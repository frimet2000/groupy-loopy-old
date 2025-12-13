import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This function should be called by a cron job every 15 minutes
    const now = new Date();
    const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

    // Get all unsent reminders that should be sent in the next 15 minutes
    const reminders = await base44.asServiceRole.entities.TripReminder.filter({
      sent: false
    });

    const remindersToSend = reminders.filter(reminder => {
      const reminderTime = new Date(reminder.reminder_time);
      return reminderTime >= now && reminderTime <= fifteenMinutesFromNow;
    });

    console.log(`Found ${remindersToSend.length} reminders to send`);

    // Send each reminder
    for (const reminder of remindersToSend) {
      try {
        // Get trip details
        const trips = await base44.asServiceRole.entities.Trip.filter({ id: reminder.trip_id });
        const trip = trips[0];
        
        if (!trip) continue;

        const title = trip.title || trip.title_he || trip.title_en;
        const tripDate = new Date(trip.date);
        const formattedDate = tripDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });

        // Get user to check language preference
        const users = await base44.asServiceRole.entities.User.filter({ 
          email: reminder.user_email 
        });
        const user = users[0];
        const language = user?.language || 'en';

        const subject = language === 'he' 
          ? `תזכורת: ${title}`
          : `Reminder: ${title}`;

        const body = reminder.message || (language === 'he'
          ? `שלום,\n\nזוהי תזכורת לטיול "${title}" שמתקיים ב-${formattedDate}.\n\nמיקום: ${trip.location}\n${trip.meeting_time ? `שעת התכנסות: ${trip.meeting_time}\n` : ''}\nנתראה שם!\n\nבהצלחה,\nצוות The Group Loop`
          : `Hi,\n\nThis is a reminder for the trip "${title}" happening on ${formattedDate}.\n\nLocation: ${trip.location}\n${trip.meeting_time ? `Meeting time: ${trip.meeting_time}\n` : ''}\nSee you there!\n\nBest regards,\nThe Group Loop Team`);

        // Send email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: reminder.user_email,
          subject,
          body
        });

        // Mark as sent
        await base44.asServiceRole.entities.TripReminder.update(reminder.id, {
          sent: true,
          sent_at: new Date().toISOString()
        });

        console.log(`Sent reminder ${reminder.id} to ${reminder.user_email}`);
      } catch (error) {
        console.error(`Error sending reminder ${reminder.id}:`, error);
      }
    }

    return Response.json({ 
      success: true, 
      reminders_sent: remindersToSend.length,
      message: `Successfully sent ${remindersToSend.length} reminders` 
    });
  } catch (error) {
    console.error('Error in sendReminders:', error);
    return Response.json({ 
      error: error.message || 'Failed to send reminders' 
    }, { status: 500 });
  }
});