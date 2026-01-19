// @ts-nocheck
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Calendar, CheckCircle, Clock, Dog, Search, ArrowUpDown } from 'lucide-react';
import ParticipantsByDayTable from './portal/ParticipantsByDayTable';

export default function NifgashimParticipantsView({ tripId, language, isRTL }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState('date');

  // Fetch portal registrations
  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['nifgashimRegistrations', tripId],
    queryFn: () => base44.entities.NifgashimRegistration.filter({ trip_id: tripId }),
    refetchOnWindowFocus: false,
  });

  // Fetch trip to get trek days
  const { data: trip } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const trips = await base44.entities.Trip.filter({ id: tripId });
      return trips[0] || null;
    },
    refetchOnWindowFocus: false,
  });

  // Calculate stats from portal registrations
  const stats = React.useMemo(() => {
    let totalParticipants = 0;
    let totalAdults = 0;
    let totalChildren = 0;
    let paidCount = 0;

    if (!Array.isArray(registrations)) return {
      totalRegistrations: 0,
      totalParticipants: 0,
      totalAdults: 0,
      totalChildren: 0,
      paidCount: 0,
      pendingCount: 0
    };

    registrations.forEach(reg => {
      const participants = Array.isArray(reg.participants) ? reg.participants : [];
      participants.forEach(p => {
        totalParticipants++;
        const ageRange = p.age_range;
        if (ageRange && typeof ageRange === 'string') {
          const age = parseInt(ageRange.split('-')[0]);
          if (age < 10) {
            totalChildren++;
          } else {
            totalAdults++;
          }
        } else {
          totalAdults++;
        }
      });

      if (reg.payment_status === 'completed' || reg.status === 'completed') {
        paidCount++;
      }
    });

    return {
      totalRegistrations: registrations.length,
      totalParticipants,
      totalAdults,
      totalChildren,
      paidCount,
      pendingCount: registrations.length - paidCount
    };
  }, [registrations]);

  // Filter and sort registrations
  const filteredAndSortedRegistrations = React.useMemo(() => {
    let filtered = registrations;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(reg => {
        const allParticipants = reg.participants || [];
        return (
          (reg.customer_name || '').toLowerCase().includes(searchLower) ||
          (reg.customer_email || '').toLowerCase().includes(searchLower) ||
          (reg.user_email || '').toLowerCase().includes(searchLower) ||
          (reg.group_name || '').toLowerCase().includes(searchLower) ||
          allParticipants.some(p => 
            (p.name || '').toLowerCase().includes(searchLower) ||
            (p.email || '').toLowerCase().includes(searchLower) ||
            (p.phone || '').includes(searchTerm) ||
            (p.id_number || '').includes(searchTerm)
          )
        );
      });
    }

    // Sort
    const sorted = [...filtered];
    if (sortBy === 'date') {
      sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => {
        const nameA = (a.customer_name || a.customer_email || a.user_email || '').toLowerCase();
        const nameB = (b.customer_name || b.customer_email || b.user_email || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else if (sortBy === 'participants') {
      sorted.sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0));
    }

    return sorted;
  }, [registrations, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border-2 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">{stats.totalRegistrations}</div>
            <div className="text-xs text-blue-600 mt-1">
              {language === 'he' ? 'הרשמות' : 'Registrations'}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-700">{stats.totalParticipants}</div>
            <div className="text-xs text-purple-600 mt-1">
              {language === 'he' ? 'משתתפים' : 'Participants'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-indigo-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-indigo-700">{stats.totalAdults}</div>
            <div className="text-xs text-indigo-600 mt-1">
              {language === 'he' ? 'מבוגרים' : 'Adults'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-pink-200">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-pink-700">{stats.totalChildren}</div>
            <div className="text-xs text-pink-600 mt-1">
              {language === 'he' ? 'ילדים' : 'Children'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-3xl font-bold text-green-700">{stats.paidCount}</div>
            </div>
            <div className="text-xs text-green-600 mt-1">
              {language === 'he' ? 'שולם' : 'Paid'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div className="text-3xl font-bold text-yellow-700">{stats.pendingCount}</div>
            </div>
            <div className="text-xs text-yellow-600 mt-1">
              {language === 'he' ? 'ממתין' : 'Pending'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registrations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            {language === 'he' ? 'כל ההרשמות' : 'All Registrations'} ({registrations.length})
          </CardTitle>
          
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={language === 'he' ? 'חיפוש לפי שם, אימייל, טלפון, ת"ז...' : 'Search by name, email, phone, ID...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">
                  {language === 'he' ? 'תאריך הרשמה' : 'Registration Date'}
                </SelectItem>
                <SelectItem value="name">
                  {language === 'he' ? 'שם' : 'Name'}
                </SelectItem>
                <SelectItem value="participants">
                  {language === 'he' ? 'מספר משתתפים' : 'Number of Participants'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedRegistrations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm 
                ? (language === 'he' ? 'לא נמצאו תוצאות' : 'No results found')
                : (language === 'he' ? 'אין הרשמות עדיין' : 'No registrations yet')}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedRegistrations.map((reg, idx) => {
                const isPaid = reg.payment_status === 'completed' || reg.status === 'completed';
                const participantCount = reg.participants?.length || 0;
                const childrenCount = (reg.participants || []).filter(p => {
                  const age = p.age_range ? parseInt(p.age_range.split('-')[0]) : null;
                  return age !== null && age < 10;
                }).length;
                const adultsCount = participantCount - childrenCount;

                return (
                  <div key={reg.id || idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <div className="font-medium">
                        {reg.customer_name || reg.customer_email || reg.user_email}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {reg.is_organized_group && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                            {reg.group_name || (language === 'he' ? 'קבוצה מאורגנת' : 'Organized Group')}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {participantCount} {language === 'he' ? 'משתתפים' : 'participants'}
                        </Badge>
                        {adultsCount > 0 && (
                          <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">
                            {adultsCount} {language === 'he' ? 'מבוגרים' : 'adults'}
                          </Badge>
                        )}
                        {childrenCount > 0 && (
                          <Badge variant="outline" className="text-xs bg-pink-50 text-pink-700">
                            {childrenCount} {language === 'he' ? 'ילדים' : 'children'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}