// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Only admins can verify QR codes
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { qrData, dayNumber } = await req.json();

    if (!qrData) {
      return Response.json({ error: 'QR data required' }, { status: 400 });
    }

    // Decode the QR data
    let decoded;
    try {
      const decodedString = atob(qrData);
      decoded = JSON.parse(decodedString);
    } catch (e) {
      return Response.json({ 
        success: false, 
        status: 'invalid',
        message: 'Invalid QR code format'
      });
    }

    const { rid: registrationId, pid: participantIdNumber, idx: participantIndex, days: selectedDays } = decoded;

    if (!registrationId || !participantIdNumber) {
      return Response.json({ 
        success: false, 
        status: 'invalid',
        message: 'QR code missing required data'
      });
    }

    // Get registration from database
    const registration = await base44.asServiceRole.entities.NifgashimRegistration.get(registrationId);
    
    if (!registration) {
      return Response.json({ 
        success: false, 
        status: 'not_found',
        message: 'Registration not found'
      });
    }

    // Verify participant exists in registration
    const participants = registration.participants || [];
    const participant = participants.find(p => p.id_number === participantIdNumber) || participants[participantIndex];
    
    if (!participant) {
      return Response.json({ 
        success: false, 
        status: 'not_found',
        message: 'Participant not found in registration'
      });
    }

    // Check if participant is registered for this specific day (if dayNumber provided)
    const registeredDays = registration.selected_days || registration.selectedDays?.map(d => d.day_number) || [];
    
    if (dayNumber && !registeredDays.includes(dayNumber)) {
      return Response.json({ 
        success: false, 
        status: 'wrong_day',
        message: `Participant is not registered for day ${dayNumber}`,
        participantName: participant.name,
        registeredDays
      });
    }

    // Check if already checked in for this day
    const checkIns = registration.check_ins || [];
    const alreadyCheckedIn = checkIns.find(
      c => c.participant_id === participantIdNumber && (!dayNumber || c.day_number === dayNumber)
    );

    if (alreadyCheckedIn) {
      return Response.json({ 
        success: false, 
        status: 'already_checked_in',
        message: 'Participant already checked in',
        participantName: participant.name,
        checkedInAt: alreadyCheckedIn.checked_in_at
      });
    }

    // Record the check-in
    const newCheckIn = {
      participant_id: participantIdNumber,
      participant_name: participant.name,
      day_number: dayNumber || null,
      checked_in_at: new Date().toISOString(),
      checked_in_by: user.email
    };

    const updatedCheckIns = [...checkIns, newCheckIn];

    await base44.asServiceRole.entities.NifgashimRegistration.update(registrationId, {
      check_ins: updatedCheckIns
    });

    // Calculate total people in this registration
    const totalPeople = registration.is_organized_group && registration.groupInfo?.totalParticipants
      ? registration.groupInfo.totalParticipants
      : participants.length;

    return Response.json({ 
      success: true, 
      status: 'verified',
      message: 'Check-in successful!',
      participantName: participant.name,
      participantId: participantIdNumber,
      participantPhone: participant.phone,
      totalPeople,
      registeredDays,
      paymentStatus: registration.payment_status,
      isGroup: registration.is_organized_group || false,
      groupName: registration.group_name || registration.groupInfo?.name || null,
      checkedInAt: newCheckIn.checked_in_at
    });

  } catch (error) {
    console.error('Error verifying QR:', error);
    return Response.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
});