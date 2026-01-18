// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import QRCode from 'npm:qrcode@1.5.3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { registrationId, language = 'he' } = await req.json();

    if (!registrationId) {
      return Response.json({ error: 'Registration ID required' }, { status: 400 });
    }

    // Get registration details
    const registration = await base44.asServiceRole.entities.NifgashimRegistration.get(registrationId);
    
    if (!registration) {
      return Response.json({ error: 'Registration not found' }, { status: 404 });
    }

    const participants = registration.participants || [];
    const mainParticipant = participants[0] || {};
    const recipientEmail = registration.customer_email || registration.user_email || mainParticipant.email;
    const recipientName = mainParticipant.name || registration.customer_name || recipientEmail;

    if (!recipientEmail) {
      return Response.json({ error: 'No email found for registration' }, { status: 400 });
    }

    // Generate QR codes for each participant
    const qrCodes = [];
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      
      const qrData = {
        rid: registrationId,
        pid: participant.id_number,
        idx: i,
        days: registration.selected_days || [],
        ts: Date.now(),
        hash: btoa(`${registrationId}-${participant.id_number}-${Date.now()}`).slice(0, 12)
      };

      const qrString = JSON.stringify(qrData);
      const encodedQR = btoa(qrString);

      const qrCodeDataUrl = await QRCode.toDataURL(encodedQR, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      });

      qrCodes.push({
        name: participant.name,
        idNumber: participant.id_number,
        qrCode: qrCodeDataUrl
      });
    }

    const selectedDays = registration.selected_days || [];
    const selectedDaysText = selectedDays.length > 0 
      ? selectedDays.sort((a, b) => a - b).join(', ')
      : '-';

    const translations = {
      he: {
        subject: 'קוד QR שלך - נפגשים בשביל ישראל 🎫',
        greeting: `שלום ${recipientName},`,
        intro: 'תודה שנרשמת למסע "נפגשים בשביל ישראל"!',
        qrTitle: 'קוד ה-QR האישי שלך',
        qrInstructions: 'הצג את הקוד הזה למארגנים בכניסה לכל יום טיול.',
        important: 'חשוב!',
        tip1: 'שמור את המייל הזה או צלם מסך של קוד ה-QR',
        tip2: 'הקוד תקף לכל הימים שנרשמת אליהם',
        tip3: 'ודא שהטלפון טעון ובעל קליטה',
        registrationDetails: 'פרטי ההרשמה:',
        selectedDays: 'ימים נבחרים',
        participants: 'משתתפים',
        paymentStatus: 'סטטוס תשלום',
        paid: 'שולם',
        pending: 'ממתין לתשלום',
        exempt: 'פטור',
        seeYou: 'נתראה במסע! 🥾',
        team: 'צוות נפגשים בשביל ישראל',
        participantQR: 'קוד QR עבור'
      },
      en: {
        subject: 'Your QR Code - Nifgashim for Israel 🎫',
        greeting: `Hello ${recipientName},`,
        intro: 'Thank you for registering for "Nifgashim for Israel" trek!',
        qrTitle: 'Your Personal QR Code',
        qrInstructions: 'Show this code to organizers at the entrance each trek day.',
        important: 'Important!',
        tip1: 'Save this email or screenshot the QR code',
        tip2: 'This code is valid for all days you registered for',
        tip3: 'Make sure your phone is charged and has signal',
        registrationDetails: 'Registration Details:',
        selectedDays: 'Selected Days',
        participants: 'Participants',
        paymentStatus: 'Payment Status',
        paid: 'Paid',
        pending: 'Pending Payment',
        exempt: 'Exempt',
        seeYou: 'See you on the trek! 🥾',
        team: 'Nifgashim for Israel Team',
        participantQR: 'QR Code for'
      },
      ru: {
        subject: 'Ваш QR-код - Nifgashim для Израиля 🎫',
        greeting: `Здравствуйте, ${recipientName},`,
        intro: 'Спасибо за регистрацию на поход "Nifgashim для Израиля"!',
        qrTitle: 'Ваш персональный QR-код',
        qrInstructions: 'Покажите этот код организаторам при входе каждый день похода.',
        important: 'Важно!',
        tip1: 'Сохраните это письмо или сделайте скриншот QR-кода',
        tip2: 'Этот код действителен для всех зарегистрированных дней',
        tip3: 'Убедитесь, что ваш телефон заряжен и есть сигнал',
        registrationDetails: 'Детали регистрации:',
        selectedDays: 'Выбранные дни',
        participants: 'Участники',
        paymentStatus: 'Статус оплаты',
        paid: 'Оплачено',
        pending: 'Ожидание оплаты',
        exempt: 'Освобожден',
        seeYou: 'Увидимся на походе! 🥾',
        team: 'Команда Nifgashim для Израиля',
        participantQR: 'QR-код для'
      },
      es: {
        subject: 'Tu Código QR - Nifgashim para Israel 🎫',
        greeting: `Hola ${recipientName},`,
        intro: '¡Gracias por registrarte en el trek "Nifgashim para Israel"!',
        qrTitle: 'Tu Código QR Personal',
        qrInstructions: 'Muestra este código a los organizadores en la entrada cada día de trek.',
        important: '¡Importante!',
        tip1: 'Guarda este correo o haz una captura del código QR',
        tip2: 'Este código es válido para todos los días registrados',
        tip3: 'Asegúrate de que tu teléfono esté cargado y tenga señal',
        registrationDetails: 'Detalles de Registro:',
        selectedDays: 'Días Seleccionados',
        participants: 'Participantes',
        paymentStatus: 'Estado de Pago',
        paid: 'Pagado',
        pending: 'Pago Pendiente',
        exempt: 'Exento',
        seeYou: '¡Nos vemos en el trek! 🥾',
        team: 'Equipo Nifgashim para Israel',
        participantQR: 'Código QR para'
      },
      fr: {
        subject: 'Votre Code QR - Nifgashim pour Israël 🎫',
        greeting: `Bonjour ${recipientName},`,
        intro: 'Merci de vous être inscrit au trek "Nifgashim pour Israël"!',
        qrTitle: 'Votre Code QR Personnel',
        qrInstructions: 'Montrez ce code aux organisateurs à l\'entrée chaque jour de trek.',
        important: 'Important!',
        tip1: 'Sauvegardez cet email ou faites une capture d\'écran du code QR',
        tip2: 'Ce code est valable pour tous les jours auxquels vous êtes inscrit',
        tip3: 'Assurez-vous que votre téléphone est chargé et a du signal',
        registrationDetails: 'Détails de l\'inscription:',
        selectedDays: 'Jours Sélectionnés',
        participants: 'Participants',
        paymentStatus: 'Statut de Paiement',
        paid: 'Payé',
        pending: 'Paiement en attente',
        exempt: 'Exempté',
        seeYou: 'À bientôt sur le trek! 🥾',
        team: 'Équipe Nifgashim pour Israël',
        participantQR: 'Code QR pour'
      },
      de: {
        subject: 'Ihr QR-Code - Nifgashim für Israel 🎫',
        greeting: `Hallo ${recipientName},`,
        intro: 'Danke für Ihre Anmeldung zum Trek "Nifgashim für Israel"!',
        qrTitle: 'Ihr persönlicher QR-Code',
        qrInstructions: 'Zeigen Sie diesen Code den Organisatoren am Eingang jedes Trek-Tages.',
        important: 'Wichtig!',
        tip1: 'Speichern Sie diese E-Mail oder machen Sie einen Screenshot des QR-Codes',
        tip2: 'Dieser Code gilt für alle angemeldeten Tage',
        tip3: 'Stellen Sie sicher, dass Ihr Telefon geladen ist und Empfang hat',
        registrationDetails: 'Anmeldedetails:',
        selectedDays: 'Ausgewählte Tage',
        participants: 'Teilnehmer',
        paymentStatus: 'Zahlungsstatus',
        paid: 'Bezahlt',
        pending: 'Zahlung ausstehend',
        exempt: 'Befreit',
        seeYou: 'Wir sehen uns auf dem Trek! 🥾',
        team: 'Nifgashim für Israel Team',
        participantQR: 'QR-Code für'
      },
      it: {
        subject: 'Il tuo Codice QR - Nifgashim per Israele 🎫',
        greeting: `Ciao ${recipientName},`,
        intro: 'Grazie per esserti registrato al trek "Nifgashim per Israele"!',
        qrTitle: 'Il tuo Codice QR Personale',
        qrInstructions: 'Mostra questo codice agli organizzatori all\'ingresso ogni giorno di trek.',
        important: 'Importante!',
        tip1: 'Salva questa email o fai uno screenshot del codice QR',
        tip2: 'Questo codice è valido per tutti i giorni a cui sei registrato',
        tip3: 'Assicurati che il tuo telefono sia carico e abbia segnale',
        registrationDetails: 'Dettagli Registrazione:',
        selectedDays: 'Giorni Selezionati',
        participants: 'Partecipanti',
        paymentStatus: 'Stato Pagamento',
        paid: 'Pagato',
        pending: 'Pagamento in attesa',
        exempt: 'Esente',
        seeYou: 'Ci vediamo al trek! 🥾',
        team: 'Team Nifgashim per Israele',
        participantQR: 'Codice QR per'
      }
    };

    const t = translations[language] || translations.he;
    const isRTL = language === 'he';
    const direction = isRTL ? 'rtl' : 'ltr';

    // Build QR codes HTML
    let qrCodesHtml = '';
    qrCodes.forEach((qr, idx) => {
      qrCodesHtml += `
        <div style="text-align: center; margin: 20px 0; padding: 20px; background: #f8fafc; border-radius: 12px; border: 2px solid #e2e8f0;">
          ${qrCodes.length > 1 ? `<p style="font-weight: bold; margin-bottom: 10px; color: #1e40af;">${t.participantQR}: ${qr.name}</p>` : ''}
          <img src="${qr.qrCode}" alt="QR Code" style="max-width: 250px; width: 100%; height: auto; border-radius: 8px;" />
          <p style="font-size: 12px; color: #64748b; margin-top: 8px;">${qr.idNumber}</p>
        </div>
      `;
    });

    const paymentStatusText = registration.payment_status === 'completed' ? t.paid :
                              registration.payment_status === 'exempt' ? t.exempt : t.pending;

    const emailHtml = `
<!DOCTYPE html>
<html dir="${direction}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background: #f1f5f9;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
      <h1 style="margin: 0; color: white; font-size: 24px;">🎫 ${t.qrTitle}</h1>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <p style="font-size: 18px; color: #1e293b; margin-bottom: 10px;">${t.greeting}</p>
      <p style="color: #475569; margin-bottom: 25px;">${t.intro}</p>
      
      <!-- QR Codes -->
      <div style="background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%); padding: 25px; border-radius: 12px; margin-bottom: 25px;">
        <h2 style="text-align: center; color: #1e40af; margin-top: 0;">${t.qrTitle}</h2>
        <p style="text-align: center; color: #64748b; margin-bottom: 20px;">${t.qrInstructions}</p>
        ${qrCodesHtml}
      </div>
      
      <!-- Important Tips -->
      <div style="background: #fef3c7; padding: 20px; border-radius: 12px; border-${isRTL ? 'right' : 'left'}: 4px solid #f59e0b; margin-bottom: 25px;">
        <h3 style="color: #92400e; margin-top: 0;">⚠️ ${t.important}</h3>
        <ul style="color: #78350f; padding-${isRTL ? 'right' : 'left'}: 20px; margin: 0;">
          <li style="margin-bottom: 8px;">${t.tip1}</li>
          <li style="margin-bottom: 8px;">${t.tip2}</li>
          <li>${t.tip3}</li>
        </ul>
      </div>
      
      <!-- Registration Details -->
      <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
        <h3 style="color: #1e293b; margin-top: 0;">📋 ${t.registrationDetails}</h3>
        <table style="width: 100%; color: #475569;">
          <tr>
            <td style="padding: 8px 0;"><strong>${t.selectedDays}:</strong></td>
            <td style="padding: 8px 0;">${selectedDaysText}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>${t.participants}:</strong></td>
            <td style="padding: 8px 0;">${participants.length}</td>
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
      
      <!-- Footer -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 20px; color: #3b82f6; font-weight: bold; margin-bottom: 10px;">${t.seeYou}</p>
        <p style="color: #64748b; margin: 0;">${t.team}</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: t.subject,
      body: emailHtml
    });

    // Update registration to mark QR email sent
    await base44.asServiceRole.entities.NifgashimRegistration.update(registrationId, {
      qr_email_sent: true,
      qr_email_sent_at: new Date().toISOString()
    });

    return Response.json({ 
      success: true, 
      message: 'QR email sent successfully',
      recipientEmail,
      participantsCount: participants.length
    });

  } catch (error) {
    console.error('Error sending QR email:', error);
    return Response.json({ error: error.message || 'Failed to send QR email' }, { status: 500 });
  }
});