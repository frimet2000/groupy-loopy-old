import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  // החזרת שגיאה אם זו לא בקשת GET
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const baseUrl = 'https://groupyloopy.app';
    const now = new Date().toISOString().split('T')[0];
    
    // משיכת טיולים ציבוריים מהדאטה-בייס (Customization)
    const trips = await base44.asServiceRole.entities.Trip.filter({ 
      status: 'open',
      privacy: 'public' 
    }, '-created_date', 100);
    
    // בניית ה-XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // הוספת דף הבית (עם עדיפות גבוהה)
    xml += `  <url><loc>${baseUrl}/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>\n`;

    // הוספת הטיולים הדינמיים (Auto-update)
    trips.forEach(trip => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/TripDetails?id=${trip.id}</loc>\n`;
      xml += `    <lastmod>${(trip.updated_date || now).split('T')[0]}</lastmod>\n`;
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';

    // שליחת ה-XML עם Header נקי (Bypassing HTML rendering)
    return new Response(xml.trim(), {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (e) {
    return new Response('Sitemap Error', { status: 500 });
  }
});