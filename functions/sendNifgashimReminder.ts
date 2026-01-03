// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { date, language = 'he' } = await req.json();

    // Get all registrations for this date
    const registrations = await base44.asServiceRole.entities.NifgashimRegistration.filter({
      registration_status: 'confirmed'
    });

    const participantsForDate = registrations.filter(reg => 
      reg.selected_days?.includes(date)
    );

    const translations = {
      he: {
        subject: 'תזכורת - מסע נפגשים בשביל ישראל מחר',
        greeting: 'שלום,',
        reminder: `מחר ${new Date(date).toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} תשתתף/י במסע "נפגשים בשביל ישראל"!`,
        remember: 'זכור/י:',
        item1: '✓ להגיע לנקודת המפגש בזמן',
        item2: '✓ להביא את קוד ה-QR האישי שלך',
        item3: '✓ ציוד הכרחי: נעליים נוחות, כובע, מים',
        item4: '✓ לוודא תשלום מלא',
        qr: 'להצגת קוד QR אישי, היכנס לאפליקציה',
        questions: 'שאלות? צור קשר:',
        email: 'info@nifgashim.org.il',
        seeYou: 'נתראה מחר!',
        team: 'צוות נפגשים בשביל ישראל'
      },
      en: {
        subject: 'Reminder - Nifgashim for Israel Trek Tomorrow',
        greeting: 'Hello,',
        reminder: `Tomorrow ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} you will participate in "Nifgashim for Israel" trek!`,
        remember: 'Remember:',
        item1: '✓ Arrive at meeting point on time',
        item2: '✓ Bring your personal QR code',
        item3: '✓ Essential gear: comfortable shoes, hat, water',
        item4: '✓ Ensure full payment',
        qr: 'To show your personal QR code, log into the app',
        questions: 'Questions? Contact:',
        email: 'info@nifgashim.org.il',
        seeYou: 'See you tomorrow!',
        team: 'Nifgashim for Israel Team'
      }
    };

    const t = translations[language] || translations.he;

    let sentCount = 0;

    for (const reg of participantsForDate) {
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${language === 'he' ? 'rtl' : 'ltr'};">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🔔 ${t.reminder}</h1>
          </div>
          
          <div style="padding: 30px; background: white;">
            <p style="font-size: 16px; color: #374151;">${t.greeting}</p>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-right: 4px solid #f59e0b;">
              <h3 style="margin-top: 0; color: #92400e;">${t.remember}</h3>
              <p>${t.item1}</p>
              <p>${t.item2}</p>
              <p>${t.item3}</p>
              <p>${t.item4}</p>
            </div>

            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px;">${t.qr}</p>
            </div>

            <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0;"><strong>${t.questions}</strong></p>
              <p style="margin: 5px 0 0 0;">${t.email}</p>
            </div>

            <p style="margin-top: 30px; font-size: 18px; color: #f59e0b; font-weight: bold;">${t.seeYou}</p>
            <p style="color: #6b7280;">${t.team}</p>
          </div>
        </div>
      `;

      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: reg.user_email,
          subject: t.subject,
          body: emailBody
        });
        sentCount++;
      } catch (e) {
        console.error(`Failed to send to ${reg.user_email}:`, e);
      }
    }

    return Response.json({ 
      success: true, 
      sent: sentCount, 
      total: participantsForDate.length 
    });
  } catch (error: any) {
    console.error('Error:', error);
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
});