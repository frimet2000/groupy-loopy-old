import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  // גוגל חייב GET
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const baseUrl = 'https://groupyloopy.app';
    const now = new Date().toISOString().split('T')[0];
    const languages = ['en', 'he', 'es', 'fr', 'de', 'it', 'ru'];
    
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
    
    const trips = await base44.asServiceRole.entities.Trip.filter({ 
      status: 'open',
      privacy: 'public' 
    }, '-created_date', 100);
    
    // בניית ה-XML בפורמט תקין
    const xmlLines = [];
    xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
    xmlLines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">');
    
    staticPages.forEach(page => {
      const pagePath = page.path ? '/' + page.path : '';
      xmlLines.push('  <url>');
      xmlLines.push(`    <loc>${baseUrl}${pagePath}</loc>`);
      xmlLines.push(`    <lastmod>${now}</lastmod>`);
      xmlLines.push(`    <changefreq>${page.changefreq}</changefreq>`);
      xmlLines.push(`    <priority>${page.priority}</priority>`);
      languages.forEach(lang => {
        xmlLines.push(`    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}${pagePath}?lang=${lang}" />`);
      });
      xmlLines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${pagePath}" />`);
      xmlLines.push('  </url>');
      
      languages.forEach(lang => {
        xmlLines.push('  <url>');
        xmlLines.push(`    <loc>${baseUrl}${pagePath}?lang=${lang}</loc>`);
        xmlLines.push(`    <lastmod>${now}</lastmod>`);
        xmlLines.push(`    <changefreq>${page.changefreq}</changefreq>`);
        xmlLines.push(`    <priority>${page.priority}</priority>`);
        xmlLines.push('  </url>');
      });
    });
    
    trips.forEach(trip => {
      const tripDate = (trip.updated_date || trip.created_date || new Date().toISOString()).split('T')[0];
      xmlLines.push('  <url>');
      xmlLines.push(`    <loc>${baseUrl}/TripDetails?id=${trip.id}</loc>`);
      xmlLines.push(`    <lastmod>${tripDate}</lastmod>`);
      xmlLines.push('    <changefreq>daily</changefreq>');
      xmlLines.push('    <priority>0.8</priority>');
      xmlLines.push('  </url>');
    });
    
    xmlLines.push('</urlset>');

    return new Response(xmlLines.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    const fallbackXml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://groupyloopy.app</loc></url></urlset>';
    return new Response(fallbackXml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    });
  }
});