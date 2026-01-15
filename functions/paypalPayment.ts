import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    const { amount, participantsCount, userEmail } = await req.json();

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

    // Build PayPal form data
    const formParams = new URLSearchParams({
      cmd: '_s-xclick',
      hosted_button_id: BUTTON_ID,
      user_email: email,
      custom: email,
      on0: 'כמות אנשים',
      os0: String(participantsCount),
      currency_code: 'ILS'
    });

    // Get the app URL for return
    const appUrl = 'https://groupyloopy.app';
    const returnUrl = `${appUrl}/NifgashimPortal?payment=success`;
    const cancelUrl = `${appUrl}/NifgashimPortal?payment=cancelled`;

    // Return the form as HTML that auto-submits
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PayPal Payment</title>
</head>
<body>
  <form id="paypalForm" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" style="display: none;">
    <input type="hidden" name="cmd" value="_s-xclick">
    <input type="hidden" name="hosted_button_id" value="${BUTTON_ID}">
    <input type="hidden" name="user_email" value="${email}">
    <input type="hidden" name="custom" value="${email}">
    <input type="hidden" name="on0" value="כמות אנשים">
    <input type="hidden" name="os0" value="${participantsCount}">
    <input type="hidden" name="currency_code" value="ILS">
    <input type="hidden" name="return" value="${returnUrl}">
    <input type="hidden" name="cancel_return" value="${cancelUrl}">
    <input type="hidden" name="rm" value="2">
    <button type="submit"></button>
  </form>
  <script>
    document.getElementById('paypalForm').submit();
  </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    console.error('PayPal payment error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});