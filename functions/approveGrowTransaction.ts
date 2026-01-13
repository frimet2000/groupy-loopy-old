// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const payload = await req.json();
    console.log('approveGrowTransaction called with:', JSON.stringify(payload, null, 2));

    const { transactionId, processId } = payload;

    const userId = Deno.env.get('GROW_USER_ID') || '5c04d711acb29250';
    const pageCode = Deno.env.get('GROW_PAGE_CODE') || '30f1b9975952';
    
    if (!userId) {
      console.error('GROW_USER_ID not set');
      return Response.json({ success: false, error: 'Grow not configured' }, { status: 500 });
    }

    // Approve transaction with Grow (Sandbox)
    const approveResponse = await fetch('https://sandbox.meshulam.co.il/api/light/server/1.0/approveTransaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        pageCode,
        userId,
        transactionId,
        processId
      }).toString()
    });

    const approveData = await approveResponse.json();
    console.log('Grow approve response:', JSON.stringify(approveData, null, 2));

    if (approveData.status === '1') {
      return Response.json({
        success: true,
        message: 'Transaction approved successfully'
      });
    } else {
      console.error('Grow approve error:', approveData);
      return Response.json({ 
        success: false,
        error: approveData.err || 'Failed to approve transaction', 
        details: approveData 
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Exception in approveGrowTransaction:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});
