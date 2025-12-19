import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { waypoints } = await req.json();

        if (!waypoints || waypoints.length < 2) {
            return Response.json({ error: 'At least 2 waypoints required' }, { status: 400 });
        }

        const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
        if (!apiKey) {
            return Response.json({ error: 'Google Maps API key not configured' }, { status: 500 });
        }

        // Build the origin, destination, and waypoints for Google Directions API
        const origin = `${waypoints[0].latitude},${waypoints[0].longitude}`;
        const destination = `${waypoints[waypoints.length - 1].latitude},${waypoints[waypoints.length - 1].longitude}`;
        
        // Middle waypoints (if any)
        const waypointsParam = waypoints.length > 2 
            ? waypoints.slice(1, -1).map(wp => `${wp.latitude},${wp.longitude}`).join('|')
            : '';

        // Build URL for Google Directions API
        let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=walking&key=${apiKey}`;
        
        if (waypointsParam) {
            url += `&waypoints=${waypointsParam}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK') {
            return Response.json({ error: `Google Maps API error: ${data.status}` }, { status: 400 });
        }

        // Extract the route path from the response
        const route = data.routes[0];
        const legs = route.legs;
        
        // Decode all polylines from all legs
        const allPoints = [];
        for (const leg of legs) {
            for (const step of leg.steps) {
                const points = decodePolyline(step.polyline.points);
                allPoints.push(...points);
            }
        }

        return Response.json({ 
            success: true,
            route: allPoints,
            distance: legs.reduce((sum, leg) => sum + leg.distance.value, 0), // in meters
            duration: legs.reduce((sum, leg) => sum + leg.duration.value, 0) // in seconds
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

// Function to decode Google's encoded polyline
function decodePolyline(encoded) {
    const points = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
        let b;
        let shift = 0;
        let result = 0;
        
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        
        const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lat += dlat;

        shift = 0;
        result = 0;
        
        do {
            b = encoded.charCodeAt(index++) - 63;
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);
        
        const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
        lng += dlng;

        points.push([lat / 1e5, lng / 1e5]);
    }

    return points;
}