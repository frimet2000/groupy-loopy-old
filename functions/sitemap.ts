import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const baseUrl = 'https://groupyloopy.app';
    const now = new Date().toISOString().split('T')[0];
    
    // Static pages
    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: 'CreateTrip', priority: '0.9', changefreq: 'weekly' },
      { path: 'MyTrips', priority: '0.8', changefreq: 'daily' },
      { path: 'AIRecommendations', priority: '0.7', changefreq: 'weekly' },
      { path: 'Community', priority: '0.7', changefreq: 'daily' },
      { path: 'Weather', priority: '0.6', changefreq: 'weekly' },
      { path: 'TravelJournal', priority: '0.6', changefreq: 'weekly' },
      { path: 'AboutUs', priority: '0.5', changefreq: 'monthly' },
      { path: 'PrivacyPolicy', priority: '0.3', changefreq: 'monthly' },
      { path: 'TermsOfUse', priority: '0.3', changefreq: 'monthly' },
      { path: 'AccessibilityStatement', priority: '0.3', changefreq: 'monthly' },
      { path: 'NifgashimPortal', priority: '0.9', changefreq: 'weekly' }
    ];
    
    // Fetch dynamic trips (public only)
    const trips = await base44.asServiceRole.entities.Trip.filter({ 
      status: 'open',
      privacy: 'public' 
    }, '-created_date', 100);
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Add static pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.path ? '/' + page.path : ''}</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
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
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Sitemap error:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
});