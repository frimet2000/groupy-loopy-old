// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    console.log('=== createGrowPayment START ===');
    const base44 = createClientFromRequest(req);

    const payload = await req.json();
    console.log('Payload received:', JSON.stringify(payload, null, 2));

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
      description,
      enableGooglePay
    } = payload;

    const userId = Deno.env.get('GROW_USER_ID') || '5c04d711acb29250';
    const pageCode = Deno.env.get('GROW_PAGE_CODE') || '30f1b9975952';
    
    console.log('GROW_USER_ID value:', userId);
    console.log('GROW_PAGE_CODE value:', pageCode);
    
    if (!userId || !pageCode) {
      console.error('GROW credentials missing! userId:', !!userId, 'pageCode:', !!pageCode);
      return Response.json({ success: false, error: 'Grow not configured - missing credentials' }, { status: 500 });
    }
    
    // Validate format
    if (userId.length < 10 || pageCode.length < 10) {
      console.error('GROW credentials appear invalid - too short');
      return Response.json({ success: false, error: 'Grow credentials format invalid' }, { status: 500 });
    }

    // Create registration record
    console.log('Creating NifgashimRegistration record...');
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
    console.log('Registration created with ID:', registration.id);

    // Create success/cancel URLs
    const origin = req.headers.get('origin');
    const isLocalhost = origin?.includes('localhost') || origin?.includes('127.0.0.1');
    const baseUrl = isLocalhost ? 'https://groupyloopy.com' : (origin || 'https://groupyloopy.com');
    
    const successUrl = `${baseUrl}/NifgashimPortal?id=${tripId}&payment_success=true&registration_id=${registration.id}`;
    const cancelUrl = `${baseUrl}/NifgashimPortal?id=${tripId}&payment_cancel=true`;

    // Clean and validate name (must have at least 2 words)
    let fullName = customerName.trim();
    if (!fullName.includes(' ')) {
      fullName = fullName + ' User'; // Add default second name if missing
    }

    // Clean phone number (remove non-digits)
    if (!customerPhone) {
      console.error('customerPhone is missing');
      return Response.json({ 
        success: false, 
        error: 'מספר טלפון חסר. אנא הזן מספר טלפון תקין.'
      }, { status: 400 });
    }
    
    let cleanPhone = customerPhone.replace(/\D/g, '');
    console.log('Phone validation - original:', customerPhone, 'cleaned:', cleanPhone);
    
    // Validate Israeli mobile phone (05XXXXXXXX)
    if (!cleanPhone.startsWith('05') || cleanPhone.length !== 10) {
      if (cleanPhone.length === 9 && cleanPhone.startsWith('5')) {
        cleanPhone = '0' + cleanPhone;
        console.log('Phone corrected to:', cleanPhone);
      } else {
        console.error('Invalid Israeli phone number:', cleanPhone);
        return Response.json({ 
          success: false, 
          error: 'מספר טלפון לא תקין. יש להזין מספר נייד ישראלי תקין (05XXXXXXXX)',
          receivedPhone: customerPhone
        }, { status: 400 });
      }
    }

    // Clean description - remove Hebrew and special characters, only ASCII allowed
    const cleanDescription = 'Nifgashim Trek Registration';

    // Prepare form data for Grow API
    const formData = new URLSearchParams();
    formData.append('pageCode', pageCode);
    formData.append('userId', userId);
    formData.append('sum', parseFloat(amount).toFixed(2));
    formData.append('description', cleanDescription);
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
    if (enableGooglePay) {
      formData.append('transactionTypes[6]', '13'); // Google Pay - restricted to Chrome
    }
    formData.append('transactionTypes[1]', '6'); // Bit

    console.log('Sending request to Grow API...');
    console.log('Request body:', formData.toString());

    // Convert URLSearchParams to plain object for logging and debugging
    const bodyObject = Object.fromEntries(formData);
    console.log('Request body as object:', JSON.stringify(bodyObject, null, 2));

    // Determine environment based on credentials
    // If using the default test userId, ALWAYS use sandbox, regardless of the domain we are running on.
    const isSandbox = (userId === '5c04d711acb29250'); 
    
    const growApiUrl = isSandbox 
      ? 'https://sandbox.meshulam.co.il/api/light/server/1.0/createPaymentProcess'
      : 'https://meshulam.co.il/api/light/server/1.0/createPaymentProcess';

    console.log(`Sending request to Grow API (${isSandbox ? 'Sandbox' : 'Production'})...`);
    console.log('Request body:', formData.toString());

    // Convert URLSearchParams to plain object for logging and debugging
    const bodyObject = Object.fromEntries(formData);
    console.log('Request body as object:', JSON.stringify(bodyObject, null, 2));

    const growResponse = await fetch(growApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    console.log('Grow API HTTP status:', growResponse.status);
    const contentType = growResponse.headers.get('content-type');
    console.log('Response content-type:', contentType);

    let growData;
    try {
      const responseText = await growResponse.text();
      console.log('Raw response:', responseText.substring(0, 500));
      growData = JSON.parse(responseText);
      console.log('Parsed Grow response:', JSON.stringify(growData, null, 2));
    } catch (parseError) {
      console.error('Failed to parse Grow response:', parseError.message);
      return Response.json({
        success: false,
        error: 'Grow API returned invalid JSON',
        details: parseError.message
      }, { status: 500 });
    }

    if (!growResponse.ok) {
      console.error('Grow API HTTP error:', growResponse.status, growData);
      return Response.json({ 
        success: false,
        error: 'Grow API returned error: ' + growResponse.status,
        details: growData,
        requestSent: formData.toString()
      }, { status: 400 });
    }

    if (growData.status === '1' && growData.data?.url) {
      console.log('Payment URL created successfully:', growData.data.url);
      return Response.json({
        success: true,
        paymentUrl: growData.data.url,
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
    console.error('=== EXCEPTION in createGrowPayment ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return Response.json({ 
      success: false, 
      error: error.message || 'Unknown error',
      errorType: error.name,
      stack: error.stack
    }, { status: 500 });
  }
});