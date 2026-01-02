import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Utensils, 
  Bed, 
  Car,
  Heart,
  Download,
  AlertCircle,
  Mail,
  Send,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DailyMeetingPoints from '../components/nifgashim/DailyMeetingPoints';

export default function NifgashimDashboard() {
  const { language, isRTL } = useLanguage();
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const translations = {
    he: {
      title: "דאשבורד נפגשים בשביל ישראל",
      overview: "סקירה כללית",
      registrations: "הרשמות",
      memorials: "בקשות הנצחה",
      checkIns: "צ'ק-אינים",
      totalRegistrations: "סה\"כ הרשמות",
      confirmedRegistrations: "מאושרות",
      pendingPayments: "ממתינות לתשלום",
      totalRevenue: "הכנסות",
      todayCheckIns: "צ'ק-אינים היום",
      mealsToday: "ארוחות היום",
      accommodation: "לינות",
      drivers: "נהגים",
      sendReminders: "שלח תזכורות",
      remindersSent: "התזכורות נשלחו בהצלחה",
      selectDateForReminder: "בחר תאריך לשליחת תזכורות",
      analytics: "אנליטיקה",
      registrationTrend: "מגמת הרשמות",
      paymentDistribution: "התפלגות תשלומים",
      regionDistribution: "התפלגות אזורים",
      negevDays: "ימי נגב",
      lastDays: "14 ימים אחרונים",
      filterByDate: "סינון לפי תאריך",
      allDates: "כל התאריכים",
      pendingMemorials: "הנצחות לאישור",
      approvedMemorials: "הנצחות מאושרות",
      exportExcel: "ייצוא לאקסל",
      adminOnly: "דף זה מיועד למנהלים בלבד",
      noData: "אין נתונים",
      lunch: "צהריים",
      dinner: "ערב",
      breakfast: "בוקר"
    },
    en: {
      title: "Nifgashim for Israel Dashboard",
      overview: "Overview",
      registrations: "Registrations",
      memorials: "Memorial Requests",
      checkIns: "Check-ins",
      totalRegistrations: "Total Registrations",
      confirmedRegistrations: "Confirmed",
      pendingPayments: "Pending Payments",
      totalRevenue: "Revenue",
      todayCheckIns: "Today's Check-ins",
      mealsToday: "Today's Meals",
      accommodation: "Accommodations",
      drivers: "Drivers",
      sendReminders: "Send Reminders",
      remindersSent: "Reminders sent successfully",
      selectDateForReminder: "Select date to send reminders",
      analytics: "Analytics",
      registrationTrend: "Registration Trend",
      paymentDistribution: "Payment Distribution",
      regionDistribution: "Region Distribution",
      negevDays: "Negev Days",
      lastDays: "Last 14 Days",
      filterByDate: "Filter by Date",
      allDates: "All Dates",
      pendingMemorials: "Pending Memorials",
      approvedMemorials: "Approved Memorials",
      exportExcel: "Export to Excel",
      adminOnly: "This page is for administrators only",
      noData: "No data",
      lunch: "Lunch",
      dinner: "Dinner",
      breakfast: "Breakfast"
    }
  };

  const trans = translations[language] || translations.en;

  const { data: registrations = [] } = useQuery({
    queryKey: ['nifgashimRegistrations'],
    queryFn: () => base44.entities.NifgashimRegistration.list('-created_date'),
    refetchInterval: 10000
  });

  const { data: memorials = [] } = useQuery({
    queryKey: ['memorials'],
    queryFn: () => base44.entities.Memorial.list('-created_date'),
    refetchInterval: 10000
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData?.role !== 'admin') {
          base44.auth.redirectToLogin();
          return;
        }
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{trans.adminOnly}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const confirmedRegs = registrations.filter(r => r.registration_status === 'confirmed');
  const pendingPayments = registrations.filter(r => r.payment_status === 'pending' || r.payment_status === 'partial');
  const totalRevenue = registrations.reduce((sum, r) => sum + (r.amount_paid || 0), 0);
  const todayCheckIns = registrations.reduce((sum, r) => {
    const today = new Date().toISOString().split('T')[0];
    return sum + (r.check_ins?.filter(c => c.date === today).length || 0);
  }, 0);

  const pendingMemorials = memorials.filter(m => m.status === 'pending');
  const approvedMemorials = memorials.filter(m => m.status === 'approved');

  // Analytics data
  const paymentStatusData = [
    { name: trans.pending, value: pendingPayments.length, color: '#f59e0b' },
    { name: trans.confirmedRegistrations, value: confirmedRegs.length, color: '#10b981' }
  ];

  const dailyRegistrations = registrations.reduce((acc, reg) => {
    const date = new Date(reg.created_date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US', { month: 'short', day: 'numeric' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const registrationTrend = Object.entries(dailyRegistrations).map(([date, count]) => ({
    date,
    [trans.totalRegistrations]: count
  })).slice(-14); // Last 14 days

  const regionDistribution = registrations.reduce((acc, reg) => {
    const negevDays = reg.negev_days_count || 0;
    const otherDays = (reg.total_days_count || 0) - negevDays;
    acc.negev = (acc.negev || 0) + negevDays;
    acc.other = (acc.other || 0) + otherDays;
    return acc;
  }, {});

  const regionData = [
    { name: trans.negevDays || 'Negev', value: regionDistribution.negev || 0, color: '#f59e0b' },
    { name: language === 'he' ? 'שאר אזורים' : 'Other Regions', value: regionDistribution.other || 0, color: '#3b82f6' }
  ];

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`min-h-screen bg-gray-50 py-6 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {trans.title}
          </h1>
          <p className="text-gray-600">{trans.overview}</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            title={trans.totalRegistrations}
            value={registrations.length}
            color="text-blue-600"
          />
          <StatCard
            icon={CheckCircle2}
            title={trans.confirmedRegistrations}
            value={confirmedRegs.length}
            color="text-green-600"
          />
          <StatCard
            icon={Clock}
            title={trans.pendingPayments}
            value={pendingPayments.length}
            color="text-orange-600"
          />
          <StatCard
            icon={DollarSign}
            title={trans.totalRevenue}
            value={`${totalRevenue.toLocaleString()}₪`}
            color="text-purple-600"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-8">
        <StatCard
          icon={CheckCircle2}
          title={trans.todayCheckIns}
          value={todayCheckIns}
          color="text-emerald-600"
        />
        <StatCard
          icon={Heart}
          title={trans.pendingMemorials}
          value={pendingMemorials.length}
          color="text-red-600"
        />
        <StatCard
          icon={Heart}
          title={trans.approvedMemorials}
          value={approvedMemorials.length}
          color="text-pink-600"
        />
        </div>

        {/* Send Reminders */}
        <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100">
                <Mail className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="font-semibold">{trans.sendReminders}</div>
                <div className="text-sm text-gray-600">{trans.selectDateForReminder}</div>
              </div>
            </div>
            <Button
              onClick={async () => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const dateStr = tomorrow.toISOString().split('T')[0];
                try {
                  const result = await base44.functions.invoke('sendNifgashimReminder', {
                    date: dateStr,
                    language
                  });
                  toast.success(`${trans.remindersSent} (${result.data.sent}/${result.data.total})`);
                } catch (e) {
                  toast.error(language === 'he' ? 'שגיאה בשליחה' : 'Send error');
                }
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {language === 'he' ? 'שלח למחר' : 'Send for Tomorrow'}
            </Button>
          </div>
        </CardContent>
        </Card>

        {/* Analytics Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Registration Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5" />
                {trans.registrationTrend}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={registrationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey={trans.totalRegistrations} stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 text-center mt-2">{trans.lastDays}</p>
            </CardContent>
          </Card>

          {/* Payment Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-5 h-5" />
                {trans.paymentDistribution}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Region Distribution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5" />
                {trans.regionDistribution}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={regionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6">
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="registrations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="registrations">{trans.registrations}</TabsTrigger>
            <TabsTrigger value="memorials">{trans.memorials}</TabsTrigger>
            <TabsTrigger value="checkIns">{trans.checkIns}</TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{trans.registrations}</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await base44.functions.invoke('exportNifgashimData', {
                          type: 'registrations'
                        });
                        const blob = new Blob([response.data], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        a.remove();
                        toast.success(language === 'he' ? 'הנתונים יוצאו בהצלחה' : 'Data exported successfully');
                      } catch (e) {
                        toast.error(language === 'he' ? 'שגיאה בייצוא' : 'Export error');
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {trans.exportExcel}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {registrations.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">{trans.noData}</p>
                  ) : (
                    registrations.map((reg, idx) => (
                      <Card key={reg.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="font-semibold">{reg.user_email}</div>
                              <div className="text-sm text-gray-600">
                                {reg.total_days_count} {trans.days} • {reg.total_amount}₪
                              </div>
                            </div>
                            <Badge className={
                              reg.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                              reg.payment_status === 'partial' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {reg.payment_status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memorials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{trans.memorials}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {memorials.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">{trans.noData}</p>
                  ) : (
                    memorials.map((memorial) => (
                      <Card key={memorial.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="font-semibold">{memorial.fallen_name}</div>
                              <div className="text-sm text-gray-600">{memorial.requester_name}</div>
                              <div className="text-xs text-gray-500">{memorial.requester_email}</div>
                            </div>
                            <Badge className={
                              memorial.status === 'approved' ? 'bg-green-100 text-green-800' :
                              memorial.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {memorial.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkIns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{trans.checkIns}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">
                  {language === 'he' ? 'מערכת צ\'ק-אין תפותח בשלב הבא' : 'Check-in system coming in next phase'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}