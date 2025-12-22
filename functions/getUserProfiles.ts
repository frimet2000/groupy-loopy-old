import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emails } = await req.json();
    
    if (!emails || !Array.isArray(emails)) {
      return Response.json({ error: 'emails array required' }, { status: 400 });
    }

    // Use service role to fetch user profiles
    const users = await base44.asServiceRole.entities.User.list();
    
    const toRange = (birthDate) => {
      if (!birthDate) return null;
      const d = new Date(birthDate);
      if (isNaN(d.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
      if (age < 0) return null;
      if (age < 3) return '0-2';
      if (age < 7) return '3-6';
      if (age < 11) return '7-10';
      if (age < 15) return '11-14';
      if (age < 19) return '15-18';
      if (age < 22) return '18-21';
      return '21+';
    };

    const toParentAgeRange = (birthDate) => {
      if (!birthDate) return null;
      const d = new Date(birthDate);
      if (isNaN(d.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - d.getFullYear();
      const m = today.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
      if (age < 0) return null;
      if (age < 30) return '20-30';
      if (age < 40) return '30-40';
      if (age < 50) return '40-50';
      if (age < 60) return '50-60';
      return '60+';
    };

    const profileMap = {};
    
    emails.forEach(email => {
      const userProfile = users.find(u => u.email === email);
      if (userProfile) {
        let childrenRanges = Array.isArray(userProfile.children_age_ranges) ? userProfile.children_age_ranges : [];
        if ((!childrenRanges || childrenRanges.length === 0) && Array.isArray(userProfile.children_birth_dates) && userProfile.children_birth_dates.length > 0) {
          childrenRanges = userProfile.children_birth_dates
            .map(c => {
              const range = toRange(c.birth_date);
              return range ? { id: c.id, name: c.name, age_range: range, gender: c.gender } : null;
            })
            .filter(Boolean);
        }
        // Calculate parent age range from birth_date if not set
        let parentAgeRange = userProfile.parent_age_range || userProfile.age_range;
        if (!parentAgeRange && userProfile.birth_date) {
          parentAgeRange = toParentAgeRange(userProfile.birth_date);
        }

        profileMap[email] = {
          name: (userProfile.first_name && userProfile.last_name)
            ? `${userProfile.first_name} ${userProfile.last_name}`
            : userProfile.full_name,
          children_age_ranges: childrenRanges,
          parent_age_range: parentAgeRange
        };
      }
    });

    return Response.json({ profiles: profileMap });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});