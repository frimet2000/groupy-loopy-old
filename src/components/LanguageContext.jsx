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

    // Activity types
    hiking: "Hiking",
    cycling: "Cycling",
    offroad: "Off-Road",
    activityType: "Activity Type",

    // Cycling types
    road: "Road Cycling",
    gravel: "Gravel",
    hybrid: "Hybrid",
    bmx: "BMX",
    electric: "Electric Bike",
    cyclingType: "Cycling Type",
    cyclingDistance: "Distance (km)",
    cyclingElevation: "Elevation Gain (m)",

    // Off-road types
    jeep: "Jeep",
    atv: "ATV / Quad",
    dirt_bike: "Dirt Bike",
    side_by_side: "Side by Side / UTV",
    buggy: "Buggy",
    truck: "4x4 Truck",
    offroadVehicleType: "Vehicle Type",
    offroadDistance: "Distance (km)",
    offroadTerrainType: "Terrain Types",

    // Terrain types
    sand: "Sand Dunes",
    rocks: "Rocky Terrain",
    mud: "Mud",
    hills: "Hills & Slopes",
    forest_trails: "Forest Trails",
    river_crossing: "River Crossing",

    // Difficulty levels
    extreme: "Extreme",
    
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
    
    // Countries
    country: "Country",
    selectCountry: "Select Country",
    israel: "Israel",
    usa: "United States",
    italy: "Italy",
    spain: "Spain",
    france: "France",
    germany: "Germany",
    uk: "United Kingdom",
    japan: "Japan",
    australia: "Australia",
    canada: "Canada",
    switzerland: "Switzerland",
    austria: "Austria",
    new_zealand: "New Zealand",
    norway: "Norway",
    sweden: "Sweden",
    greece: "Greece",
    portugal: "Portugal",
    netherlands: "Netherlands",
    belgium: "Belgium",
    denmark: "Denmark",
    ireland: "Ireland",
    iceland: "Iceland",
    croatia: "Croatia",
    poland: "Poland",
    czech_republic: "Czech Republic",
    thailand: "Thailand",
    indonesia: "Indonesia",
    malaysia: "Malaysia",
    vietnam: "Vietnam",
    south_korea: "South Korea",
    china: "China",
    india: "India",
    nepal: "Nepal",
    turkey: "Turkey",
    egypt: "Egypt",
    morocco: "Morocco",
    south_africa: "South Africa",
    kenya: "Kenya",
    tanzania: "Tanzania",
    brazil: "Brazil",
    argentina: "Argentina",
    chile: "Chile",
    peru: "Peru",
    mexico: "Mexico",
    costa_rica: "Costa Rica",
    finland: "Finland",
    romania: "Romania",
    hungary: "Hungary",
    slovakia: "Slovakia",
    bulgaria: "Bulgaria",
    serbia: "Serbia",
    slovenia: "Slovenia",
    montenegro: "Montenegro",
    bosnia_herzegovina: "Bosnia & Herzegovina",
    albania: "Albania",
    north_macedonia: "North Macedonia",
    luxembourg: "Luxembourg",
    malta: "Malta",
    cyprus: "Cyprus",
    estonia: "Estonia",
    latvia: "Latvia",
    lithuania: "Lithuania",

    // Regions - Israel
    north: "North",
    center: "Center",
    south: "South",
    jerusalem: "Jerusalem Area",
    negev: "Negev",
    eilat: "Eilat Area",

    // Regions - USA
    northeast: "Northeast",
    southeast: "Southeast",
    midwest: "Midwest",
    southwest: "Southwest",
    west: "West",
    pacific_northwest: "Pacific Northwest",
    rocky_mountains: "Rocky Mountains",
    great_plains: "Great Plains",

    // Regions - Italy
    northern: "Northern Italy",
    central: "Central Italy",
    southern: "Southern Italy",
    sicily: "Sicily",
    sardinia: "Sardinia",
    tuscany: "Tuscany",
    lombardy: "Lombardy",
    veneto: "Veneto",

    // Regions - Spain
    andalusia: "Andalusia",
    catalonia: "Catalonia",
    madrid: "Madrid",
    valencia: "Valencia",
    basque_country: "Basque Country",
    galicia: "Galicia",
    canary_islands: "Canary Islands",
    balearic_islands: "Balearic Islands",

    // Regions - France
    ile_de_france: "Île-de-France",
    provence: "Provence",
    brittany: "Brittany",
    normandy: "Normandy",
    alps: "Alps",
    pyrenees: "Pyrenees",
    corsica: "Corsica",
    burgundy: "Burgundy",

    // Regions - Germany
    bavaria: "Bavaria",
    berlin: "Berlin",
    baden_wurttemberg: "Baden-Württemberg",
    north_rhine_westphalia: "North Rhine-Westphalia",
    saxony: "Saxony",
    hesse: "Hesse",
    rhineland_palatinate: "Rhineland-Palatinate",
    lower_saxony: "Lower Saxony",

    // Regions - UK
    england_south: "South England",
    england_north: "North England",
    scotland: "Scotland",
    wales: "Wales",
    northern_ireland: "Northern Ireland",
    london: "London",
    lake_district: "Lake District",
    peak_district: "Peak District",

    // Regions - Japan
    hokkaido: "Hokkaido",
    tohoku: "Tohoku",
    kanto: "Kanto",
    chubu: "Chubu",
    kansai: "Kansai",
    chugoku: "Chugoku",
    shikoku: "Shikoku",
    kyushu: "Kyushu",

    // Regions - Australia
    new_south_wales: "New South Wales",
    victoria: "Victoria",
    queensland: "Queensland",
    western_australia: "Western Australia",
    south_australia: "South Australia",
    tasmania: "Tasmania",
    northern_territory: "Northern Territory",

    // Regions - Canada
    british_columbia: "British Columbia",
    alberta: "Alberta",
    ontario: "Ontario",
    quebec: "Quebec",
    maritime_provinces: "Maritime Provinces",
    yukon: "Yukon",
    northwest_territories: "Northwest Territories",
    nunavut: "Nunavut",

    // Regions - Switzerland
    valais: "Valais",
    graubunden: "Graubünden",
    bern: "Bern",
    zurich: "Zürich",
    ticino: "Ticino",
    central_switzerland: "Central Switzerland",
    eastern_switzerland: "Eastern Switzerland",
    western_switzerland: "Western Switzerland",

    // Regions - Austria
    tyrol: "Tyrol",
    salzburg: "Salzburg",
    vienna: "Vienna",
    upper_austria: "Upper Austria",
    lower_austria: "Lower Austria",
    styria: "Styria",
    carinthia: "Carinthia",
    vorarlberg: "Vorarlberg",

    // Regions - New Zealand
    north_island: "North Island",
    south_island: "South Island",
    auckland: "Auckland",
    canterbury: "Canterbury",
    otago: "Otago",
    wellington: "Wellington",
    marlborough: "Marlborough",
    west_coast: "West Coast",

    // Regions - Norway
    eastern: "Eastern Norway",
    western: "Western Norway",
    southern: "Southern Norway",
    central: "Central Norway",
    northern: "Northern Norway",
    lofoten: "Lofoten",
    fjord_norway: "Fjord Norway",
    nordland: "Nordland",

    // Regions - Sweden
    stockholm: "Stockholm",
    goteborg: "Göteborg",
    malmo: "Malmö",
    norrland: "Norrland",
    svealand: "Svealand",
    gotaland: "Götaland",
    lapland: "Lapland",
    dalarna: "Dalarna",
    
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

    // Accessibility
    wheelchair: "Wheelchair Accessible",
    visual_impairment: "Visual Impairment",
    hearing_impairment: "Hearing Impairment",
    mobility_aid: "Mobility Aid",
    stroller_friendly: "Stroller Friendly",
    elderly_friendly: "Elderly Friendly",
    accessibilityTypes: "Accessibility Types",
    myAccessibilityNeeds: "My Accessibility Needs",
    
    // Hero
    heroTitle: "Find Trip Partners",
    heroSubtitle: "Join organized groups or create your own trip and invite others",
    exploreTrips: "Explore Trips",
    
    // Empty states
    noTripsFound: "No trips found",
    createFirstTrip: "Create your first trip",
    noUpcomingTrips: "No upcoming trips",
    noOrganizedTrips: "No organized trips yet",

    // Budget
    budget: "Budget",
    moderate: "Moderate",
    comfortable: "Comfortable",
    luxury: "Luxury",

    // Travel companions
    solo: "Solo",
    couple: "Couple",
    family_young_kids: "Family (Young Kids)",
    family_teens: "Family (Teens)",
    friends: "Friends",
    group: "Group",

    // Activity intensity
    relaxed: "Relaxed",
    active: "Active",
    very_active: "Very Active",

    // Accommodation
    camping: "Camping",
    hostel: "Hostel",
    hotel: "Hotel",
    boutique: "Boutique Hotel",
    resort: "Resort",
    vacation_rental: "Vacation Rental",
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

    // Activity types
    hiking: "טיול רגלי",
    cycling: "רכיבת אופניים",
    offroad: "טיול שטח",
    activityType: "סוג פעילות",

    // Cycling types
    road: "אופני כביש",
    gravel: "גראבל",
    hybrid: "היברידי",
    bmx: "BMX",
    electric: "אופניים חשמליים",
    cyclingType: "סוג אופניים",
    cyclingDistance: "מרחק (ק\"מ)",
    cyclingElevation: "עליה מצטברת (מ')",

    // Off-road types
    jeep: "ג'יפ",
    atv: "טרקטורון",
    dirt_bike: "אופנוע שטח",
    side_by_side: "טרקטורון דו-מושבי",
    buggy: "באגי",
    truck: "רכב שטח 4X4",
    offroadVehicleType: "סוג רכב",
    offroadDistance: "מרחק (ק\"מ)",
    offroadTerrainType: "סוגי שטח",

    // Terrain types
    sand: "דיונות חול",
    rocks: "סלעים",
    mud: "בוץ",
    hills: "גבעות ומדרונות",
    forest_trails: "שבילי יער",
    river_crossing: "חציית נחלים",

    // Difficulty levels
    extreme: "אקסטרים",
    
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
    
    // Countries
    country: "מדינה",
    selectCountry: "בחר מדינה",
    israel: "ישראל",
    usa: "ארצות הברית",
    italy: "איטליה",
    spain: "ספרד",
    france: "צרפת",
    germany: "גרמניה",
    uk: "בריטניה",
    japan: "יפן",
    australia: "אוסטרליה",
    canada: "קנדה",
    switzerland: "שוויץ",
    austria: "אוסטריה",
    new_zealand: "ניו זילנד",
    norway: "נורווגיה",
    sweden: "שוודיה",
    greece: "יוון",
    portugal: "פורטוגל",
    netherlands: "הולנד",
    belgium: "בלגיה",
    denmark: "דנמרק",
    ireland: "אירלנד",
    iceland: "איסלנד",
    croatia: "קרואטיה",
    poland: "פולין",
    czech_republic: "צ'כיה",
    thailand: "תאילנד",
    indonesia: "אינדונזיה",
    malaysia: "מלזיה",
    vietnam: "וייטנאם",
    south_korea: "דרום קוריאה",
    china: "סין",
    india: "הודו",
    nepal: "נפאל",
    turkey: "טורקיה",
    egypt: "מצרים",
    morocco: "מרוקו",
    south_africa: "דרום אפריקה",
    kenya: "קניה",
    tanzania: "טנזניה",
    brazil: "ברזיל",
    argentina: "ארגנטינה",
    chile: "צ'ילה",
    peru: "פרו",
    mexico: "מקסיקו",
    costa_rica: "קוסטה ריקה",
    finland: "פינלנד",
    romania: "רומניה",
    hungary: "הונגריה",
    slovakia: "סלובקיה",
    bulgaria: "בולגריה",
    serbia: "סרביה",
    slovenia: "סלובניה",
    montenegro: "מונטנגרו",
    bosnia_herzegovina: "בוסניה והרצגובינה",
    albania: "אלבניה",
    north_macedonia: "מקדוניה הצפונית",
    luxembourg: "לוקסמבורג",
    malta: "מלטה",
    cyprus: "קפריסין",
    estonia: "אסטוניה",
    latvia: "לטביה",
    lithuania: "ליטא",

    // Regions - Israel
    north: "צפון",
    center: "מרכז",
    south: "דרום",
    jerusalem: "אזור ירושלים",
    negev: "נגב",
    eilat: "אזור אילת",

    // Regions - USA
    northeast: "צפון-מזרח",
    southeast: "דרום-מזרח",
    midwest: "מערב התיכון",
    southwest: "דרום-מערב",
    west: "מערב",
    pacific_northwest: "צפון-מערב השקט",
    rocky_mountains: "הרי הרוקי",
    great_plains: "המישורים הגדולים",

    // Regions - Italy
    northern: "צפון איטליה",
    central: "מרכז איטליה",
    southern: "דרום איטליה",
    sicily: "סיציליה",
    sardinia: "סרדיניה",
    tuscany: "טוסקנה",
    lombardy: "לומברדיה",
    veneto: "ונטו",

    // Regions - Spain
    andalusia: "אנדלוסיה",
    catalonia: "קטלוניה",
    madrid: "מדריד",
    valencia: "ולנסיה",
    basque_country: "חבל הבאסקים",
    galicia: "גליציה",
    canary_islands: "האיים הקנריים",
    balearic_islands: "האיים הבלאריים",

    // Regions - France
    ile_de_france: "איל דה פראנס",
    provence: "פרובאנס",
    brittany: "בריטני",
    normandy: "נורמנדי",
    alps: "האלפים",
    pyrenees: "הפירנאים",
    corsica: "קורסיקה",
    burgundy: "בורגונדי",

    // Regions - Germany
    bavaria: "בוואריה",
    berlin: "ברלין",
    baden_wurttemberg: "באדן-וירטמברג",
    north_rhine_westphalia: "נורדריין-וסטפאליה",
    saxony: "סקסוניה",
    hesse: "הסה",
    rhineland_palatinate: "ריינלנד-פאלץ",
    lower_saxony: "סקסוניה התחתונה",

    // Regions - UK
    england_south: "דרום אנגליה",
    england_north: "צפון אנגליה",
    scotland: "סקוטלנד",
    wales: "ויילס",
    northern_ireland: "צפון אירלנד",
    london: "לונדון",
    lake_district: "אזור האגמים",
    peak_district: "אזור הפיקס",

    // Regions - Japan
    hokkaido: "הוקאידו",
    tohoku: "טוהוקו",
    kanto: "קנטו",
    chubu: "צ'ובו",
    kansai: "קנסאי",
    chugoku: "צ'וגוקו",
    shikoku: "שיקוקו",
    kyushu: "קיושו",

    // Regions - Australia
    new_south_wales: "ניו סאות' ויילס",
    victoria: "ויקטוריה",
    queensland: "קווינסלנד",
    western_australia: "מערב אוסטרליה",
    south_australia: "דרום אוסטרליה",
    tasmania: "טסמניה",
    northern_territory: "הטריטוריה הצפונית",

    // Regions - Canada
    british_columbia: "קולומביה הבריטית",
    alberta: "אלברטה",
    ontario: "אונטריו",
    quebec: "קוויבק",
    maritime_provinces: "המחוזות הימיים",
    yukon: "יוקון",
    northwest_territories: "הטריטוריות הצפון-מערביות",
    nunavut: "נונאווט",

    // Regions - Switzerland
    valais: "ואלה",
    graubunden: "גראובינדן",
    bern: "ברן",
    zurich: "ציריך",
    ticino: "טיצ'ינו",
    central_switzerland: "מרכז שוויץ",
    eastern_switzerland: "מזרח שוויץ",
    western_switzerland: "מערב שוויץ",

    // Regions - Austria
    tyrol: "טירול",
    salzburg: "זלצבורג",
    vienna: "וינה",
    upper_austria: "אוסטריה העליונה",
    lower_austria: "אוסטריה התחתונה",
    styria: "שטיריה",
    carinthia: "קרינתיה",
    vorarlberg: "פוראלברג",

    // Regions - New Zealand
    north_island: "האי הצפוני",
    south_island: "האי הדרומי",
    auckland: "אוקלנד",
    canterbury: "קנטרברי",
    otago: "אוטאגו",
    wellington: "וולינגטון",
    marlborough: "מרלבורו",
    west_coast: "החוף המערבי",

    // Regions - Norway
    eastern: "מזרח נורווגיה",
    western: "מערב נורווגיה",
    southern: "דרום נורווגיה",
    central: "מרכז נורווגיה",
    northern: "צפון נורווגיה",
    lofoten: "לופוטן",
    fjord_norway: "נורווגיית הפיורדים",
    nordland: "נורדלנד",

    // Regions - Sweden
    stockholm: "סטוקהולם",
    goteborg: "גטבורג",
    malmo: "מלמו",
    norrland: "נורלנד",
    svealand: "סוואלנד",
    gotaland: "גטאלנד",
    lapland: "לפלנד",
    dalarna: "דלרנה",
    
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

    // Accessibility
    wheelchair: "נגיש לכיסא גלגלים",
    visual_impairment: "לקות ראייה",
    hearing_impairment: "לקות שמיעה",
    mobility_aid: "עזרי ניידות",
    stroller_friendly: "ידידותי לעגלות",
    elderly_friendly: "ידידותי לקשישים",
    accessibilityTypes: "סוגי נגישות",
    myAccessibilityNeeds: "דרישות הנגישות שלי",
    
    // Hero
    heroTitle: "מצאו שותפים לטיול",
    heroSubtitle: "הצטרפו לקבוצות מאורגנות או צרו טיול משלכם והזמינו אחרים",
    exploreTrips: "גלה טיולים",
    
    // Empty states
    noTripsFound: "לא נמצאו טיולים",
    createFirstTrip: "צור את הטיול הראשון שלך",
    noUpcomingTrips: "אין טיולים קרובים",
    noOrganizedTrips: "עדיין אין טיולים שארגנת",

    // Budget
    budget: "חסכוני",
    moderate: "בינוני",
    comfortable: "נוח",
    luxury: "יוקרתי",

    // Travel companions
    solo: "סולו",
    couple: "זוג",
    family_young_kids: "משפחה (ילדים קטנים)",
    family_teens: "משפחה (מתבגרים)",
    friends: "חברים",
    group: "קבוצה",

    // Activity intensity
    relaxed: "נינוח",
    active: "פעיל",
    very_active: "פעיל מאוד",

    // Accommodation
    camping: "קמפינג",
    hostel: "אכסניה",
    hotel: "מלון",
    boutique: "מלון בוטיק",
    resort: "אתר נופש",
    vacation_rental: "דירת נופש",
  }
};

const detectLanguageFromLocation = async () => {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return 'en';
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Map coordinates to language based on region
        if (latitude >= 29 && latitude <= 33.5 && longitude >= 34 && longitude <= 36) {
          resolve('he'); // Israel
        } else if (latitude >= 41 && latitude <= 51 && longitude >= -5 && longitude <= 10) {
          // France, Spain, parts of Germany
          if (longitude >= -5 && longitude <= 3) {
            if (latitude >= 43 && latitude <= 51 && longitude >= -5 && longitude <= 5) {
              resolve('fr'); // France
            } else if (latitude >= 36 && latitude <= 44 && longitude >= -10 && longitude <= 4) {
              resolve('es'); // Spain
            } else {
              resolve('fr');
            }
          } else if (latitude >= 47 && latitude <= 55 && longitude >= 5 && longitude <= 15) {
            resolve('de'); // Germany
          } else if (latitude >= 36 && latitude <= 48 && longitude >= 6 && longitude <= 19) {
            resolve('it'); // Italy
          } else {
            resolve('en');
          }
        } else if (latitude >= 36 && latitude <= 48 && longitude >= 6 && longitude <= 19) {
          resolve('it'); // Italy
        } else if (latitude >= 47 && latitude <= 55 && longitude >= 5 && longitude <= 15) {
          resolve('de'); // Germany, Austria, Switzerland
        } else if (latitude >= 36 && latitude <= 44 && longitude >= -10 && longitude <= 4) {
          resolve('es'); // Spain
        } else if (latitude >= 41 && latitude <= 51 && longitude >= -5 && longitude <= 6) {
          resolve('fr'); // France
        } else {
          resolve('en'); // Default to English
        }
      },
      () => {
        resolve('en'); // Default to English if geolocation fails
      }
    );
  });
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language');
      if (saved) return saved;
      
      // Check if this is first visit
      const firstVisit = !localStorage.getItem('language_detected');
      if (firstVisit) {
        return 'en'; // Temporary, will be updated by useEffect
      }
      return 'en';
    }
    return 'en';
  });

  useEffect(() => {
    const initLanguage = async () => {
      const saved = localStorage.getItem('language');
      if (!saved && !localStorage.getItem('language_detected')) {
        // First visit - detect language
        const detected = await detectLanguageFromLocation();
        setLanguage(detected);
        localStorage.setItem('language', detected);
        localStorage.setItem('language_detected', 'true');
      }
    };
    initLanguage();
  }, []);

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