// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { tripId } = body || {};
    if (!tripId) {
      return Response.json({ error: 'Missing tripId' }, { status: 400 });
    }

    const trips = await base44.asServiceRole.entities.Trip.filter({ id: tripId });
    const trip = trips[0];
    if (!trip) {
      return Response.json({ error: 'Trip not found' }, { status: 404 });
    }

    const updatedParticipants = (trip.participants || []).filter((p: any) => p.email !== user.email);
    const totalParticipantsCount = updatedParticipants.reduce((sum: number, p: any) => sum + (p.total_people || 1), 0);
    const updateData: any = { participants: updatedParticipants, current_participants: totalParticipantsCount };

    if (Array.isArray(trip.participants_selected_days) && trip.participants_selected_days.length > 0) {
      updateData.participants_selected_days = trip.participants_selected_days.filter((d: any) => d.email !== user.email);
    }

    await base44.asServiceRole.entities.Trip.update(tripId, updateData);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to leave' }, { status: 500 });
  }
});
