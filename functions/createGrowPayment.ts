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

    // Clean and validate name (must have at least 2 words)
    let fullName = customerName.trim();
    if (!fullName.includes(' ')) {
      fullName = fullName + ' User'; // Add default second name if missing
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = customerPhone.replace(/\D/g, '');

    // Prepare form data for Grow API
    const formData = new URLSearchParams();
    formData.append('pageCode', pageCode);
    formData.append('userId', userId);
    formData.append('sum', parseFloat(amount).toFixed(2));
    formData.append('description', description || 'Nifgashim Registration');
    formData.append('pageField[fullName]', fullName);
    formData.append('pageField[phone]', cleanPhone);
    if (customerEmail && customerEmail.includes('@')) {
      formData.append('pageField[email]', customerEmail);
    }
    formData.append('successUrl', successUrl);
    formData.append('cancelUrl', cancelUrl);
    formData.append('maxPaymentNum', '1');
    formData.append('cField1', registration.id);
    formData.append('cField2', tripId);
    formData.append('cField3', participants.length.toString());
    
    // Add payment methods - credit card, bit, google pay
    formData.append('transactionTypes[0]', '1'); // Credit card
    formData.append('transactionTypes[1]', '6'); // Bit
    formData.append('transactionTypes[3]', '13'); // Google Pay

    console.log('Sending to Grow API:', formData.toString());

    const growResponse = await fetch('https://sandbox.meshulam.co.il/api/light/server/1.0/createPaymentProcess', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    const growData = await growResponse.json();
    console.log('Grow API response status:', growResponse.status);
    console.log('Grow API response:', JSON.stringify(growData, null, 2));

    if (!growResponse.ok) {
      console.error('Grow API HTTP error:', growResponse.status, growData);
      return Response.json({ 
        success: false,
        error: 'Grow API returned error: ' + growResponse.status,
        details: growData,
        requestSent: formData.toString()
      }, { status: 400 });
    }

    if (growData.status === '1' && growData.data?.processToken) {
      console.log('Payment process created successfully:', growData.data.processToken);
      return Response.json({
        success: true,
        processToken: growData.data.processToken,
        processId: growData.data.processId,
        registrationId: registration.id
      });
    } else {
      console.error('Grow API error response:', growData);
      return Response.json({ 
        success: false,
        error: growData.err || growData.message || 'Failed to create payment process', 
        details: growData,
        requestSent: formData.toString()
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