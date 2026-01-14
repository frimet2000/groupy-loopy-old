import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    console.log('createGrowPayment called');
    const body = await req.json();
    console.log('Request body:', body);
    
    const { amount } = body;
    const pageCode = Deno.env.get('GROW_PAGE_CODE');
    const userId = Deno.env.get('GROW_USER_ID');

    console.log('pageCode:', pageCode, 'userId:', userId, 'amount:', amount);

    if (!pageCode || !userId) {
      console.error('Missing Grow credentials');
      return Response.json({ error: 'Grow credentials not configured' }, { status: 500 });
    }

    // Create payment via Grow API with fixed amount
    const payload = {
      pageCode: pageCode,
      userId: userId,
      sum: Math.round(amount),
      currency: 'ILS',
      description: 'Nifgashim Registration',
      maxPayments: 1
    };

    console.log('Sending payload to Grow:', JSON.stringify(payload));

    const response = await fetch('https://www.meshulam.co.il/api/growpage/createpayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', responseData);

    if (responseData.url) {
      return Response.json({ url: responseData.url });
    } else {
      console.error('No URL in response:', responseData);
      return Response.json({ 
        error: responseData.errorMessage || 'Failed to create payment',
        details: responseData
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating payment:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});