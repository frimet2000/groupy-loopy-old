// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

Deno.serve(async (req: Request) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { amount, email, receiptName, receiptId } = await req.json();

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
      receipt_email: email, // Send receipt to payer
      description: `Nifgashim Registration - ${receiptName || email} ${receiptId ? `(ID: ${receiptId})` : ''}`,
      metadata: {
        receipt_name: receiptName,
        receipt_id: receiptId,
        receipt_email: email
      },
      automatic_payment_methods: {
        enabled: true
      },
    });

    return Response.json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
});