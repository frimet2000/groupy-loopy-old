Deno.serve(async (req) => {
  const adsTxtContent = `google.com, pub-4551819767344595, DIRECT, f08c47fec0942fa0`;

  return new Response(adsTxtContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
});