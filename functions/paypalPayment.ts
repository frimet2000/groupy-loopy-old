import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const { amount, participantsCount, userEmail, registrationId } = await req.json();

    let BUTTON_ID = Deno.env.get('PAYPAL_BUTTON_ID');
    if (!BUTTON_ID) {
      return Response.json({ error: 'PayPal button not configured' }, { status: 500 });
    }

    // Extract button ID if it's embedded in HTML
    const buttonIdMatch = BUTTON_ID.match(/value="([^"]+)"\s*\/>/);
    if (buttonIdMatch && buttonIdMatch[1].length < 50) {
      BUTTON_ID = buttonIdMatch[1];
    } else {
      // Try alternate pattern
      const altMatch = BUTTON_ID.match(/hosted_button_id"\s+value="([^"]+)"/);
      if (altMatch) {
        BUTTON_ID = altMatch[1];
      }
    }

    console.log('Using Button ID:', BUTTON_ID.substring(0, 20) + (BUTTON_ID.length > 20 ? '...' : ''));

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
      cmd: '_xclick',
      business: 'nifgashim.israel@gmail.com',
      item_name: `Nifgashim Trek - ${participantsCount} Participant${participantsCount > 1 ? 's' : ''}`,
      amount: amount.toFixed(2),
      currency_code: 'ILS',
      quantity: participantsCount,
      custom: registrationId || email,
      return: returnUrl,
      cancel_return: cancelUrl,
      notify_url: 'https://groupyloopy.app/api/apps/693c3ab4048a1e3a31fffd66/functions/paypalIPN',
      no_shipping: '2',
      rm: '2'
    });

    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;

    // Return the URL in response body (axios doesn't follow 302 automatically)
    return Response.json({
      success: true,
      paypalUrl: paypalUrl
    });
  } catch (error) {
    console.error('PayPal payment error:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    return Response.json({ error: error.message || 'Unknown error', details: String(error) }, { status: 500 });
  }
});