import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, Mountain, Tent, Users, Bike, Truck, Clock, 
  Calendar, Backpack, DollarSign, MapPin, Check, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const templates = {
  weekend_getaway: {
    icon: Calendar,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    name: { 
      he: 'סופ"ש קצר', 
      en: 'Weekend Getaway',
      ru: 'Выходные',
      es: 'Escapada de fin de semana',
      fr: 'Week-end',
      de: 'Wochenendausflug',
      it: 'Weekend fuori porta'
    },
    description: { 
      he: 'טיול קצר ומרענן לסוף שבוע', 
      en: 'A short refreshing weekend trip',
      ru: 'Короткая освежающая поездка на выходные',
      es: 'Un viaje corto y refrescante de fin de semana',
      fr: 'Une courte escapade rafraîchissante',
      de: 'Ein kurzer erfrischender Wochenendausflug',
      it: 'Un breve viaggio rinfrescante per il fine settimana'
    },
    defaults: {
      duration_type: 'full_day',
      duration_value: 1,
      difficulty: 'easy',
      activity_type: 'hiking',
      max_participants: 10,
      pets_allowed: true,
      camping_available: false,
    },
    itinerary: [
      { 
        day: 1, 
        title: { he: 'יום הטיול', en: 'Trip Day' },
        activities: [
          { time: '07:00', activity: { he: 'התכנסות ויציאה', en: 'Meeting & departure' } },
          { time: '09:00', activity: { he: 'תחילת המסלול', en: 'Start hiking' } },
          { time: '12:00', activity: { he: 'ארוחת צהריים בשטח', en: 'Lunch break' } },
          { time: '15:00', activity: { he: 'סיום המסלול', en: 'End of trail' } },
          { time: '16:00', activity: { he: 'חזרה הביתה', en: 'Return home' } },
        ]
      }
    ],
    equipment: [
      { he: 'נעלי הליכה', en: 'Hiking shoes' },
      { he: 'כובע', en: 'Hat' },
      { he: 'קרם הגנה', en: 'Sunscreen' },
      { he: 'מים (3 ליטר)', en: 'Water (3 liters)' },
      { he: 'כריכים', en: 'Sandwiches' },
      { he: 'חטיפים', en: 'Snacks' },
    ],
    budget: {
      solo_min: 50,
      solo_max: 150,
      family_min: 150,
      family_max: 400,
      currency: 'ILS',
      notes: { he: 'כולל דלק וארוחות', en: 'Includes fuel and meals' }
    }
  },
  multi_day_hike: {
    icon: Mountain,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    name: { 
      he: 'טיול רב-יומי', 
      en: 'Multi-Day Hike',
      ru: 'Многодневный поход',
      es: 'Caminata de varios días',
      fr: 'Randonnée multi-jours',
      de: 'Mehrtageswanderung',
      it: 'Escursione di più giorni'
    },
    description: { 
      he: 'הרפתקה של מספר ימים בטבע', 
      en: 'A multi-day adventure in nature',
      ru: 'Многодневное приключение на природе',
      es: 'Una aventura de varios días en la naturaleza',
      fr: 'Une aventure de plusieurs jours dans la nature',
      de: 'Ein mehrtägiges Abenteuer in der Natur',
      it: 'Un\'avventura di più giorni nella natura'
    },
    defaults: {
      duration_type: 'multi_day',
      duration_value: 3,
      difficulty: 'challenging',
      activity_type: 'hiking',
      max_participants: 8,
      pets_allowed: false,
      camping_available: true,
    },
    itinerary: [
      { 
        day: 1, 
        title: { he: 'יום ראשון - התחלה', en: 'Day 1 - Start' },
        activities: [
          { time: '06:00', activity: { he: 'התכנסות', en: 'Meeting point' } },
          { time: '07:00', activity: { he: 'תחילת המסע', en: 'Begin journey' } },
          { time: '12:00', activity: { he: 'ארוחת צהריים', en: 'Lunch' } },
          { time: '17:00', activity: { he: 'הקמת מחנה', en: 'Set up camp' } },
          { time: '19:00', activity: { he: 'ארוחת ערב ומדורה', en: 'Dinner & campfire' } },
        ]
      },
      { 
        day: 2, 
        title: { he: 'יום שני - המשך', en: 'Day 2 - Continue' },
        activities: [
          { time: '06:00', activity: { he: 'השכמה וארוחת בוקר', en: 'Wake up & breakfast' } },
          { time: '07:30', activity: { he: 'פירוק מחנה ויציאה', en: 'Pack up & depart' } },
          { time: '12:00', activity: { he: 'ארוחת צהריים', en: 'Lunch' } },
          { time: '17:00', activity: { he: 'הקמת מחנה', en: 'Set up camp' } },
        ]
      },
      { 
        day: 3, 
        title: { he: 'יום שלישי - סיום', en: 'Day 3 - Finish' },
        activities: [
          { time: '06:00', activity: { he: 'השכמה וארוחת בוקר', en: 'Wake up & breakfast' } },
          { time: '07:30', activity: { he: 'יציאה לחלק האחרון', en: 'Final stretch' } },
          { time: '12:00', activity: { he: 'סיום וחזרה', en: 'Finish & return' } },
        ]
      }
    ],
    equipment: [
      { he: 'תרמיל גדול (60+ ליטר)', en: 'Large backpack (60+ L)' },
      { he: 'אוהל', en: 'Tent' },
      { he: 'שק שינה', en: 'Sleeping bag' },
      { he: 'מזרן שטח', en: 'Sleeping pad' },
      { he: 'כירה ודלק', en: 'Stove & fuel' },
      { he: 'סירים וכלי אוכל', en: 'Cookware & utensils' },
      { he: 'פנס ראש', en: 'Headlamp' },
      { he: 'מים (4 ליטר ליום)', en: 'Water (4L per day)' },
      { he: 'אוכל ל-3 ימים', en: 'Food for 3 days' },
      { he: 'ערכת עזרה ראשונה', en: 'First aid kit' },
      { he: 'בגדים חמים', en: 'Warm clothes' },
    ],
    budget: {
      solo_min: 300,
      solo_max: 600,
      family_min: 800,
      family_max: 1500,
      currency: 'ILS',
      notes: { he: 'כולל ציוד קמפינג ואוכל', en: 'Includes camping gear and food' }
    }
  },
  family_vacation: {
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    name: { 
      he: 'טיול משפחתי', 
      en: 'Family Vacation',
      ru: 'Семейный отдых',
      es: 'Vacaciones familiares',
      fr: 'Vacances en famille',
      de: 'Familienurlaub',
      it: 'Vacanza in famiglia'
    },
    description: { 
      he: 'טיול נוח ומהנה לכל המשפחה', 
      en: 'A comfortable fun trip for the whole family',
      ru: 'Комфортная и веселая поездка для всей семьи',
      es: 'Un viaje cómodo y divertido para toda la familia',
      fr: 'Un voyage confortable et amusant pour toute la famille',
      de: 'Ein bequemer und spaßiger Ausflug für die ganze Familie',
      it: 'Un viaggio comodo e divertente per tutta la famiglia'
    },
    defaults: {
      duration_type: 'full_day',
      duration_value: 1,
      difficulty: 'easy',
      activity_type: 'hiking',
      max_participants: 20,
      pets_allowed: true,
      camping_available: false,
      trail_type: ['partial_shade', 'family_friendly'],
      interests: ['nature', 'family_friendly'],
      children_age_ranges: ['3-6', '7-10'],
    },
    itinerary: [
      { 
        day: 1, 
        title: { he: 'יום כיף משפחתי', en: 'Family Fun Day' },
        activities: [
          { time: '08:00', activity: { he: 'התכנסות', en: 'Meeting' } },
          { time: '08:30', activity: { he: 'הליכה קלה', en: 'Easy walk' } },
          { time: '10:00', activity: { he: 'הפסקת פירות', en: 'Fruit break' } },
          { time: '11:00', activity: { he: 'פעילות לילדים', en: 'Kids activity' } },
          { time: '12:30', activity: { he: 'פיקניק משפחתי', en: 'Family picnic' } },
          { time: '14:00', activity: { he: 'משחקים בטבע', en: 'Nature games' } },
          { time: '15:30', activity: { he: 'סיום וחזרה', en: 'End & return' } },
        ]
      }
    ],
    equipment: [
      { he: 'עגלה/מנשא לילדים', en: 'Stroller/baby carrier' },
      { he: 'חטיפים לילדים', en: 'Kids snacks' },
      { he: 'מים (2 ליטר לאדם)', en: 'Water (2L per person)' },
      { he: 'כובעים לכולם', en: 'Hats for everyone' },
      { he: 'קרם הגנה', en: 'Sunscreen' },
      { he: 'שמיכת פיקניק', en: 'Picnic blanket' },
      { he: 'משחקים', en: 'Games' },
      { he: 'בגדי החלפה לילדים', en: 'Extra clothes for kids' },
    ],
    budget: {
      solo_min: 100,
      solo_max: 200,
      family_min: 250,
      family_max: 500,
      currency: 'ILS',
      notes: { he: 'כולל אוכל ופעילויות', en: 'Includes food and activities' }
    }
  },
  adventure_trip: {
    icon: Tent,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    name: { 
      he: 'טיול אתגרי', 
      en: 'Adventure Trip',
      ru: 'Приключенческий тур',
      es: 'Viaje de aventura',
      fr: 'Voyage d\'aventure',
      de: 'Abenteuerreise',
      it: 'Viaggio avventura'
    },
    description: { 
      he: 'חוויה אתגרית ומלאת אדרנלין', 
      en: 'A challenging adrenaline-filled experience',
      ru: 'Сложный опыт, полный адреналина',
      es: 'Una experiencia desafiante llena de adrenalina',
      fr: 'Une expérience stimulante pleine d\'adrénaline',
      de: 'Ein herausforderndes Adrenalin-Erlebnis',
      it: 'Un\'esperienza stimolante piena di adrenalina'
    },
    defaults: {
      duration_type: 'full_day',
      duration_value: 1,
      difficulty: 'hard',
      activity_type: 'hiking',
      max_participants: 6,
      pets_allowed: false,
      camping_available: false,
      interests: ['extreme_sports', 'nature'],
    },
    itinerary: [
      { 
        day: 1, 
        title: { he: 'יום האתגר', en: 'Challenge Day' },
        activities: [
          { time: '05:30', activity: { he: 'התכנסות', en: 'Meeting' } },
          { time: '06:00', activity: { he: 'תדריך בטיחות', en: 'Safety briefing' } },
          { time: '06:30', activity: { he: 'תחילת המסלול', en: 'Start route' } },
          { time: '10:00', activity: { he: 'הפסקה קצרה', en: 'Short break' } },
          { time: '13:00', activity: { he: 'נקודת האתגר המרכזי', en: 'Main challenge point' } },
          { time: '16:00', activity: { he: 'סיום וחזרה', en: 'Finish & return' } },
        ]
      }
    ],
    equipment: [
      { he: 'נעלי טיפוס/הליכה מקצועיות', en: 'Professional hiking/climbing shoes' },
      { he: 'קסדה', en: 'Helmet' },
      { he: 'כפפות', en: 'Gloves' },
      { he: 'חבלים (אם נדרש)', en: 'Ropes (if needed)' },
      { he: 'מים (4 ליטר)', en: 'Water (4 liters)' },
      { he: 'חטיפי אנרגיה', en: 'Energy bars' },
      { he: 'ערכת עזרה ראשונה', en: 'First aid kit' },
      { he: 'בגדים מתאימים', en: 'Appropriate clothing' },
      { he: 'פנס ראש', en: 'Headlamp' },
    ],
    budget: {
      solo_min: 150,
      solo_max: 400,
      family_min: 400,
      family_max: 1000,
      currency: 'ILS',
      notes: { he: 'כולל ציוד מיוחד והדרכה', en: 'Includes special gear and guidance' }
    }
  },
  cycling_tour: {
    icon: Bike,
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    name: { 
      he: 'סיור אופניים', 
      en: 'Cycling Tour',
      ru: 'Велотур',
      es: 'Tour en bicicleta',
      fr: 'Tour à vélo',
      de: 'Radtour',
      it: 'Tour in bicicletta'
    },
    description: { 
      he: 'רכיבת אופניים מהנה בנופים יפים', 
      en: 'Enjoyable cycling through beautiful scenery',
      ru: 'Приятная велопрогулка по красивым местам',
      es: 'Ciclismo agradable por hermosos paisajes',
      fr: 'Agréable balade à vélo dans de beaux paysages',
      de: 'Angenehmes Radfahren durch schöne Landschaften',
      it: 'Piacevole pedalata attraverso bei paesaggi'
    },
    defaults: {
      duration_type: 'half_day',
      duration_value: 4,
      difficulty: 'moderate',
      activity_type: 'cycling',
      cycling_type: 'road',
      cycling_distance: 40,
      cycling_elevation: 300,
      max_participants: 12,
      pets_allowed: false,
      camping_available: false,
    },
    itinerary: [
      { 
        day: 1, 
        title: { he: 'יום רכיבה', en: 'Cycling Day' },
        activities: [
          { time: '07:00', activity: { he: 'התכנסות ובדיקת אופניים', en: 'Meeting & bike check' } },
          { time: '07:30', activity: { he: 'יציאה לרכיבה', en: 'Start cycling' } },
          { time: '09:30', activity: { he: 'תחנת מנוחה ראשונה', en: 'First rest stop' } },
          { time: '11:00', activity: { he: 'תחנת מנוחה שניה', en: 'Second rest stop' } },
          { time: '12:30', activity: { he: 'סיום וארוחה', en: 'Finish & meal' } },
        ]
      }
    ],
    equipment: [
      { he: 'אופניים תקינים', en: 'Working bicycle' },
      { he: 'קסדה', en: 'Helmet' },
      { he: 'כפפות רכיבה', en: 'Cycling gloves' },
      { he: 'משקפי שמש', en: 'Sunglasses' },
      { he: 'בקבוק מים (2 ליטר)', en: 'Water bottle (2L)' },
      { he: 'חטיפי אנרגיה', en: 'Energy snacks' },
      { he: 'ערכת תיקון פנצ\'ר', en: 'Puncture repair kit' },
      { he: 'משאבה', en: 'Pump' },
      { he: 'בגדי רכיבה', en: 'Cycling clothes' },
    ],
    budget: {
      solo_min: 50,
      solo_max: 150,
      family_min: 150,
      family_max: 400,
      currency: 'ILS',
      notes: { he: 'לא כולל השכרת אופניים', en: 'Does not include bike rental' }
    }
  },
  offroad_adventure: {
    icon: Truck,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    name: { 
      he: 'טיול ג\'יפים', 
      en: 'Off-Road Adventure',
      ru: 'Внедорожное приключение',
      es: 'Aventura todoterreno',
      fr: 'Aventure tout-terrain',
      de: 'Offroad-Abenteuer',
      it: 'Avventura fuoristrada'
    },
    description: { 
      he: 'חוויית שטח מרגשת ברכבי 4x4', 
      en: 'Exciting off-road experience in 4x4 vehicles',
      ru: 'Захватывающий внедорожный опыт на автомобилях 4x4',
      es: 'Emocionante experiencia todoterreno en vehículos 4x4',
      fr: 'Expérience tout-terrain passionnante en véhicules 4x4',
      de: 'Aufregendes Offroad-Erlebnis mit 4x4-Fahrzeugen',
      it: 'Emozionante esperienza fuoristrada con veicoli 4x4'
    },
    defaults: {
      duration_type: 'full_day',
      duration_value: 1,
      difficulty: 'moderate',
      activity_type: 'offroad',
      offroad_vehicle_type: 'jeep',
      offroad_distance: 60,
      offroad_terrain_type: ['rocks', 'hills', 'desert'],
      max_participants: 16,
      pets_allowed: false,
      camping_available: false,
    },
    itinerary: [
      { 
        day: 1, 
        title: { he: 'יום שטח', en: 'Off-Road Day' },
        activities: [
          { time: '07:00', activity: { he: 'התכנסות ותדריך', en: 'Meeting & briefing' } },
          { time: '07:30', activity: { he: 'יציאה למסלול', en: 'Start route' } },
          { time: '10:00', activity: { he: 'תחנת תצפית', en: 'Viewpoint stop' } },
          { time: '12:00', activity: { he: 'ארוחת צהריים בשטח', en: 'Field lunch' } },
          { time: '14:00', activity: { he: 'המשך המסלול', en: 'Continue route' } },
          { time: '17:00', activity: { he: 'סיום', en: 'Finish' } },
        ]
      }
    ],
    equipment: [
      { he: 'רכב שטח תקין', en: 'Working off-road vehicle' },
      { he: 'מכשיר קשר', en: 'Radio' },
      { he: 'גלגל רזרבי', en: 'Spare tire' },
      { he: 'כלי החלפת גלגל', en: 'Tire change tools' },
      { he: 'חבל גרירה', en: 'Tow rope' },
      { he: 'מים (3 ליטר לאדם)', en: 'Water (3L per person)' },
      { he: 'אוכל', en: 'Food' },
      { he: 'קרם הגנה', en: 'Sunscreen' },
      { he: 'ערכת עזרה ראשונה', en: 'First aid kit' },
    ],
    budget: {
      solo_min: 200,
      solo_max: 500,
      family_min: 400,
      family_max: 1000,
      currency: 'ILS',
      notes: { he: 'כולל דלק ותחזוקה', en: 'Includes fuel and maintenance' }
    }
  }
};

export default function TripTemplates({ onSelectTemplate, onClose }) {
  const { language } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleSelect = (templateKey) => {
    setSelectedTemplate(templateKey);
    setShowPreview(true);
  };

  const handleApply = () => {
    const template = templates[selectedTemplate];
    const lang = language === 'he' ? 'he' : 'en';
    
    // Prepare data for the form
    const formData = {
      ...template.defaults,
      // Convert itinerary
      daily_itinerary: template.itinerary.map((day, idx) => ({
        id: Date.now().toString() + idx,
        day: day.day,
        title: day.title[lang],
        activities: day.activities.map((act, actIdx) => ({
          id: Date.now().toString() + idx + actIdx,
          time: act.time,
          activity: act.activity[lang],
          notes: ''
        }))
      })),
      // Convert equipment
      equipment_checklist: template.equipment.map((item, idx) => ({
        id: Date.now().toString() + idx,
        item: item[lang],
        checked: false,
        category: 'general'
      })),
      // Budget
      budget: {
        ...template.budget,
        notes: template.budget.notes[lang]
      },
      // Water recommendation based on difficulty
      recommended_water_liters: template.defaults.difficulty === 'easy' ? 2 : 
                                template.defaults.difficulty === 'moderate' ? 3 : 4
    };
    
    onSelectTemplate(formData);
    setShowPreview(false);
    onClose();
  };

  const template = selectedTemplate ? templates[selectedTemplate] : null;
  const lang = ['he', 'ru', 'es', 'fr', 'de', 'it'].includes(language) ? language : 'en';

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(templates).map(([key, tmpl]) => {
          const Icon = tmpl.icon;
          return (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-lg ${tmpl.borderColor} border-2`}
                onClick={() => handleSelect(key)}
              >
                <CardContent className="p-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tmpl.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-1">{tmpl.name[lang]}</h3>
                  <p className="text-sm text-gray-600 mb-3">{tmpl.description[lang]}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {tmpl.defaults.duration_value} {
                        language === 'he' ? (tmpl.defaults.duration_type === 'multi_day' ? 'ימים' : tmpl.defaults.duration_type === 'half_day' ? 'שעות' : 'יום') :
                        language === 'ru' ? (tmpl.defaults.duration_type === 'multi_day' ? 'дней' : tmpl.defaults.duration_type === 'half_day' ? 'часов' : 'день') :
                        language === 'es' ? (tmpl.defaults.duration_type === 'multi_day' ? 'días' : tmpl.defaults.duration_type === 'half_day' ? 'horas' : 'día') :
                        language === 'fr' ? (tmpl.defaults.duration_type === 'multi_day' ? 'jours' : tmpl.defaults.duration_type === 'half_day' ? 'heures' : 'jour') :
                        language === 'de' ? (tmpl.defaults.duration_type === 'multi_day' ? 'Tage' : tmpl.defaults.duration_type === 'half_day' ? 'Stunden' : 'Tag') :
                        language === 'it' ? (tmpl.defaults.duration_type === 'multi_day' ? 'giorni' : tmpl.defaults.duration_type === 'half_day' ? 'ore' : 'giorno') :
                        tmpl.defaults.duration_type.replace('_', ' ')
                      }
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {language === 'he' ? (tmpl.defaults.difficulty === 'easy' ? 'קל' : tmpl.defaults.difficulty === 'moderate' ? 'בינוני' : tmpl.defaults.difficulty === 'challenging' ? 'מאתגר' : 'קשה') :
                       language === 'ru' ? (tmpl.defaults.difficulty === 'easy' ? 'Легко' : tmpl.defaults.difficulty === 'moderate' ? 'Средне' : tmpl.defaults.difficulty === 'challenging' ? 'Сложно' : 'Трудно') :
                       language === 'es' ? (tmpl.defaults.difficulty === 'easy' ? 'Fácil' : tmpl.defaults.difficulty === 'moderate' ? 'Moderado' : tmpl.defaults.difficulty === 'challenging' ? 'Desafiante' : 'Difícil') :
                       language === 'fr' ? (tmpl.defaults.difficulty === 'easy' ? 'Facile' : tmpl.defaults.difficulty === 'moderate' ? 'Modéré' : tmpl.defaults.difficulty === 'challenging' ? 'Difficile' : 'Très difficile') :
                       language === 'de' ? (tmpl.defaults.difficulty === 'easy' ? 'Leicht' : tmpl.defaults.difficulty === 'moderate' ? 'Mäßig' : tmpl.defaults.difficulty === 'challenging' ? 'Fordernd' : 'Schwer') :
                       language === 'it' ? (tmpl.defaults.difficulty === 'easy' ? 'Facile' : tmpl.defaults.difficulty === 'moderate' ? 'Moderato' : tmpl.defaults.difficulty === 'challenging' ? 'Impegnativo' : 'Difficile') :
                       tmpl.defaults.difficulty}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {template && (
                <>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center`}>
                    <template.icon className="w-5 h-5 text-white" />
                  </div>
                  {template.name[lang]}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {template?.description[lang]}
            </DialogDescription>
          </DialogHeader>

          {template && (
            <ScrollArea className="h-[50vh] pr-4">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className={`p-4 rounded-lg ${template.bgColor}`}>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {language === 'he' ? 'פרטים בסיסיים' : language === 'ru' ? 'Основные детали' : language === 'es' ? 'Detalles básicos' : language === 'fr' ? 'Détails de base' : language === 'de' ? 'Grundlegende Details' : language === 'it' ? 'Dettagli di base' : 'Basic Details'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">{language === 'he' ? 'משך:' : language === 'ru' ? 'Длительность:' : language === 'es' ? 'Duración:' : language === 'fr' ? 'Durée:' : language === 'de' ? 'Dauer:' : language === 'it' ? 'Durata:' : 'Duration:'}</span>
                      <span className="font-medium ml-2">{template.defaults.duration_value} {
                        language === 'he' ? (template.defaults.duration_type === 'multi_day' ? 'ימים' : 'יום') :
                        language === 'ru' ? (template.defaults.duration_type === 'multi_day' ? 'дней' : 'день') :
                        language === 'es' ? (template.defaults.duration_type === 'multi_day' ? 'días' : 'día') :
                        language === 'fr' ? (template.defaults.duration_type === 'multi_day' ? 'jours' : 'jour') :
                        language === 'de' ? (template.defaults.duration_type === 'multi_day' ? 'Tage' : 'Tag') :
                        language === 'it' ? (template.defaults.duration_type === 'multi_day' ? 'giorni' : 'giorno') :
                        template.defaults.duration_type.replace('_', ' ')
                      }</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{language === 'he' ? 'קושי:' : language === 'ru' ? 'Сложность:' : language === 'es' ? 'Dificultad:' : language === 'fr' ? 'Difficulté:' : language === 'de' ? 'Schwierigkeit:' : language === 'it' ? 'Difficoltà:' : 'Difficulty:'}</span>
                      <span className="font-medium ml-2">{
                        language === 'he' ? (template.defaults.difficulty === 'easy' ? 'קל' : template.defaults.difficulty === 'moderate' ? 'בינוני' : template.defaults.difficulty === 'challenging' ? 'מאתגר' : 'קשה') :
                        language === 'ru' ? (template.defaults.difficulty === 'easy' ? 'Легко' : template.defaults.difficulty === 'moderate' ? 'Средне' : template.defaults.difficulty === 'challenging' ? 'Сложно' : 'Трудно') :
                        language === 'es' ? (template.defaults.difficulty === 'easy' ? 'Fácil' : template.defaults.difficulty === 'moderate' ? 'Moderado' : template.defaults.difficulty === 'challenging' ? 'Desafiante' : 'Difícil') :
                        language === 'fr' ? (template.defaults.difficulty === 'easy' ? 'Facile' : template.defaults.difficulty === 'moderate' ? 'Modéré' : template.defaults.difficulty === 'challenging' ? 'Difficile' : 'Très difficile') :
                        language === 'de' ? (template.defaults.difficulty === 'easy' ? 'Leicht' : template.defaults.difficulty === 'moderate' ? 'Mäßig' : template.defaults.difficulty === 'challenging' ? 'Fordernd' : 'Schwer') :
                        language === 'it' ? (template.defaults.difficulty === 'easy' ? 'Facile' : template.defaults.difficulty === 'moderate' ? 'Moderato' : template.defaults.difficulty === 'challenging' ? 'Impegnativo' : 'Difficile') :
                        template.defaults.difficulty
                      }</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{language === 'he' ? 'משתתפים:' : language === 'ru' ? 'Участники:' : language === 'es' ? 'Participantes:' : language === 'fr' ? 'Participants:' : language === 'de' ? 'Teilnehmer:' : language === 'it' ? 'Partecipanti:' : 'Participants:'}</span>
                      <span className="font-medium ml-2">{language === 'he' ? 'עד' : language === 'ru' ? 'до' : language === 'es' ? 'hasta' : language === 'fr' ? 'jusqu\'à' : language === 'de' ? 'bis zu' : language === 'it' ? 'fino a' : 'up to'} {template.defaults.max_participants}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">{language === 'he' ? 'קמפינג:' : language === 'ru' ? 'Кемпинг:' : language === 'es' ? 'Camping:' : language === 'fr' ? 'Camping:' : language === 'de' ? 'Camping:' : language === 'it' ? 'Campeggio:' : 'Camping:'}</span>
                      <span className="font-medium ml-2">{template.defaults.camping_available ? 
                        (language === 'he' ? 'כן' : language === 'ru' ? 'Да' : language === 'es' ? 'Sí' : language === 'fr' ? 'Oui' : language === 'de' ? 'Ja' : language === 'it' ? 'Sì' : 'Yes') : 
                        (language === 'he' ? 'לא' : language === 'ru' ? 'Нет' : language === 'es' ? 'No' : language === 'fr' ? 'Non' : language === 'de' ? 'Nein' : language === 'it' ? 'No' : 'No')
                      }</span>
                    </div>
                  </div>
                </div>

                {/* Itinerary */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {language === 'he' ? 'לוח זמנים מוצע' : language === 'ru' ? 'Предлагаемый маршрут' : language === 'es' ? 'Itinerario sugerido' : language === 'fr' ? 'Itinéraire suggéré' : language === 'de' ? 'Vorgeschlagene Route' : language === 'it' ? 'Itinerario suggerito' : 'Suggested Itinerary'}
                  </h4>
                  <div className="space-y-4">
                    {template.itinerary.map((day) => (
                      <div key={day.day} className="border rounded-lg p-3">
                        <h5 className="font-medium text-sm mb-2">{day.title[lang]}</h5>
                        <div className="space-y-1">
                          {day.activities.map((act, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className="text-gray-500 w-12">{act.time}</span>
                              <ChevronRight className="w-3 h-3 text-gray-400" />
                              <span>{act.activity[lang]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Backpack className="w-4 h-4" />
                    {language === 'he' ? 'רשימת ציוד' : language === 'ru' ? 'Список снаряжения' : language === 'es' ? 'Lista de equipo' : language === 'fr' ? 'Liste d\'équipement' : language === 'de' ? 'Ausrüstungsliste' : language === 'it' ? 'Lista attrezzatura' : 'Equipment List'}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {template.equipment.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{item[lang]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {language === 'he' ? 'תקציב משוער' : language === 'ru' ? 'Примерный бюджет' : language === 'es' ? 'Presupuesto estimado' : language === 'fr' ? 'Budget estimé' : language === 'de' ? 'Geschätztes Budget' : language === 'it' ? 'Budget stimato' : 'Estimated Budget'}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 mb-1">{language === 'he' ? 'יחיד' : language === 'ru' ? 'Соло' : language === 'es' ? 'Individual' : language === 'fr' ? 'Solo' : language === 'de' ? 'Allein' : language === 'it' ? 'Singolo' : 'Solo'}</p>
                      <p className="font-semibold">{template.budget.solo_min}-{template.budget.solo_max} ₪</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 mb-1">{language === 'he' ? 'משפחה' : language === 'ru' ? 'Семья' : language === 'es' ? 'Familia' : language === 'fr' ? 'Famille' : language === 'de' ? 'Familie' : language === 'it' ? 'Famiglia' : 'Family'}</p>
                      <p className="font-semibold">{template.budget.family_min}-{template.budget.family_max} ₪</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{template.budget.notes[lang]}</p>
                </div>
              </div>
            </ScrollArea>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
            </Button>
            <Button onClick={handleApply} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <Sparkles className="w-4 h-4" />
              {language === 'he' ? 'השתמש בתבנית' : language === 'ru' ? 'Использовать шаблон' : language === 'es' ? 'Usar plantilla' : language === 'fr' ? 'Utiliser le modèle' : language === 'de' ? 'Vorlage verwenden' : language === 'it' ? 'Usa modello' : 'Use Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}