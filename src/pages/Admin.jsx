import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../components/LanguageContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Shield, Users, Map, Search, Trash2, Ban, Loader2, UserX, CheckCircle, Edit, UserMinus, UserPlus, Eye, RefreshCw, Calendar, MapPin, UserCog, ChevronDown, ChevronUp, Facebook, Save, Play } from 'lucide-react';
import { toast } from "sonner";
import { motion } from 'framer-motion';

export default function Admin() {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchUsers, setSearchUsers] = useState('');
  const [searchTrips, setSearchTrips] = useState('');
  const [deleteUserDialog, setDeleteUserDialog] = useState(null);
  const [banUserDialog, setBanUserDialog] = useState(null);
  const [deleteTripDialog, setDeleteTripDialog] = useState(null);
  const [editTripDialog, setEditTripDialog] = useState(null);
  const [editTripData, setEditTripData] = useState(null);
  const [expandedTrip, setExpandedTrip] = useState(null);
  const [viewAllParticipants, setViewAllParticipants] = useState(false);
  const [marketingConfig, setMarketingConfig] = useState({
    facebook_page_id: '',
    facebook_access_token: ''
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [runningBot, setRunningBot] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.role !== 'admin') {
          toast.error(language === 'he' ? 'אין לך הרשאות גישה' : 'Access denied');
          navigate('/');
          return;
        }
        setUser(userData);
        // Load marketing config from user profile
        setMarketingConfig({
          facebook_page_id: userData.facebook_page_id || '',
          facebook_access_token: userData.facebook_access_token || ''
        });
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, [navigate, language]);

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user,
  });

  const { data: trips = [], isLoading: loadingTrips } = useQuery({
    queryKey: ['admin-trips'],
    queryFn: () => base44.entities.Trip.list('-created_date'),
    enabled: !!user,
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      // Delete user's trips first
      const userEmail = users.find(u => u.id === userId)?.email;
      const userTrips = trips.filter(t => t.organizer_email === userEmail);
      for (const trip of userTrips) {
        await base44.entities.Trip.delete(trip.id);
      }
      // Delete user
      await base44.entities.User.delete(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-trips'] });
      toast.success(language === 'he' ? 'המשתמש נמחק בהצלחה' : 'User deleted successfully');
      setDeleteUserDialog(null);
    },
    onError: () => {
      toast.error(language === 'he' ? 'שגיאה במחיקת המשתמש' : 'Error deleting user');
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId) => {
      const userToUpdate = users.find(u => u.id === userId);
      await base44.entities.User.update(userId, {
        is_banned: !userToUpdate.is_banned
      });
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      const userToUpdate = users.find(u => u.id === userId);
      toast.success(
        userToUpdate.is_banned 
          ? (language === 'he' ? 'החסימה הוסרה' : 'User unbanned')
          : (language === 'he' ? 'המשתמש נחסם' : 'User banned')
      );
      setBanUserDialog(null);
    },
    onError: () => {
      toast.error(language === 'he' ? 'שגיאה בחסימת המשתמש' : 'Error banning user');
    },
  });

  const deleteTripMutation = useMutation({
    mutationFn: (tripId) => base44.entities.Trip.delete(tripId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trips'] });
      toast.success(language === 'he' ? 'הטיול נמחק בהצלחה' : 'Trip deleted successfully');
      setDeleteTripDialog(null);
    },
    onError: () => {
      toast.error(language === 'he' ? 'שגיאה במחיקת הטיול' : 'Error deleting trip');
    },
  });

  const updateTripMutation = useMutation({
    mutationFn: ({ tripId, data }) => base44.entities.Trip.update(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trips'] });
      toast.success(language === 'he' ? 'הטיול עודכן בהצלחה' : 'Trip updated successfully');
      setEditTripDialog(null);
      setEditTripData(null);
    },
    onError: () => {
      toast.error(language === 'he' ? 'שגיאה בעדכון הטיול' : 'Error updating trip');
    },
  });

  const handleEditTrip = (trip) => {
    setEditTripDialog(trip);
    setEditTripData({
      title: trip.title || '',
      description: trip.description || '',
      location: trip.location || '',
      date: trip.date || '',
      meeting_time: trip.meeting_time || '',
      max_participants: trip.max_participants || 10,
      organizer_email: trip.organizer_email || '',
      organizer_name: trip.organizer_name || '',
      difficulty: trip.difficulty || 'moderate',
      status: trip.status || 'open',
      privacy: trip.privacy || 'public',
      country: trip.country || 'israel',
      region: trip.region || '',
    });
  };

  const handleChangeOrganizer = async (tripId, newOrganizerEmail, newOrganizerName) => {
    updateTripMutation.mutate({
      tripId,
      data: {
        organizer_email: newOrganizerEmail,
        organizer_name: newOrganizerName
      }
    });
  };

  // Get all participants across all trips
  const allParticipants = trips.reduce((acc, trip) => {
    const tripParticipants = trip.participants || [];
    tripParticipants.forEach(p => {
      if (!acc.find(a => a.email === p.email)) {
        acc.push({
          ...p,
          trips: [{ id: trip.id, title: trip.title || trip.title_he }]
        });
      } else {
        const existing = acc.find(a => a.email === p.email);
        existing.trips.push({ id: trip.id, title: trip.title || trip.title_he });
      }
    });
    return acc;
  }, []);

  const handleSaveTrip = () => {
    if (!editTripData.title || !editTripData.location || !editTripData.date) {
      toast.error(language === 'he' ? 'יש למלא את כל השדות הנדרשים' : 'Please fill all required fields');
      return;
    }
    updateTripMutation.mutate({
      tripId: editTripDialog.id,
      data: editTripData
    });
  };

  const handleRemoveParticipant = (participantEmail) => {
    const updatedParticipants = editTripDialog.participants?.filter(p => p.email !== participantEmail) || [];
    const updatedData = {
      ...editTripData,
      participants: updatedParticipants,
      current_participants: updatedParticipants.length
    };
    updateTripMutation.mutate({
      tripId: editTripDialog.id,
      data: updatedData
    });
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await base44.auth.updateMe({
        facebook_page_id: marketingConfig.facebook_page_id,
        facebook_access_token: marketingConfig.facebook_access_token
      });
      toast.success(language === 'he' ? 'ההגדרות נשמרו' : 'Settings saved');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בשמירת הגדרות' : 'Error saving settings');
    }
    setSavingConfig(false);
  };

  const handleRunBot = async () => {
    setRunningBot(true);
    try {
      await base44.functions.invoke('postTripToFacebook', {
        facebook_page_id: marketingConfig.facebook_page_id,
        facebook_access_token: marketingConfig.facebook_access_token
      });
      toast.success(language === 'he' ? 'הבוט רץ בהצלחה' : 'Bot ran successfully');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהרצת הבוט' : 'Error running bot');
    }
    setRunningBot(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    const searchLower = searchUsers.toLowerCase();
    return (
      u.email?.toLowerCase().includes(searchLower) ||
      u.full_name?.toLowerCase().includes(searchLower) ||
      u.first_name?.toLowerCase().includes(searchLower) ||
      u.last_name?.toLowerCase().includes(searchLower)
    );
  });

  const filteredTrips = trips.filter(t => {
    const searchLower = searchTrips.toLowerCase();
    return (
      t.title?.toLowerCase().includes(searchLower) ||
      t.title_he?.toLowerCase().includes(searchLower) ||
      t.title_en?.toLowerCase().includes(searchLower) ||
      t.location?.toLowerCase().includes(searchLower) ||
      t.organizer_email?.toLowerCase().includes(searchLower)
    );
  });

  const stats = [
    { 
      icon: Users, 
      label: language === 'he' ? 'משתמשים' : language === 'ru' ? 'Пользователи' : 'Users', 
      value: users.length,
      color: 'text-blue-600'
    },
    { 
      icon: Map, 
      label: language === 'he' ? 'טיולים' : language === 'ru' ? 'Поездки' : 'Trips', 
      value: trips.length,
      color: 'text-emerald-600'
    },
    { 
      icon: UserPlus, 
      label: language === 'he' ? 'משתתפים בקבוצות' : language === 'ru' ? 'Участники групп' : 'Group Participants', 
      value: allParticipants.length,
      color: 'text-purple-600'
    },
    { 
      icon: Ban, 
      label: language === 'he' ? 'משתמשים חסומים' : language === 'ru' ? 'Заблокированные' : 'Banned Users', 
      value: users.filter(u => u.is_banned).length,
      color: 'text-red-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'he' ? 'פאנל ניהול' : language === 'ru' ? 'Панель управления' : 'Admin Panel'}
            </h1>
          </div>
          <p className="text-gray-600">
            {language === 'he' ? 'ניהול משתמשים וטיולים' : language === 'ru' ? 'Управление пользователями и поездками' : 'Manage users and trips'}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <Tabs defaultValue="users">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="users" className="gap-2">
                  <Users className="w-4 h-4" />
                  {language === 'he' ? 'משתמשים' : 'Users'}
                </TabsTrigger>
                <TabsTrigger value="trips" className="gap-2">
                  <Map className="w-4 h-4" />
                  {language === 'he' ? 'טיולים' : 'Trips'}
                </TabsTrigger>
                <TabsTrigger value="participants" className="gap-2">
                  <UserCog className="w-4 h-4" />
                  {language === 'he' ? 'משתתפים' : 'Participants'}
                </TabsTrigger>
                <TabsTrigger value="marketing" className="gap-2">
                  <Facebook className="w-4 h-4" />
                  {language === 'he' ? 'שיווק' : 'Marketing'}
                </TabsTrigger>
              </TabsList>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={language === 'he' ? 'חפש משתמש...' : language === 'ru' ? 'Поиск пользователя...' : language === 'es' ? 'Buscar usuario...' : language === 'fr' ? 'Rechercher utilisateur...' : language === 'de' ? 'Benutzer suchen...' : language === 'it' ? 'Cerca utente...' : 'Search user...'}
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {loadingUsers ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{language === 'he' ? 'שם' : language === 'ru' ? 'Имя' : language === 'es' ? 'Nombre' : language === 'fr' ? 'Nom' : language === 'de' ? 'Name' : language === 'it' ? 'Nome' : 'Name'}</TableHead>
                          <TableHead>{language === 'he' ? 'אימייל' : language === 'ru' ? 'Email' : language === 'es' ? 'Correo' : language === 'fr' ? 'Email' : language === 'de' ? 'E-Mail' : language === 'it' ? 'Email' : 'Email'}</TableHead>
                          <TableHead>{language === 'he' ? 'תפקיד' : language === 'ru' ? 'Роль' : language === 'es' ? 'Rol' : language === 'fr' ? 'Rôle' : language === 'de' ? 'Rolle' : language === 'it' ? 'Ruolo' : 'Role'}</TableHead>
                          <TableHead>{language === 'he' ? 'סטטוס' : language === 'ru' ? 'Статус' : language === 'es' ? 'Estado' : language === 'fr' ? 'Statut' : language === 'de' ? 'Status' : language === 'it' ? 'Stato' : 'Status'}</TableHead>
                          <TableHead>{language === 'he' ? 'פעולות' : language === 'ru' ? 'Действия' : language === 'es' ? 'Acciones' : language === 'fr' ? 'Actions' : language === 'de' ? 'Aktionen' : language === 'it' ? 'Azioni' : 'Actions'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">
                              {u.first_name && u.last_name 
                                ? `${u.first_name} ${u.last_name}` 
                                : u.full_name || (language === 'he' ? 'לא צוין' : language === 'ru' ? 'Не указано' : language === 'es' ? 'N/A' : language === 'fr' ? 'N/A' : language === 'de' ? 'N/A' : language === 'it' ? 'N/D' : 'N/A')}
                            </TableCell>
                            <TableCell dir="ltr">{u.email}</TableCell>
                            <TableCell>
                              <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                                {u.role === 'admin' 
                                  ? (language === 'he' ? 'מנהל' : language === 'ru' ? 'Админ' : language === 'es' ? 'Admin' : language === 'fr' ? 'Admin' : language === 'de' ? 'Admin' : language === 'it' ? 'Admin' : 'Admin')
                                  : (language === 'he' ? 'משתמש' : language === 'ru' ? 'Пользователь' : language === 'es' ? 'Usuario' : language === 'fr' ? 'Utilisateur' : language === 'de' ? 'Benutzer' : language === 'it' ? 'Utente' : 'User')}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {u.is_banned ? (
                                <Badge variant="destructive" className="gap-1">
                                  <Ban className="w-3 h-3" />
                                  {language === 'he' ? 'חסום' : language === 'ru' ? 'Заблокирован' : language === 'es' ? 'Bloqueado' : language === 'fr' ? 'Banni' : language === 'de' ? 'Gesperrt' : language === 'it' ? 'Bannato' : 'Banned'}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1 text-green-600 border-green-200">
                                  <CheckCircle className="w-3 h-3" />
                                  {language === 'he' ? 'פעיל' : language === 'ru' ? 'Активен' : language === 'es' ? 'Activo' : language === 'fr' ? 'Actif' : language === 'de' ? 'Aktiv' : language === 'it' ? 'Attivo' : 'Active'}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {u.role !== 'admin' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant={u.is_banned ? "outline" : "destructive"}
                                    onClick={() => setBanUserDialog(u)}
                                  >
                                    {u.is_banned ? (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        {language === 'he' ? 'בטל חסימה' : language === 'ru' ? 'Разблокировать' : language === 'es' ? 'Desbloquear' : language === 'fr' ? 'Débloquer' : language === 'de' ? 'Entsperren' : language === 'it' ? 'Sbanna' : 'Unban'}
                                      </>
                                    ) : (
                                      <>
                                        <Ban className="w-4 h-4 mr-1" />
                                        {language === 'he' ? 'חסום' : language === 'ru' ? 'Заблокировать' : 'Ban'}
                                      </>
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setDeleteUserDialog(u)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    {language === 'he' ? 'מחק' : language === 'ru' ? 'Удалить' : language === 'es' ? 'Eliminar' : language === 'fr' ? 'Supprimer' : language === 'de' ? 'Löschen' : language === 'it' ? 'Elimina' : 'Delete'}
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Trips Tab */}
              <TabsContent value="trips" className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={language === 'he' ? 'חפש טיול...' : 'Search trip...'}
                    value={searchTrips}
                    onChange={(e) => setSearchTrips(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {loadingTrips ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTrips.map((trip) => (
                      <Card key={trip.id} className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-lg">{trip.title || trip.title_he || trip.title_en}</h3>
                                <Badge variant={trip.status === 'open' ? 'default' : 'secondary'}>
                                  {trip.status}
                                </Badge>
                                <Badge variant="outline">{trip.country || 'israel'}</Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {trip.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(trip.date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {(trip.participants?.length || 0) + 1} / {trip.max_participants || '∞'}
                                </div>
                                <div className="flex items-center gap-1" dir="ltr">
                                  <UserCog className="w-4 h-4" />
                                  {trip.organizer_email}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                              >
                                {expandedTrip === trip.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditTrip(trip)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => setDeleteTripDialog(trip)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Expanded view with participants */}
                          {expandedTrip === trip.id && (
                            <div className="mt-4 pt-4 border-t">
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {language === 'he' ? 'משתתפים בקבוצה' : 'Group Participants'} ({(trip.participants?.length || 0) + 1})
                              </h4>
                              
                              {/* Organizer */}
                              <div className="mb-2 p-2 bg-emerald-50 rounded-lg flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{trip.organizer_name || 'Organizer'}</p>
                                  <p className="text-xs text-gray-500">{trip.organizer_email}</p>
                                </div>
                                <Badge className="bg-emerald-600">{language === 'he' ? 'מארגן' : 'Organizer'}</Badge>
                              </div>
                              
                              {/* Participants */}
                              {trip.participants && trip.participants.length > 0 ? (
                                <div className="space-y-2">
                                  {trip.participants.map((p, idx) => (
                                    <div key={idx} className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                                      <div>
                                        <p className="font-medium text-sm">{p.name}</p>
                                        <p className="text-xs text-gray-500">{p.email}</p>
                                        {p.joined_at && (
                                          <p className="text-xs text-gray-400">
                                            {language === 'he' ? 'הצטרף:' : 'Joined:'} {new Date(p.joined_at).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleChangeOrganizer(trip.id, p.email, p.name)}
                                          title={language === 'he' ? 'הפוך למארגן' : 'Make Organizer'}
                                        >
                                          <RefreshCw className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-red-600"
                                          onClick={() => {
                                            const updatedParticipants = trip.participants.filter(part => part.email !== p.email);
                                            updateTripMutation.mutate({
                                              tripId: trip.id,
                                              data: { participants: updatedParticipants, current_participants: updatedParticipants.length + 1 }
                                            });
                                          }}
                                        >
                                          <UserMinus className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500">{language === 'he' ? 'אין משתתפים נוספים' : 'No other participants'}</p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* All Participants Tab */}
              <TabsContent value="participants" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">
                    {language === 'he' ? 'כל המשתתפים בכל הקבוצות' : 'All Participants Across All Groups'} ({allParticipants.length})
                  </h3>
                </div>
                
                {allParticipants.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{language === 'he' ? 'שם' : 'Name'}</TableHead>
                          <TableHead>{language === 'he' ? 'אימייל' : 'Email'}</TableHead>
                          <TableHead>{language === 'he' ? 'מספר טיולים' : 'Trips Count'}</TableHead>
                          <TableHead>{language === 'he' ? 'טיולים' : 'Trips'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allParticipants.map((p, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{p.name}</TableCell>
                            <TableCell dir="ltr">{p.email}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{p.trips.length}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {p.trips.slice(0, 3).map((t, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {t.title?.substring(0, 20)}...
                                  </Badge>
                                ))}
                                {p.trips.length > 3 && (
                                  <Badge variant="outline" className="text-xs">+{p.trips.length - 3}</Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    {language === 'he' ? 'אין משתתפים בקבוצות' : 'No participants in groups'}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="marketing" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Facebook className="w-5 h-5 text-blue-600" />
                            {language === 'he' ? 'בוט פייסבוק' : 'Facebook Bot'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Facebook Page ID</label>
                                <Input 
                                    value={marketingConfig.facebook_page_id} 
                                    onChange={e => setMarketingConfig({...marketingConfig, facebook_page_id: e.target.value})} 
                                    placeholder="e.g., 123456789"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Page Access Token</label>
                                <Input 
                                    type="password"
                                    value={marketingConfig.facebook_access_token} 
                                    onChange={e => setMarketingConfig({...marketingConfig, facebook_access_token: e.target.value})} 
                                    placeholder="EAAG..."
                                />
                                <p className="text-xs text-gray-500">
                                    {language === 'he' 
                                        ? <span>יש להשיג טוקן קבוע (Long-lived) דרך <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Graph API Explorer</a></span>
                                        : <span>Get a long-lived token via <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Graph API Explorer</a></span>
                                    }
                                </p>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <Button onClick={handleSaveConfig} disabled={savingConfig} className="gap-2">
                                    {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {language === 'he' ? 'שמור הגדרות' : 'Save Settings'}
                                </Button>
                                <Button onClick={handleRunBot} disabled={runningBot || !marketingConfig.facebook_access_token} variant="secondary" className="gap-2">
                                    {runningBot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                    {language === 'he' ? 'הפעל בוט כעת' : 'Run Bot Now'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Delete User Dialog */}
      <AlertDialog open={!!deleteUserDialog} onOpenChange={() => setDeleteUserDialog(null)}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'he' ? 'מחיקת משתמש' : language === 'ru' ? 'Удалить пользователя' : language === 'es' ? 'Eliminar usuario' : language === 'fr' ? 'Supprimer utilisateur' : language === 'de' ? 'Benutzer löschen' : language === 'it' ? 'Elimina utente' : 'Delete User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'he' 
                ? `האם אתה בטוח שברצונך למחוק את המשתמש ${deleteUserDialog?.email}? פעולה זו תמחק גם את כל הטיולים שלו.`
                : language === 'ru'
                ? `Вы уверены, что хотите удалить пользователя ${deleteUserDialog?.email}? Это также удалит все их поездки.`
                : `Are you sure you want to delete user ${deleteUserDialog?.email}? This will also delete all their trips.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUserMutation.isPending}>
              {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserMutation.mutate(deleteUserDialog?.id)}
              disabled={deleteUserMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteUserMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                language === 'he' ? 'מחק' : 'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban User Dialog */}
      <AlertDialog open={!!banUserDialog} onOpenChange={() => setBanUserDialog(null)}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {banUserDialog?.is_banned 
                ? (language === 'he' ? 'ביטול חסימת משתמש' : language === 'ru' ? 'Разблокировать пользователя' : language === 'es' ? 'Desbloquear usuario' : language === 'fr' ? 'Débloquer utilisateur' : language === 'de' ? 'Benutzer entsperren' : language === 'it' ? 'Sbanna utente' : 'Unban User')
                : (language === 'he' ? 'חסימת משתמש' : language === 'ru' ? 'Заблокировать пользователя' : language === 'es' ? 'Bloquear usuario' : language === 'fr' ? 'Bloquer utilisateur' : language === 'de' ? 'Benutzer sperren' : language === 'it' ? 'Banna utente' : 'Ban User')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banUserDialog?.is_banned 
                ? (language === 'he' 
                  ? `האם אתה בטוח שברצונך לבטל את חסימת המשתמש ${banUserDialog?.email}?`
                  : language === 'ru'
                  ? `Вы уверены, что хотите разблокировать пользователя ${banUserDialog?.email}?`
                  : `Are you sure you want to unban user ${banUserDialog?.email}?`)
                : (language === 'he' 
                  ? `האם אתה בטוח שברצונך לחסום את המשתמש ${banUserDialog?.email}? המשתמש לא יוכל להתחבר לאפליקציה.`
                  : language === 'ru'
                  ? `Вы уверены, что хотите заблокировать пользователя ${banUserDialog?.email}? Они не смогут войти в приложение.`
                  : `Are you sure you want to ban user ${banUserDialog?.email}? They will not be able to log in.`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={banUserMutation.isPending}>
              {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => banUserMutation.mutate(banUserDialog?.id)}
              disabled={banUserMutation.isPending}
              className={banUserDialog?.is_banned ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}
            >
              {banUserMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : banUserDialog?.is_banned ? (
                language === 'he' ? 'בטל חסימה' : language === 'ru' ? 'Разблокировать' : language === 'es' ? 'Desbloquear' : language === 'fr' ? 'Débloquer' : language === 'de' ? 'Entsperren' : language === 'it' ? 'Sbanna' : 'Unban'
              ) : (
                language === 'he' ? 'חסום' : language === 'ru' ? 'Заблокировать' : language === 'es' ? 'Bloquear' : language === 'fr' ? 'Bloquer' : language === 'de' ? 'Sperren' : language === 'it' ? 'Blocca' : 'Ban'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Trip Dialog */}
      <AlertDialog open={!!deleteTripDialog} onOpenChange={() => setDeleteTripDialog(null)}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'he' ? 'מחיקת טיול' : language === 'ru' ? 'Удалить поездку' : language === 'es' ? 'Eliminar viaje' : language === 'fr' ? 'Supprimer voyage' : language === 'de' ? 'Reise löschen' : language === 'it' ? 'Elimina viaggio' : 'Delete Trip'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'he' 
                ? `האם אתה בטוח שברצונך למחוק את הטיול "${deleteTripDialog?.title || deleteTripDialog?.title_he}"?`
                : language === 'ru'
                ? `Вы уверены, что хотите удалить поездку "${deleteTripDialog?.title || deleteTripDialog?.title_en}"?`
                : `Are you sure you want to delete trip "${deleteTripDialog?.title || deleteTripDialog?.title_en}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTripMutation.isPending}>
              {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTripMutation.mutate(deleteTripDialog?.id)}
              disabled={deleteTripMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteTripMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                language === 'he' ? 'מחק' : 'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Trip Dialog */}
      {editTripDialog && editTripData && (
        <AlertDialog open={!!editTripDialog} onOpenChange={() => { setEditTripDialog(null); setEditTripData(null); }}>
          <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'} className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {language === 'he' ? 'עריכת טיול' : language === 'ru' ? 'Редактировать поездку' : 'Edit Trip'}
              </AlertDialogTitle>
            </AlertDialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === 'he' ? 'שם הטיול' : 'Trip Title'}</label>
                  <Input
                    value={editTripData.title}
                    onChange={(e) => setEditTripData({...editTripData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === 'he' ? 'מיקום' : 'Location'}</label>
                  <Input
                    value={editTripData.location}
                    onChange={(e) => setEditTripData({...editTripData, location: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === 'he' ? 'תאריך' : 'Date'}</label>
                  <Input
                    type="date"
                    value={editTripData.date}
                    onChange={(e) => setEditTripData({...editTripData, date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === 'he' ? 'שעת מפגש' : 'Meeting Time'}</label>
                  <Input
                    type="time"
                    value={editTripData.meeting_time}
                    onChange={(e) => setEditTripData({...editTripData, meeting_time: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === 'he' ? 'מקסימום משתתפים' : 'Max Participants'}</label>
                  <Input
                    type="number"
                    value={editTripData.max_participants}
                    onChange={(e) => setEditTripData({...editTripData, max_participants: parseInt(e.target.value)})}
                    min={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === 'he' ? 'שם מארגן' : 'Organizer Name'}</label>
                  <Input
                    value={editTripData.organizer_name}
                    onChange={(e) => setEditTripData({...editTripData, organizer_name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === 'he' ? 'אימייל מארגן' : 'Organizer Email'}</label>
                  <Input
                    type="email"
                    value={editTripData.organizer_email}
                    onChange={(e) => setEditTripData({...editTripData, organizer_email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === 'he' ? 'מדינה' : 'Country'}</label>
                  <Input
                    value={editTripData.country}
                    onChange={(e) => setEditTripData({...editTripData, country: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === 'he' ? 'אזור' : 'Region'}</label>
                  <Input
                    value={editTripData.region}
                    onChange={(e) => setEditTripData({...editTripData, region: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === 'he' ? 'רמת קושי' : 'Difficulty'}</label>
                  <select
                    value={editTripData.difficulty}
                    onChange={(e) => setEditTripData({...editTripData, difficulty: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="easy">{language === 'he' ? 'קל' : 'Easy'}</option>
                    <option value="moderate">{language === 'he' ? 'בינוני' : 'Moderate'}</option>
                    <option value="challenging">{language === 'he' ? 'מאתגר' : 'Challenging'}</option>
                    <option value="hard">{language === 'he' ? 'קשה' : 'Hard'}</option>
                    <option value="extreme">{language === 'he' ? 'אקסטרים' : 'Extreme'}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === 'he' ? 'סטטוס' : 'Status'}</label>
                  <select
                    value={editTripData.status}
                    onChange={(e) => setEditTripData({...editTripData, status: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="open">{language === 'he' ? 'פתוח' : 'Open'}</option>
                    <option value="full">{language === 'he' ? 'מלא' : 'Full'}</option>
                    <option value="completed">{language === 'he' ? 'הושלם' : 'Completed'}</option>
                    <option value="cancelled">{language === 'he' ? 'בוטל' : 'Cancelled'}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{language === 'he' ? 'פרטיות' : 'Privacy'}</label>
                  <select
                    value={editTripData.privacy}
                    onChange={(e) => setEditTripData({...editTripData, privacy: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="public">{language === 'he' ? 'ציבורי' : 'Public'}</option>
                    <option value="private">{language === 'he' ? 'פרטי' : 'Private'}</option>
                    <option value="invite_only">{language === 'he' ? 'הזמנה בלבד' : 'Invite Only'}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{language === 'he' ? 'תיאור' : 'Description'}</label>
                <textarea
                  value={editTripData.description}
                  onChange={(e) => setEditTripData({...editTripData, description: e.target.value})}
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={4}
                />
              </div>

              {/* Participants Management */}
              {editTripDialog.participants && editTripDialog.participants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {language === 'he' ? 'משתתפים' : 'Participants'} ({editTripDialog.participants.length})
                  </label>
                  <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                    {editTripDialog.participants.map((participant, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{participant.name}</p>
                          <p className="text-xs text-gray-500">{participant.email}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveParticipant(participant.email)}
                          disabled={updateTripMutation.isPending}
                        >
                          <UserMinus className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={updateTripMutation.isPending}>
                {language === 'he' ? 'ביטול' : 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSaveTrip}
                disabled={updateTripMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {updateTripMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  language === 'he' ? 'שמור' : 'Save'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}