Deno.serve(async (req) => {
  const robotsTxt = `# Groupy Loopy - Robots.txt
User-agent: *
Allow: /
Disallow: /Dashboard
Disallow: /MyTrips
Disallow: /Settings
Disallow: /Profile
Disallow: /Admin
Disallow: /Inbox
Disallow: /Notifications
Disallow: /NifgashimDashboard
Disallow: /NifgashimCheckIn

# Sitemaps
Sitemap: https://groupyloopy.app/api/functions/sitemap

# Crawl-delay
Crawl-delay: 1
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
});