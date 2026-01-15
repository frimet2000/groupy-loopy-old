import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { amount, customerEmail, customerName, registrationId } = await req.json();
    
    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const pageCode = Deno.env.get('GROW_PAGE_CODE');
    const userId = Deno.env.get('GROW_USER_ID');
    
    if (!pageCode || !userId) {
      return Response.json({ 
        error: 'Missing Grow credentials',
        details: 'GROW_PAGE_CODE or GROW_USER_ID not configured'
      }, { status: 400 });
    }
    
    // Use the PaymentSuccess page as success URL
    const baseUrl = req.headers.get('origin') || 'https://groupyloopy.app';
    const successUrl = `${baseUrl}/NifgashimPortal?payment_success=true&registration_id=${registrationId || ''}`;
    const cancelUrl = `${baseUrl}/NifgashimPortal`;
    
    const form = new FormData();
    form.append('pageCode', pageCode);
    form.append('userId', userId);
    form.append('sum', amount.toString());
    form.append('successUrl', successUrl);
    form.append('cancelUrl', cancelUrl);
    form.append('description', `הרשמה למסע נפגשים - ${customerName || ''}`);
    form.append('paymentNum', '1');
    form.append('maxPaymentNum', '12');
    
    if (customerEmail) {
      form.append('cField1', customerEmail);
    }
    if (customerName) {
      form.append('cField2', customerName);
    }
    if (registrationId) {
      form.append('cField3', registrationId);
    }

    // Use Meshulam API (Grow's backend)
    const apiUrl = 'https://secure.meshulam.co.il/api/light/server/1.0/createPaymentProcess';

    console.log('Calling Meshulam API with:', { 
      pageCode, 
      pageCodeLength: pageCode?.length,
      userId, 
      userIdLength: userId?.length,
      amount, 
      successUrl 
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: form,
      headers: {
        'accept': 'application/json'
      }
    });

    const responseText = await response.text();
    console.log('Meshulam API raw response:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', responseText);
      return Response.json({ 
        error: 'Invalid response from payment provider',
        rawResponse: responseText.substring(0, 500)
      }, { status: 500 });
    }
    
    console.log('Meshulam API response:', JSON.stringify(data));

    // Meshulam/Grow returns status=1 for success
    if (data.status === 1 && data.data) {
      // Return authCode for SDK usage, or URL for redirect
      return Response.json({
        success: true,
        authCode: data.data.authCode,
        paymentUrl: data.data.url,
        processId: data.data.processId,
        processToken: data.data.processToken
      });
    } else {
      // Return more details for debugging
      console.error('Grow API error:', JSON.stringify(data));
      return Response.json({
        success: false,
        error: data.err?.message || data.message || 'Payment creation failed',
        errorCode: data.err?.id || data.status,
        details: data,
        sentParams: {
          pageCode: pageCode ? 'SET' : 'MISSING',
          userId: userId ? 'SET' : 'MISSING',
          amount,
          successUrl
        }
      });
    }
  } catch (error) {
    console.error('Error creating Grow payment:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});