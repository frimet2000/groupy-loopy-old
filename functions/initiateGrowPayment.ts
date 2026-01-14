import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sum, fullName, phone } = body;

    if (!sum || !fullName || !phone) {
      return Response.json({ error: 'Missing required fields: sum, fullName, phone' }, { status: 400 });
    }

    const userId = Deno.env.get('GROW_USER_ID');
    const pageCode = Deno.env.get('GROW_PAGE_CODE');

    if (!userId || !pageCode) {
      console.error('Missing Grow credentials');
      return Response.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('pageCode', pageCode);
    formData.append('sum', String(sum));
    formData.append('fullName', fullName);
    formData.append('phone', phone);

    console.log('Calling Grow API with:', { sum, fullName, phone });

    const growResponse = await fetch('https://sandbox.meshulam.co.il/api/light/server/1.0/createPaymentProcess', {
      method: 'POST',
      body: formData
    });

    if (!growResponse.ok) {
      const errorText = await growResponse.text();
      console.error('Grow API error:', growResponse.status, errorText);
      return Response.json(
        { error: `Grow API error: ${growResponse.status}` },
        { status: growResponse.status }
      );
    }

    const responseText = await growResponse.text();
    console.log('Raw Grow response:', responseText);

    // Try to parse as JSON first
    let growData;
    try {
      growData = JSON.parse(responseText);
    } catch {
      // If not JSON, try to parse as query string or handle raw response
      console.log('Response is not JSON, treating as text');
      growData = { rawResponse: responseText };
    }

    console.log('Grow API response:', growData);

    // Extract processId from response
    const processId = growData.processId || growData.data?.processId || growData?.id;

    if (!processId) {
      console.error('No processId in response:', growData);
      return Response.json(
        { error: 'Failed to create payment process', details: growData },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      processId,
      processToken: growData.processToken || growData.token
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    return Response.json(
      { error: error.message || 'Failed to initiate payment' },
      { status: 500 }
    );
  }
});