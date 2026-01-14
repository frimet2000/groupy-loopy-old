// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  console.log('--- createGrowPayment Invoked ---');
  
  try {
    // Initialize SDK just in case environment requires it, but don't enforce auth
    try {
        const base44 = createClientFromRequest(req);
    } catch (e) {
        console.warn('SDK initialization warning:', e);
    }

    // Allow CORS if needed
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Parse request body
    let body;
    try {
        body = await req.json();
    } catch (e) {
        console.error('Failed to parse request body:', e);
        return Response.json({ success: false, error: 'Invalid JSON body' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }
    
    const { sum, fullName, phone, description, email } = body;
    
    // Hardcoded credentials as per user instruction
    const userId = '5c04d711acb29250';
    const pageCode = '30f1b9975952';
    
    if (!sum) {
         console.error('Missing required fields:', { sum });
         return Response.json({ success: false, error: 'Missing required sum' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const numSum = Number(sum);

    // Prepare FormData for Grow API (using URLSearchParams for better compatibility)
    const params = new URLSearchParams();
    params.append('userId', userId);
    params.append('pageCode', pageCode);
    params.append('sum', numSum.toFixed(2));
    params.append('description', description || 'Nifgashim Payment');
    
    // Optional parameters - only send if provided
    // User requested that customer fills details on Grow page, so these might be omitted
    if (fullName) params.append('pageField[fullName]', fullName.trim());
    if (phone) params.append('pageField[phone]', phone.trim());
    if (email) params.append('pageField[email]', email.trim());

    // Add success and cancel URLs
    const baseUrl = req.headers.get('origin') || 'https://groupyloopy.app';
    const successUrl = `${baseUrl}/nifgashimportal?payment_success=true`;
    const cancelUrl = `${baseUrl}/nifgashimportal?payment_cancel=true`;
    
    params.append('successUrl', successUrl);
    params.append('cancelUrl', cancelUrl);
    
    // Explicitly using Sandbox URL as requested
    const growUrl = 'https://sandbox.meshulam.co.il/api/light/server/1.0/createPaymentProcess';

    console.log('--- Sending Request to Meshulam (Sandbox) ---');
    console.log('URL:', growUrl);
    console.log('Params:', params.toString());
    
    let growResponse;
    try {
      growResponse = await fetch(growUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: params.toString()
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return Response.json({ success: false, error: 'Failed to reach Meshulam server', details: fetchError.message }, { 
          status: 200, // Return 200 to allow frontend to handle it
          headers: { 'Access-Control-Allow-Origin': '*' } 
      });
    }

    const responseText = await growResponse.text();
    console.log('Meshulam Raw Response:', responseText);

    let responseData;
    try {
        responseData = JSON.parse(responseText);
    } catch (e) {
        console.error('Failed to parse Meshulam response:', e);
        return Response.json({ success: false, error: 'Invalid response from Meshulam', raw: responseText }, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // Check for Meshulam logic errors
    if (responseData.status !== 1) { // Assuming 1 is success based on docs, or check 'err' field
         console.error('Meshulam API Error:', responseData);
         return Response.json({ success: false, error: responseData.err || 'Meshulam API Error', data: responseData }, { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // Return success with processId
    return Response.json({ 
        success: true, 
        processId: responseData.data.processId, 
        processToken: responseData.data.processToken,
        url: responseData.data.url 
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('CRITICAL SERVER ERROR:', error);
    return Response.json({ success: false, error: error.message, stack: error.stack }, {
      status: 200, // Return 200 to ensure frontend sees the error details
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});