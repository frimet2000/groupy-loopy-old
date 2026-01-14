import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { amount } = await req.json();
    const pageCode = Deno.env.get('GROW_PAGE_CODE');
    const userId = Deno.env.get('GROW_USER_ID');

    if (!pageCode || !userId) {
      return Response.json({ error: 'Grow credentials not configured' }, { status: 500 });
    }

    // Create payment via Grow API - amount is locked on their side
    const response = await fetch('https://api.meshulam.co.il/api/GrowPage/CreatePayment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pageCode: pageCode,
        userId: userId,
        sum: Math.round(amount),
        currency: 'ILS'
      })
    });

    const data = await response.json();

    if (data.url) {
      return Response.json({ url: data.url });
    } else {
      return Response.json({ 
        error: data.errorMessage || 'Failed to create payment',
        details: data 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating payment:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});