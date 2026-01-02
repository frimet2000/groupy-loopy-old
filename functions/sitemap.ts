import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  // וידוא שהבקשה היא מסוג GET
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const baseUrl = 'https://groupyloopy.app';
    const now = new Date().toISOString().split('T')[0];
    const languages = ['en', 'he', 'es', 'fr', 'de', 'it', 'ru'];
    
    // 1. הגדרת דפים סטטיים
    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: 'CreateTrip', priority: '0.9', changefreq: 'weekly' },
      { path: 'MyTrips', priority: '0.8', changefreq: 'daily' },
      { path: 'Community', priority: '0.7', changefreq: 'daily' },
      { path: 'TripPlanningGuide', priority: '0.9', changefreq: 'monthly' }
    ];
    
    // 2. משיכת נתונים דינמיים (טיולים ציבוריים)
    const trips = await base44.asServiceRole.entities.Trip.filter({ 
      status: 'open',
      privacy: 'public' 
    }, '-created_date', 100);
    
    // 3. בניית מבנה ה-XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
    
    // הוספת דפים סטטיים עם גרסאות שפה
    staticPages.forEach(page => {
      const pagePath = page.path ? `/${page.path}` : '';
      
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${pagePath}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      
      // תגיות שפה (Hreflang) לקידום בינלאומי
      languages.forEach(lang => {
        xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}${pagePath}?lang=${lang}" />\n`;
      });
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${pagePath}" />\n`;
      xml += '  </url>\n';
    });
    
    // הוספת דפי טיולים דינמיים
    trips.forEach(trip => {
      const tripDate = (trip.updated_date || trip.created_date || now).split('T')[0];
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/TripDetails?id=${trip.id}</loc>\n`;
      xml += `    <lastmod>${tripDate}</lastmod>\n`;
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';

    // 4. החזרת ה-Response עם ה-Headers הנכונים
    return new Response(xml.trim(), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('Sitemap Error:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
});