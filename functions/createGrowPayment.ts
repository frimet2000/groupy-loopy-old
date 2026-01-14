Deno.serve(async (req) => {
  try {
    const { amount } = await req.json();
    const pageCode = Deno.env.get('GROW_PAGE_CODE');
    const userId = Deno.env.get('GROW_USER_ID');

    if (!pageCode || !userId) {
      return Response.json({ error: 'Grow credentials not configured' }, { status: 500 });
    }

    // Call Grow API to create payment
    const response = await fetch('https://api.meshulam.co.il/api/GrowPage/CreatePayment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageCode,
        userId,
        sum: Math.round(amount),
        currency: 'ILS'
      })
    });

    const data = await response.json();
    
    if (!response.ok || !data.url) {
      console.error('Grow API error:', data);
      return Response.json({ error: data.errorMessage || 'Failed to create payment' }, { status: 400 });
    }

    return Response.json({ url: data.url });
  } catch (error) {
    console.error('Payment error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});