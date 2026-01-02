import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle2, Clock, Heart, QrCode, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import ParticipantQRCode from '../components/nifgashim/ParticipantQRCode';
import DailyMemorial from '../components/nifgashim/DailyMemorial';
import DailyMeetingPoints from '../components/nifgashim/DailyMeetingPoints';
import { Label } from '@/components/ui/label';

export default function MyNifgashim() {
  const { language, isRTL } = useLanguage();
  const [user, setUser] = useState(null);

  const translations = {
    he: {
      title: "המסע שלי - נפגשים בשביל ישראל",
      myRegistration: "ההרשמה שלי",
      myQR: "ה-QR שלי",
      memorials: "הנצחות",
      selectedDays: "ימים שנבחרתי",
      totalCost: "עלות כוללת",
      paymentStatus: "סטטוס תשלום",
      pending: "ממתין",
      partial: "חלקי",
      completed: "שולם",
      checkedIn: "נרשמתי",
      notCheckedIn: "טרם נרשמתי",
      noRegistration: "עדיין לא נרשמת למסע",
      registerNow: "הרשמה למסע",
      todayMemorial: "הנצחת היום",
      payNow: "שלם עכשיו",
      remaining: "נותר לתשלום"
    },
    en: {
      title: "My Trek - Nifgashim for Israel",
      myRegistration: "My Registration",
      myQR: "My QR",
      memorials: "Memorials",
      selectedDays: "Selected Days",
      totalCost: "Total Cost",
      paymentStatus: "Payment Status",
      pending: "Pending",
      partial: "Partial",
      completed: "Completed",
      checkedIn: "Checked In",
      notCheckedIn: "Not Checked In",
      noRegistration: "You haven't registered for the trek yet",
      registerNow: "Register for Trek",
      todayMemorial: "Today's Memorial",
      payNow: "Pay Now",
      remaining: "Remaining"
    }
  };

  const trans = translations[language] || translations.en;

  const { data: registrations = [] } = useQuery({
    queryKey: ['myNifgashimRegistration', user?.email],
    queryFn: () => base44.entities.NifgashimRegistration.filter({
      user_email: user.email,
      year: new Date().getFullYear()
    }),
    enabled: !!user?.email
  });

  const { data: memorials = [] } = useQuery({
    queryKey: ['approvedMemorials'],
    queryFn: () => base44.entities.Memorial.filter({ status: 'approved' }),
    refetchInterval: 60000
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const myRegistration = registrations[0];
  const today = new Date().toISOString().split('T')[0];
  const todayMemorial = memorials.find(m => m.display_on_date === today);

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className={`min-h-screen bg-gray-50 py-6 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{trans.title}</h1>
        </motion.div>

        {!myRegistration ? (
          <Alert>
            <AlertDescription className="flex items-center justify-between">
              <span>{trans.noRegistration}</span>
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="registration" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="registration">{trans.myRegistration}</TabsTrigger>
              <TabsTrigger value="qr">{trans.myQR}</TabsTrigger>
              <TabsTrigger value="memorials">{trans.memorials}</TabsTrigger>
            </TabsList>

            <TabsContent value="registration">
              <Card>
                <CardHeader>
                  <CardTitle>{trans.myRegistration}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600">
                            {myRegistration.total_days_count}
                          </div>
                          <div className="text-sm text-gray-600">{trans.selectedDays}</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {myRegistration.total_amount}₪
                          </div>
                          <div className="text-sm text-gray-600">{trans.totalCost}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <Label className="mb-2 block">{trans.paymentStatus}</Label>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        myRegistration.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                        myRegistration.payment_status === 'partial' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {trans[myRegistration.payment_status]}
                      </Badge>
                      {myRegistration.payment_status !== 'completed' && (
                        <Button 
                          size="sm" 
                          onClick={() => window.location.href = createPageUrl('NifgashimPayment')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <CreditCard className="w-4 h-4 mr-1" />
                          {trans.payNow}
                        </Button>
                      )}
                    </div>
                    {myRegistration.payment_status !== 'completed' && (
                      <div className="text-sm text-orange-600 mt-1">
                        {trans.remaining}: {myRegistration.total_amount - (myRegistration.amount_paid || 0)}₪
                      </div>
                    )}
                  </div>

                  {/* Days List */}
                  <div className="space-y-2">
                    {myRegistration.selected_days?.map((date, idx) => {
                      const checkIn = myRegistration.check_ins?.find(c => c.date === date);
                      return (
                        <Card key={idx} className={checkIn ? 'bg-green-50 border-green-300' : ''}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <span className="font-medium">
                                  {new Date(date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                              {checkIn ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  {trans.checkedIn}
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {trans.notCheckedIn}
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="qr">
              <ParticipantQRCode 
                userEmail={user.email} 
                registrationId={myRegistration.id}
              />
            </TabsContent>

            <TabsContent value="memorials">
              <div className="space-y-4">
                {todayMemorial && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">{trans.todayMemorial}</h3>
                    <DailyMemorial memorial={todayMemorial} />
                  </div>
                )}

                {memorials.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                      {language === 'he' ? 'אין הנצחות זמינות כעת' : 'No memorials available'}
                    </CardContent>
                  </Card>
                ) : (
                  memorials.map((memorial) => (
                    <DailyMemorial key={memorial.id} memorial={memorial} compact={memorial.id !== todayMemorial?.id} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}