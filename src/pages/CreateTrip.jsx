import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";

// UI Components (Shadcn)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Icons
import { 
  Loader2, Upload, MapPin, Sparkles, Navigation, Calendar, 
  ChevronRight, ChevronLeft, Check, Info, AlertCircle,
  Clock, Mountain, Footprints, Wallet, Settings2
} from 'lucide-react';

// Custom Components
import LocationPicker from '../components/maps/LocationPicker';
import WaypointsCreator from '../components/creation/WaypointsCreator';
import EquipmentCreator from '../components/creation/EquipmentCreator';
import ItineraryCreator from '../components/creation/ItineraryCreator';
import BudgetCreator from '../components/creation/BudgetCreator';
import OrganizerWaiver from '../components/legal/OrganizerWaiver';
import { getAllCountries } from '../components/utils/CountryRegions';

// Constants
const difficulties = ['easy', 'moderate', 'challenging', 'hard', 'extreme'];
const activityTypes = ['hiking', 'cycling', 'offroad'];
const STEPS = [
  { id: 1, title: 'בסיס', icon: <Info className="w-4 h-4" /> },
  { id: 2, title: 'מיקום וזמן', icon: <MapPin className="w-4 h-4" /> },
  { id: 3, title: 'תכנון AI', icon: <Sparkles className="w-4 h-4" /> },
  { id: 4, title: 'תקציב ופרסום', icon: <Check className="w-4 h-4" /> }
];

export default function CreateTrip() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  
  // States
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [dynamicRegions, setDynamicRegions] = useState([]);
  const [showWaiver, setShowWaiver] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', location: '', country: 'israel', region: '',
    date: '', meeting_time: '', duration_type: 'full_day', duration_value: 1,
    activity_type: 'hiking', difficulty: 'moderate', image_url: '',
    latitude: 32.0853, longitude: 34.7818 // Default Tel Aviv
  });

  const [waypoints, setWaypoints] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [budget, setBudget] = useState({ solo_min: 0, solo_max: 0, currency: 'ILS', notes: '' });

  // Load User & Initial Logic
  useEffect(() => {
    const init = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        fetchRegions('israel');
      } catch (e) {
        navigate(createPageUrl('Home'));
      }
    };
    init();
  }, [navigate]);

  // Helpers
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'country') fetchRegions(value);
  };

  const fetchRegions = async (country) => {
    setLoadingRegions(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `List 12 main regions in ${country} in ${language === 'he' ? 'Hebrew' : 'English'}. Return as JSON array of strings.`,
        response_json_schema: { type: "object", properties: { regions: { type: "array", items: { type: "string" } } } }
      });
      setDynamicRegions(result.regions || []);
    } catch (e) { console.error(e); }
    setLoadingRegions(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('image_url', file_url);
      toast.success(t('image_uploaded'));
    } catch (e) { toast.error(t('upload_error')); }
    setImageUploading(false);
  };

  const saveTrip = async () => {
    setSaving(true);
    try {
      const finalData = { ...formData, waypoints, equipment_checklist: equipment, daily_itinerary: itinerary, budget };
      const created = await base44.entities.Trip.create(finalData);
      toast.success(t('trip_created'));
      navigate(createPageUrl('TripDetails') + '?id=' + created.id);
    } catch (e) { toast.error(t('save_error')); }
    setSaving(false);
  };

  // UI Components for Steps
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-12 space-x-4 rtl:space-x-reverse">
      {STEPS.map((s) => (
        <div key={s.id} className="flex items-center">
          <div className={`flex flex-col items-center group cursor-pointer`} onClick={() => s.id < step && setStep(s.id)}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
              step >= s.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white text-slate-300 border border-slate-200'
            }`}>
              {step > s.id ? <Check className="w-5 h-5" /> : s.icon}
            </div>
            <span className={`text-xs mt-2 font-medium ${step >= s.id ? 'text-emerald-700' : 'text-slate-400'}`}>
              {s.title}
            </span>
          </div>
          {s.id < 4 && <div className={`w-12 h-[2px] mb-6 transition-colors duration-500 ${step > s.id ? 'bg-emerald-600' : 'bg-slate-200'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] left-[5%] w-[30%] h-[30%] bg-emerald-100/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[5%] w-[25%] h-[25%] bg-blue-100/30 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-12">
        <header className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
              {t('create_adventure')}
            </h1>
            <p className="text-slate-500 font-medium">{t('start_planning_subtitle')}</p>
          </motion.div>
        </header>

        <StepIndicator />

        <form onSubmit={(e) => { e.preventDefault(); setShowWaiver(true); }}>
          <AnimatePresence mode="wait">
            {/* STEP 1: GENERAL INFO */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <Card className="border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
                  <CardHeader className="bg-white">
                    <CardTitle className="flex items-center gap-2">
                      <Settings2 className="w-5 h-5 text-emerald-600" />
                      {t('basic_info')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6 bg-white/50 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-bold">{t('trip_title')}</Label>
                        <Input 
                          placeholder={t('title_placeholder')} 
                          className="h-12 border-slate-200 focus:ring-emerald-500"
                          value={formData.title} 
                          onChange={(e) => handleChange('title', e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-bold">{t('activity_type')}</Label>
                        <Select value={formData.activity_type} onValueChange={(v) => handleChange('activity_type', v)}>
                          <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {activityTypes.map(type => <SelectItem key={type} value={type}>{t(type)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold">{t('description')}</Label>
                      <Textarea 
                        placeholder={t('desc_placeholder')} 
                        className="min-h-[120px] resize-none border-slate-200"
                        value={formData.description} 
                        onChange={(e) => handleChange('description', e.target.value)} 
                      />
                    </div>

                    <div className="pt-4">
                      <Label className="text-slate-700 font-bold block mb-3">{t('difficulty_level')}</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {difficulties.map((d) => (
                          <button
                            key={d} type="button"
                            onClick={() => handleChange('difficulty', d)}
                            className={`py-3 rounded-lg text-xs font-bold transition-all ${
                              formData.difficulty === d 
                              ? 'bg-emerald-600 text-white shadow-md' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {t(d)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 2: LOCATION (Map Focused) */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-700">
                      <MapPin className="w-5 h-5" />
                      {t('where_and_when')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>{t('region')}</Label>
                        <Select value={formData.region} onValueChange={(v) => handleChange('region', v)}>
                          <SelectTrigger>{loadingRegions ? <Loader2 className="animate-spin" /> : <SelectValue placeholder={t('choose_region')} />}</SelectTrigger>
                          <SelectContent>{dynamicRegions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>{t('starting_point')}</Label>
                        <div className="flex gap-2">
                          <Input value={formData.location} onChange={(e) => handleChange('location', e.target.value)} placeholder={t('search_place')} />
                          <Button type="button" onClick={() => setShowMapPicker(true)} variant="secondary">
                            <Navigation className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {t('date')}</Label>
                        <Input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Clock className="w-4 h-4" /> {t('meeting_time')}</Label>
                        <Input type="time" value={formData.meeting_time} onChange={(e) => handleChange('meeting_time', e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* STEP 3: AI CREATION TOOLS */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full animate-pulse">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{t('ai_planner')}</h3>
                      <p className="text-emerald-100 text-sm">{t('ai_planner_desc')}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <ItineraryCreator itinerary={itinerary} setItinerary={setItinerary} />
                  <EquipmentCreator equipment={equipment} setEquipment={setEquipment} />
                  <WaypointsCreator waypoints={waypoints} setWaypoints={setWaypoints} />
                </div>
              </motion.div>
            )}

            {/* STEP 4: BUDGET & REVIEW */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <BudgetCreator budget={budget} setBudget={setBudget} />
                
                <Card className="border-2 border-emerald-500 bg-emerald-50/50">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-emerald-500 rounded-full text-white">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900">{t('ready_to_go')}</h4>
                      <p className="text-sm text-emerald-700">{t('final_review_msg')}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Dock */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50">
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-3 rounded-full shadow-2xl flex items-center justify-between">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setStep(s => s - 1)} 
                disabled={step === 1}
                className="text-white hover:bg-white/10 rounded-full px-6"
              >
                <ChevronLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''} mr-2`} />
                {t('back')}
              </Button>

              <div className="hidden md:flex gap-1">
                {STEPS.map(s => (
                  <div key={s.id} className={`w-2 h-2 rounded-full transition-all ${step === s.id ? 'w-6 bg-emerald-500' : 'bg-slate-600'}`} />
                ))}
              </div>

              {step < 4 ? (
                <Button 
                  type="button" 
                  onClick={() => setStep(s => s + 1)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8 font-bold"
                >
                  {t('continue')}
                  <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''} ml-2`} />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-12 font-black shadow-lg shadow-emerald-500/30"
                >
                  {saving ? <Loader2 className="animate-spin" /> : t('publish_adventure')}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      <LocationPicker
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        initialLat={formData.latitude}
        initialLng={formData.longitude}
        onConfirm={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))}
      />
      
      {showWaiver && (
        <OrganizerWaiver 
          isOpen={showWaiver} 
          onAccept={saveTrip} 
          onDecline={() => setShowWaiver(false)} 
          saving={saving} 
        />
      )}
    </div>
  );
}