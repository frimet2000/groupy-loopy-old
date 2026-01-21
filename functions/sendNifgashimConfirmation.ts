// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { registrationId, language = 'he' } = await req.json();

    // Get registration details
    const registration = await base44.asServiceRole.entities.NifgashimRegistration.get(registrationId);
    
    // Generate edit token if doesn't exist
    let editToken = registration.edit_token;
    if (!editToken) {
      editToken = crypto.randomUUID() + '-' + crypto.randomUUID();
      await base44.asServiceRole.entities.NifgashimRegistration.update(registrationId, {
        edit_token: editToken,
        edit_token_created_at: new Date().toISOString()
      });
    }
    
    // Build edit URL
    const baseUrl = req.headers.get('origin') || 'https://groupyloopy.app';
    const editUrl = `${baseUrl}/EditNifgashimDays?regId=${registrationId}&token=${editToken}`;
    
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
        editDays: 'לשינוי ימי המסע לחץ כאן',
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
        editDays: 'Click here to change your trek days',
        questions: 'Questions? Contact:',
        email: 'info@nifgashim.org.il',
        seeYou: 'See you on the trek!',
        team: 'Nifgashim for Israel Team'
      }
    };

    const t = translations[language] || translations.he;

    // Get selected days details
    const selectedDays = registration.selected_days || [];
    const selectedDaysData = registration.selectedDays || [];
    
    // Build days list HTML
    let selectedDaysHtml = '';
    if (selectedDays.length > 0) {
      const sortedDays = [...selectedDays].sort((a, b) => a - b);
      const daysInfo = sortedDays.map(dayNum => {
        const savedDay = selectedDaysData.find(d => d.day_number === dayNum);
        const dayTitle = savedDay?.daily_title || '';
        const dayDate = savedDay?.date || '';
        
        let formattedDate = '';
        if (dayDate) {
          const d = new Date(dayDate);
          formattedDate = d.toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          });
        }
        
        return { dayNum, dayTitle, formattedDate };
      });
      
      selectedDaysHtml = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          ${daysInfo.map(d => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 8px; text-align: ${language === 'he' ? 'right' : 'left'};">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; width: 32px; height: 32px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                    ${d.dayNum}
                  </span>
                  <div>
                    <div style="font-weight: 600; color: #1e293b;">${d.dayTitle || (language === 'he' ? `יום ${d.dayNum}` : `Day ${d.dayNum}`)}</div>
                    ${d.formattedDate ? `<div style="font-size: 12px; color: #64748b;">📅 ${d.formattedDate}</div>` : ''}
                  </div>
                </div>
              </td>
            </tr>
          `).join('')}
        </table>
      `;
    }

    const participants = registration.participants || [];
    const paymentStatusText = registration.payment_status === 'completed' ? (language === 'he' ? 'שולם' : 'Paid') :
                              registration.payment_status === 'exempt' ? (language === 'he' ? 'פטור' : 'Exempt') : (language === 'he' ? 'ממתין' : 'Pending');

    const emailBody = `
<!DOCTYPE html>
<html dir="${language === 'he' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f1f5f9;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
      <h1 style="margin: 0; color: white; font-size: 24px;">✅ ${t.confirmed}</h1>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="font-size: 18px; color: #1e293b; margin-bottom: 10px;">${t.greeting}</p>
      
      <!-- Registration Details -->
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin-top: 0;">📋 ${t.details}</h3>
        
        <!-- Selected Days -->
        <div style="margin-bottom: 20px;">
          <p style="font-weight: 600; color: #1e293b; margin-bottom: 8px;">🗓️ ${language === 'he' ? 'ימים נבחרים' : 'Selected Days'}:</p>
          ${selectedDaysHtml}
        </div>
        
        <table style="width: 100%; color: #475569;">
          <tr>
            <td style="padding: 8px 0;"><strong>${language === 'he' ? 'משתתפים' : 'Participants'}:</strong></td>
            <td style="padding: 8px 0;">${participants.length}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>${t.totalCost}:</strong></td>
            <td style="padding: 8px 0;">${registration.total_amount || registration.amount || 0}₪</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>${t.paymentStatus}:</strong></td>
            <td style="padding: 8px 0;">
              <span style="background: ${registration.payment_status === 'completed' ? '#dcfce7' : registration.payment_status === 'exempt' ? '#dbeafe' : '#fef9c3'}; 
                          color: ${registration.payment_status === 'completed' ? '#166534' : registration.payment_status === 'exempt' ? '#1e40af' : '#854d0e'}; 
                          padding: 4px 12px; border-radius: 20px; font-size: 14px;">
                ${paymentStatusText}
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Next Steps -->
      <div style="margin: 30px 0;">
        <h3 style="color: #1f2937;">${t.nextSteps}</h3>
        ${registration.payment_status !== 'completed' && registration.payment_status !== 'exempt' ? `<p>${t.step1}</p>` : ''}
        <p>${t.step2}</p>
        <p>${t.step3}</p>
      </div>

      <!-- Edit Days Link -->
      <div style="text-align: center; margin: 20px 0;">
        <a href="${editUrl}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #6366f1); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          ✏️ ${t.editDays}
        </a>
      </div>

      <!-- Contact Info -->
      <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; border-${language === 'he' ? 'right' : 'left'}: 4px solid #3b82f6;">
        <p style="margin: 0;"><strong>${t.questions}</strong></p>
        <p style="margin: 5px 0 0 0;">${t.email}</p>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 30px;">
        <p style="font-size: 20px; color: #3b82f6; font-weight: bold; margin-bottom: 10px;">${t.seeYou}</p>
        <p style="color: #64748b; margin: 0;">${t.team}</p>
      </div>
    </div>
  </div>
</body>
</html>
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