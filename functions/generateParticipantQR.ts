// @ts-nocheck
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import QRCode from 'npm:qrcode@1.5.3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { registrationId, participantIndex = 0 } = await req.json();

    if (!registrationId) {
      return Response.json({ error: 'Registration ID required' }, { status: 400 });
    }

    // Get registration details
    const registration = await base44.asServiceRole.entities.NifgashimRegistration.get(registrationId);
    
    if (!registration) {
      return Response.json({ error: 'Registration not found' }, { status: 404 });
    }

    const participants = registration.participants || [];
    const participant = participants[participantIndex] || participants[0];
    
    if (!participant) {
      return Response.json({ error: 'No participant found' }, { status: 404 });
    }

    // Create unique QR data - contains encoded verification info
    const qrData = {
      rid: registrationId, // registration ID
      pid: participant.id_number, // participant ID number
      idx: participantIndex, // participant index
      days: registration.selected_days || [], // selected days
      ts: Date.now(), // timestamp for uniqueness
      hash: btoa(`${registrationId}-${participant.id_number}-${Date.now()}`).slice(0, 12) // simple hash
    };

    const qrString = JSON.stringify(qrData);
    const encodedQR = btoa(qrString);

    // Generate QR code as data URL (base64 image)
    const qrCodeDataUrl = await QRCode.toDataURL(encodedQR, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2,
      color: {
        dark: '#1e40af', // Blue color
        light: '#ffffff'
      }
    });

    // Also generate a verification URL that can be used
    const verificationUrl = `https://groupyloopy.app/NifgashimPortal?verify=${encodedQR}`;

    return Response.json({
      success: true,
      qrCodeDataUrl,
      verificationUrl,
      participantName: participant.name,
      participantId: participant.id_number,
      selectedDays: registration.selected_days || [],
      registrationId
    });

  } catch (error) {
    console.error('Error generating QR:', error);
    return Response.json({ error: error.message || 'Failed to generate QR' }, { status: 500 });
  }
});