Deno.serve(async (req) => {
  const publicKey = Deno.env.get("VITE_STRIPE_PUBLIC_KEY");
  
  if (!publicKey) {
    return Response.json({ error: 'Stripe public key not configured' }, { status: 500 });
  }

  return Response.json({ publicKey });
});