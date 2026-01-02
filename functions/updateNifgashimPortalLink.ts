import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const tripId = '6946647d7d7b248feaf1b118';
    const portalUrl = 'https://groupyloopy.app/NifgashimPortal';

    const trips = await base44.entities.Trip.filter({ id: tripId });
    const trip = trips[0];

    if (!trip) {
      return Response.json({ error: 'Trip not found' }, { status: 404 });
    }

    const currentDescription = trip.description || '';
    const newDescription = currentDescription.includes(portalUrl)
      ? currentDescription
      : `${currentDescription}\n\n🔗 ${portalUrl}`;

    await base44.entities.Trip.update(tripId, {
      description: newDescription
    });

    return Response.json({ 
      success: true, 
      message: 'Portal link added to trip description',
      portalUrl 
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});