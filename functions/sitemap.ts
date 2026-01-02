import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  // Ensure proper handling of all requests
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    
    const baseUrl = 'https://groupyloopy.app';
    const now = new Date().toISOString().split('T')[0];
    const languages = ['en', 'he', 'es', 'fr', 'de', 'it', 'ru'];
    
    // Static pages
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
    
    // Fetch dynamic trips (public only)
    const trips = await base44.asServiceRole.entities.Trip.filter({ 
      status: 'open',
      privacy: 'public' 
    }, '-created_date', 100);
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ';
    xml += 'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
    
    // Add static pages with all language versions
    staticPages.forEach(page => {
      const pagePath = page.path ? '/' + page.path : '';
      
      // Default version (no lang param)
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${pagePath}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      
      // Add hreflang alternates
      languages.forEach(lang => {
        xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}${pagePath}?lang=${lang}" />\n`;
      });
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${pagePath}" />\n`;
      xml += '  </url>\n';
      
      // Add language-specific versions
      languages.forEach(lang => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${pagePath}?lang=${lang}</loc>\n`;
        xml += `    <lastmod>${now}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += '  </url>\n';
      });
    });
    
    // Add trip pages
    trips.forEach(trip => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/TripDetails?id=${trip.id}</loc>\n`;
      xml += `    <lastmod>${trip.updated_date || trip.created_date}</lastmod>\n`;
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });
    
    xml += '</urlset>';
    
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
    
    // Return a minimal valid XML even on error
    const errorXml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://groupyloopy.app</loc>\n  </url>\n</urlset>';
    
    return new Response(errorXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
});