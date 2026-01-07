import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    console.log('Grow webhook received:', body);

    const base44 = createClientFromRequest(req);
    const data = JSON.parse(body);

    const { 
      transactionId, 
      processId, 
      status,
      sum,
      customFields 
    } = data;

    console.log('Processing Grow webhook:', { transactionId, processId, status, customFields });

    // Extract custom fields
    const registrationId = customFields?.registration_id;
    const tripId = customFields?.trip_id;

    if (!registrationId) {
      console.error('No registration_id in webhook data');
      return Response.json({ success: false, error: 'Missing registration_id' }, { status: 400 });
    }

    // Update registration status
    if (status === '1' || status === 1) {
      // Payment successful
      await base44.asServiceRole.entities.NifgashimRegistration.update(registrationId, {
        status: 'completed',
        transaction_id: transactionId,
        completed_at: new Date().toISOString()
      });

      // Get registration details
      const registration = await base44.asServiceRole.entities.NifgashimRegistration.filter({ id: registrationId });
      
      if (registration && registration.length > 0 && tripId) {
        const reg = registration[0];
        const trip = await base44.asServiceRole.entities.Trip.filter({ id: tripId });
        
        if (trip && trip.length > 0) {
          const currentTrip = trip[0];
          const participants = currentTrip.participants || [];

          // Add participants to trip
          reg.participants.forEach(participant => {
            const existingParticipant = participants.find(p => p.email === participant.email);
            if (!existingParticipant) {
              participants.push({
                email: participant.email || reg.customer_email,
                name: participant.fullName,
                phone: participant.phone,
                id_number: participant.idNumber,
                joined_at: new Date().toISOString(),
                selected_days: reg.selectedDays?.map(d => d.day_number) || [],
                payment_status: 'completed',
                payment_amount: reg.amount,
                payment_transaction_id: transactionId,
                payment_timestamp: new Date().toISOString(),
                is_organized_group: reg.userType === 'group',
                group_type: reg.groupInfo?.groupType,
                group_name: reg.groupInfo?.groupName
              });
            }
          });

          await base44.asServiceRole.entities.Trip.update(tripId, { participants });
        }
      }

      console.log('Payment completed successfully');
    } else {
      // Payment failed
      await base44.asServiceRole.entities.NifgashimRegistration.update(registrationId, {
        status: 'failed'
      });
      console.log('Payment failed');
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Grow webhook error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});