import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import DaySelector from '../components/nifgashim/DaySelector';

export default function NifgashimRegistration() {
  const { t, isRTL, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState([]);
  const [formData, setFormData] = useState({
    id_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    dietary_restrictions: '',
    medical_conditions: ''
  });

  const translations = {
    he: {
      title: "הרשמה למסע נפגשים בשביל ישראל",
      subtitle: "בחרו את הימים בהם תרצו להשתתף",
      personalInfo: "פרטים אישיים",
      idNumber: "תעודת זהות",
      idNumberPlaceholder: "9 ספרות",
      emergencyContact: "איש קשר לחירום",
      emergencyContactPlaceholder: "שם מלא",
      emergencyPhone: "טלפון לחירום",
      emergencyPhonePlaceholder: "05X-XXXXXXX",
      dietary: "הגבלות תזונתיות",
      dietaryPlaceholder: "צמחוני, טבעוני, כשר, אלרגיות...",
      medical: "מצב רפואי רלוונטי",
      medicalPlaceholder: "מחלות, תרופות, מגבלות...",
      selectDates: "בחירת ימים",
      selectedDays: "ימים שנבחרו",
      negevDays: "ימים בנגב",
      totalDays: "סה\"כ ימים",
      totalCost: "עלות כוללת",
      rules: "חוקים",
      rule1: "מקסימום 8 ימים בנגב",
      rule2: "מקסימום 30 ימים סה\"כ",
      limitReached: "הגעת למגבלה!",
      submit: "שליחה והמשך לתשלום",
      submitting: "שולח...",
      success: "ההרשמה נשלחה בהצלחה!",
      error: "שגיאה בשליחת הטופס",
      loginRequired: "נדרש להתחבר תחילה"
    },
    en: {
      title: "Nifgashim for Israel Registration",
      subtitle: "Select the days you wish to participate",
      personalInfo: "Personal Information",
      idNumber: "ID Number",
      idNumberPlaceholder: "9 digits",
      emergencyContact: "Emergency Contact",
      emergencyContactPlaceholder: "Full name",
      emergencyPhone: "Emergency Phone",
      emergencyPhonePlaceholder: "05X-XXXXXXX",
      dietary: "Dietary Restrictions",
      dietaryPlaceholder: "Vegetarian, vegan, kosher, allergies...",
      medical: "Relevant Medical Conditions",
      medicalPlaceholder: "Illnesses, medications, limitations...",
      selectDates: "Select Dates",
      selectedDays: "Selected Days",
      negevDays: "Negev Days",
      totalDays: "Total Days",
      totalCost: "Total Cost",
      rules: "Rules",
      rule1: "Maximum 8 days in Negev",
      rule2: "Maximum 30 days total",
      limitReached: "Limit reached!",
      submit: "Submit & Continue to Payment",
      submitting: "Submitting...",
      success: "Registration submitted successfully!",
      error: "Error submitting form",
      loginRequired: "Please login first"
    }
  };

  const trans = translations[language] || translations.en;

  const { data: trips = [] } = useQuery({
    queryKey: ['nifgashimTrips'],
    queryFn: () => base44.entities.Trip.filter({ 
      activity_type: 'trek',
      organizer_email: 'nifgashim@israel.org'
    })
  });

  const nifgashimTrip = trips[0];
  const trekDays = nifgashimTrip?.trek_days || [];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        toast.error(trans.loginRequired);
        base44.auth.redirectToLogin();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const negevDaysCount = selectedDates.filter(dateStr => {
    const day = trekDays.find(d => d.date === dateStr);
    return day?.region === 'negev';
  }).length;

  const totalDaysCount = selectedDates.length;
  const totalCost = totalDaysCount * 85;

  const canAddMoreDays = totalDaysCount < 30 && negevDaysCount < 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.id_number || formData.id_number.length !== 9) {
      toast.error(language === 'he' ? 'יש להזין תעודת זהות תקינה' : 'Please enter a valid ID number');
      return;
    }

    if (selectedDates.length === 0) {
      toast.error(language === 'he' ? 'יש לבחור לפחות יום אחד' : 'Please select at least one day');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.NifgashimRegistration.create({
        user_email: user.email,
        year: new Date().getFullYear(),
        selected_days: selectedDates.map(d => d.toISOString().split('T')[0]),
        negev_days_count: negevDaysCount,
        total_days_count: totalDaysCount,
        total_amount: totalCost,
        ...formData,
        registration_status: 'submitted'
      });

      toast.success(trans.success);
      // Navigate to payment page here
    } catch (error) {
      console.error(error);
      toast.error(trans.error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 py-8 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
            <CardTitle className="text-2xl sm:text-3xl">{trans.title}</CardTitle>
            <CardDescription className="text-white opacity-90">
              {trans.subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">{trans.personalInfo}</h3>
                
                <div>
                  <Label htmlFor="id_number">{trans.idNumber} *</Label>
                  <Input
                    id="id_number"
                    value={formData.id_number}
                    onChange={(e) => setFormData({...formData, id_number: e.target.value})}
                    placeholder={trans.idNumberPlaceholder}
                    maxLength={9}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_contact_name">{trans.emergencyContact} *</Label>
                  <Input
                    id="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={(e) => setFormData({...formData, emergency_contact_name: e.target.value})}
                    placeholder={trans.emergencyContactPlaceholder}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="emergency_contact_phone">{trans.emergencyPhone} *</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => setFormData({...formData, emergency_contact_phone: e.target.value})}
                    placeholder={trans.emergencyPhonePlaceholder}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dietary_restrictions">{trans.dietary}</Label>
                  <Textarea
                    id="dietary_restrictions"
                    value={formData.dietary_restrictions}
                    onChange={(e) => setFormData({...formData, dietary_restrictions: e.target.value})}
                    placeholder={trans.dietaryPlaceholder}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="medical_conditions">{trans.medical}</Label>
                  <Textarea
                    id="medical_conditions"
                    value={formData.medical_conditions}
                    onChange={(e) => setFormData({...formData, medical_conditions: e.target.value})}
                    placeholder={trans.medicalPlaceholder}
                    rows={2}
                  />
                </div>
              </div>

              {/* Date Selection */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">{trans.selectDates}</h3>
                
                <DaySelector
                  trekDays={trekDays}
                  selectedDates={selectedDates}
                  onDatesChange={setSelectedDates}
                  maxNegevDays={8}
                  maxTotalDays={30}
                />

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-blue-600">{totalDaysCount}</div>
                      <div className="text-sm text-gray-600">{trans.totalDays}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-emerald-600">{negevDaysCount}</div>
                      <div className="text-sm text-gray-600">{trans.negevDays}</div>
                    </CardContent>
                  </Card>
                  <Card className="sm:col-span-2">
                    <CardContent className="pt-4">
                      <div className="text-2xl font-bold text-purple-600">{totalCost}₪</div>
                      <div className="text-sm text-gray-600">{trans.totalCost}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || !canAddMoreDays && totalDaysCount === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
                size="lg"
              >
                {loading ? trans.submitting : trans.submit}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}