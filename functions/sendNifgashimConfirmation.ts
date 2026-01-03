// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { registrationId, language = 'he' } = await req.json();

    // Get registration details
    const registration = await base44.asServiceRole.entities.NifgashimRegistration.get(registrationId);
    
    if (!registration) {
      return Response.json({ error: 'Registration not found' }, { status: 404 });
    }

    const translations = {
      he: {
        subject: 'אישור הרשמה - נפגשים בשביל ישראל',
        greeting: `שלום,`,
        confirmed: 'ההרשמה שלך למסע "נפגשים בשביל ישראל" אושרה בהצלחה!',
        details: 'פרטי ההרשמה:',
        days: 'מספר ימים',
        negevDays: 'ימי נגב',
        totalCost: 'עלות כוללת',
        paymentStatus: 'סטטוס תשלום',
        nextSteps: 'השלבים הבאים:',
        step1: '1. השלם את התשלום (אם טרם שולם)',
        step2: '2. הורד את האפליקציה וצור קוד QR אישי',
        step3: '3. הגע לנקודות המפגש בזמן',
        questions: 'שאלות? צור קשר:',
        email: 'info@nifgashim.org.il',
        seeYou: 'נתראה במסע!',
        team: 'צוות נפגשים בשביל ישראל'
      },
      en: {
        subject: 'Registration Confirmation - Nifgashim for Israel',
        greeting: 'Hello,',
        confirmed: 'Your registration for "Nifgashim for Israel" trek has been confirmed!',
        details: 'Registration Details:',
        days: 'Number of days',
        negevDays: 'Negev days',
        totalCost: 'Total cost',
        paymentStatus: 'Payment status',
        nextSteps: 'Next Steps:',
        step1: '1. Complete payment (if not yet paid)',
        step2: '2. Download the app and create your personal QR code',
        step3: '3. Arrive at meeting points on time',
        questions: 'Questions? Contact:',
        email: 'info@nifgashim.org.il',
        seeYou: 'See you on the trek!',
        team: 'Nifgashim for Israel Team'
      }
    };

    const t = translations[language] || translations.he;

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${language === 'he' ? 'rtl' : 'ltr'};">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">✅ ${t.confirmed}</h1>
        </div>
        
        <div style="padding: 30px; background: white;">
          <p style="font-size: 16px; color: #374151;">${t.greeting}</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1f2937;">${t.details}</h3>
            <p><strong>${t.days}:</strong> ${registration.total_days_count}</p>
            <p><strong>${t.negevDays}:</strong> ${registration.negev_days_count}</p>
            <p><strong>${t.totalCost}:</strong> ${registration.total_amount}₪</p>
            <p><strong>${t.paymentStatus}:</strong> ${registration.payment_status}</p>
          </div>

          <div style="margin: 30px 0;">
            <h3 style="color: #1f2937;">${t.nextSteps}</h3>
            <p>${t.step1}</p>
            <p>${t.step2}</p>
            <p>${t.step3}</p>
          </div>

          <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0;"><strong>${t.questions}</strong></p>
            <p style="margin: 5px 0 0 0;">${t.email}</p>
          </div>

          <p style="margin-top: 30px; font-size: 18px; color: #3b82f6; font-weight: bold;">${t.seeYou}</p>
          <p style="color: #6b7280;">${t.team}</p>
        </div>
      </div>
    `;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: registration.user_email,
      subject: t.subject,
      body: emailBody
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('Error:', error);
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
});