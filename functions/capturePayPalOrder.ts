import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { orderId, registrationId } = await req.json();

    const CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');

    if (!CLIENT_ID || !CLIENT_SECRET) {
      return Response.json({ error: 'PayPal credentials not configured' }, { status: 500 });
    }

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
      return Response.json({ error: 'Failed to authenticate with PayPal' }, { status: 500 });
    }

    const { access_token } = await authResponse.json();

    // Capture the order
    const captureResponse = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!captureResponse.ok) {
      const error = await captureResponse.text();
      console.error('PayPal capture failed:', error);
      return Response.json({ error: 'Failed to capture payment' }, { status: 500 });
    }

    const captureData = await captureResponse.json();

    // Update registration status
    if (registrationId) {
      const registrations = await base44.asServiceRole.entities.NifgashimRegistration.filter({ id: registrationId });
      if (registrations && registrations.length > 0) {
        await base44.asServiceRole.entities.NifgashimRegistration.update(registrationId, {
          status: 'completed',
          payment_status: 'completed',
          transaction_id: captureData.id,
          amount_paid: parseFloat(captureData.purchase_units[0].payments.captures[0].amount.value),
          completed_at: new Date().toISOString()
        });
      }
    }

    return Response.json({
      success: true,
      captureData
    });
  } catch (error) {
    console.error('PayPal capture error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});