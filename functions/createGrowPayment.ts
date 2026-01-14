import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { amount } = await req.json();
    const pageCode = Deno.env.get('GROW_PAGE_CODE');

    if (!pageCode) {
      return Response.json({ error: 'Grow page code not configured' }, { status: 500 });
    }

    // Generate direct Grow payment URL with fixed amount (readonly locks it)
    const paymentUrl = `https://meshulam.co.il/s/${pageCode}?sum=${Math.round(amount)}&readonly=true`;

    console.log('Payment URL created:', { pageCode, amount, paymentUrl });

    return Response.json({ url: paymentUrl });
  } catch (error) {
    console.error('Error creating payment URL:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});