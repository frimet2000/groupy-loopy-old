import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    
    if (!CLIENT_ID) {
      return Response.json({ error: 'PayPal not configured' }, { status: 500 });
    }

    return Response.json({ clientId: CLIENT_ID });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});