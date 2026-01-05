import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const payload = await req.json();
    console.log('createMeshulamPayment called with:', JSON.stringify(payload, null, 2));

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
      customerIdNumber,
      description
    } = payload;

    const pageCode = Deno.env.get('MESHULAM_PAGE_CODE');
    console.log('MESHULAM_PAGE_CODE exists:', !!pageCode);
    
    if (!pageCode) {
      console.error('MESHULAM_PAGE_CODE not set');
      return Response.json({ success: false, error: 'Meshulam not configured' }, { status: 500 });
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

    // Create Meshulam payment page
    const meshulamResponse = await fetch('https://secure.meshulam.co.il/api/light/server/1.0/createPaymentProcess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pageCode,
        amount: amount.toFixed(2),
        description,
        fullName: customerName,
        email: customerEmail,
        phone: customerPhone,
        customer_id: customerIdNumber,
        successUrl,
        cancelUrl,
        maxPayments: 1,
        sum: amount.toFixed(2),
        currency: 'ILS',
        sendEmail: true,
        customFields: {
          registration_id: registration.id,
          trip_id: tripId,
          participants_count: participants.length
        }
      })
    });

    const meshulamData = await meshulamResponse.json();
    console.log('Meshulam API response:', JSON.stringify(meshulamData, null, 2));

    if (meshulamData.status === '1' && meshulamData.data?.url) {
      console.log('Payment URL created successfully:', meshulamData.data.url);
      return Response.json({
        success: true,
        paymentUrl: meshulamData.data.url,
        registrationId: registration.id
      });
    } else {
      console.error('Meshulam API error:', meshulamData);
      return Response.json({ 
        success: false,
        error: meshulamData.err || 'Failed to create payment', 
        details: meshulamData 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Exception in createMeshulamPayment:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});