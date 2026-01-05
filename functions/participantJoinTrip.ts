import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { tripId, joinMessage = '', accessibilityNeeds = [], selectedTrekDays = [], familyMembers = { me: true, spouse: false, pets: false, other: false }, selectedChildren = [], otherMemberName = '' } = body || {};
    if (!tripId) {
      return Response.json({ error: 'Missing tripId' }, { status: 400 });
    }

    const trips = await base44.asServiceRole.entities.Trip.filter({ id: tripId });
    const trip = trips[0];
    if (!trip) {
      return Response.json({ error: 'Trip not found' }, { status: 404 });
    }

    const userName = user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.full_name || user.email;

    if (trip.activity_type === 'trek' && Array.isArray(trip.trek_days) && trip.trek_days.length > 0 && (!Array.isArray(selectedTrekDays) || selectedTrekDays.length === 0)) {
      return Response.json({ error: 'Select at least one trek day' }, { status: 400 });
    }

    const toRange = (a: any) => {
      if (a == null || isNaN(a)) return null;
      if (a < 3) return '0-2';
      if (a < 7) return '3-6';
      if (a < 11) return '7-10';
      if (a < 15) return '11-14';
      if (a < 19) return '15-18';
      if (a < 22) return '18-21';
      return '21+';
    };

    let myKids = Array.isArray(user.children_age_ranges) && user.children_age_ranges.length > 0 ? user.children_age_ranges : Array.isArray(user.children_birth_dates) ? user.children_birth_dates.map((c: any) => {
      const d = new Date(c.birth_date);
      const today = new Date();
      let age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
      return { id: c.id, name: c.name, age_range: isNaN(d.getTime()) ? null : toRange(age), gender: c.gender };
    }) : [];
    myKids = (myKids || []).map((k: any, i: number) => ({ ...k, id: k?.id || `idx_${i}` }));
    const selSet = new Set(selectedChildren || []);
    const childrenDetails = (myKids || []).filter((k: any) => selSet.has(k.id)).map((k: any) => ({ id: k.id, name: k.name, age_range: k.age_range, gender: k.gender }));

    const parentAgeRange = user.parent_age_range || user.age_range || null;

    let totalPeopleJoining = 1;
    if (familyMembers?.spouse) totalPeopleJoining++;
    if (Array.isArray(selectedChildren) && selectedChildren.length > 0) totalPeopleJoining += selectedChildren.length;
    if (familyMembers?.other && otherMemberName) totalPeopleJoining++;

    const alreadyParticipant = (trip.participants || []).some((p: any) => p.email === user.email);
    if (alreadyParticipant) {
      return Response.json({ success: true, autoJoined: true });
    }

    const needsApproval = trip.approval_required === true || (trip.flexible_participants && (trip.current_participants || 0) >= (trip.max_participants || 0));

    if (!needsApproval) {
      const participantData = {
        email: user.email,
        name: userName,
        joined_at: new Date().toISOString(),
        accessibility_needs: accessibilityNeeds,
        waiver_accepted: true,
        waiver_timestamp: new Date().toISOString(),
        family_members: familyMembers,
        selected_children: selectedChildren,
        other_member_name: otherMemberName,
        total_people: totalPeopleJoining,
        children_details: childrenDetails,
        parent_age_range: parentAgeRange
      };
      const updatedParticipants = [...(trip.participants || []), participantData];
      const totalParticipantsCount = updatedParticipants.reduce((sum: number, p: any) => sum + (p.total_people || 1), 0);
      const updateData: any = { participants: updatedParticipants, current_participants: totalParticipantsCount };
      if (trip.activity_type === 'trek') {
        const updatedSelectedDays = [...(trip.participants_selected_days || []), { email: user.email, name: userName, days: selectedTrekDays || [] }];
        updateData.participants_selected_days = updatedSelectedDays;
      }
      await base44.asServiceRole.entities.Trip.update(tripId, updateData);
      return Response.json({ success: true, autoJoined: true });
    }

    const familyInfo: string[] = [];
    if (familyMembers?.spouse) familyInfo.push('בן/בת זוג');
    if (Array.isArray(selectedChildren) && selectedChildren.length > 0) familyInfo.push(`${selectedChildren.length} ילדים`);
    if (familyMembers?.pets) familyInfo.push('בעלי חיים');
    if (familyMembers?.other && otherMemberName) familyInfo.push(otherMemberName);
    const familyMessage = familyInfo.length > 0 ? `\nמצטרפים: ${familyInfo.join(', ')}` : '';
    const fullMessage = (joinMessage || '') + familyMessage;

    const updatedPendingRequests = [...(trip.pending_requests || []), {
      email: user.email,
      name: userName,
      requested_at: new Date().toISOString(),
      message: fullMessage,
      accessibility_needs: accessibilityNeeds,
      waiver_accepted: false,
      waiver_timestamp: null,
      selected_days: trip.activity_type === 'trek' ? (selectedTrekDays || []) : [],
      family_members: familyMembers,
      selected_children: selectedChildren,
      other_member_name: otherMemberName,
      children_details: childrenDetails,
      parent_age_range: parentAgeRange
    }];
    await base44.asServiceRole.entities.Trip.update(tripId, { pending_requests: updatedPendingRequests });

    const title = trip.title || trip.title_he || trip.title_en || 'Trip';
    const organizerEmail = trip.organizer_email;
    const emailBody = `שלום ${trip.organizer_name},\n\n${userName} מבקש להצטרף לטיול "${title}".${joinMessage ? `\n\nהודעה מהמשתתף:\n"${joinMessage}"` : ''}\n\nהיכנס לעמוד הטיול כדי לאשר או לדחות את הבקשה.\n\nבברכה,\nצוות Groupy Loopy`;
    try {
      if (organizerEmail) {
        await base44.asServiceRole.integrations.Core.SendEmail({ to: organizerEmail, subject: `בקשה להצטרפות לטיול "${title}"`, body: emailBody });
        await base44.asServiceRole.functions.invoke('sendPushNotification', { recipient_email: organizerEmail, notification_type: 'join_requests', title: 'בקשה להצטרפות חדשה', body: `${userName} מבקש להצטרף לטיול "${title}"` });
      }
    } catch (_e) {}

    return Response.json({ success: true, autoJoined: false });
  } catch (error) {
    return Response.json({ error: error.message || 'Failed to join' }, { status: 500 });
  }
});
