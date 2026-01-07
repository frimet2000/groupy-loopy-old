import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const payload = await req.json();
    console.log('createGrowPayment called with:', JSON.stringify(payload, null, 2));

    const {
      amount,
      tripId,
      participants,
      userType,
      groupInfo,
      selectedDays,
      memorialData,
      vehicleInfo,
      customerName,
      customerEmail,
      customerPhone,
      description
    } = payload;

    const userId = Deno.env.get('GROW_USER_ID');
    const pageCode = Deno.env.get('GROW_PAGE_CODE');
    
    if (!userId || !pageCode) {
      console.error('GROW_USER_ID or GROW_PAGE_CODE not set');
      return Response.json({ success: false, error: 'Grow not configured' }, { status: 500 });
    }

    // Create registration record
    const registration = await base44.asServiceRole.entities.NifgashimRegistration.create({
      trip_id: tripId,
      participants,
      userType,
      groupInfo,
      vehicleInfo,
      memorialData,
      selectedDays,
      amount,
      status: 'pending_payment',
      customer_email: customerEmail
    });

    // Create success/cancel URLs
    const baseUrl = req.headers.get('origin') || 'https://groupyloopy.app';
    const successUrl = `${baseUrl}/NifgashimPortal?id=${tripId}&payment_success=true&registration_id=${registration.id}`;
    const cancelUrl = `${baseUrl}/NifgashimPortal?id=${tripId}&payment_cancel=true`;

    // Create Grow payment process
    const growResponse = await fetch('https://api.meshulam.co.il/api/light/server/1.0/createPaymentProcess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        pageCode,
        sum: amount.toFixed(2),
        description,
        fullName: customerName,
        phone: customerPhone,
        email: customerEmail,
        successUrl,
        cancelUrl,
        maxPayments: 1,
        currency: 'ILS',
        sendEmail: true,
        customFields: {
          registration_id: registration.id,
          trip_id: tripId,
          participants_count: participants.length
        }
      })
    });

    const growData = await growResponse.json();
    console.log('Grow API response:', JSON.stringify(growData, null, 2));

    if (growData.status === '1' && growData.data?.processToken) {
      console.log('Payment process created successfully:', growData.data.processToken);
      return Response.json({
        success: true,
        processToken: growData.data.processToken,
        processId: growData.data.processId,
        registrationId: registration.id
      });
    } else {
      console.error('Grow API error:', growData);
      return Response.json({ 
        success: false,
        error: growData.err || 'Failed to create payment process', 
        details: growData 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Exception in createGrowPayment:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});