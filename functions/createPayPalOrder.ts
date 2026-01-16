import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const { amount, participantsCount, userEmail, registrationId } = await req.json();

    const CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return Response.json({ error: 'PayPal credentials not configured' }, { status: 500 });
    }

    if (!amount || amount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const email = userEmail || user?.email || '';

    // Get PayPal access token
    const authResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!authResponse.ok) {
      const error = await authResponse.text();
      console.error('PayPal auth failed:', error);
      return Response.json({ error: 'Failed to authenticate with PayPal' }, { status: 500 });
    }

    const { access_token } = await authResponse.json();

    // Create order
    const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: registrationId || email,
          description: `Nifgashim Trek - ${participantsCount} Participant${participantsCount > 1 ? 's' : ''}`,
          amount: {
            currency_code: 'ILS',
            value: amount.toFixed(2)
          }
        }],
        application_context: {
          brand_name: 'Nifgashim Bishvil Israel',
          return_url: `https://groupyloopy.app/PaymentSuccess?source=paypal&registration_id=${registrationId}`,
          cancel_url: 'https://groupyloopy.app/NifgashimPortal?payment_cancel=true'
        }
      })
    });

    if (!orderResponse.ok) {
      const error = await orderResponse.text();
      console.error('PayPal order creation failed:', error);
      return Response.json({ error: 'Failed to create PayPal order' }, { status: 500 });
    }

    const order = await orderResponse.json();

    return Response.json({
      success: true,
      orderId: order.id
    });
  } catch (error) {
    console.error('PayPal order creation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});