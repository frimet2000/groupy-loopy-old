import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trip_id } = await req.json();
    
    // Get trip details
    const trips = await base44.asServiceRole.entities.Trip.filter({ id: trip_id });
    const trip = trips[0];
    
    if (!trip) {
      return Response.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Get access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlecalendar');

    const title = trip.title || trip.title_he || trip.title_en || 'Trip';
    const description = trip.description || trip.description_he || trip.description_en || '';
    const location = trip.location || '';
    
    // Calculate end time
    let endDate = new Date(trip.date);
    if (trip.duration_type === 'hours' && trip.duration_value) {
      endDate.setHours(endDate.getHours() + trip.duration_value);
    } else if (trip.duration_type === 'half_day') {
      endDate.setHours(endDate.getHours() + 4);
    } else if (trip.duration_type === 'full_day') {
      endDate.setDate(endDate.getDate() + 1);
    } else if (trip.duration_type === 'overnight') {
      endDate.setDate(endDate.getDate() + 1);
    } else if (trip.duration_type === 'multi_day' && trip.duration_value) {
      endDate.setDate(endDate.getDate() + trip.duration_value);
    } else {
      endDate.setHours(endDate.getHours() + 2);
    }

    const startDate = new Date(trip.date);
    if (trip.meeting_time) {
      const [hours, minutes] = trip.meeting_time.split(':');
      startDate.setHours(parseInt(hours), parseInt(minutes));
    } else {
      startDate.setHours(9, 0);
    }

    // Build attendees list
    const attendees = [];
    
    // Add organizer
    if (trip.organizer_email) {
      attendees.push({
        email: trip.organizer_email,
        organizer: true,
        responseStatus: 'accepted'
      });
    }
    
    // Add participants
    if (trip.participants && Array.isArray(trip.participants)) {
      trip.participants.forEach(p => {
        if (p.email && p.email !== trip.organizer_email) {
          attendees.push({
            email: p.email,
            responseStatus: 'needsAction'
          });
        }
      });
    }

    // Create event
    const event = {
      summary: title,
      description: description,
      location: location,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: 'UTC'
      },
      attendees: attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 }
        ]
      },
      guestsCanSeeOtherGuests: true,
      guestsCanModify: false
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Calendar API error: ${error}`);
    }

    const createdEvent = await response.json();

    return Response.json({ 
      success: true,
      event_link: createdEvent.htmlLink
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});