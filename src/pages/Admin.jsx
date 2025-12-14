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
import { Shield, Users, Map, Search, Trash2, Ban, Loader2, UserX, CheckCircle } from 'lucide-react';
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="users" className="gap-2">
                  <Users className="w-4 h-4" />
                  {language === 'he' ? 'משתמשים' : language === 'ru' ? 'Пользователи' : language === 'es' ? 'Usuarios' : language === 'fr' ? 'Utilisateurs' : language === 'de' ? 'Benutzer' : language === 'it' ? 'Utenti' : 'Users'}
                </TabsTrigger>
                <TabsTrigger value="trips" className="gap-2">
                  <Map className="w-4 h-4" />
                  {language === 'he' ? 'טיולים' : language === 'ru' ? 'Поездки' : language === 'es' ? 'Viajes' : language === 'fr' ? 'Voyages' : language === 'de' ? 'Reisen' : language === 'it' ? 'Viaggi' : 'Trips'}
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
                    placeholder={language === 'he' ? 'חפש טיול...' : language === 'ru' ? 'Поиск поездки...' : language === 'es' ? 'Buscar viaje...' : language === 'fr' ? 'Rechercher voyage...' : language === 'de' ? 'Reise suchen...' : language === 'it' ? 'Cerca viaggio...' : 'Search trip...'}
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
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{language === 'he' ? 'שם הטיול' : language === 'ru' ? 'Название' : language === 'es' ? 'Nombre del viaje' : language === 'fr' ? 'Nom du voyage' : language === 'de' ? 'Reisename' : language === 'it' ? 'Nome del viaggio' : 'Trip Name'}</TableHead>
                          <TableHead>{language === 'he' ? 'מארגן' : language === 'ru' ? 'Организатор' : language === 'es' ? 'Organizador' : language === 'fr' ? 'Organisateur' : language === 'de' ? 'Organisator' : language === 'it' ? 'Organizzatore' : 'Organizer'}</TableHead>
                          <TableHead>{language === 'he' ? 'מיקום' : language === 'ru' ? 'Местоположение' : language === 'es' ? 'Ubicación' : language === 'fr' ? 'Emplacement' : language === 'de' ? 'Standort' : language === 'it' ? 'Posizione' : 'Location'}</TableHead>
                          <TableHead>{language === 'he' ? 'תאריך' : language === 'ru' ? 'Дата' : language === 'es' ? 'Fecha' : language === 'fr' ? 'Date' : language === 'de' ? 'Datum' : language === 'it' ? 'Data' : 'Date'}</TableHead>
                          <TableHead>{language === 'he' ? 'משתתפים' : language === 'ru' ? 'Участники' : language === 'es' ? 'Participantes' : language === 'fr' ? 'Participants' : language === 'de' ? 'Teilnehmer' : language === 'it' ? 'Partecipanti' : 'Participants'}</TableHead>
                          <TableHead>{language === 'he' ? 'פעולות' : language === 'ru' ? 'Действия' : language === 'es' ? 'Acciones' : language === 'fr' ? 'Actions' : language === 'de' ? 'Aktionen' : language === 'it' ? 'Azioni' : 'Actions'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTrips.map((trip) => (
                          <TableRow key={trip.id}>
                            <TableCell className="font-medium">
                              {trip.title || trip.title_he || trip.title_en}
                            </TableCell>
                            <TableCell dir="ltr">{trip.organizer_email}</TableCell>
                            <TableCell>{trip.location}</TableCell>
                            <TableCell>{new Date(trip.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {trip.current_participants || 1} / {trip.max_participants || '∞'}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteTripDialog(trip)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                {language === 'he' ? 'מחק' : language === 'ru' ? 'Удалить' : language === 'es' ? 'Eliminar' : language === 'fr' ? 'Supprimer' : language === 'de' ? 'Löschen' : language === 'it' ? 'Elimina' : 'Delete'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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
    </div>
  );
}