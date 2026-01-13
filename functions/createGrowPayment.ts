import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await req.json();
    const { sum, fullName, phone } = body;

    if (!sum || !fullName || !phone) {
      return Response.json(
        { error: 'Missing required fields: sum, fullName, phone' },
        { status: 400 }
      );
    }

    const userId = Deno.env.get('GROW_USER_ID');
    const pageCode = Deno.env.get('GROW_PAGE_CODE');

    if (!userId || !pageCode) {
      console.error('Missing Grow credentials');
      return Response.json(
        { error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    // Prepare URLSearchParams for Grow API
    const params = new URLSearchParams();
    params.append('userId', userId);
    params.append('pageCode', pageCode);
    params.append('sum', sum.toString());
    params.append('fullName', fullName);
    params.append('phone', phone);

    console.log('Calling Grow API with params:', {
      userId,
      pageCode,
      sum,
      fullName,
      phone
    });

    // Call Grow's createPaymentProcess API
    const growResponse = await fetch(
      'https://sandbox.meshulam.co.il/api/light/server/1.0/createPaymentProcess',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      }
    );

    const responseText = await growResponse.text();
    console.log('Grow API response:', responseText);

    if (!growResponse.ok) {
      console.error('Grow API error:', responseText);
      return Response.json(
        { error: 'Payment service error', details: responseText },
        { status: growResponse.status }
      );
    }

    // Parse XML response from Grow
    let processId = null;
    let processToken = null;

    // Extract processId and processToken from XML response
    const processIdMatch = responseText.match(/<processId>([^<]+)<\/processId>/);
    const tokenMatch = responseText.match(/<processToken>([^<]+)<\/processToken>/);
    const statusMatch = responseText.match(/<status>(\d+)<\/status>/);

    if (processIdMatch) {
      processId = processIdMatch[1];
    }
    if (tokenMatch) {
      processToken = tokenMatch[1];
    }

    const status = statusMatch ? parseInt(statusMatch[1]) : null;

    console.log('Parsed Grow response:', {
      status,
      processId,
      processToken: processToken ? '***' : 'null'
    });

    if (status !== 1 || !processId) {
      return Response.json(
        {
          error: 'Failed to create payment process',
          status,
          details: responseText
        },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      status,
      processId,
      processToken
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return Response.json(
      { error: error.message || 'Payment creation failed' },
      { status: 500 }
    );
  }
});