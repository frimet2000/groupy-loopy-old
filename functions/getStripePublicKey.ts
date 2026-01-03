// @ts-nocheck
Deno.serve(async (req) => {
  // The public key is stored as VITE_STRIPE_PUBLIC_KEY secret
  const publicKey = Deno.env.get("VITE_STRIPE_PUBLIC_KEY") || Deno.env.get("STRIPE_PUBLIC_KEY");
  
  if (!publicKey) {
    return Response.json({ 
      error: 'Stripe public key not configured',
      details: 'Please set VITE_STRIPE_PUBLIC_KEY or STRIPE_PUBLIC_KEY in environment variables'
    }, { status: 500 });
  }

  return Response.json({ publicKey });
});