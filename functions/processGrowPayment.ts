import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      amount, 
      customerName, 
      customerPhone, 
      customerEmail,
      description,
      useOrganizerAccount
    } = await req.json();

    if (!amount || !customerName || !customerPhone) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Determine which credentials to use
    let pageCode = Deno.env.get('GROW_PAGE_CODE');
    let userId = Deno.env.get('GROW_USER_ID');

    // If using organizer's account, fetch their stored credentials
    if (useOrganizerAccount && user.grow_connected) {
      pageCode = user.grow_page_code;
      userId = user.grow_user_id;
    }

    if (!pageCode || !userId) {
      return Response.json({ 
        success: false, 
        error: 'Grow credentials not configured'
      }, { status: 400 });
    }

    // Create payment with Grow API
    const paymentPayload = {
      PageCode: pageCode,
      UserId: userId,
      Sum: amount.toFixed(2),
      CustName: customerName,
      CustPhone: customerPhone,
      CustEmail: customerEmail,
      Remark: description || 'Payment',
      Language: 'HE'
    };

    const response = await fetch('https://api.meshulam.co.il/api/GrowPage/GetTerminalCode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentPayload)
    });

    const data = await response.json();

    if (data.TerminalCode) {
      // Successfully got terminal code, payment process initiated
      return Response.json({ 
        success: true,
        processId: data.TerminalCode,
        amount: amount,
        currency: 'ILS'
      });
    } else {
      return Response.json({ 
        success: false, 
        error: data.ErrorDescription || 'Payment initiation failed'
      });
    }
  } catch (error) {
    console.error('Process payment error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Payment processing failed'
    }, { status: 500 });
  }
});