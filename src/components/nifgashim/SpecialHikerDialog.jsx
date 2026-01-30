// @ts-nocheck
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, CheckCircle2, AlertTriangle, DollarSign, Send, Star } from 'lucide-react';
import { toast } from 'sonner';

export default function SpecialHikerDialog({ 
  registration, 
  trip, 
  open, 
  onOpenChange,
  onSuccess,
  language = 'he',
  isRTL = false
}) {
  const trekDays = trip?.trek_days || [];
  const [selectedDays, setSelectedDays] = useState(() => {
    return trekDays.map(d => d.day_number);
  });
  const [customAmount, setCustomAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translations = {
    he: {
      title: 'מטייל חריג - כל ימי הטיול',
      description: 'סמן מטייל שעושה יותר מ-8 ימי נגב (או כל ימי הטיול) וקבע מחיר מותאם אישית. בקשת תשלום תישלח במייל.',
      selectAllDays: 'בחר את כל ימי הטיול',
      selectedDaysLabel: 'ימים נבחרים',
      customPrice: 'מחיר מותאם אישית (₪)',
      pricePlaceholder: 'הזן סכום...',
      sendPaymentRequest: 'שלח בקשת תשלום',
      sending: 'שולח...',
      cancel: 'ביטול',
      success: 'בקשת התשלום נשלחה בהצלחה!',
      participant: 'משתתף',
      email: 'אימייל',
      totalDays: 'סה"כ ימים',
      noteSpecial: '⭐ מטייל חריג - יותר מ-8 ימי נגב',
      priceRequired: 'נא להזין מחיר',
      selectDays: 'נא לבחור לפחות יום אחד'
    },
    en: {
      title: 'Special Hiker - All Trek Days',
      description: 'Mark a hiker doing more than 8 Negev days (or all trek days) and set a custom price. Payment request will be sent by email.',
      selectAllDays: 'Select all trek days',
      selectedDaysLabel: 'Selected Days',
      customPrice: 'Custom Price (₪)',
      pricePlaceholder: 'Enter amount...',
      sendPaymentRequest: 'Send Payment Request',
      sending: 'Sending...',
      cancel: 'Cancel',
      success: 'Payment request sent successfully!',
      participant: 'Participant',
      email: 'Email',
      totalDays: 'Total Days',
      noteSpecial: '⭐ Special Hiker - More than 8 Negev days',
      priceRequired: 'Please enter a price',
      selectDays: 'Please select at least one day'
    },
    ru: {
      title: 'Особый участник - Все дни',
      description: 'Отметьте участника, который проходит больше 8 дней и установите индивидуальную цену. Запрос на оплату будет отправлен по email.',
      selectAllDays: 'Выбрать все дни',
      selectedDaysLabel: 'Выбранные дни',
      customPrice: 'Индивидуальная цена (₪)',
      pricePlaceholder: 'Введите сумму...',
      sendPaymentRequest: 'Отправить запрос на оплату',
      sending: 'Отправка...',
      cancel: 'Отмена',
      success: 'Запрос на оплату отправлен!',
      participant: 'Участник',
      email: 'Email',
      totalDays: 'Всего дней',
      noteSpecial: '⭐ Особый участник - Более 8 дней',
      priceRequired: 'Пожалуйста, введите цену',
      selectDays: 'Выберите хотя бы один день'
    },
    es: {
      title: 'Excursionista Especial',
      description: 'Marque a un excursionista que hace más de 8 días y establezca un precio personalizado. La solicitud de pago se enviará por email.',
      selectAllDays: 'Seleccionar todos los días',
      selectedDaysLabel: 'Días seleccionados',
      customPrice: 'Precio personalizado (₪)',
      pricePlaceholder: 'Ingrese el monto...',
      sendPaymentRequest: 'Enviar solicitud de pago',
      sending: 'Enviando...',
      cancel: 'Cancelar',
      success: '¡Solicitud de pago enviada!',
      participant: 'Participante',
      email: 'Email',
      totalDays: 'Total días',
      noteSpecial: '⭐ Excursionista especial - Más de 8 días',
      priceRequired: 'Por favor ingrese un precio',
      selectDays: 'Seleccione al menos un día'
    },
    fr: {
      title: 'Randonneur Spécial',
      description: 'Marquez un randonneur faisant plus de 8 jours et définissez un prix personnalisé. La demande de paiement sera envoyée par email.',
      selectAllDays: 'Sélectionner tous les jours',
      selectedDaysLabel: 'Jours sélectionnés',
      customPrice: 'Prix personnalisé (₪)',
      pricePlaceholder: 'Entrez le montant...',
      sendPaymentRequest: 'Envoyer la demande de paiement',
      sending: 'Envoi...',
      cancel: 'Annuler',
      success: 'Demande de paiement envoyée!',
      participant: 'Participant',
      email: 'Email',
      totalDays: 'Total jours',
      noteSpecial: '⭐ Randonneur spécial - Plus de 8 jours',
      priceRequired: 'Veuillez entrer un prix',
      selectDays: 'Sélectionnez au moins un jour'
    },
    de: {
      title: 'Besonderer Wanderer',
      description: 'Markieren Sie einen Wanderer, der mehr als 8 Tage macht und legen Sie einen individuellen Preis fest. Die Zahlungsanforderung wird per E-Mail gesendet.',
      selectAllDays: 'Alle Tage auswählen',
      selectedDaysLabel: 'Ausgewählte Tage',
      customPrice: 'Individueller Preis (₪)',
      pricePlaceholder: 'Betrag eingeben...',
      sendPaymentRequest: 'Zahlungsanforderung senden',
      sending: 'Senden...',
      cancel: 'Abbrechen',
      success: 'Zahlungsanforderung gesendet!',
      participant: 'Teilnehmer',
      email: 'E-Mail',
      totalDays: 'Gesamttage',
      noteSpecial: '⭐ Besonderer Wanderer - Mehr als 8 Tage',
      priceRequired: 'Bitte geben Sie einen Preis ein',
      selectDays: 'Bitte wählen Sie mindestens einen Tag'
    },
    it: {
      title: 'Escursionista Speciale',
      description: 'Segna un escursionista che fa più di 8 giorni e imposta un prezzo personalizzato. La richiesta di pagamento verrà inviata via email.',
      selectAllDays: 'Seleziona tutti i giorni',
      selectedDaysLabel: 'Giorni selezionati',
      customPrice: 'Prezzo personalizzato (₪)',
      pricePlaceholder: 'Inserisci importo...',
      sendPaymentRequest: 'Invia richiesta di pagamento',
      sending: 'Invio...',
      cancel: 'Annulla',
      success: 'Richiesta di pagamento inviata!',
      participant: 'Partecipante',
      email: 'Email',
      totalDays: 'Totale giorni',
      noteSpecial: '⭐ Escursionista speciale - Più di 8 giorni',
      priceRequired: 'Inserisci un prezzo',
      selectDays: 'Seleziona almeno un giorno'
    }
  };

  const t = translations[language] || translations.en;

  const mainParticipant = registration?.participants?.[0] || {};
  const participantName = mainParticipant.name || registration?.customer_name || registration?.customer_email;
  const participantEmail = registration?.customer_email || registration?.user_email || mainParticipant.email;

  const toggleDay = (dayNum) => {
    setSelectedDays(prev => 
      prev.includes(dayNum) 
        ? prev.filter(d => d !== dayNum)
        : [...prev, dayNum].sort((a, b) => a - b)
    );
  };

  const selectAllDays = () => {
    setSelectedDays(trekDays.map(d => d.day_number));
  };

  const handleSubmit = async () => {
    if (selectedDays.length === 0) {
      toast.error(t.selectDays);
      return;
    }
    
    if (!customAmount || parseFloat(customAmount) <= 0) {
      toast.error(t.priceRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await base44.functions.invoke('sendSpecialHikerPaymentRequest', {
        registrationId: registration.id,
        selectedDays: selectedDays,
        customAmount: parseFloat(customAmount),
        language: language
      });

      if (response.data?.success) {
        toast.success(t.success);
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(response.data?.error || 'Error sending payment request');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysByCategory = trekDays.reduce((acc, day) => {
    const categoryId = day.category_id || 'uncategorized';
    if (!acc[categoryId]) acc[categoryId] = [];
    acc[categoryId].push(day);
    return acc;
  }, {});

  const categories = trip?.trek_categories || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Star className="w-6 h-6 text-orange-500" />
            {t.title}
          </DialogTitle>
          <DialogDescription>
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-orange-800 font-bold">
              {t.noteSpecial}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">{t.participant}:</span>
              <p className="font-semibold">{participantName}</p>
            </div>
            <div>
              <span className="text-gray-600">{t.email}:</span>
              <p className="font-semibold" dir="ltr">{participantEmail}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={selectAllDays}
            className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50 w-full sm:w-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            {t.selectAllDays} ({trekDays.length})
          </Button>
          <Badge className="bg-purple-600 text-white px-3 py-1">
            {t.totalDays}: {selectedDays.length}
          </Badge>
        </div>

        <div className="space-y-4 max-h-[300px] overflow-y-auto border rounded-lg p-4 bg-gray-50">
          {Object.entries(daysByCategory).map(([categoryId, days]) => {
            const category = categories.find(c => c.id === categoryId);
            const categoryName = category?.name || (language === 'he' ? 'כללי' : 'General');
            const categoryColor = category?.color || '#6366f1';

            return (
              <div key={categoryId} className="space-y-2">
                <div 
                  className="text-sm font-bold px-3 py-1 rounded-full inline-block text-white"
                  style={{ backgroundColor: categoryColor }}
                >
                  {categoryName}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {days.sort((a, b) => {
                    if (a.date && b.date) return new Date(a.date) - new Date(b.date);
                    return a.day_number - b.day_number;
                  }).map(day => {
                    const isSelected = selectedDays.includes(day.day_number);
                    return (
                      <div
                        key={day.day_number}
                        onClick={() => toggleDay(day.day_number)}
                        className={`cursor-pointer rounded-lg p-3 border-2 transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleDay(day.day_number)}
                            className="pointer-events-none"
                          />
                          <div>
                            <p className="font-bold text-sm">
                              {language === 'he' ? `יום ${day.day_number}` : `Day ${day.day_number}`}
                            </p>
                            {day.date && (
                              <p className="text-xs text-gray-500">
                                {new Date(day.date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { day: 'numeric', month: 'short' })}
                              </p>
                            )}
                          </div>
                        </div>
                        {day.daily_title && (
                          <p className="text-xs text-gray-600 mt-1 truncate">{day.daily_title}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
          <Label className="flex items-center gap-2 text-green-800 font-bold mb-2">
            <DollarSign className="w-5 h-5" />
            {t.customPrice}
          </Label>
          <Input
            type="number"
            min="0"
            step="1"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder={t.pricePlaceholder}
            className="text-lg font-bold text-green-700 border-green-300 focus:border-green-500"
            dir="ltr"
          />
        </div>

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {t.cancel}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedDays.length === 0 || !customAmount}
            className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.sending}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {t.sendPaymentRequest}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}