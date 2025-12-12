import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Navigation
    home: "Home",
    myTrips: "My Trips",
    createTrip: "Create Trip",
    aiRecommendations: "AI Recommendations",
    profile: "Profile",
    logout: "Logout",
    
    // General
    search: "Search",
    filter: "Filter",
    apply: "Apply",
    clear: "Clear",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    join: "Join Trip",
    leave: "Leave Trip",
    share: "Share",
    loading: "Loading...",
    noResults: "No results found",
    
    // Trip details
    tripDetails: "Trip Details",
    organizer: "Organizer",
    participants: "Participants",
    maxParticipants: "Max Participants",
    date: "Date",
    duration: "Duration",
    difficulty: "Difficulty",
    trailType: "Trail Type",
    interests: "Interests",
    petsAllowed: "Pets Allowed",
    campingAvailable: "Camping Available",
    weather: "Weather Forecast",
    location: "Location",
    region: "Region",
    
    // Duration types
    hours: "Hours",
    half_day: "Half Day",
    full_day: "Full Day",
    overnight: "Overnight",
    multi_day: "Multi-Day",
    
    // Difficulty levels
    easy: "Easy",
    moderate: "Moderate",
    challenging: "Challenging",
    hard: "Hard",
    
    // Trail types
    water: "Water Trail",
    full_shade: "Full Shade",
    partial_shade: "Partial Shade",
    desert: "Desert",
    forest: "Forest",
    coastal: "Coastal",
    mountain: "Mountain",
    historical: "Historical",
    urban: "Urban",
    
    // Interests
    nature: "Nature",
    history: "History",
    photography: "Photography",
    birdwatching: "Birdwatching",
    archaeology: "Archaeology",
    geology: "Geology",
    botany: "Botany",
    extreme_sports: "Extreme Sports",
    family_friendly: "Family Friendly",
    romantic: "Romantic",
    
    // Regions
    north: "North",
    center: "Center",
    south: "South",
    jerusalem: "Jerusalem Area",
    negev: "Negev",
    eilat: "Eilat Area",
    
    // Status
    open: "Open",
    full: "Full",
    completed: "Completed",
    cancelled: "Cancelled",
    
    // Form labels
    titleHe: "Title (Hebrew)",
    titleEn: "Title (English)",
    descriptionHe: "Description (Hebrew)",
    descriptionEn: "Description (English)",
    selectDate: "Select Date",
    selectRegion: "Select Region",
    selectDifficulty: "Select Difficulty",
    selectDuration: "Select Duration",
    durationValue: "Duration Value",
    parentAgeRange: "Parent Age Range",
    childrenAgeRange: "Children Age Range",
    minAge: "Min Age",
    maxAge: "Max Age",
    uploadImage: "Upload Image",
    
    // Messages
    tripCreated: "Trip created successfully!",
    tripUpdated: "Trip updated successfully!",
    joinedTrip: "You have joined the trip!",
    leftTrip: "You have left the trip!",
    tripFull: "This trip is full",
    alreadyJoined: "You have already joined this trip",
    
    // AI
    getRecommendations: "Get AI Recommendations",
    basedOnLocation: "Based on your location",
    basedOnPreferences: "Based on your preferences",
    recommendedTrips: "Recommended Trips for You",
    
    // Weather
    temperature: "Temperature",
    humidity: "Humidity",
    wind: "Wind",
    conditions: "Conditions",
    
    // Yes/No
    yes: "Yes",
    no: "No",
    
    // Filters
    allRegions: "All Regions",
    allDifficulties: "All Difficulties",
    allDurations: "All Durations",
    dateRange: "Date Range",
    from: "From",
    to: "To",
    
    // Hero
    heroTitle: "Find Trip Partners",
    heroSubtitle: "Join organized groups or create your own trip and invite others",
    exploreTrips: "Explore Trips",
    
    // Empty states
    noTripsFound: "No trips found",
    createFirstTrip: "Create your first trip",
    noUpcomingTrips: "No upcoming trips",
    noOrganizedTrips: "No organized trips yet",
  },
  he: {
    // Navigation
    home: "בית",
    myTrips: "הטיולים שלי",
    createTrip: "צור טיול",
    aiRecommendations: "המלצות AI",
    profile: "פרופיל",
    logout: "התנתק",
    
    // General
    search: "חיפוש",
    filter: "סינון",
    apply: "החל",
    clear: "נקה",
    save: "שמור",
    cancel: "ביטול",
    delete: "מחק",
    edit: "ערוך",
    join: "הצטרף לטיול",
    leave: "עזוב טיול",
    share: "שתף",
    loading: "טוען...",
    noResults: "לא נמצאו תוצאות",
    
    // Trip details
    tripDetails: "פרטי הטיול",
    organizer: "מארגן",
    participants: "משתתפים",
    maxParticipants: "מקסימום משתתפים",
    date: "תאריך",
    duration: "משך",
    difficulty: "רמת קושי",
    trailType: "סוג מסלול",
    interests: "תחומי עניין",
    petsAllowed: "מותר בעלי חיים",
    campingAvailable: "אפשרות קמפינג",
    weather: "תחזית מזג האוויר",
    location: "מיקום",
    region: "אזור",
    
    // Duration types
    hours: "שעות",
    half_day: "חצי יום",
    full_day: "יום מלא",
    overnight: "לילה",
    multi_day: "מספר ימים",
    
    // Difficulty levels
    easy: "קל",
    moderate: "בינוני",
    challenging: "מאתגר",
    hard: "קשה",
    
    // Trail types
    water: "מסלול מים",
    full_shade: "מוצל מלא",
    partial_shade: "מוצל חלקי",
    desert: "מדבר",
    forest: "יער",
    coastal: "חופי",
    mountain: "הרים",
    historical: "היסטורי",
    urban: "עירוני",
    
    // Interests
    nature: "טבע",
    history: "היסטוריה",
    photography: "צילום",
    birdwatching: "צפרות",
    archaeology: "ארכיאולוגיה",
    geology: "גיאולוגיה",
    botany: "בוטניקה",
    extreme_sports: "ספורט אתגרי",
    family_friendly: "מתאים למשפחות",
    romantic: "רומנטי",
    
    // Regions
    north: "צפון",
    center: "מרכז",
    south: "דרום",
    jerusalem: "אזור ירושלים",
    negev: "נגב",
    eilat: "אזור אילת",
    
    // Status
    open: "פתוח",
    full: "מלא",
    completed: "הושלם",
    cancelled: "בוטל",
    
    // Form labels
    titleHe: "כותרת (עברית)",
    titleEn: "כותרת (אנגלית)",
    descriptionHe: "תיאור (עברית)",
    descriptionEn: "תיאור (אנגלית)",
    selectDate: "בחר תאריך",
    selectRegion: "בחר אזור",
    selectDifficulty: "בחר רמת קושי",
    selectDuration: "בחר משך",
    durationValue: "משך זמן",
    parentAgeRange: "טווח גילאי הורים",
    childrenAgeRange: "טווח גילאי ילדים",
    minAge: "גיל מינימלי",
    maxAge: "גיל מקסימלי",
    uploadImage: "העלה תמונה",
    
    // Messages
    tripCreated: "הטיול נוצר בהצלחה!",
    tripUpdated: "הטיול עודכן בהצלחה!",
    joinedTrip: "הצטרפת לטיול!",
    leftTrip: "עזבת את הטיול!",
    tripFull: "הטיול מלא",
    alreadyJoined: "כבר הצטרפת לטיול הזה",
    
    // AI
    getRecommendations: "קבל המלצות AI",
    basedOnLocation: "מבוסס על המיקום שלך",
    basedOnPreferences: "מבוסס על ההעדפות שלך",
    recommendedTrips: "טיולים מומלצים עבורך",
    
    // Weather
    temperature: "טמפרטורה",
    humidity: "לחות",
    wind: "רוח",
    conditions: "מצב",
    
    // Yes/No
    yes: "כן",
    no: "לא",
    
    // Filters
    allRegions: "כל האזורים",
    allDifficulties: "כל רמות הקושי",
    allDurations: "כל משכי הזמן",
    dateRange: "טווח תאריכים",
    from: "מ",
    to: "עד",
    
    // Hero
    heroTitle: "מצאו שותפים לטיול",
    heroSubtitle: "הצטרפו לקבוצות מאורגנות או צרו טיול משלכם והזמינו אחרים",
    exploreTrips: "גלה טיולים",
    
    // Empty states
    noTripsFound: "לא נמצאו טיולים",
    createFirstTrip: "צור את הטיול הראשון שלך",
    noUpcomingTrips: "אין טיולים קרובים",
    noOrganizedTrips: "עדיין אין טיולים שארגנת",
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'he';
    }
    return 'he';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.dir = language === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => translations[language][key] || key;
  const isRTL = language === 'he';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}