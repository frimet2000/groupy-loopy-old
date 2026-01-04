import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json();
    const {
      amount,
      tripId,
      participants,
      userType,
      groupInfo,
      selectedDays,
      customerName,
      customerEmail,
      customerPhone,
      customerIdNumber,
      memorialData,
      vehicleInfo
    } = body;

    if (!amount || !tripId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const registrationData = {
      trip_id: tripId,
      participants,
      userType,
      groupInfo,
      selectedDays,
      vehicleInfo,
      memorialData,
      amount,
      status: 'pending_payment',
      customer_email: customerEmail
    };

    const newRegistration = await base44.asServiceRole.entities.NifgashimRegistration.create(registrationData);
    const registrationId = newRegistration.id;

    const origin = new URL(req.url).origin;
    
    const successUrl = `${origin}/NifgashimPortal?id=${tripId}&payment_success=true&registration_id=${registrationId}`;
    const cancelUrl = `${origin}/NifgashimPortal?id=${tripId}`;

    const basePaymentUrl = 'https://meshulam.co.il/s/bc8d0eda-efc0-ebd2-43c0-71efbd570304';
    
    const params = new URLSearchParams({
      amount: amount.toString(),
      description: `הרשמה למסע נפגשים - ${participants.length} משתתפים`,
      fullName: customerName || '',
      email: customerEmail || '',
      phone: customerPhone || '',
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      clientId: registrationId
    });

    const paymentUrl = `${basePaymentUrl}?${params.toString()}`;

    return Response.json({
      success: true,
      paymentUrl,
      registrationId
    });

  } catch (error) {
    console.error('Meshulam payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});