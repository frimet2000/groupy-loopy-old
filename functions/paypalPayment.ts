import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const { amount, participantsCount, userEmail, registrationId } = await req.json();

    const BUTTON_ID = Deno.env.get('PAYPAL_BUTTON_ID');
    if (!BUTTON_ID) {
      return Response.json({ error: 'PayPal button not configured' }, { status: 500 });
    }

    if (!amount || amount <= 0 || !participantsCount || participantsCount < 1) {
      return Response.json({ error: 'Invalid amount or participants count' }, { status: 400 });
    }

    const email = userEmail || user?.email || '';
    if (!email) {
      return Response.json({ error: 'User email required' }, { status: 400 });
    }

    const appUrl = 'https://groupyloopy.app';
    const returnUrl = `${appUrl}/PaymentSuccess?source=paypal`;
    const cancelUrl = `${appUrl}/NifgashimPortal?payment_cancel=true`;

    // Construct PayPal payment URL with all parameters
    const params = new URLSearchParams({
      cmd: '_s-xclick',
      hosted_button_id: BUTTON_ID,
      custom: registrationId || email,
      return: returnUrl,
      cancel_return: cancelUrl,
      notify_url: 'https://groupyloopy.app/api/apps/693c3ab4048a1e3a31fffd66/functions/paypalIPN'
    });

    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;

    // Return a redirect response
    return new Response(null, {
      status: 302,
      headers: {
        'Location': paypalUrl
      }
    });
  } catch (error) {
    console.error('PayPal payment error:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    return Response.json({ error: error.message || 'Unknown error', details: String(error) }, { status: 500 });
  }
});