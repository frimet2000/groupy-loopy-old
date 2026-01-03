import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { amount } = await req.json();

    if (!amount) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Create payment intent and return client secret
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to agorot
      currency: 'ils',
      automatic_payment_methods: {
        enabled: true
      },
      description: 'Nifgashim Bishvil Israel Trek Registration'
    });

    return Response.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Payment error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});