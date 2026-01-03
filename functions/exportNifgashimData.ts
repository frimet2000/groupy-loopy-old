// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { type, date } = await req.json();

    const registrations = await base44.asServiceRole.entities.NifgashimRegistration.list();

    let csvData = '';
    
    if (type === 'registrations') {
      // Export all registrations
      csvData = 'Email,Total Days,Negev Days,Total Cost,Amount Paid,Payment Status,Registration Status\n';
      
      registrations.forEach(reg => {
        csvData += `${reg.user_email},${reg.total_days_count},${reg.negev_days_count},${reg.total_amount},${reg.amount_paid || 0},${reg.payment_status},${reg.registration_status}\n`;
      });
    } 
    else if (type === 'daily_checkins' && date) {
      // Export check-ins for specific date
      csvData = 'Email,Checked In,Time,Lunch,Dinner,Breakfast,Accommodation,Driver\n';
      
      registrations.forEach(reg => {
        if (reg.selected_days?.includes(date)) {
          const checkIn = reg.check_ins?.find(c => c.date === date);
          if (checkIn) {
            csvData += `${reg.user_email},Yes,${new Date(checkIn.checked_in_at).toLocaleTimeString()},${checkIn.meals?.lunch ? 'Yes' : 'No'},${checkIn.meals?.dinner ? 'Yes' : 'No'},${checkIn.meals?.breakfast_next_day ? 'Yes' : 'No'},${checkIn.accommodation ? 'Yes' : 'No'},${checkIn.is_driver ? 'Yes' : 'No'}\n`;
          } else {
            csvData += `${reg.user_email},No,-,-,-,-,-,-\n`;
          }
        }
      });
    }
    else if (type === 'meals' && date) {
      // Export meals summary
      csvData = 'Email,Lunch,Dinner,Breakfast Next Day\n';
      
      registrations.forEach(reg => {
        if (reg.selected_days?.includes(date)) {
          const checkIn = reg.check_ins?.find(c => c.date === date);
          if (checkIn) {
            csvData += `${reg.user_email},${checkIn.meals?.lunch ? 'Yes' : 'No'},${checkIn.meals?.dinner ? 'Yes' : 'No'},${checkIn.meals?.breakfast_next_day ? 'Yes' : 'No'}\n`;
          }
        }
      });
    }

    return new Response(csvData, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="nifgashim_${type}_${date || 'all'}.csv"`
      }
    });
  } catch (error: any) {
    console.error('Error:', error);
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
});