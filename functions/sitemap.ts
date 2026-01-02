import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  // וידוא שגוגל (או המשתמש) משתמשים ב-GET
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const baseUrl = 'https://groupyloopy.app';
    const now = new Date().toISOString().split('T')[0];
    const languages = ['en', 'he', 'es', 'fr', 'de', 'it', 'ru'];
    
    // רשימת הדפים הסטטיים שלך
    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: 'CreateTrip', priority: '0.9', changefreq: 'weekly' },
      { path: 'MyTrips', priority: '0.8', changefreq: 'daily' },
      { path: 'AIRecommendations', priority: '0.7', changefreq: 'weekly' },
      { path: 'Community', priority: '0.7', changefreq: 'daily' },
      { path: 'Weather', priority: '0.6', changefreq: 'weekly' },
      { path: 'TravelJournal', priority: '0.6', changefreq: 'weekly' },
      { path: 'TripPlanningGuide', priority: '0.9', changefreq: 'monthly' },
      { path: 'AboutUs', priority: '0.5', changefreq: 'monthly' },
      { path: 'PrivacyPolicy', priority: '0.3', changefreq: 'monthly' },
      { path: 'TermsOfUse', priority: '0.3', changefreq: 'monthly' },
      { path: 'AccessibilityStatement', priority: '0.3', changefreq: 'monthly' },
      { path: 'Features', priority: '0.8', changefreq: 'monthly' },
      { path: 'NifgashimPortal', priority: '0.9', changefreq: 'weekly' }
    ];
    
    // משיכת טיולים ציבוריים מהדאטה-בייס של Base44
    const trips = await base44.asServiceRole.entities.Trip.filter({ 
      status: 'open',
      privacy: 'public' 
    }, '-created_date', 100);
    
    // בניית ה-XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
    
    staticPages.forEach(page => {
      const pagePath = page.path ? '/' + page.path : '';
      
      // כתובת ראשית (Canonical)
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${pagePath}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      
      // הזרקת תגיות hreflang - קריטי ל-SEO בינלאומי
      languages.forEach(lang => {
        xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}${pagePath}?lang=${lang}" />\n`;
      });
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${pagePath}" />\n`;
      xml += '  </url>\n';
      
      // הוספת כתובות השפות כדפים עצמאיים לסריקה עמוקה
      languages.forEach(lang => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${pagePath}?lang=${lang}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
      });
    });
    
    // דפי טיולים דינמיים
    trips.forEach(trip => {
      const tripDate = trip.updated_date || trip.created_date || now;
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/TripDetails?id=${trip.id}</loc>\n`;
      xml += `    <lastmod>${new Date(tripDate).toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    
    // החזרת תשובה עם Header מסוג XML - זה מה שיפתור את שגיאת ה-HTTP בגוגל
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff'
      }
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    // מנגנון הגנה: מחזיר XML בסיסי אם יש שגיאה כדי שגוגל לא יקבל 500
    const fallbackXml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://groupyloopy.app</loc>\n  </url>\n</urlset>';
    
    return new Response(fallbackXml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    });
  }
});