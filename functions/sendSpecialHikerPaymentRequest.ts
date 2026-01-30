import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Helper function to encode string to base64 for Gmail API
function encodeBase64(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}

// Helper to send email via Gmail API
async function sendEmailViaGmail(accessToken, to, subject, htmlBody) {
  // Encode subject in base64 for UTF-8 support
  const encodedSubject = encodeBase64(subject);
  
  const message = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${encodedSubject}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    encodeBase64(htmlBody)
  ].join('\r\n');

  // Encode the entire message for Gmail API
  const rawMessage = encodeBase64(message)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: rawMessage })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Gmail API Error:', error);
    throw new Error(`Gmail API error: ${error}`);
  }

  return await response.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { registrationId, selectedDays, customAmount, language = 'he' } = await req.json();

    if (!registrationId || !selectedDays || !customAmount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get registration
    const registrations = await base44.asServiceRole.entities.NifgashimRegistration.filter({ id: registrationId });
    const registration = registrations[0];

    if (!registration) {
      return Response.json({ error: 'Registration not found' }, { status: 404 });
    }

    const participantEmail = registration.customer_email || registration.user_email || registration.participants?.[0]?.email;
    const participantName = registration.participants?.[0]?.name || registration.customer_name || participantEmail;

    if (!participantEmail) {
      return Response.json({ error: 'No email found for participant' }, { status: 400 });
    }

    // Update registration with special hiker status and pending custom payment
    await base44.asServiceRole.entities.NifgashimRegistration.update(registrationId, {
      selected_days: selectedDays,
      selectedDays: selectedDays.map(dayNum => ({ day_number: dayNum })),
      is_special_hiker: true,
      custom_payment_amount: customAmount,
      custom_payment_status: 'pending',
      custom_payment_requested_at: new Date().toISOString(),
      custom_payment_requested_by: user.email
    });

    // Generate payment link - direct to PayPal payment page on portal
    const baseUrl = 'https://groupyloopy.app';
    const paymentUrl = `${baseUrl}/NifgashimPortal?payment_request=${registrationId}&amount=${customAmount}`;

    // Prepare email content
    const translations = {
      he: {
        subject: 'בקשת תשלום מיוחדת - נפגשים בשביל ישראל',
        greeting: `שלום ${participantName},`,
        intro: 'קיבלנו את בקשתך להשתתף כמטייל חריג בכל ימי הטיול!',
        daysLabel: 'ימי טיול נבחרים',
        amountLabel: 'סכום לתשלום',
        payButton: 'לחץ כאן לתשלום',
        note: 'לאחר התשלום תקבל אישור במייל עם קוד QR להשתתפות.',
        thanks: 'תודה רבה,',
        team: 'צוות נפגשים בשביל ישראל'
      },
      en: {
        subject: 'Special Payment Request - Nifgashim for Israel',
        greeting: `Hello ${participantName},`,
        intro: 'We received your request to participate as a special hiker for all trek days!',
        daysLabel: 'Selected Trek Days',
        amountLabel: 'Amount to Pay',
        payButton: 'Click here to pay',
        note: 'After payment you will receive a confirmation email with your QR code for participation.',
        thanks: 'Thank you,',
        team: 'Nifgashim for Israel Team'
      },
      ru: {
        subject: 'Специальный запрос на оплату - Nifgashim',
        greeting: `Здравствуйте ${participantName},`,
        intro: 'Мы получили вашу заявку на участие в качестве особого участника на все дни!',
        daysLabel: 'Выбранные дни',
        amountLabel: 'Сумма к оплате',
        payButton: 'Нажмите для оплаты',
        note: 'После оплаты вы получите подтверждение с QR-кодом для участия.',
        thanks: 'Спасибо,',
        team: 'Команда Nifgashim'
      },
      es: {
        subject: 'Solicitud de Pago Especial - Nifgashim',
        greeting: `Hola ${participantName},`,
        intro: '¡Recibimos su solicitud para participar como excursionista especial en todos los días!',
        daysLabel: 'Días Seleccionados',
        amountLabel: 'Monto a Pagar',
        payButton: 'Haga clic para pagar',
        note: 'Después del pago recibirá un correo de confirmación con su código QR.',
        thanks: 'Gracias,',
        team: 'Equipo Nifgashim'
      },
      fr: {
        subject: 'Demande de Paiement Spéciale - Nifgashim',
        greeting: `Bonjour ${participantName},`,
        intro: 'Nous avons reçu votre demande de participation en tant que randonneur spécial!',
        daysLabel: 'Jours Sélectionnés',
        amountLabel: 'Montant à Payer',
        payButton: 'Cliquez pour payer',
        note: 'Après le paiement, vous recevrez un email de confirmation avec votre code QR.',
        thanks: 'Merci,',
        team: 'Équipe Nifgashim'
      },
      de: {
        subject: 'Besondere Zahlungsanforderung - Nifgashim',
        greeting: `Hallo ${participantName},`,
        intro: 'Wir haben Ihre Anfrage für die Teilnahme als besonderer Wanderer erhalten!',
        daysLabel: 'Ausgewählte Tage',
        amountLabel: 'Zu zahlender Betrag',
        payButton: 'Hier klicken zum Bezahlen',
        note: 'Nach der Zahlung erhalten Sie eine Bestätigungs-E-Mail mit Ihrem QR-Code.',
        thanks: 'Danke,',
        team: 'Nifgashim Team'
      },
      it: {
        subject: 'Richiesta di Pagamento Speciale - Nifgashim',
        greeting: `Ciao ${participantName},`,
        intro: 'Abbiamo ricevuto la tua richiesta di partecipare come escursionista speciale!',
        daysLabel: 'Giorni Selezionati',
        amountLabel: 'Importo da Pagare',
        payButton: 'Clicca per pagare',
        note: 'Dopo il pagamento riceverai una email di conferma con il tuo codice QR.',
        thanks: 'Grazie,',
        team: 'Team Nifgashim'
      }
    };

    const t = translations[language] || translations.en;
    const isRTL = language === 'he';

    const htmlBody = `
<!DOCTYPE html>
<html dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">⭐ ${t.subject}</h1>
  </div>
  
  <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    <p style="font-size: 18px; margin-bottom: 20px;">${t.greeting}</p>
    
    <p style="font-size: 16px; margin-bottom: 25px;">${t.intro}</p>
    
    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 2px solid #f59e0b;">
      <p style="margin: 0 0 10px 0; font-weight: bold; color: #92400e;">${t.daysLabel}:</p>
      <p style="margin: 0; font-size: 20px; color: #78350f;">
        ${selectedDays.length} ${language === 'he' ? 'ימים' : 'days'} (${selectedDays.join(', ')})
      </p>
    </div>
    
    <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 2px solid #10b981;">
      <p style="margin: 0 0 10px 0; font-weight: bold; color: #065f46;">${t.amountLabel}:</p>
      <p style="margin: 0; font-size: 32px; font-weight: bold; color: #047857;">₪${customAmount}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${paymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);">
        ${t.payButton}
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 25px;">
      ${t.note}
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
    
    <p style="margin: 0; font-size: 14px;">${t.thanks}</p>
    <p style="margin: 5px 0 0 0; font-weight: bold; color: #f97316;">${t.team}</p>
  </div>
</body>
</html>
    `;

    // Try to send via Gmail API first
    let emailSent = false;
    let emailError = null;
    
    try {
      console.log('Attempting to send email via Gmail to:', participantEmail);
      const gmailToken = await base44.asServiceRole.connectors.getAccessToken('gmail');
      console.log('Got Gmail token, sending email...');
      await sendEmailViaGmail(gmailToken, participantEmail, t.subject, htmlBody);
      emailSent = true;
      console.log('Email sent successfully via Gmail');
    } catch (gmailError) {
      console.error('Gmail failed:', gmailError.message);
      emailError = gmailError.message;
      
      // Fallback to Core.SendEmail
      try {
        console.log('Trying Core.SendEmail as fallback...');
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: participantEmail,
          subject: t.subject,
          body: htmlBody,
          from_name: 'נפגשים בשביל ישראל'
        });
        emailSent = true;
        console.log('Email sent successfully via Core.SendEmail');
      } catch (coreError) {
        console.error('Core.SendEmail also failed:', coreError.message);
        emailError = `Gmail: ${gmailError.message}, Core: ${coreError.message}`;
      }
    }
    
    if (!emailSent) {
      return Response.json({ 
        success: false, 
        error: 'Failed to send email: ' + emailError
      }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      message: 'Payment request sent',
      email: participantEmail,
      amount: customAmount,
      days: selectedDays.length
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});