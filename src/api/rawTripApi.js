
// JavaScript Example: Reading Entities 
// Filterable fields: country, title, description, location, latitude, longitude, region, sub_region, date, registration_start_date, meeting_time, duration_type, duration_value, activity_type, difficulty, trip_character, cycling_type, cycling_distance, cycling_elevation, offroad_vehicle_type, offroad_distance, offroad_terrain_type, trail_type, interests, accessibility_types, parent_age_ranges, children_age_ranges, pets_allowed, camping_available, has_guide, guide_name, guide_topic, max_participants, flexible_participants, current_participants, image_url, status, privacy, invited_emails, hidden_tabs, linked_days_pairs, scheduled_messages, views, saves, likes, comments, organizer_name, organizer_email, additional_organizers, organizer_waiver_accepted, organizer_waiver_timestamp, trek_categories, payment_settings, required_declarations, participants, pending_requests, registration_reminders, messages, video_call_invites, waypoints, equipment_checklist, daily_itinerary, budget, allergens, recommended_water_liters, photos, experiences, live_locations, contributions, approval_required, trek_days, trek_overall_highest_point_m, trek_overall_lowest_point_m, trek_total_distance_km, participants_selected_days 
export async function fetchTripEntities() {
  const response = await fetch(`https://app.base44.com/api/apps/693c3ab4048a1e3a31fffd66/entities/Trip`, {
    headers: {
      'api_key': '6038ed8aa02f4f5eb813b1b899ed95bf',
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  console.log(data);
  return data;
}

export async function updateTripEntity(tripId, tripData) {
  const response = await fetch(`https://app.base44.com/api/apps/693c3ab4048a1e3a31fffd66/entities/Trip/${tripId}`, {
    method: 'POST',
    headers: {
      'api_key': '6038ed8aa02f4f5eb813b1b899ed95bf',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tripData)
  });
  const data = await response.json();
  console.log(data);
  return data;
}
