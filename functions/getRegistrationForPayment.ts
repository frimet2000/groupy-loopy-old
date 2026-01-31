import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { registrationId } = await req.json();

    if (!registrationId) {
      return Response.json({ error: 'Missing registrationId' }, { status: 400 });
    }

    // Use service role to fetch registration (no user auth required for payment page)
    const registrations = await base44.asServiceRole.entities.NifgashimRegistration.filter({ id: registrationId });
    const registration = registrations[0];

    if (!registration) {
      return Response.json({ error: 'Registration not found' }, { status: 404 });
    }

    // Return only necessary fields for payment display
    return Response.json({ 
      registration: {
        id: registration.id,
        participants: registration.participants,
        customer_name: registration.customer_name,
        customer_email: registration.customer_email,
        user_email: registration.user_email,
        selected_days: registration.selected_days,
        selectedDays: registration.selectedDays,
        custom_payment_amount: registration.custom_payment_amount,
        custom_payment_status: registration.custom_payment_status,
        payment_status: registration.payment_status,
        is_special_hiker: registration.is_special_hiker
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});