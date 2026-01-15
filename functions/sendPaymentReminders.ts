import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Verify admin
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { registrationIds, customMessage } = body;

    // Get pending registrations
    let registrations;
    if (registrationIds && registrationIds.length > 0) {
      // Send to specific registrations
      const allRegs = await base44.asServiceRole.entities.NifgashimRegistration.list();
      registrations = allRegs.filter(r => registrationIds.includes(r.id) && r.payment_status === 'pending');
    } else {
      // Get all pending payments
      registrations = await base44.asServiceRole.entities.NifgashimRegistration.filter({ payment_status: 'pending' });
    }

    if (registrations.length === 0) {
      return Response.json({ success: true, sent: 0, message: 'No pending payments found' });
    }

    const results = [];
    
    for (const reg of registrations) {
      const email = reg.customer_email || reg.user_email;
      if (!email) continue;

      const mainParticipant = reg.participants?.[0] || {};
      const name = mainParticipant.name || email.split('@')[0];
      const amount = reg.amount || reg.total_amount || 0;

      const defaultMessageHe = `שלום ${name},

זוהי תזכורת לגבי הרשמתך למסע "נפגשים בשביל ישראל".

סכום לתשלום: ₪${amount}

להשלמת ההרשמה והתשלום, אנא היכנסו לקישור ההרשמה שלנו.

בברכה,
צוות נפגשים בשביל ישראל`;

      const defaultMessageEn = `Hello ${name},

This is a reminder regarding your registration for "Nifgashim for Israel" trek.

Amount due: ₪${amount}

To complete your registration and payment, please visit our registration link.

Best regards,
Nifgashim for Israel Team`;

      const message = customMessage || `${defaultMessageHe}\n\n---\n\n${defaultMessageEn}`;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: 'תזכורת תשלום - נפגשים בשביל ישראל / Payment Reminder',
          body: message
        });
        
        results.push({ email, status: 'sent' });
      } catch (emailError) {
        console.error(`Failed to send to ${email}:`, emailError.message);
        results.push({ email, status: 'failed', error: emailError.message });
      }
    }

    const sentCount = results.filter(r => r.status === 'sent').length;
    
    return Response.json({ 
      success: true, 
      sent: sentCount,
      total: registrations.length,
      results 
    });
  } catch (error) {
    console.error('sendPaymentReminders error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});