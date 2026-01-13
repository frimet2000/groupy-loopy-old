// @ts-nocheck
// import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // const base44 = createClientFromRequest(req);
    
    // Allow CORS if needed, or handle by Deno deploy usually
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
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

    const { sum, fullName, phone, email, description } = body;

    // Validate required fields
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

    // Validate sum is a number/string and positive
    let numSum = parseFloat(sum);
    if (isNaN(numSum) || numSum <= 0) {
      return Response.json(
        { error: 'sum must be a positive number', received: sum },
        { status: 400 }
      );
    }

    // Use environment variables or defaults as requested
    const userId = Deno.env.get('GROW_USER_ID') || '5c04d711acb29250';
    const pageCode = Deno.env.get('GROW_PAGE_CODE') || '30f1b9975952';

    if (!userId || !pageCode) {
      console.error('Missing Grow credentials');
      return Response.json(
        { error: 'Missing Grow API credentials', status: 500 },
        { status: 500 }
      );
    }

    // Prepare FormData for Grow API
    const form = new FormData();
    form.append('userId', userId);
    form.append('pageCode', pageCode);
    form.append('sum', numSum.toFixed(2));
    form.append('fullName', fullName.trim());
    form.append('phone', phone.trim());
    
    // Add success and cancel URLs (required for some flows and prevents errors)
    const baseUrl = req.headers.get('origin') || 'https://groupyloopy.app';
    const successUrl = `${baseUrl}/nifgashimportal?payment_success=true`;
    const cancelUrl = `${baseUrl}/nifgashimportal?payment_cancel=true`;
    
    form.append('successUrl', successUrl);
    form.append('cancelUrl', cancelUrl);
    
    if (email) form.append('email', email.trim());
    if (description) form.append('description', description.trim());
    
    // Explicitly using Sandbox URL as requested
    const growUrl = 'https://sandbox.meshulam.co.il/api/light/server/1.0/createPaymentProcess';

    console.log('--- Sending Request to Meshulam (Sandbox) ---');
    console.log('URL:', growUrl);
    // console.log('Params:', params.toString());
    
    let growResponse;
    try {
      growResponse = await fetch(growUrl, {
        method: 'POST',
        headers: {
          // 'Content-Type': 'multipart/form-data', // Fetch handles boundary automatically
          'Accept': 'application/json'
        },
        body: form
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return Response.json(
        { error: 'Failed to connect to Meshulam API', details: fetchError.message },
        { status: 503 }
      );
    }

    const responseText = await growResponse.text();
    console.log('--- Meshulam Raw Response ---');
    console.log(responseText);
    console.log('-----------------------------');

    let responseData = {};
    let status = null;
    let errorMessage = null;
    let processId = null;
    let processToken = null;

    // Try parsing as JSON first
    try {
      responseData = JSON.parse(responseText);
      status = responseData.status;
      if (responseData.err) {
        errorMessage = responseData.err.message || JSON.stringify(responseData.err);
      }
      if (responseData.data) {
        processId = responseData.data.processId;
        processToken = responseData.data.processToken;
      }
    } catch (e) {
      // Fallback to XML regex parsing if JSON fails
      console.log('JSON parse failed, trying XML regex...');
      const statusMatch = responseText.match(/<status>([^<]+)<\/status>/);
      const errorDescMatch = responseText.match(/<errorDesc>([^<]+)<\/errorDesc>/);
      const processIdMatch = responseText.match(/<processId>([^<]+)<\/processId>/);
      const tokenMatch = responseText.match(/<processToken>([^<]+)<\/processToken>/);

      if (statusMatch) status = statusMatch[1];
      if (errorDescMatch) errorMessage = errorDescMatch[1];
      if (processIdMatch) processId = processIdMatch[1];
      if (tokenMatch) processToken = tokenMatch[1];
    }

    console.log('Parsed Status:', status);
    
    if (status !== '1') {
      console.error('Meshulam returned error status:', status);
      return Response.json(
        { 
          error: errorMessage || 'Meshulam API rejected the request',
          meshulamStatus: status,
          rawResponse: responseText,
          // If we got a URL despite the error, return it so client can use iframe
          url: responseData.data?.url || (responseText.match(/<url>([^<]+)<\/url>/) || [])[1],
          success: false // Explicitly mark as failed but with data
        },
        // Return 200 OK even on logic error so client can parse the JSON easily
        // (Axios throws on 402, making it hard to access the response body)
        { status: 200 } 
      );
    }

    return Response.json({
      success: true,
      processId,
      processToken,
      url: responseData.data?.url, // In case they return a URL
      // registrationId: registration.id, // Registration not created in this flow yet
      debug: responseData // for client side debugging
    });

  } catch (error) {
    console.error('Unexpected error in createGrowPayment:', error);
    return Response.json(
      { 
        error: 'Internal Server Error', 
        message: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
});
