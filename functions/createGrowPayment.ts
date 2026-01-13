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

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return Response.json(
        { error: 'Invalid JSON in request body', details: parseError.message },
        { status: 400 }
      );
    }

    const { sum, fullName, phone } = body;

    if (!sum || !fullName || !phone) {
      return Response.json(
        {
          error: 'Missing required fields',
          received: { sum, fullName, phone },
          required: ['sum', 'fullName', 'phone']
        },
        { status: 400 }
      );
    }

    // Validate sum is a number
    const numSum = typeof sum === 'string' ? parseFloat(sum) : sum;
    if (isNaN(numSum) || numSum <= 0) {
      return Response.json(
        { error: 'sum must be a positive number', received: sum },
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
    params.append('sum', numSum.toString());
    params.append('fullName', fullName.trim());
    params.append('phone', phone.trim());

    console.log('Calling Grow API with params:', {
      userId,
      pageCode,
      sum: numSum,
      fullName: fullName.trim(),
      phone: phone.trim(),
      paramsString: params.toString()
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
      console.error('Grow API HTTP error:', {
        status: growResponse.status,
        statusText: growResponse.statusText,
        responseText
      });
      return Response.json(
        {
          error: `Meshulam API error (HTTP ${growResponse.status})`,
          httpStatus: growResponse.status,
          statusText: growResponse.statusText,
          details: responseText
        },
        { status: 502 }
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
          error: 'Meshulam rejected payment process creation',
          meshulamStatus: status,
          meshulamStatusDesc: status === 0 ? 'Error' : status === 1 ? 'Success' : 'Unknown',
          missingProcessId: !processId,
          fullResponse: responseText
        },
        { status: 402 }
      );
    }

    return Response.json({
      success: true,
      status,
      processId,
      processToken
    });
  } catch (error) {
    console.error('Payment creation exception:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return Response.json(
      {
        error: 'Payment function error',
        message: error.message,
        type: error.name
      },
      { status: 500 }
    );
  }
});