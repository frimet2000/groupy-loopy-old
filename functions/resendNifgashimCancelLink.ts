import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, idNumber, language = 'he' } = await req.json();

    if (!email) {
      return Response.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Find registration by email (and optionally ID number)
    let query = { customer_email: email };
    
    // If ID number provided, add to query
    if (idNumber) {
      query = { 
        customer_email: email,
        'participants.id_number': idNumber
      };
    }

    const registrations = await base44.asServiceRole.entities.NifgashimRegistration.filter(query);

    if (!registrations || registrations.length === 0) {
      // Don't reveal if registration exists or not for security
      return Response.json({ success: true });
    }

    // Get the most recent non-cancelled registration
    const activeReg = registrations
      .filter(r => r.registration_status !== 'cancelled')
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

    if (!activeReg) {
      return Response.json({ success: true });
    }

    // Generate edit token if not exists
    let editToken = activeReg.edit_token;
    if (!editToken) {
      editToken = crypto.randomUUID();
      await base44.asServiceRole.entities.NifgashimRegistration.update(activeReg.id, {
        edit_token: editToken,
        edit_token_created_at: new Date().toISOString()
      });
    }

    // Create cancel link
    const cancelUrl = `${new URL(req.url).origin}/CancelNifgashimRegistration?regId=${activeReg.id}&token=${editToken}`;

    // Email translations
    const translations = {
      he: {
        subject: '🔗 קישור לביטול השתתפות במסע - נפגשים בשביל ישראל',
        title: 'קישור לביטול השתתפות',
        greeting: 'שלום',
        intro: 'קיבלנו את בקשתך לקבל קישור לביטול ההשתתפות שלך במסע נפגשים בשביל ישראל.',
        button: 'ללחוץ כאן לביטול ההשתתפות',
        note: 'הקישור תקף ל-7 ימים מרגע קבלת האימייל.',
        warning: 'שים לב: ביטול ההשתתפות הוא בלתי הפיך.',
        notYou: 'אם לא ביקשת קישור זה, התעלם מאימייל זה.',
        footer: 'בברכה,<br><strong>צוות נפגשים בשביל ישראל</strong>'
      },
      en: {
        subject: '🔗 Trek Cancellation Link - Nifgashim for Israel',
        title: 'Trek Cancellation Link',
        greeting: 'Hello',
        intro: 'We received your request for a link to cancel your Nifgashim for Israel trek registration.',
        button: 'Click here to cancel registration',
        note: 'This link is valid for 7 days from receipt.',
        warning: 'Note: Cancellation is irreversible.',
        notYou: 'If you did not request this link, please ignore this email.',
        footer: 'Best regards,<br><strong>Nifgashim for Israel Team</strong>'
      },
      ru: {
        subject: '🔗 Ссылка для отмены регистрации - Nifgashim для Израиля',
        title: 'Ссылка для отмены',
        greeting: 'Здравствуйте',
        intro: 'Мы получили ваш запрос на ссылку для отмены регистрации на поход Nifgashim для Израиля.',
        button: 'Нажмите здесь для отмены',
        note: 'Ссылка действительна 7 дней с момента получения.',
        warning: 'Внимание: отмена необратима.',
        notYou: 'Если вы не запрашивали эту ссылку, проигнорируйте это письмо.',
        footer: 'С уважением,<br><strong>Команда Nifgashim для Израиля</strong>'
      },
      es: {
        subject: '🔗 Enlace de Cancelación - Nifgashim para Israel',
        title: 'Enlace de Cancelación',
        greeting: 'Hola',
        intro: 'Recibimos tu solicitud de enlace para cancelar tu registro en Nifgashim para Israel.',
        button: 'Haz clic aquí para cancelar',
        note: 'Este enlace es válido por 7 días desde su recepción.',
        warning: 'Nota: la cancelación es irreversible.',
        notYou: 'Si no solicitaste este enlace, ignora este correo.',
        footer: 'Saludos,<br><strong>Equipo Nifgashim para Israel</strong>'
      },
      fr: {
        subject: '🔗 Lien d\'Annulation - Nifgashim pour Israël',
        title: 'Lien d\'Annulation',
        greeting: 'Bonjour',
        intro: 'Nous avons reçu votre demande de lien pour annuler votre inscription à Nifgashim pour Israël.',
        button: 'Cliquez ici pour annuler',
        note: 'Ce lien est valide 7 jours à compter de sa réception.',
        warning: 'Note: l\'annulation est irréversible.',
        notYou: 'Si vous n\'avez pas demandé ce lien, ignorez cet e-mail.',
        footer: 'Cordialement,<br><strong>Équipe Nifgashim pour Israël</strong>'
      },
      de: {
        subject: '🔗 Stornierungslink - Nifgashim für Israel',
        title: 'Stornierungslink',
        greeting: 'Hallo',
        intro: 'Wir haben Ihre Anfrage für einen Link zur Stornierung Ihrer Nifgashim für Israel-Anmeldung erhalten.',
        button: 'Hier klicken zum Stornieren',
        note: 'Dieser Link ist 7 Tage ab Erhalt gültig.',
        warning: 'Hinweis: Die Stornierung ist unwiderruflich.',
        notYou: 'Wenn Sie diesen Link nicht angefordert haben, ignorieren Sie diese E-Mail.',
        footer: 'Mit freundlichen Grüßen,<br><strong>Nifgashim für Israel Team</strong>'
      },
      it: {
        subject: '🔗 Link di Annullamento - Nifgashim per Israele',
        title: 'Link di Annullamento',
        greeting: 'Ciao',
        intro: 'Abbiamo ricevuto la tua richiesta di link per annullare la registrazione a Nifgashim per Israele.',
        button: 'Clicca qui per annullare',
        note: 'Questo link è valido per 7 giorni dal ricevimento.',
        warning: 'Nota: l\'annullamento è irreversibile.',
        notYou: 'Se non hai richiesto questo link, ignora questa email.',
        footer: 'Cordiali saluti,<br><strong>Team Nifgashim per Israele</strong>'
      }
    };

    const trans = translations[language] || translations.en;

    // Send email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: trans.subject,
      body: `
        <!DOCTYPE html>
        <html dir="${language === 'he' ? 'rtl' : 'ltr'}">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta charset="UTF-8">
        </head>
        <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 20px; text-align: center;">
              <div style="background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 4px solid rgba(255,255,255,0.3);">
                <span style="font-size: 48px; color: white;">🔗</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                ${trans.title}
              </h1>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <p style="color: #333; font-size: 18px; margin-bottom: 10px;">
                ${trans.greeting} <strong>${activeReg.customer_name || ''}</strong>,
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                ${trans.intro}
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${cancelUrl}" style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3); transition: transform 0.2s;">
                  ${trans.button}
                </a>
              </div>

              <!-- Warning Box -->
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #92400e; margin: 0; font-size: 15px;">
                  ⚠️ <strong>${trans.warning}</strong>
                </p>
              </div>

              <!-- Note -->
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding: 15px; background: #f9fafb; border-radius: 8px; text-align: center;">
                📅 ${trans.note}
              </p>

              <!-- Security Note -->
              <p style="color: #9ca3af; font-size: 13px; text-align: center; margin-top: 20px;">
                ${trans.notYou}
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 2px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 15px; margin: 0; line-height: 1.6;">
                ${trans.footer}
              </p>
            </div>

          </div>
        </body>
        </html>
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error resending cancel link:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});