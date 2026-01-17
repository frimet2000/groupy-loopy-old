// @ts-nocheck
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { UserPlus, Loader2, Check, Send, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminManualRegistration({ 
  trip, 
  trekDays, 
  language, 
  isRTL, 
  onRegistrationComplete 
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    idNumber: '',
    ageRange: '36-50',
    selectedDays: [],
    skipPayment: true,
    paymentStatus: 'pending', // pending, completed, exempt
    sendPaymentLink: false
  });

  const translations = {
    he: {
      title: "רישום ידני (מנהל)",
      addParticipant: "הוסף משתתף ידנית",
      name: "שם מלא",
      email: "אימייל",
      phone: "טלפון",
      idNumber: "ת.ז",
      ageRange: "טווח גיל",
      selectDays: "בחר ימי טיול",
      paymentOptions: "אפשרויות תשלום",
      skipPayment: "דלג על תשלום",
      markAsPaid: "סמן כשולם",
      markAsPending: "ממתין לתשלום",
      markAsExempt: "פטור מתשלום",
      sendPaymentLink: "שלח קישור לתשלום",
      submit: "שמור רישום",
      submitting: "שומר...",
      cancel: "ביטול",
      success: "ההרשמה נשמרה בהצלחה",
      error: "שגיאה בשמירת ההרשמה",
      paymentLinkSent: "קישור לתשלום נשלח",
      day: "יום"
    },
    en: {
      title: "Manual Registration (Admin)",
      addParticipant: "Add Participant Manually",
      name: "Full Name",
      email: "Email",
      phone: "Phone",
      idNumber: "ID Number",
      ageRange: "Age Range",
      selectDays: "Select Trek Days",
      paymentOptions: "Payment Options",
      skipPayment: "Skip Payment",
      markAsPaid: "Mark as Paid",
      markAsPending: "Pending Payment",
      markAsExempt: "Payment Exempt",
      sendPaymentLink: "Send Payment Link",
      submit: "Save Registration",
      submitting: "Saving...",
      cancel: "Cancel",
      success: "Registration saved successfully",
      error: "Error saving registration",
      paymentLinkSent: "Payment link sent",
      day: "Day"
    },
    ru: { title: "Ручная регистрация", addParticipant: "Добавить участника", name: "Имя", email: "Email", phone: "Телефон", idNumber: "ID", ageRange: "Возраст", selectDays: "Выбрать дни", paymentOptions: "Оплата", skipPayment: "Пропустить", markAsPaid: "Оплачено", markAsPending: "Ожидание", markAsExempt: "Освобожден", sendPaymentLink: "Отправить ссылку", submit: "Сохранить", submitting: "Сохранение...", cancel: "Отмена", success: "Сохранено", error: "Ошибка", paymentLinkSent: "Ссылка отправлена", day: "День" },
    es: { title: "Registro manual", addParticipant: "Agregar participante", name: "Nombre", email: "Email", phone: "Teléfono", idNumber: "ID", ageRange: "Edad", selectDays: "Seleccionar días", paymentOptions: "Pago", skipPayment: "Omitir", markAsPaid: "Pagado", markAsPending: "Pendiente", markAsExempt: "Exento", sendPaymentLink: "Enviar enlace", submit: "Guardar", submitting: "Guardando...", cancel: "Cancelar", success: "Guardado", error: "Error", paymentLinkSent: "Enlace enviado", day: "Día" },
    fr: { title: "Inscription manuelle", addParticipant: "Ajouter participant", name: "Nom", email: "Email", phone: "Téléphone", idNumber: "ID", ageRange: "Âge", selectDays: "Sélectionner jours", paymentOptions: "Paiement", skipPayment: "Ignorer", markAsPaid: "Payé", markAsPending: "En attente", markAsExempt: "Exempté", sendPaymentLink: "Envoyer lien", submit: "Enregistrer", submitting: "Enregistrement...", cancel: "Annuler", success: "Enregistré", error: "Erreur", paymentLinkSent: "Lien envoyé", day: "Jour" },
    de: { title: "Manuelle Registrierung", addParticipant: "Teilnehmer hinzufügen", name: "Name", email: "Email", phone: "Telefon", idNumber: "ID", ageRange: "Alter", selectDays: "Tage wählen", paymentOptions: "Zahlung", skipPayment: "Überspringen", markAsPaid: "Bezahlt", markAsPending: "Ausstehend", markAsExempt: "Befreit", sendPaymentLink: "Link senden", submit: "Speichern", submitting: "Speichern...", cancel: "Abbrechen", success: "Gespeichert", error: "Fehler", paymentLinkSent: "Link gesendet", day: "Tag" },
    it: { title: "Registrazione manuale", addParticipant: "Aggiungi partecipante", name: "Nome", email: "Email", phone: "Telefono", idNumber: "ID", ageRange: "Età", selectDays: "Seleziona giorni", paymentOptions: "Pagamento", skipPayment: "Salta", markAsPaid: "Pagato", markAsPending: "In attesa", markAsExempt: "Esente", sendPaymentLink: "Invia link", submit: "Salva", submitting: "Salvataggio...", cancel: "Annulla", success: "Salvato", error: "Errore", paymentLinkSent: "Link inviato", day: "Giorno" }
  };

  const trans = translations[language] || translations.en;

  const ageRanges = [
    { value: '0-2', label: '0-2' },
    { value: '3-6', label: '3-6' },
    { value: '7-10', label: '7-10' },
    { value: '11-14', label: '11-14' },
    { value: '15-18', label: '15-18' },
    { value: '18-21', label: '18-21' },
    { value: '21-35', label: '21-35' },
    { value: '36-50', label: '36-50' },
    { value: '51-65', label: '51-65' },
    { value: '65+', label: '65+' }
  ];

  const sortedDays = [...(trekDays || [])].sort((a, b) => {
    if (a.date && b.date) return new Date(a.date) - new Date(b.date);
    return (a.day_number || 0) - (b.day_number || 0);
  });

  const toggleDay = (dayNumber) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayNumber)
        ? prev.selectedDays.filter(d => d !== dayNumber)
        : [...prev.selectedDays, dayNumber]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || formData.selectedDays.length === 0) {
      toast.error(language === 'he' ? 'נא למלא את כל השדות הנדרשים' : 'Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const age = parseInt(formData.ageRange.split('-')[0]);
      const isAdult = age >= 10;
      const amount = isAdult ? 85 : 0;

      const registrationData = {
        trip_id: trip.id,
        user_email: formData.email,
        year: new Date().getFullYear(),
        participants: [{
          name: formData.name,
          id_number: formData.idNumber,
          phone: formData.phone,
          email: formData.email,
          age_range: formData.ageRange
        }],
        userType: 'individual',
        selectedDays: formData.selectedDays.map(dayNum => {
          const dayInfo = trekDays.find(d => d.day_number === dayNum);
          return {
            day_number: dayNum,
            daily_title: dayInfo?.daily_title || '',
            date: dayInfo?.date || null
          };
        }),
        selected_days: formData.selectedDays,
        amount: amount,
        total_amount: amount,
        amount_paid: formData.paymentStatus === 'completed' ? amount : 0,
        status: formData.paymentStatus === 'completed' ? 'completed' : 'pending_payment',
        registration_status: 'submitted',
        payment_status: formData.paymentStatus,
        customer_email: formData.email,
        customer_name: formData.name,
        emergency_contact_phone: formData.phone,
        is_organized_group: false,
        admin_registered: true, // Mark as admin-registered
        admin_notes: `Registered manually by admin on ${new Date().toISOString()}`
      };

      await base44.entities.NifgashimRegistration.create(registrationData);

      // Send payment link if requested
      if (formData.sendPaymentLink && formData.paymentStatus === 'pending' && formData.email) {
        const paymentUrl = `${window.location.origin}/NifgashimPortal?id=${trip.id}`;
        await base44.integrations.Core.SendEmail({
          to: formData.email,
          subject: language === 'he' ? 'קישור לתשלום - נפגשים בשביל ישראל' : 'Payment Link - Nifgashim',
          body: language === 'he'
            ? `שלום ${formData.name},\n\nנרשמת למסע נפגשים בשביל ישראל.\nאנא השלם את התשלום בקישור הבא:\n${paymentUrl}\n\nסכום לתשלום: ₪${amount}\n\nבברכה,\nצוות נפגשים`
            : `Hello ${formData.name},\n\nYou have been registered for Nifgashim.\nPlease complete payment at:\n${paymentUrl}\n\nAmount: ₪${amount}\n\nNifgashim Team`
        });
        toast.success(trans.paymentLinkSent);
      }

      toast.success(trans.success);
      setOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        idNumber: '',
        ageRange: '36-50',
        selectedDays: [],
        skipPayment: true,
        paymentStatus: 'pending',
        sendPaymentLink: false
      });
      
      if (onRegistrationComplete) {
        onRegistrationComplete();
      }
    } catch (error) {
      console.error('Error creating manual registration:', error);
      toast.error(trans.error);
    }
    setSubmitting(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 bg-indigo-600 hover:bg-indigo-700"
      >
        <UserPlus className="w-4 h-4" />
        {trans.addParticipant}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              {trans.title}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' 
                ? 'רשום משתתף חדש ידנית עם אפשרות לדלג על תשלום'
                : 'Manually register a new participant with option to skip payment'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>{trans.name} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={trans.name}
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>{trans.email} *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                  dir="ltr"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>{trans.phone}</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="050-1234567"
                  dir="ltr"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>{trans.idNumber}</Label>
                <Input
                  value={formData.idNumber}
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                  placeholder="123456789"
                  dir="ltr"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label>{trans.ageRange}</Label>
                <Select 
                  value={formData.ageRange} 
                  onValueChange={(v) => setFormData({...formData, ageRange: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ageRanges.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Trek Days Selection */}
            <div>
              <Label className="mb-2 block">{trans.selectDays} *</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border max-h-40 overflow-y-auto">
                {sortedDays.map(day => (
                  <Badge
                    key={day.day_number}
                    variant={formData.selectedDays.includes(day.day_number) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all ${
                      formData.selectedDays.includes(day.day_number)
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'hover:bg-indigo-50'
                    }`}
                    onClick={() => toggleDay(day.day_number)}
                  >
                    {trans.day} {day.day_number}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'he' 
                  ? `נבחרו ${formData.selectedDays.length} ימים`
                  : `${formData.selectedDays.length} days selected`}
              </p>
            </div>

            {/* Payment Options */}
            <div className="p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
              <Label className="mb-3 block font-semibold">{trans.paymentOptions}</Label>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="pending"
                    name="paymentStatus"
                    checked={formData.paymentStatus === 'pending'}
                    onChange={() => setFormData({...formData, paymentStatus: 'pending'})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="pending" className="cursor-pointer">
                    {trans.markAsPending}
                  </label>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="completed"
                    name="paymentStatus"
                    checked={formData.paymentStatus === 'completed'}
                    onChange={() => setFormData({...formData, paymentStatus: 'completed'})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="completed" className="cursor-pointer">
                    {trans.markAsPaid}
                  </label>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="exempt"
                    name="paymentStatus"
                    checked={formData.paymentStatus === 'exempt'}
                    onChange={() => setFormData({...formData, paymentStatus: 'exempt'})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="exempt" className="cursor-pointer">
                    {trans.markAsExempt}
                  </label>
                </div>

                {formData.paymentStatus === 'pending' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-yellow-300">
                    <Checkbox
                      id="sendLink"
                      checked={formData.sendPaymentLink}
                      onCheckedChange={(checked) => setFormData({...formData, sendPaymentLink: !!checked})}
                    />
                    <label htmlFor="sendLink" className="text-sm cursor-pointer flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      {trans.sendPaymentLink}
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {trans.cancel}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {trans.submitting}
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {trans.submit}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}