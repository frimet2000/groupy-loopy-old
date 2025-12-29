// Send chat notification via Push and Email with threading support
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const sender = await base44.auth.me();
    if (!sender) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      tripId,
      recipientEmails,
      message,
      isUrgent,
      isGroup,
      groupName,
      messageId
    } = await req.json();

    if (!recipientEmails || recipientEmails.length === 0 || !message) {
      return Response.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Get VAPID keys
    const publicKey = Deno.env.get('WEB_PUSH_PUBLIC_KEY');
    const privateKey = Deno.env.get('WEB_PUSH_PRIVATE_KEY');

    if (publicKey && privateKey) {
      webpush.setVapidDetails(
        'mailto:support@groupyloopy.com',
        publicKey,
        privateKey
      );
    }

    const results = [];

    // Send to each recipient
    for (const email of recipientEmails) {
      try {
        const recipients = await base44.asServiceRole.entities.User.filter({ email });
        if (recipients.length === 0) continue;

        const recipient = recipients[0];

        // Prepare notification title and body
        const title = isUrgent 
          ? `🚨 URGENT: ${sender.full_name || sender.first_name}`
          : (isGroup ? `${groupName}: ${sender.full_name || sender.first_name}` : sender.full_name || sender.first_name);
        
        const body = message.substring(0, 100) + (message.length > 100 ? '...' : '');

        // Send Push Notification
        const subscriptions = recipient.push_subscriptions || [];
        let pushSent = false;

        if (publicKey && privateKey && subscriptions.length > 0) {
          const payload = JSON.stringify({
            title,
            body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: `trip-${tripId}`,
            isUrgent, // Pass urgent flag to service worker
            data: {
              url: `/TripDetails?id=${tripId}`,
              tripId,
              messageId,
              isUrgent
            },
            requireInteraction: isUrgent,
            actions: [
              { action: 'open', title: isUrgent ? '⚠️ פתח' : 'פתח צ\'אט' },
              { action: 'close', title: 'סגור' }
            ]
          });

          const pushResults = await Promise.allSettled(
            subscriptions.map(async (subscription) => {
              try {
                await webpush.sendNotification(subscription, payload);
                pushSent = true;
                return { success: true, endpoint: subscription.endpoint };
              } catch (error) {
                // Handle expired subscriptions (410 Gone)
                if (error.statusCode === 410 || error.statusCode === 404) {
                  console.log('Removing expired subscription:', subscription.endpoint);
                  return { success: false, expired: true, endpoint: subscription.endpoint };
                }
                console.error('Push notification error:', error);
                return { success: false, expired: false, endpoint: subscription.endpoint };
              }
            })
          );

          // Clean up expired subscriptions
          const expiredEndpoints = pushResults
            .filter(r => r.value?.expired)
            .map(r => r.value.endpoint);

          if (expiredEndpoints.length > 0) {
            const updatedSubscriptions = subscriptions.filter(
              sub => !expiredEndpoints.includes(sub.endpoint)
            );
            await base44.asServiceRole.entities.User.update(recipient.id, {
              push_subscriptions: updatedSubscriptions
            });
          }
        }

        // Send Email with threading
        const urgentPrefix = isUrgent ? '🚨 URGENT: ' : '';
        const groupPrefix = isGroup ? `[${groupName}] ` : '';
        const subject = `${urgentPrefix}${groupPrefix}New message from ${sender.full_name || sender.first_name}`;
        
        // Create consistent Message-ID for threading
        const baseMessageId = `trip-${tripId}@groupyloopy.com`;
        const threadMessageId = `${messageId}@groupyloopy.com`;
        
        const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${isUrgent ? '#dc2626' : '#10b981'}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .urgent-banner { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
    .message { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; }
    .button { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${isUrgent ? '🚨 URGENT MESSAGE' : (isGroup ? `📢 ${groupName}` : '💬 New Message')}</h2>
      <p>From: ${sender.full_name || sender.first_name}</p>
    </div>
    
    ${isUrgent ? '<div class="urgent-banner">⚠️ This is a high-priority urgent message</div>' : ''}
    
    <div class="message">
      <p>${message.replace(/\n/g, '<br>')}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${Deno.env.get('APP_URL') || 'https://app.groupyloopy.com'}/TripDetails?id=${tripId}" class="button">
        Open Trip Chat
      </a>
    </div>
    
    <div class="footer">
      <p>This message was sent via Groupy Loopy</p>
      <p>To manage your notifications, visit your settings</p>
    </div>
  </div>
</body>
</html>
        `;

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          subject: subject,
          body: emailBody,
          headers: {
            'Message-ID': threadMessageId,
            'In-Reply-To': baseMessageId,
            'References': baseMessageId,
            'X-Priority': isUrgent ? '1' : '3',
            'Importance': isUrgent ? 'high' : 'normal'
          }
        });

        results.push({
          email,
          pushSent,
          emailSent: true,
          success: true
        });
      } catch (error) {
        results.push({
          email,
          success: false,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      results,
      totalSent: results.filter(r => r.success).length
    });

  } catch (error) {
    console.error('Error sending chat notification:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});