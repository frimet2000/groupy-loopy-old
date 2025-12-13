import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipient_email, notification_type, title, body, data } = await req.json();

    // Fetch recipient user to check notification preferences
    const users = await base44.asServiceRole.entities.User.filter({ email: recipient_email });
    const recipient = users[0];

    if (!recipient) {
      return Response.json({ error: 'Recipient not found' }, { status: 404 });
    }

    // Check if user wants this type of notification
    const prefs = recipient.notification_preferences || {};
    if (prefs[notification_type] === false) {
      return Response.json({ 
        success: true, 
        message: 'User has disabled this notification type',
        skipped: true 
      });
    }

    // Send email notification (since we don't have actual push notifications set up)
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipient_email,
      subject: title,
      body: body
    });

    return Response.json({ 
      success: true, 
      message: 'Notification sent successfully' 
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return Response.json({ 
      error: error.message || 'Failed to send notification' 
    }, { status: 500 });
  }
});