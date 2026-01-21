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
        subject: 'אישור ביטול השתתפות - נפגשים בשביל ישראל',
        greeting: 'שלום',
        body: `
          <p>קיבלנו את בקשתך לביטול ההשתתפות במסע נפגשים בשביל ישראל.</p>
          <p><strong>ההרשמה שלך בוטלה בהצלחה.</strong></p>
          ${cancellationReason ? `<p><strong>סיבת הביטול:</strong> ${cancellationReason}</p>` : ''}
          <p>אם יש לך שאלות או שביטלת בטעות, אנא צור קשר איתנו.</p>
          <p>נשמח לראותך במסעות הבאים!</p>
        `,
        footer: 'תודה,<br>צוות נפגשים בשביל ישראל'
      },
      en: {
        subject: 'Cancellation Confirmation - Nifgashim for Israel',
        greeting: 'Hello',
        body: `
          <p>We have received your request to cancel your Nifgashim for Israel trek registration.</p>
          <p><strong>Your registration has been successfully cancelled.</strong></p>
          ${cancellationReason ? `<p><strong>Cancellation Reason:</strong> ${cancellationReason}</p>` : ''}
          <p>If you have questions or cancelled by mistake, please contact us.</p>
          <p>We hope to see you on future treks!</p>
        `,
        footer: 'Thank you,<br>Nifgashim for Israel Team'
      }
    };

    const trans = translations[language] || translations.en;

    if (registration.customer_email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: registration.customer_email,
          subject: trans.subject,
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${trans.greeting} ${registration.customer_name || ''},</h2>
              ${trans.body}
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">${trans.footer}</p>
            </div>
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