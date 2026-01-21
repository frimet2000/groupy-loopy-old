import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { registrationId, token, cancellationReason, language = 'he' } = await req.json();

    if (!registrationId || !token) {
      return Response.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    // Get registration
    const registrations = await base44.asServiceRole.entities.NifgashimRegistration.filter({ id: registrationId });
    if (!registrations || registrations.length === 0) {
      return Response.json({ success: false, error: 'Registration not found' }, { status: 404 });
    }

    const registration = registrations[0];

    // Verify token
    if (registration.edit_token !== token) {
      return Response.json({ success: false, error: 'Invalid token' }, { status: 403 });
    }

    // Check if already cancelled
    if (registration.registration_status === 'cancelled') {
      return Response.json({ success: false, error: 'Registration already cancelled' }, { status: 400 });
    }

    // Update registration to cancelled status
    await base44.asServiceRole.entities.NifgashimRegistration.update(registrationId, {
      registration_status: 'cancelled',
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: cancellationReason || null
    });

    // Send cancellation confirmation email
    const translations = {
      he: {
        subject: '⚠️ ביטול השתתפות במסע נפגשים בשביל ישראל',
        title: 'ההשתתפות שלך במסע בוטלה',
        cancelled: '✗ הרשמתך בוטלה בהצלחה',
        details: 'פרטי הביטול',
        reason: 'סיבת הביטול',
        date: 'תאריך הביטול',
        contact: 'אם ביטלת בטעות או יש לך שאלות, אנא צור קשר איתנו בהקדם.',
        future: 'נשמח לראותך במסעות הבאים!',
        footer: 'בברכה,<br><strong>צוות נפגשים בשביל ישראל</strong>'
      },
      en: {
        subject: '⚠️ Trek Registration Cancelled - Nifgashim for Israel',
        title: 'Your Trek Registration Has Been Cancelled',
        cancelled: '✗ Your registration was successfully cancelled',
        details: 'Cancellation Details',
        reason: 'Cancellation Reason',
        date: 'Cancellation Date',
        contact: 'If you cancelled by mistake or have questions, please contact us immediately.',
        future: 'We hope to see you on future treks!',
        footer: 'Best regards,<br><strong>Nifgashim for Israel Team</strong>'
      },
      ru: {
        subject: '⚠️ Регистрация на поход отменена - Nifgashim для Израиля',
        title: 'Ваша регистрация на поход отменена',
        cancelled: '✗ Регистрация успешно отменена',
        details: 'Детали отмены',
        reason: 'Причина отмены',
        date: 'Дата отмены',
        contact: 'Если вы отменили по ошибке или есть вопросы, свяжитесь с нами.',
        future: 'Надеемся увидеть вас на будущих походах!',
        footer: 'С уважением,<br><strong>Команда Nifgashim для Израиля</strong>'
      },
      es: {
        subject: '⚠️ Registro de Trek Cancelado - Nifgashim para Israel',
        title: 'Tu registro de trek ha sido cancelado',
        cancelled: '✗ Tu registro fue cancelado exitosamente',
        details: 'Detalles de cancelación',
        reason: 'Motivo de cancelación',
        date: 'Fecha de cancelación',
        contact: 'Si cancelaste por error o tienes preguntas, contáctanos inmediatamente.',
        future: '¡Esperamos verte en futuros treks!',
        footer: 'Saludos,<br><strong>Equipo Nifgashim para Israel</strong>'
      },
      fr: {
        subject: '⚠️ Inscription au Trek Annulée - Nifgashim pour Israël',
        title: 'Votre inscription au trek a été annulée',
        cancelled: '✗ Votre inscription a été annulée avec succès',
        details: 'Détails de l\'annulation',
        reason: 'Raison de l\'annulation',
        date: 'Date d\'annulation',
        contact: 'Si vous avez annulé par erreur ou avez des questions, contactez-nous immédiatement.',
        future: 'Nous espérons vous voir lors des prochains treks!',
        footer: 'Cordialement,<br><strong>Équipe Nifgashim pour Israël</strong>'
      },
      de: {
        subject: '⚠️ Trek-Registrierung Storniert - Nifgashim für Israel',
        title: 'Ihre Trek-Registrierung wurde storniert',
        cancelled: '✗ Ihre Registrierung wurde erfolgreich storniert',
        details: 'Stornierungsdetails',
        reason: 'Stornierungsgrund',
        date: 'Stornierungsdatum',
        contact: 'Wenn Sie versehentlich storniert haben oder Fragen haben, kontaktieren Sie uns sofort.',
        future: 'Wir hoffen, Sie bei zukünftigen Treks zu sehen!',
        footer: 'Mit freundlichen Grüßen,<br><strong>Nifgashim für Israel Team</strong>'
      },
      it: {
        subject: '⚠️ Registrazione Trek Annullata - Nifgashim per Israele',
        title: 'La tua registrazione al trek è stata annullata',
        cancelled: '✗ La tua registrazione è stata annullata con successo',
        details: 'Dettagli annullamento',
        reason: 'Motivo dell\'annullamento',
        date: 'Data di annullamento',
        contact: 'Se hai annullato per errore o hai domande, contattaci immediatamente.',
        future: 'Speriamo di vederti nei prossimi trek!',
        footer: 'Cordiali saluti,<br><strong>Team Nifgashim per Israele</strong>'
      }
    };

    const trans = translations[language] || translations.en;
    const cancelDate = new Date().toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (registration.customer_email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: registration.customer_email,
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
                
                <!-- Header with Red Alert -->
                <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 20px; text-align: center;">
                  <div style="background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 4px solid rgba(255,255,255,0.3);">
                    <span style="font-size: 48px; color: white;">✗</span>
                  </div>
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                    ${trans.title}
                  </h1>
                </div>

                <!-- Main Content -->
                <div style="padding: 40px 30px;">
                  
                  <!-- Cancellation Notice -->
                  <div style="background: #fee2e2; border: 3px solid #dc2626; border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
                    <p style="color: #991b1b; font-size: 20px; font-weight: bold; margin: 0;">
                      ${trans.cancelled}
                    </p>
                  </div>

                  <!-- Greeting -->
                  <p style="color: #333; font-size: 18px; margin-bottom: 20px;">
                    ${language === 'he' ? 'שלום' : 'Hello'} <strong>${registration.customer_name || ''}</strong>,
                  </p>

                  <!-- Details Box -->
                  <div style="background: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0; border: 2px solid #e5e7eb;">
                    <h2 style="color: #dc2626; margin: 0 0 20px 0; font-size: 18px; font-weight: bold; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">
                      📋 ${trans.details}
                    </h2>
                    
                    <div style="margin-bottom: 15px;">
                      <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">${trans.date}</div>
                      <div style="color: #111827; font-size: 16px; font-weight: 600;">${cancelDate}</div>
                    </div>
                    
                    ${cancellationReason ? `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                      <div style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">${trans.reason}</div>
                      <div style="color: #111827; font-size: 16px; background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
                        ${cancellationReason}
                      </div>
                    </div>
                    ` : ''}
                  </div>

                  <!-- Contact Notice -->
                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 15px; line-height: 1.6;">
                      💡 <strong>${trans.contact}</strong>
                    </p>
                  </div>

                  <!-- Future Message -->
                  <p style="color: #059669; font-size: 16px; text-align: center; padding: 20px; background: #d1fae5; border-radius: 8px; margin: 30px 0;">
                    🌟 ${trans.future}
                  </p>

                </div>

                <!-- Footer -->
                <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 2px solid #e5e7eb;">
                  <p style="color: #6b7280; font-size: 15px; margin: 0; line-height: 1.6;">
                    ${trans.footer}
                  </p>
                </div>

              </div>
              
              <!-- Mobile Responsive Note -->
              <div style="max-width: 600px; margin: 20px auto; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                  ${language === 'he' ? 'אימייל זה נשלח אוטומטית מהמערכת' : 'This email was sent automatically from the system'}
                </p>
              </div>
            </body>
            </html>
          `
        });
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }
    }

    // Notify admin
    try {
      const trips = await base44.asServiceRole.entities.Trip.filter({ id: registration.trip_id });
      if (trips && trips.length > 0) {
        const trip = trips[0];
        const adminEmail = trip.organizer_email;
        
        if (adminEmail) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: adminEmail,
            subject: `ביטול הרשמה: ${registration.customer_name}`,
            body: `
              <div style="font-family: Arial, sans-serif;">
                <h3>התקבל ביטול הרשמה למסע</h3>
                <p><strong>שם:</strong> ${registration.customer_name}</p>
                <p><strong>מייל:</strong> ${registration.customer_email}</p>
                <p><strong>משתתפים:</strong> ${registration.participants?.length || 0}</p>
                ${cancellationReason ? `<p><strong>סיבת ביטול:</strong> ${cancellationReason}</p>` : ''}
                <p><strong>תאריך ביטול:</strong> ${new Date().toLocaleString('he-IL')}</p>
              </div>
            `
          });
        }
      }
    } catch (adminEmailError) {
      console.error('Failed to send admin notification:', adminEmailError);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});