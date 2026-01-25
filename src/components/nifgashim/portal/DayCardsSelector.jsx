import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Mountain, CheckCircle2, Info, X, Map, Download, Loader2, Link2 } from 'lucide-react';
import RopeOverlay from './RopeOverlay';
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
  maxDays = 8,
  mapUrl = null,
  trekCategories = []
}) {
  const { language, isRTL } = useLanguage();
  const [selectedDayForInfo, setSelectedDayForInfo] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [showLinkedDaysDialog, setShowLinkedDaysDialog] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef(null);
  const gridRef = useRef(null);
  const cardRefs = useRef({});
  const [isDesktop, setIsDesktop] = useState(false);

  React.useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 640); // sm breakpoint
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const translations = {
    he: {
      selectDays: "בחר את ימי המסע שלך",
      selected: "נבחרו",
      days: "ימים",
      maxReached: `ניתן לבחור עד ${maxDays} ימים`,
      negevMaxReached: `הגעת למקסימום ${maxDays} ימי נגב`,
      negevDays: "ימי נגב",
      northCenterDays: "ימי צפון-מרכז",
      difficulty: {
        easy: "קל",
        moderate: "בינוני",
        hard: "קשה"
      },
      km: "ק״מ",
      meters: "מ׳ טיפוס",
      readMore: "קרא עוד",
      close: "סגור",
      viewMap: "צפה במפה",
      downloadPdf: "הורד PDF",
      generating: "מכין קובץ...",
      selectedDaysTitle: "ימי המסע שנבחרו",
      linkedDaysTitle: "ימים מקושרים",
      linkedDaysMessage: "ימים אלו מהווים מסלול רציף ומחייבים השתתפות ברצף. לא ניתן להירשם ליום השני ללא השתתפות ביום הראשון, ולא ניתן לבחור רק אחד מהם.",
      linkedDaysConfirm: "הבנתי, בחר את שני הימים",
      linkedDaysCancel: "ביטול"
    },
    en: {
      selectDays: "Select Your Trek Days",
      selected: "Selected",
      days: "days",
      maxReached: `You can select up to ${maxDays} days`,
      negevMaxReached: `Maximum ${maxDays} Negev days reached`,
      negevDays: "Negev days",
      northCenterDays: "North-Center days",
      difficulty: {
        easy: "Easy",
        moderate: "Moderate",
        hard: "Hard"
      },
      km: "km",
      meters: "m climb",
      readMore: "Read More",
      close: "Close",
      viewMap: "View Map",
      downloadPdf: "Download PDF",
      generating: "Generating...",
      selectedDaysTitle: "Selected Trek Days",
      linkedDaysTitle: "Linked Days",
      linkedDaysMessage: "These days form a continuous route and require sequential participation. You cannot register for the second day without participating in the first, and you cannot select only one of them.",
      linkedDaysConfirm: "I understand, select both days",
      linkedDaysCancel: "Cancel"
    },
    ru: {
      selectDays: "Выберите дни похода",
      selected: "Выбрано",
      days: "дней",
      maxReached: `Можно выбрать до ${maxDays} дней`,
      negevMaxReached: `Достигнут максимум ${maxDays} дней в Негеве`,
      negevDays: "дни Негева",
      northCenterDays: "дни Север-Центр",
      difficulty: {
        easy: "Легко",
        moderate: "Средне",
        hard: "Сложно"
      },
      km: "км",
      meters: "м подъема",
      readMore: "Подробнее",
      close: "Закрыть",
      viewMap: "Карта",
      downloadPdf: "Скачать PDF",
      generating: "Создание...",
      selectedDaysTitle: "Выбранные дни похода",
      linkedDaysTitle: "Связанные дни",
      linkedDaysMessage: "Эти дни образуют непрерывный маршрут и требуют последовательного участия. Вы не можете зарегистрироваться на второй день без участия в первом, и нельзя выбрать только один из них.",
      linkedDaysConfirm: "Понятно, выбрать оба дня",
      linkedDaysCancel: "Отмена"
    },
    es: {
      selectDays: "Selecciona los días del trek",
      selected: "Seleccionados",
      days: "días",
      maxReached: `Puedes seleccionar hasta ${maxDays} días`,
      negevMaxReached: `Máximo ${maxDays} días de Negev alcanzado`,
      negevDays: "días del Negev",
      northCenterDays: "días Norte-Centro",
      difficulty: {
        easy: "Fácil",
        moderate: "Moderado",
        hard: "Difícil"
      },
      km: "km",
      meters: "m subida",
      readMore: "Leer más",
      close: "Cerrar",
      viewMap: "Ver mapa",
      downloadPdf: "Descargar PDF",
      generating: "Generando...",
      selectedDaysTitle: "Días del trek seleccionados",
      linkedDaysTitle: "Días vinculados",
      linkedDaysMessage: "Estos días forman una ruta continua y requieren participación secuencial. No puede registrarse para el segundo día sin participar en el primero, y no puede seleccionar solo uno de ellos.",
      linkedDaysConfirm: "Entendido, seleccionar ambos días",
      linkedDaysCancel: "Cancelar"
    },
    fr: {
      selectDays: "Sélectionnez vos jours de trek",
      selected: "Sélectionnés",
      days: "jours",
      maxReached: `Vous pouvez sélectionner jusqu'à ${maxDays} jours`,
      negevMaxReached: `Maximum ${maxDays} jours du Néguev atteint`,
      negevDays: "jours du Néguev",
      northCenterDays: "jours Nord-Centre",
      difficulty: {
        easy: "Facile",
        moderate: "Modéré",
        hard: "Difficile"
      },
      km: "km",
      meters: "m montée",
      readMore: "En savoir plus",
      close: "Fermer",
      viewMap: "Voir la carte",
      downloadPdf: "Télécharger PDF",
      generating: "Génération...",
      selectedDaysTitle: "Jours de trek sélectionnés",
      linkedDaysTitle: "Jours liés",
      linkedDaysMessage: "Ces jours forment un itinéraire continu et nécessitent une participation séquentielle. Vous ne pouvez pas vous inscrire au deuxième jour sans participer au premier, et vous ne pouvez pas sélectionner un seul d'entre eux.",
      linkedDaysConfirm: "Compris, sélectionner les deux jours",
      linkedDaysCancel: "Annuler"
    },
    de: {
      selectDays: "Wähle deine Trek-Tage",
      selected: "Ausgewählt",
      days: "Tage",
      maxReached: `Du kannst bis zu ${maxDays} Tage auswählen`,
      negevMaxReached: `Maximum ${maxDays} Negev-Tage erreicht`,
      negevDays: "Negev-Tage",
      northCenterDays: "Nord-Zentrum-Tage",
      difficulty: {
        easy: "Leicht",
        moderate: "Mittel",
        hard: "Schwer"
      },
      km: "km",
      meters: "m Aufstieg",
      readMore: "Mehr lesen",
      close: "Schließen",
      viewMap: "Karte ansehen",
      downloadPdf: "PDF herunterladen",
      generating: "Erstellen...",
      selectedDaysTitle: "Ausgewählte Trek-Tage",
      linkedDaysTitle: "Verknüpfte Tage",
      linkedDaysMessage: "Diese Tage bilden eine durchgehende Route und erfordern eine aufeinanderfolgende Teilnahme. Sie können sich nicht für den zweiten Tag anmelden, ohne am ersten teilzunehmen, und Sie können nicht nur einen von ihnen auswählen.",
      linkedDaysConfirm: "Verstanden, beide Tage auswählen",
      linkedDaysCancel: "Abbrechen"
    },
    it: {
      selectDays: "Seleziona i tuoi giorni di trek",
      selected: "Selezionati",
      days: "giorni",
      maxReached: `Puoi selezionare fino a ${maxDays} giorni`,
      negevMaxReached: `Massimo ${maxDays} giorni del Negev raggiunto`,
      negevDays: "giorni del Negev",
      northCenterDays: "giorni Nord-Centro",
      difficulty: {
        easy: "Facile",
        moderate: "Moderato",
        hard: "Difficile"
      },
      km: "km",
      meters: "m salita",
      readMore: "Leggi di più",
      close: "Chiudi",
      viewMap: "Vedi mappa",
      downloadPdf: "Scarica PDF",
      generating: "Generazione...",
      selectedDaysTitle: "Giorni del trek selezionati",
      linkedDaysTitle: "Giorni collegati",
      linkedDaysMessage: "Questi giorni formano un percorso continuo e richiedono una partecipazione sequenziale. Non è possibile registrarsi per il secondo giorno senza partecipare al primo e non è possibile selezionare solo uno di essi.",
      linkedDaysConfirm: "Capito, seleziona entrambi i giorni",
      linkedDaysCancel: "Annulla"
    }
  };

  const trans = translations[language] || translations.en;

  const handleDownloadPDF = async () => {
    if (selectedDays.length === 0) return;
    
    setIsGeneratingPdf(true);
    
    try {
        // Wait a moment for images to potentially load if they were hidden (though here we use a hidden div that is always present but off-screen)
        const element = pdfRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2, // Better quality
            useCORS: true, // For images
            logging: false,
            direction: isRTL ? 'rtl' : 'ltr'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        // First page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        // Additional pages if content is long
        while (heightLeft > 0) {
            position = heightLeft - imgHeight; // This logic for multi-page in jsPDF with one long image is tricky. 
            // Usually we just add new page and put the image shifted up.
            // But let's try a simpler approach: 
            // If it fits on one page, great. If not, the simple addImage cut might look weird.
            // A robust solution slices the canvas or adds page. 
            // For now, let's assume standard behavior:
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, -1 * (imgHeight - heightLeft), imgWidth, imgHeight); // This is approximate
            heightLeft -= pdfHeight;
        }
        
        // Better multi-page approach for long content:
        // Actually, let's stick to single page if possible or just standard addImage which might stretch/cut.
        // Given we are generating a list, let's rely on standard 'add page' logic if we were rendering text manually.
        // But since we are screenshotting, let's stick to the basic implementation:
        // If content is longer than 1 page:
        if (imgHeight > pdfHeight) {
             // Reset and do a simple loop
             const pdf2 = new jsPDF('p', 'mm', 'a4');
             let heightLeft2 = imgHeight;
             let position2 = 0;
             
             pdf2.addImage(imgData, 'PNG', 0, position2, imgWidth, imgHeight);
             heightLeft2 -= pdfHeight;
             
             while (heightLeft2 > 0) {
                position2 -= pdfHeight; // Move the image up
                pdf2.addPage();
                pdf2.addImage(imgData, 'PNG', 0, position2, imgWidth, imgHeight);
                heightLeft2 -= pdfHeight;
             }
             pdf2.save('trek-days.pdf');
        } else {
             pdf.save('trek-days.pdf');
        }
        
    } catch (error) {
        console.error('Error generating PDF:', error);
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  const isSelected = (day) => {
    // Always compare by day_number for consistency
    return selectedDays.some(d => d.day_number === day.day_number);
  };

  // Find the Negev category from trek_categories
  const negevCategory = trekCategories.find(cat => 
    cat.name?.toLowerCase().includes('נגב') || cat.name?.toLowerCase().includes('negev')
  );
  const negevCategoryId = negevCategory?.id;
  const negevMaxDays = negevCategory?.max_selectable_days || maxDays;

  // Check if a day is in the Negev category by matching category_id
  const isNegevDay = (day) => {
    if (!negevCategoryId || !day.category_id) return false;
    return day.category_id === negevCategoryId;
  };

  // Count selected Negev days
  const selectedNegevCount = selectedDays.filter(d => isNegevDay(d)).length;
  
  // Count selected North-Center days
  const selectedNorthCenterCount = selectedDays.filter(d => !isNegevDay(d)).length;

  // Check if Negev max is reached (8 days limit)
  const isNegevMaxReached = selectedNegevCount >= negevMaxDays;

  // Check if a specific day should be disabled
  const isDayDisabled = (day) => {
    // If already selected, never disable
    if (isSelected(day)) return false;
    
    // Only Negev days have a limit
    if (isNegevDay(day)) {
      return isNegevMaxReached;
    }
    
    // North-Center has no limit
    return false;
  };
  
  // Debug logging
  // console.log('=== DAY SELECTOR DEBUG ===');
  // console.log('Trek Categories:', trekCategories);
  // console.log('Negev Category ID:', negevCategoryId);
  // console.log('Negev Max Days:', negevMaxDays);
  // console.log('Selected Negev Count:', selectedNegevCount);
  // console.log('Is Negev Max Reached:', isNegevMaxReached);
  // console.log('Trek Days with categories:', trekDays.map(d => ({ id: d.id, title: d.daily_title, category_id: d.category_id, isNegev: isNegevDay(d) })));
  // console.log('========================');

  // Ensure consistent ordering of days in grid (by day number, then date)
  const daysForGrid = React.useMemo(() => {
    return [...trekDays].sort((a, b) => {
      const an = Number(a.day_number || 0);
      const bn = Number(b.day_number || 0);
      if (an !== bn) return an - bn;
      const ad = a.date ? new Date(a.date).getTime() : 0;
      const bd = b.date ? new Date(b.date).getTime() : 0;
      return ad - bd;
    });
  }, [trekDays]);

  const handleDayToggle = (day) => {
    const currentlySelected = isSelected(day);
    
    // Check if this day is disabled (Negev max reached for non-selected Negev days)
    if (isDayDisabled(day)) {
      return;
    }

    let newSelected = [...selectedDays];

    // Find if this day is part of any linked pair
    // NOTE: linkedDaysPairs uses day_number as stored in DB, not display number
    const relevantPairs = linkedDaysPairs.filter(pair => {
      if (Array.isArray(pair)) {
        return pair.includes(day.day_number);
      }
      return pair?.day_id_1 === day.day_number || pair?.day_id_2 === day.day_number;
    });

    const getLinkedDayNumbers = (dayNumber) => {
      const dayNumbers = new Set();
      relevantPairs.forEach(pair => {
        if (Array.isArray(pair)) {
          pair.forEach(dn => dayNumbers.add(dn));
        } else {
          dayNumbers.add(pair.day_id_1);
          dayNumbers.add(pair.day_id_2);
        }
      });
      return Array.from(dayNumbers);
    };

    const linkedDayNumbers = getLinkedDayNumbers(day.day_number);

    if (currentlySelected) {
      // Deselect logic
      // If we deselect a day, we must deselect all linked days
      if (linkedDayNumbers.length > 0) {
        newSelected = newSelected.filter(d => !linkedDayNumbers.includes(d.day_number));
      } else {
        newSelected = newSelected.filter(d => d.id !== day.id && d.day_number !== day.day_number);
      }
    } else {
      // Select logic
      const daysToAdd = [];
      
      // Always add the clicked day
      daysToAdd.push(day);

      // Add linked days if not already selected
      if (linkedDayNumbers.length > 0) {
        linkedDayNumbers.forEach(dayNum => {
          if (dayNum !== day.day_number && !newSelected.some(d => d.day_number === dayNum)) {
            const dayObj = trekDays.find(td => td.day_number === dayNum);
            if (dayObj) daysToAdd.push(dayObj);
          }
        });
      }

      // Check Negev limit for the days we're trying to add
      const negevDaysToAdd = daysToAdd.filter(d => isNegevDay(d)).length;
      const currentNegevCount = newSelected.filter(d => isNegevDay(d)).length;
      
      if (currentNegevCount + negevDaysToAdd > negevMaxDays) {
        // Cannot select - would exceed Negev limit
        return; 
      }

      newSelected = [...newSelected, ...daysToAdd];
    }

    onDaysChange(newSelected);
  };

  // Helper to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'he' ? 'he-IL' : 'en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{trans.selectDays}</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {selectedDays.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPdf}
                className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isGeneratingPdf ? trans.generating : trans.downloadPdf}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMap(true)}
              className="gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
            >
              <Map className="w-4 h-4" />
              {trans.viewMap}
            </Button>
            <div className="px-4 py-2 rounded-full text-sm font-bold bg-blue-50 text-blue-700">
             {selectedDays.length} {trans.selected}
            </div>
          </div>
        </div>
        
        {/* Category counters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2",
            isNegevMaxReached 
              ? "bg-amber-100 text-amber-800 border border-amber-300" 
              : "bg-orange-50 text-orange-700"
          )}>
            <span>{trans.negevDays}:</span>
            <span className="font-bold">{selectedNegevCount}/{negevMaxDays}</span>
          </div>
          <div className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 flex items-center gap-2">
            <span>{trans.northCenterDays}:</span>
            <span className="font-bold">{selectedNorthCenterCount}</span>
          </div>
        </div>
        
        {/* Warning message when Negev max is reached */}
        {isNegevMaxReached && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-center gap-2"
          >
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{trans.negevMaxReached}</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 relative px-0" ref={gridRef}>
         {/* Rope between linked days - only rendered on desktop for performance and stability */}
        {isDesktop && (
          <RopeOverlay containerRef={gridRef} days={daysForGrid} linkedDaysPairs={linkedDaysPairs} cardRefs={cardRefs} isRTL={isRTL} />
        )}
        
        {/* Link indicator for paired days - shown as badges on the cards */}
        {daysForGrid.map((day) => {
          const selected = isSelected(day);
          const isDisabled = isDayDisabled(day);
          const isNegev = isNegevDay(day);

          // Debug log (remove after testing)
          if (selected) {
            console.log('Day selected:', day.day_number, day.daily_title);
          }
           // Find linked day_numbers for this day
          const getLinkedPartner = () => {
            for (const pair of linkedDaysPairs) {
              const pairDays = Array.isArray(pair) ? pair : [pair.day_id_1, pair.day_id_2];
              if (pairDays.includes(day.day_number)) {
                return pairDays.find(d => d !== day.day_number);
              }
            }
            return null;
          };
          const linkedPartnerNumber = getLinkedPartner();
          const isLinked = linkedPartnerNumber !== null;
          
          // Get unique color for each linked pair
          const getLinkedPairColor = () => {
            const colors = [
              { bg: 'bg-purple-600/90', text: 'text-purple-600' },
              { bg: 'bg-pink-600/90', text: 'text-pink-600' },
              { bg: 'bg-teal-600/90', text: 'text-teal-600' },
              { bg: 'bg-amber-600/90', text: 'text-amber-600' },
              { bg: 'bg-rose-600/90', text: 'text-rose-600' },
              { bg: 'bg-cyan-600/90', text: 'text-cyan-600' },
            ];
            for (let i = 0; i < linkedDaysPairs.length; i++) {
              const pair = linkedDaysPairs[i];
              const pairDays = Array.isArray(pair) ? pair : [pair.day_id_1, pair.day_id_2];
              if (pairDays.includes(day.day_number)) {
                return colors[i % colors.length];
              }
            }
            return colors[0];
          };
          const linkedColor = isLinked ? getLinkedPairColor() : null;

           const imageUrl = day.image_url;

           return (
             <motion.div
               ref={(el) => { if (el) cardRefs.current[day.id] = el; }}
               key={day.id}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={isDesktop ? { 
                 opacity: isDisabled ? 0.5 : 1, 
                 scale: selected ? 1.02 : 1,
                 filter: isDisabled ? 'grayscale(100%)' : 'grayscale(0%)'
               } : { opacity: 1 }}
               whileTap={isDesktop && !isDisabled ? { scale: 0.98 } : {}}
               className={cn(
                 "relative rounded-lg border-2 sm:border-4 transition-all duration-200 overflow-hidden flex flex-col h-full touch-manipulation",
                 selected 
                   ? "border-green-600 shadow-md sm:shadow-2xl sm:ring-4 ring-green-400 ring-opacity-50 bg-green-50" 
                   : "border-gray-200 bg-white",
                 isDisabled && "cursor-not-allowed border-gray-100 bg-gray-50 opacity-50 grayscale"
               )}
             >
               {/* Image Section */}
                  <div 
                    className="relative w-full aspect-square sm:aspect-video bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 cursor-pointer group overflow-hidden touch-manipulation"
                    onClick={() => {
                      if (isDisabled) return;
                      if (isLinked && !isSelected(day)) {
                        setShowLinkedDaysDialog(day);
                      } else {
                        handleDayToggle(day);
                      }
                    }}
                  >
                    {imageUrl && typeof imageUrl === 'string' && imageUrl.length > 5 ? (
                      <img 
                        src={imageUrl} 
                        alt={day.daily_title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}

                    {!imageUrl || typeof imageUrl !== 'string' || imageUrl.length < 5 ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-500 to-slate-700 text-white">
                        <Mountain className="w-8 h-8 opacity-60 mb-1" />
                        <div className="text-xs opacity-70 font-medium">{language === 'he' ? 'יום ' : 'Day '}{day.day_number}</div>
                      </div>
                    ) : null}

                 {/* Overlay Gradient */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                 {/* Day Number and Date */}
                 {/* Desktop/Tablet: two small chips in corner */}
                 <div className={`absolute bottom-1 ${isRTL ? 'left-2' : 'right-2'} hidden sm:flex flex-col items-end gap-0.5`}>
                   <div className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-bold text-gray-900">
                     {language === 'he' ? `יום ${day.day_number}` : `Day ${day.day_number}`}
                   </div>
                   {day.date && (
                     <div className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-xs font-medium text-gray-700">
                       {formatDate(day.date)}
                     </div>
                   )}
                 </div>

                 {/* Mobile: single centered pill to avoid overlaps */}
                 <div className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:hidden">
                   <div className="bg-black/60 text-white backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-medium flex items-center gap-1.5">
                     <span>{language === 'he' ? `יום ${day.day_number}` : `Day ${day.day_number}`}</span>
                     {day.date && (
                       <>
                         <span className="opacity-60">•</span>
                         <span>{formatDate(day.date)}</span>
                       </>
                     )}
                   </div>
                 </div>

                 {/* Info Button - Opens Modal */}
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     setSelectedDayForInfo(day);
                   }}
                   className="absolute top-0.5 sm:top-1 left-0.5 sm:left-1 p-1 sm:p-1.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors z-10 touch-manipulation"
                 >
                   <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                 </button>

                 {/* Category Badge */}
                 <div className={`absolute top-0.5 sm:top-1 ${isRTL ? 'left-6 sm:left-8' : 'right-6 sm:right-8'} ${isNegev ? 'bg-orange-500/80' : 'bg-blue-500/80'} backdrop-blur-sm text-white text-[9px] sm:text-xs px-1 py-0.5 rounded-full shadow-sm`}>
                   {isNegev ? (language === 'he' ? 'נ' : 'N') : (language === 'he' ? 'צ' : 'C')}
                 </div>

                 {/* Linked Days Indicator */}
                 {isLinked && linkedColor && (
                   <motion.div 
                     className={`absolute bottom-1 sm:bottom-1 ${isRTL ? 'right-1' : 'left-1'} ${linkedColor.bg} backdrop-blur-sm text-white p-0.5 sm:p-1 rounded-full shadow-lg`}
                     animate={{ 
                       scale: [1, 1.1, 1],
                     }}
                     transition={{ duration: 2, repeat: Infinity }}
                   >
                     <Link2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                   </motion.div>
                 )}



                 {/* Selected Checkmark - ENHANCED VISIBILITY */}
                 {selected && (
                   <div className={`absolute top-0.5 sm:top-1 ${isRTL ? 'left-auto right-0.5 sm:right-1' : 'right-0.5 sm:right-1'} bg-green-600 text-white rounded-full p-1 sm:p-2 shadow-xl sm:shadow-2xl ring-2 sm:ring-4 ring-green-300 ring-opacity-70 z-20`}>
                     <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7" />
                   </div>
                 )}


               </div>

               {/* Content Section */}
               <div 
               className="p-1.5 sm:p-2 flex-1 flex flex-col cursor-pointer touch-manipulation"
               onClick={() => {
                 if (isDisabled) return;
                 if (isLinked && !isSelected(day)) {
                   setShowLinkedDaysDialog(day);
                 } else {
                   handleDayToggle(day);
                 }
               }}
               >
               <h3 className="font-bold text-[10px] sm:text-xs leading-tight line-clamp-2">{day.daily_title}</h3>

               <div className="mt-auto text-[9px] sm:text-xs text-gray-600 space-y-0.5">
                <div className={cn(
                  "w-1 h-1 rounded-full",
                  day.difficulty === 'easy' ? 'bg-green-500' :
                  day.difficulty === 'moderate' ? 'bg-yellow-500' :
                  'bg-red-500'
                )} />
                {day.elevation_gain_m > 0 && (
                  <div>
                    <Mountain className="w-2 h-2 inline" />
                    <span> {day.elevation_gain_m}m</span>
                  </div>
                )}
               </div>
               </div>
             </motion.div>
           );
         })}
       </div>

      {/* Day Details Modal */}
      <AnimatePresence>
        {selectedDayForInfo && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDayForInfo(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
            >
              {/* Modal Content */}
              <motion.div
                layoutId={`day-card-${selectedDayForInfo.id}`}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedDayForInfo(null)}
                  className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 p-1.5 sm:p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors touch-manipulation"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Hero Image */}
                <div className="relative h-48 sm:h-64 w-full">
                  {selectedDayForInfo.image_url ? (
                    <img 
                      src={selectedDayForInfo.image_url} 
                      alt={selectedDayForInfo.daily_title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {!selectedDayForInfo.image_url && (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                       <Mountain className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-3 sm:p-6 text-white w-full">
                    <div className="flex items-center gap-2 text-xs sm:text-sm opacity-90 mb-1 sm:mb-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                        {formatDate(selectedDayForInfo.date)}
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">{selectedDayForInfo.daily_title}</h2>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm sm:text-base">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className={cn(
                          "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full",
                          selectedDayForInfo.difficulty === 'easy' ? 'bg-green-500' :
                          selectedDayForInfo.difficulty === 'moderate' ? 'bg-yellow-500' :
                          'bg-red-500'
                        )} />
                        <span className="font-medium">
                            {selectedDayForInfo.difficulty && typeof selectedDayForInfo.difficulty === 'string' ? (trans.difficulty[selectedDayForInfo.difficulty] || selectedDayForInfo.difficulty) : '-'}
                        </span>
                    </div>
                    <div className="w-px h-4 sm:h-6 bg-gray-300" />
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        <span className="font-medium">{selectedDayForInfo.daily_distance_km}</span>
                    </div>
                    <div className="w-px h-4 sm:h-6 bg-gray-300" />
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <Mountain className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        <span className="font-medium">{selectedDayForInfo.elevation_gain_m} {trans.meters}</span>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedDayForInfo.description && (
                    <div className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed text-sm sm:text-base">
                      <div dangerouslySetInnerHTML={{ 
                        __html: selectedDayForInfo.description.includes('<') 
                          ? selectedDayForInfo.description 
                          : selectedDayForInfo.description.replace(/\n/g, '<br/>') 
                      }} />
                    </div>
                  )}

                  {!selectedDayForInfo.description && (
                    <p className="text-gray-500 italic text-center py-6 sm:py-8 text-sm sm:text-base">
                      {language === 'he' ? 'אין מידע נוסף על יום זה' : 'No additional information for this day'}
                    </p>
                  )}
                </div>

              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Linked Days Dialog */}
      <AnimatePresence>
        {showLinkedDaysDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLinkedDaysDialog(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 sm:p-6 text-white">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-2 sm:p-3 bg-white/20 rounded-full">
                    <Link2 className="w-4 h-4 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold">{trans.linkedDaysTitle}</h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">
                  {trans.linkedDaysMessage}
                </p>

                {/* Visual representation of linked days */}
                <div className="flex items-center justify-center gap-1 sm:gap-2 mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-50 rounded-xl">
                  {(() => {
                    const linkedPartner = linkedDaysPairs.find(pair => {
                      const pairDays = Array.isArray(pair) ? pair : [pair.day_id_1, pair.day_id_2];
                      return pairDays.includes(showLinkedDaysDialog.day_number);
                    });
                    const pairDays = linkedPartner ? (Array.isArray(linkedPartner) ? linkedPartner : [linkedPartner.day_id_1, linkedPartner.day_id_2]) : [];
                    const sortedPair = [...pairDays].sort((a, b) => a - b);
                    
                    return sortedPair.map((dayNum, idx) => {
                      const dayObj = trekDays.find(d => d.day_number === dayNum);
                      return (
                        <React.Fragment key={dayNum}>
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                              {dayNum}
                            </div>
                            <span className="text-[9px] sm:text-xs text-gray-600 mt-1 text-center max-w-[60px] sm:max-w-[80px] truncate">
                              {dayObj?.daily_title || `Day ${dayNum}`}
                            </span>
                          </div>
                          {idx === 0 && (
                            <div className="flex items-center">
                              <div className="w-4 sm:w-8 h-0.5 sm:h-1 bg-purple-300 rounded-full" />
                              <Link2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mx-0.5 sm:mx-1" />
                              <div className="w-4 sm:w-8 h-0.5 sm:h-1 bg-purple-300 rounded-full" />
                            </div>
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => {
                      handleDayToggle(showLinkedDaysDialog);
                      setShowLinkedDaysDialog(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {trans.linkedDaysConfirm}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowLinkedDaysDialog(null)}
                    className="flex-1"
                  >
                    {trans.linkedDaysCancel}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Modal */}
      <AnimatePresence>
        {showMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMap(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] sm:h-[80vh] overflow-hidden relative flex flex-col"
            >
              <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-gray-50">
                <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                    <Map className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    {language === 'he' ? 'מפת המסלול' : 'Route Map'}
                </h3>
                <button
                  onClick={() => setShowMap(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition-colors touch-manipulation"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <div className="flex-1 w-full h-full bg-gray-100 relative">
                  {mapUrl ? (
                    <iframe 
                      src={mapUrl}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 flex-col gap-4">
                        <Map className="w-16 h-16 opacity-20" />
                        <p>{language === 'he' ? 'מפה לא זמינה כרגע' : 'Map currently unavailable'}</p>
                    </div>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden PDF Content - Only render when generating to save memory */}
      {isGeneratingPdf && (
      <div 
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          top: 0, 
          width: '210mm', // A4 width
          minHeight: '297mm', // A4 height
          background: 'white', 
          padding: '20mm',
          direction: isRTL ? 'rtl' : 'ltr',
          fontFamily: 'Arial, sans-serif', // Standard font
          zIndex: -1
        }} 
        ref={pdfRef}
      >
          <h1 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {trans.selectedDaysTitle}
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {selectedDays.sort((a, b) => new Date(a.date) - new Date(b.date)).map((day, index) => (
                  <div key={day.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '8px', pageBreakInside: 'avoid', backgroundColor: '#fff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111' }}>{day.daily_title}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666' }}>
                              <Calendar style={{ width: '16px', height: '16px' }} />
                              <span>{formatDate(day.date)}</span>
                          </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', fontSize: '14px', color: '#555', backgroundColor: '#f9fafb', padding: '10px', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ fontWeight: 'bold' }}>{day.difficulty && typeof day.difficulty === 'string' ? (trans.difficulty[day.difficulty] || day.difficulty) : '-'}</span>
                          </div>
                          <div style={{ width: '1px', height: '20px', background: '#ddd' }} />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <MapPin style={{ width: '16px', height: '16px' }} />
                              <span>{day.daily_distance_km}</span>
                          </div>
                          {day.elevation_gain_m > 0 && (
                            <>
                              <div style={{ width: '1px', height: '20px', background: '#ddd' }} />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <Mountain style={{ width: '16px', height: '16px' }} />
                                  <span>{day.elevation_gain_m} {trans.meters}</span>
                              </div>
                            </>
                          )}
                      </div>
                      
                      {day.description && typeof day.description === 'string' && (
                        <div 
                          style={{ fontSize: '14px', lineHeight: '1.6', color: '#333' }} 
                          dangerouslySetInnerHTML={{ 
                              __html: day.description.includes('<') 
                                ? day.description 
                                : day.description.replace(/\n/g, '<br/>') 
                          }} 
                        />
                      )}
                  </div>
              ))}
          </div>
          <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#999', borderTop: '1px solid #eee', paddingTop: '10px' }}>
              Generated by Groupy
          </div>
      </div>
      )}
    </div>
  );
}