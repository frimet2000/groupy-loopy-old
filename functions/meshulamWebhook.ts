import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.json();
    
    console.log('Meshulam webhook received:', JSON.stringify(body, null, 2));

    const {
      status,
      transactionId,
      sum,
      customFields,
      processId,
      processToken,
      clientId
    } = body;

    if (status !== '1' && status !== 1 && status !== 'success') {
      return Response.json({ message: 'Payment not successful, ignoring' }, { status: 200 });
    }

    let registrationId = clientId;
    
    if (!registrationId && customFields) {
      try {
        const custom = typeof customFields === 'string' ? JSON.parse(customFields) : customFields;
        registrationId = custom?.registration_id || custom?.clientId;
      } catch (e) {
        console.error('Failed to parse customFields:', e);
      }
    }

    if (!registrationId) {
      console.error('Missing registration_id in webhook payload', JSON.stringify(body, null, 2));
      return Response.json({ error: 'Missing registration_id' }, { status: 400 });
    }

    const registrations = await base44.asServiceRole.entities.NifgashimRegistration.filter({ id: registrationId });
    const registration = registrations[0];

    if (!registration) {
      console.error('Registration not found for ID:', registrationId);
      return Response.json({ error: 'Registration not found' }, { status: 404 });
    }

    if (registration.status === 'completed') {
      return Response.json({ message: 'Already processed' }, { status: 200 });
    }

    const trips = await base44.asServiceRole.entities.Trip.filter({ id: registration.trip_id });
    const trip = trips[0];

    if (!trip) {
      console.error('Trip not found for ID:', registration.trip_id);
      return Response.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (registration.memorialData?.memorial?.fallen_name) {
      try {
        await base44.asServiceRole.entities.Memorial.create({
          trip_id: registration.trip_id,
          ...registration.memorialData.memorial,
          status: 'pending'
        });
      } catch (e) {
        console.error('Error creating memorial from webhook:', e);
      }
    }

    const participantsData = registration.participants.map(p => ({
      email: p.email || `temp-${Date.now()}@nifgashim.temp`,
      name: p.name,
      id_number: p.id_number,
      phone: p.phone,
      joined_at: new Date().toISOString(),
      selected_days: registration.selectedDays.map(d => d.day_number),
      waiver_accepted: true,
      waiver_timestamp: new Date().toISOString(),
      is_organized_group: registration.userType === 'group',
      group_type: registration.userType === 'group' ? 'other' : null,
      group_name: registration.userType === 'group' ? registration.groupInfo?.name : null,
      vehicle_number: registration.vehicleInfo?.hasVehicle ? registration.vehicleInfo?.number : null,
      has_vehicle: registration.vehicleInfo?.hasVehicle || false,
      payment_status: 'completed',
      payment_amount: registration.amount,
      payment_transaction_id: transactionId || processId
    }));

    const currentParticipants = trip.participants || [];
    await base44.asServiceRole.entities.Trip.update(trip.id, {
      participants: [...currentParticipants, ...participantsData]
    });

    await base44.asServiceRole.entities.NifgashimRegistration.update(registrationId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      transaction_id: transactionId || processId
    });

    const payerEmail = registration.customer_email;
    const payerName = participantsData[0]?.name;
    
    // Invite user to Groupy Loopy platform
    if (payerEmail) {
      try {
        await base44.asServiceRole.users.inviteUser(payerEmail, "user");
      } catch (inviteError) {
        console.log('User invite failed (might already exist):', inviteError.message);
      }
    }
    
    if (payerEmail) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: payerEmail,
          subject: 'אישור הרשמה ותשלום - נפגשים בשביל ישראל',
          body: `שלום ${payerName},

תודה שנרשמת למסע נפגשים בשביל ישראל!

פרטי ההרשמה:
• מספר משתתפים: ${participantsData.length}
• ימים נבחרים: ${registration.selectedDays.length}
• סכום ששולם: ${registration.amount}₪
• מספר עסקה: ${transactionId || processId}

נתראה במסע!
צוות נפגשים`
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
    }

    try {
      const adminEmail = trip.organizer_email;
      if (adminEmail) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: adminEmail,
          subject: `הרשמה חדשה: ${payerName}`,
          body: `התקבלה הרשמה חדשה למסע נפגשים.

משתמש: ${payerName} (${payerEmail})
משתתפים: ${participantsData.length}
סכום: ${registration.amount}₪
סוג: ${registration.userType}
מספר עסקה: ${transactionId || processId}`
        });
      }
    } catch (adminEmailError) {
      console.error('Failed to send admin notification:', adminEmailError);
    }

    return Response.json({ success: true, message: 'Registration completed' }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});