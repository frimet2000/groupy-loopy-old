// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Helper function to send email via Gmail API
async function sendEmailViaGmail(accessToken, to, subject, htmlBody) {
  const emailLines = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    htmlBody
  ];
  
  const email = emailLines.join('\r\n');
  const encodedEmail = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: encodedEmail })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gmail API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, idNumber, language = 'he' } = await req.json();

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find registration by email (and optionally ID number for extra security)
    const query = { user_email: email };
    const registrations = await base44.asServiceRole.entities.NifgashimRegistration.filter(query);
    
    if (!registrations || registrations.length === 0) {
      // Don't reveal if email exists or not for security
      return Response.json({ success: true, message: 'If a registration exists, an email will be sent' });
    }

    // If ID number provided, verify it matches
    let registration = registrations[0];
    if (idNumber) {
      registration = registrations.find(r => {
        const participants = r.participants || [];
        return participants.some(p => p.id_number === idNumber);
      });
      
      if (!registration) {
        return Response.json({ success: true, message: 'If a registration exists, an email will be sent' });
      }
    }

    // Generate new edit token if doesn't exist
    let editToken = registration.edit_token;
    if (!editToken) {
      editToken = crypto.randomUUID() + '-' + crypto.randomUUID();
      await base44.asServiceRole.entities.NifgashimRegistration.update(registration.id, {
        edit_token: editToken,
        edit_token_created_at: new Date().toISOString()
      });
    }

    // Build edit URL
    const baseUrl = req.headers.get('origin') || 'https://groupyloopy.app';
    const editUrl = `${baseUrl}/EditNifgashimDays?regId=${registration.id}&token=${editToken}`;

    const translations = {
      he: {
        subject: 'קישור לעריכת ימי המסע - נפגשים בשביל ישראל',
        greeting: 'שלום,',
        message: 'קיבלנו בקשה לשלוח לך את הקישור לעריכת ימי המסע שלך.',
        clickHere: 'לחץ כאן לעריכת ימי המסע',
        notYou: 'אם לא ביקשת זאת, התעלם מהודעה זו.',
        questions: 'שאלות? צור קשר:',
        email: 'info@nifgashim.org.il',
        team: 'צוות נפגשים בשביל ישראל'
      },
      en: {
        subject: 'Edit Trek Days Link - Nifgashim for Israel',
        greeting: 'Hello,',
        message: 'We received a request to send you the link to edit your trek days.',
        clickHere: 'Click here to edit your trek days',
        notYou: 'If you did not request this, please ignore this email.',
        questions: 'Questions? Contact:',
        email: 'info@nifgashim.org.il',
        team: 'Nifgashim for Israel Team'
      },
      ru: {
        subject: 'Ссылка для редактирования дней похода - Nifgashim',
        greeting: 'Привет,',
        message: 'Мы получили запрос на отправку ссылки для редактирования ваших дней похода.',
        clickHere: 'Нажмите здесь, чтобы отредактировать дни похода',
        notYou: 'Если вы не запрашивали это, проигнорируйте это письмо.',
        questions: 'Вопросы? Контакт:',
        email: 'info@nifgashim.org.il',
        team: 'Команда Nifgashim'
      },
      es: {
        subject: 'Enlace para editar días del trek - Nifgashim',
        greeting: 'Hola,',
        message: 'Recibimos una solicitud para enviarte el enlace para editar tus días de trek.',
        clickHere: 'Haz clic aquí para editar tus días de trek',
        notYou: 'Si no solicitaste esto, ignora este correo.',
        questions: '¿Preguntas? Contacto:',
        email: 'info@nifgashim.org.il',
        team: 'Equipo Nifgashim'
      },
      fr: {
        subject: 'Lien pour modifier les jours de trek - Nifgashim',
        greeting: 'Bonjour,',
        message: 'Nous avons reçu une demande pour vous envoyer le lien pour modifier vos jours de trek.',
        clickHere: 'Cliquez ici pour modifier vos jours de trek',
        notYou: 'Si vous n\'avez pas demandé cela, ignorez cet email.',
        questions: 'Questions? Contact:',
        email: 'info@nifgashim.org.il',
        team: 'Équipe Nifgashim'
      },
      de: {
        subject: 'Link zum Bearbeiten der Trek-Tage - Nifgashim',
        greeting: 'Hallo,',
        message: 'Wir haben eine Anfrage erhalten, Ihnen den Link zum Bearbeiten Ihrer Trek-Tage zu senden.',
        clickHere: 'Klicken Sie hier, um Ihre Trek-Tage zu bearbeiten',
        notYou: 'Wenn Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail.',
        questions: 'Fragen? Kontakt:',
        email: 'info@nifgashim.org.il',
        team: 'Nifgashim Team'
      },
      it: {
        subject: 'Link per modificare i giorni del trek - Nifgashim',
        greeting: 'Ciao,',
        message: 'Abbiamo ricevuto una richiesta per inviarti il link per modificare i tuoi giorni di trek.',
        clickHere: 'Clicca qui per modificare i tuoi giorni di trek',
        notYou: 'Se non hai richiesto questo, ignora questa email.',
        questions: 'Domande? Contatto:',
        email: 'info@nifgashim.org.il',
        team: 'Team Nifgashim'
      }
    };

    const t = translations[language] || translations.he;

    const emailBody = `
<!DOCTYPE html>
<html dir="${language === 'he' ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f1f5f9;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
      <h1 style="margin: 0; color: white; font-size: 24px;">🔗 ${t.subject}</h1>
    </div>
    
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px;">
      <p style="font-size: 18px; color: #1e293b;">${t.greeting}</p>
      <p style="color: #475569;">${t.message}</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${editUrl}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px;">
          ${t.clickHere}
        </a>
      </div>

      <p style="color: #94a3b8; font-size: 14px;">${t.notYou}</p>

      <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <p style="margin: 0;"><strong>${t.questions}</strong></p>
        <p style="margin: 5px 0 0 0;">${t.email}</p>
      </div>

      <div style="text-align: center; padding-top: 20px; margin-top: 30px; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b;">${t.team}</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    // Get Gmail access token and send via Gmail API
    let gmailAccessToken;
    try {
      gmailAccessToken = await base44.asServiceRole.connectors.getAccessToken('gmail');
    } catch (gmailError) {
      console.error('Failed to get Gmail access token:', gmailError.message);
      return Response.json({ error: 'Email service not configured' }, { status: 500 });
    }

    await sendEmailViaGmail(gmailAccessToken, email, t.subject, emailBody);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error resending edit link:', error);
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
});