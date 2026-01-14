// @ts-nocheck
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Mountain, CheckCircle2, Info, X, Map, Download, Loader2 } from 'lucide-react';
import { useLanguage } from '../../LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function NifgashimDayCardsSelector({ 
  trekDays = [], 
  linkedDaysPairs = [], 
  selectedDays = [], 
  onDaysChange,
  maxDays = 20, // הגבלה כללית למסע כולו
  mapUrl = null
}) {
  const { language, isRTL } = useLanguage();
  const [selectedDayForInfo, setSelectedDayForInfo] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef(null);

  const maxNegevDays = 8;

  const translations = {
    he: {
      selectDays: "בחר את ימי המסע שלך",
      selected: "נבחרו",
      days: "ימים",
      maxReached: `ניתן לבחור עד ${maxDays} ימים בסך הכל`,
      difficulty: { easy: "קל", moderate: "בינוני", hard: "קשה" },
      km: "ק״מ",
      meters: "מ׳ טיפוס",
      viewMap: "צפה במפה",
      downloadPdf: "הורד PDF",
      generating: "מכין קובץ...",
      selectedDaysTitle: "ימי המסע שנבחרו",
      negevLimitReached: "הגעת למכסה המקסימלית של 8 ימי נגב.",
      linked: "צמד"
    },
    en: {
      selectDays: "Select Your Trek Days",
      selected: "Selected",
      days: "days",
      maxReached: `You can select up to ${maxDays} days in total`,
      difficulty: { easy: "Easy", moderate: "Moderate", hard: "Hard" },
      km: "km",
      meters: "m climb",
      viewMap: "View Map",
      downloadPdf: "Download PDF",
      generating: "Generating...",
      selectedDaysTitle: "Selected Trek Days",
      negevLimitReached: "You reached the limit of 8 Negev days.",
      linked: "Linked"
    }
  };

  const trans = translations[language] || translations.en;

  // --- פונקציות עזר לזיהוי ימי נגב ---
  const isNegevDay = (day) => {
    if (!day) return false;
    const region = (day.region || "").toLowerCase();
    const category = (day.category_name || "").toLowerCase();
    return region === 'negev' || category.includes('negev') || category.includes('נגב');
  };

  const getSelectedNegevCount = () => selectedDays.filter(isNegevDay).length;

  const isSelected = (dayId) => selectedDays.some(d => d.id === dayId);

  // --- לוגיקת בחירה וביטול ---
  const handleDayToggle = (day) => {
    const currentlySelected = isSelected(day.id);
    
    // 1. ביטול בחירה - תמיד מותר
    if (currentlySelected) {
      const linkedIds = getLinkedIds(day.id);
      const newSelected = selectedDays.filter(d => 
        linkedIds.length > 0 ? !linkedIds.includes(d.id) : d.id !== day.id
      );
      onDaysChange(newSelected);
      return;
    }

    // 2. הוספת יום (ובדיקת ימי צמד)
    const linkedIds = getLinkedIds(day.id);
    const daysToAdd = [day];

    if (linkedIds.length > 0) {
      linkedIds.forEach(id => {
        if (id !== day.id && !isSelected(id)) {
          const linkedDayObj = trekDays.find(td => td.id === id);
          if (linkedDayObj) daysToAdd.push(linkedDayObj);
        }
      });
    }

    // חישוב המצב העתידי
    const futureSelected = [...selectedDays, ...daysToAdd];
    const futureNegevCount = futureSelected.filter(isNegevDay).length;

    // בדיקת חסם נגב (8 ימים)
    if (futureNegevCount > maxNegevDays) {
      alert(trans.negevLimitReached);
      return;
    }

    // בדיקת חסם כללי (אם קיים)
    if (futureSelected.length > maxDays) {
      alert(trans.maxReached);
      return;
    }

    onDaysChange(futureSelected);
  };

  const getLinkedIds = (dayId) => {
    const relevantPairs = linkedDaysPairs.filter(pair => 
      Array.isArray(pair) ? pair.includes(dayId) : (pair?.day_id_1 === dayId || pair?.day_id_2 === dayId)
    );
    const ids = new Set();
    relevantPairs.forEach(pair => {
      if (Array.isArray(pair)) pair.forEach(id => ids.add(id));
      else { ids.add(pair.day_id_1); ids.add(pair.day_id_2); }
    });
    return Array.from(ids);
  };

  // --- PDF & Formatting ---
  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat(language === 'he' ? 'he-IL' : 'en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    }).format(new Date(dateString));
  };

  const handleDownloadPDF = async () => {
    if (selectedDays.length === 0) return;
    setIsGeneratingPdf(true);
    try {
      const element = pdfRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      pdf.save('my-trek.pdf');
    } catch (e) { console.error(e); }
    finally { setIsGeneratingPdf(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{trans.selectDays}</h2>
          <p className="text-sm text-gray-500">
            {getSelectedNegevCount()} / {maxNegevDays} {language === 'he' ? 'ימי נגב נבחרו' : 'Negev days selected'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedDays.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={isGeneratingPdf} className="text-green-600 border-green-200">
              {isGeneratingPdf ? <Loader2 className="animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
              {isGeneratingPdf ? trans.generating : trans.downloadPdf}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowMap(true)} className="text-indigo-600 border-indigo-200">
            <Map className="w-4 h-4 mr-2" /> {trans.viewMap}
          </Button>
          <div className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
            {selectedDays.length} {trans.selected}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {trekDays.map((day) => {
          const selected = isSelected(day.id);
          const isNegev = isNegevDay(day);
          const negevFull = getSelectedNegevCount() >= maxNegevDays;
          const isDisabled = !selected && isNegev && negevFull;
          const isLinked = getLinkedIds(day.id).length > 0;
          const imageUrl = typeof day.image === 'string' ? day.image : day.image?.secure_url;

          return (
            <motion.div
              key={day.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: isDisabled ? 0.6 : 1,
                filter: isDisabled ? 'grayscale(40%)' : 'none'
              }}
              className={cn(
                "group relative rounded-xl border-2 transition-all overflow-hidden bg-white flex flex-col h-full cursor-pointer",
                selected ? "border-blue-600 shadow-md" : "border-gray-200 hover:border-blue-300",
                isDisabled && "cursor-not-allowed opacity-60"
              )}
              onClick={() => !isDisabled && handleDayToggle(day)}
            >
              {/* Image */}
              <div className="relative h-40 w-full bg-gray-100">
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300"><Mountain /></div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 inset-x-2 flex justify-between items-start">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedDayForInfo(day); }}
                    className="p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col gap-1 items-end">
                    {selected && <div className="bg-blue-600 text-white p-1 rounded-full shadow-lg"><CheckCircle2 className="w-4 h-4" /></div>}
                    {isLinked && <div className="bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full">{trans.linked}</div>}
                  </div>
                </div>

                <div className="absolute bottom-2 left-3 text-white text-xs font-bold flex items-center gap-1 drop-shadow-md">
                   <Calendar className="w-3 h-3" /> {formatDate(day.date)}
                </div>
              </div>

              {/* Body */}
              <div className="p-3 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-sm leading-tight text-gray-800">{day.daily_title}</h3>
                  {isNegev && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded uppercase font-bold">Negev</span>}
                </div>
                
                <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-gray-500 border-t">
                  <div className="flex items-center gap-1">
                    <div className={cn("w-2 h-2 rounded-full", day.difficulty === 'easy' ? 'bg-green-500' : day.difficulty === 'moderate' ? 'bg-yellow-500' : 'bg-red-500')} />
                    <span>{trans.difficulty[day.difficulty] || day.difficulty}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {day.daily_distance_km} {trans.km}</span>
                    {day.elevation_gain_m > 0 && <span className="flex items-center gap-0.5"><Mountain className="w-3 h-3" /> {day.elevation_gain_m}m</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal & PDF Hidden Content (נשאר זהה ללוגיקה הקודמת שלך) */}
      <AnimatePresence>
        {selectedDayForInfo && (
           <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedDayForInfo(null)}
           >
             <motion.div 
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden"
              onClick={e => e.stopPropagation()}
             >
                <div className="h-48 relative">
                  <img src={selectedDayForInfo.image?.secure_url || selectedDayForInfo.image} className="w-full h-full object-cover" />
                  <button onClick={() => setSelectedDayForInfo(null)} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white"><X /></button>
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">{selectedDayForInfo.daily_title}</h2>
                  <div className="prose prose-sm max-h-60 overflow-y-auto" dangerouslySetInnerHTML={{ __html: selectedDayForInfo.description }} />
                </div>
             </motion.div>
           </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden PDF Container */}
      <div ref={pdfRef} className="absolute -left-[9999px] w-[210mm] bg-white p-10" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
          <h1 className="text-3xl font-bold text-center mb-10">{trans.selectedDaysTitle}</h1>
          {selectedDays.sort((a,b) => new Date(a.date) - new Date(b.date)).map(day => (
            <div key={day.id} className="border-b py-4">
              <h3 className="text-xl font-bold">{day.daily_title} - {formatDate(day.date)}</h3>
              <p>{day.daily_distance_km} {trans.km} | {day.difficulty}</p>
            </div>
          ))}
      </div>
    </div>
  );
}