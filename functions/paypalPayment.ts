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

    // Return the form as HTML that auto-submits
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PayPal Payment</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; }
    .container { text-align: center; color: white; }
    .spinner { border: 4px solid rgba(255,255,255,0.3); border-top: 4px solid white; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    h2 { margin: 0; font-size: 20px; font-weight: 600; }
    p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h2>Redirecting to PayPal...</h2>
    <p>Please wait while we process your payment</p>
  </div>
  
  <form id="paypalForm" action="https://www.paypal.com/cgi-bin/webscr" method="post" style="display: none;">
    <input type="hidden" name="cmd" value="_s-xclick">
    <input type="hidden" name="hosted_button_id" value="${BUTTON_ID}">
    <input type="hidden" name="custom" value="${registrationId || email}">
    <input type="hidden" name="return" value="${returnUrl}">
    <input type="hidden" name="cancel_return" value="${cancelUrl}">
    <input type="hidden" name="notify_url" value="https://groupyloopy.app/api/apps/693c3ab4048a1e3a31fffd66/functions/paypalIPN">
  </form>
  
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        document.getElementById('paypalForm').submit();
      }, 500);
    });
  </script>
</body>
</html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    console.error('PayPal payment error:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    return Response.json({ error: error.message || 'Unknown error', details: String(error) }, { status: 500 });
  }
});