import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import TripCard from '../components/trips/TripCard';
import { Plus, List, Trash2, Edit2, Loader2, Heart, Lock, Unlock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const colorOptions = [
  { value: 'emerald', label: 'Emerald', class: 'from-emerald-500 to-teal-600' },
  { value: 'blue', label: 'Blue', class: 'from-blue-500 to-indigo-600' },
  { value: 'purple', label: 'Purple', class: 'from-purple-500 to-pink-600' },
  { value: 'orange', label: 'Orange', class: 'from-orange-500 to-red-600' },
  { value: 'pink', label: 'Pink', class: 'from-pink-500 to-rose-600' },
];

export default function MyLists() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false,
    color: 'emerald'
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('MyLists'));
      }
    };
    fetchUser();
  }, []);

  const { data: lists = [], isLoading } = useQuery({
    queryKey: ['tripLists', user?.email],
    queryFn: () => base44.entities.TripList.filter({ user_email: user.email }),
    enabled: !!user?.email,
  });

  const { data: allTrips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.TripList.create({ ...data, user_email: user.email }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tripLists']);
      setShowCreateDialog(false);
      resetForm();
      toast.success(language === 'he' ? 'הרשימה נוצרה בהצלחה' : 'List created successfully');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TripList.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tripLists']);
      setEditingList(null);
      resetForm();
      toast.success(language === 'he' ? 'הרשימה עודכנה' : 'List updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.TripList.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['tripLists']);
      toast.success(language === 'he' ? 'הרשימה נמחקה' : 'List deleted');
    },
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', is_public: false, color: 'emerald' });
    setShowCreateDialog(false);
    setEditingList(null);
  };

  const handleEdit = (list) => {
    setEditingList(list);
    setFormData({
      name: list.name,
      description: list.description || '',
      is_public: list.is_public || false,
      color: list.color || 'emerald'
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error(language === 'he' ? 'נא להזין שם לרשימה' : 'Please enter a list name');
      return;
    }

    if (editingList) {
      updateMutation.mutate({ id: editingList.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getListTrips = (list) => {
    if (!list.trip_ids || list.trip_ids.length === 0) return [];
    return allTrips.filter(trip => list.trip_ids.includes(trip.id));
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === 'he' ? 'הרשימות שלי' : language === 'ru' ? 'Мои списки' : language === 'es' ? 'Mis listas' : language === 'fr' ? 'Mes listes' : language === 'de' ? 'Meine Listen' : language === 'it' ? 'Le mie liste' : 'My Lists'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'he' ? 'ארגן את הטיולים שלך ברשימות מותאמות אישית' : language === 'ru' ? 'Организуйте свои поездки в пользовательских списках' : language === 'es' ? 'Organiza tus viajes en listas personalizadas' : language === 'fr' ? 'Organisez vos voyages dans des listes personnalisées' : language === 'de' ? 'Organisieren Sie Ihre Reisen in benutzerdefinierten Listen' : language === 'it' ? 'Organizza i tuoi viaggi in liste personalizzate' : 'Organize your trips in custom lists'}
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            {language === 'he' ? 'רשימה חדשה' : language === 'ru' ? 'Новый список' : language === 'es' ? 'Nueva lista' : language === 'fr' ? 'Nouvelle liste' : language === 'de' ? 'Neue Liste' : language === 'it' ? 'Nuova lista' : 'New List'}
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : lists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => {
              const listTrips = getListTrips(list);
              const colorClass = colorOptions.find(c => c.value === list.color)?.class || 'from-emerald-500 to-teal-600';
              
              return (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group">
                    <div className={`h-32 bg-gradient-to-r ${colorClass} relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <List className="w-16 h-16 text-white/30" />
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        {list.is_public ? (
                          <Badge className="bg-white/20 text-white border-white/30">
                            <Unlock className="w-3 h-3 mr-1" />
                            {language === 'he' ? 'ציבורי' : language === 'ru' ? 'Публичный' : language === 'es' ? 'Público' : language === 'fr' ? 'Public' : language === 'de' ? 'Öffentlich' : language === 'it' ? 'Pubblico' : 'Public'}
                          </Badge>
                        ) : (
                          <Badge className="bg-white/20 text-white border-white/30">
                            <Lock className="w-3 h-3 mr-1" />
                            {language === 'he' ? 'פרטי' : language === 'ru' ? 'Личный' : language === 'es' ? 'Privado' : language === 'fr' ? 'Privé' : language === 'de' ? 'Privat' : language === 'it' ? 'Privato' : 'Private'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
                        {list.name}
                      </h3>
                      {list.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2" dir={isRTL ? 'rtl' : 'ltr'}>
                          {list.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="gap-1">
                          <Heart className="w-3 h-3" />
                          {listTrips.length} {language === 'he' ? 'טיולים' : language === 'ru' ? 'поездок' : language === 'es' ? 'viajes' : language === 'fr' ? 'voyages' : language === 'de' ? 'Reisen' : language === 'it' ? 'viaggi' : 'trips'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Link to={createPageUrl('ListDetails') + '?id=' + list.id} className="flex-1">
                          <Button variant="outline" className="w-full gap-2">
                            {language === 'he' ? 'צפה' : language === 'ru' ? 'Просмотр' : language === 'es' ? 'Ver' : language === 'fr' ? 'Voir' : language === 'de' ? 'Ansehen' : language === 'it' ? 'Visualizza' : 'View'}
                            <ArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(list)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteMutation.mutate(list.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {language === 'he' ? 'אין לך רשימות עדיין' : language === 'ru' ? 'У вас пока нет списков' : language === 'es' ? 'Aún no hay listas' : language === 'fr' ? 'Pas encore de listes' : language === 'de' ? 'Noch keine Listen' : language === 'it' ? 'Nessuna lista ancora' : 'No lists yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'he' 
                ? 'צור רשימות מותאמות אישית כמו "טיולים שחייבים לעשות" או "טיולים משפחתיים"'
                : language === 'ru' ? 'Создавайте пользовательские списки, такие как "Обязательные поездки" или "Семейные поездки"'
                : language === 'es' ? 'Crea listas personalizadas como "Viajes obligatorios" o "Viajes familiares"'
                : language === 'fr' ? 'Créez des listes personnalisées comme "Voyages incontournables" ou "Voyages en famille"'
                : language === 'de' ? 'Erstellen Sie benutzerdefinierte Listen wie "Must-do-Reisen" oder "Familienreisen"'
                : language === 'it' ? 'Crea liste personalizzate come "Viaggi da fare" o "Viaggi in famiglia"'
                : 'Create custom lists like "Must-do trips" or "Family trips"'}
            </p>
            <Button onClick={() => setShowCreateDialog(true)} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              <Plus className="w-4 h-4" />
              {language === 'he' ? 'צור רשימה ראשונה' : language === 'ru' ? 'Создать первый список' : language === 'es' ? 'Crear primera lista' : language === 'fr' ? 'Créer première liste' : language === 'de' ? 'Erste Liste erstellen' : language === 'it' ? 'Crea prima lista' : 'Create First List'}
            </Button>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || !!editingList} onOpenChange={(open) => {
        if (!open) resetForm();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingList 
                ? (language === 'he' ? 'ערוך רשימה' : language === 'ru' ? 'Редактировать список' : language === 'es' ? 'Editar lista' : language === 'fr' ? 'Modifier la liste' : language === 'de' ? 'Liste bearbeiten' : language === 'it' ? 'Modifica lista' : 'Edit List')
                : (language === 'he' ? 'צור רשימה חדשה' : language === 'ru' ? 'Создать новый список' : language === 'es' ? 'Crear nueva lista' : language === 'fr' ? 'Créer nouvelle liste' : language === 'de' ? 'Neue Liste erstellen' : language === 'it' ? 'Crea nuova lista' : 'Create New List')}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' 
                ? 'ארגן את הטיולים שלך בקטגוריות מותאמות אישית'
                : language === 'ru' ? 'Организуйте свои поездки в пользовательских категориях'
                : language === 'es' ? 'Organiza tus viajes en categorías personalizadas'
                : language === 'fr' ? 'Organisez vos voyages dans des catégories personnalisées'
                : language === 'de' ? 'Organisieren Sie Ihre Reisen in benutzerdefinierten Kategorien'
                : language === 'it' ? 'Organizza i tuoi viaggi in categorie personalizzate'
                : 'Organize your trips in custom categories'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'he' ? 'שם הרשימה' : language === 'ru' ? 'Название списка' : language === 'es' ? 'Nombre de lista' : language === 'fr' ? 'Nom de la liste' : language === 'de' ? 'Listenname' : language === 'it' ? 'Nome della lista' : 'List Name'}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === 'he' ? 'למשל: טיולים שחייבים לעשות' : language === 'ru' ? 'напр., Обязательные поездки' : language === 'es' ? 'ej., Viajes obligatorios' : language === 'fr' ? 'ex., Voyages incontournables' : language === 'de' ? 'z.B. Must-do-Reisen' : language === 'it' ? 'es., Viaggi da fare' : 'e.g., Must-do trips'}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'he' ? 'תיאור (אופציונלי)' : language === 'ru' ? 'Описание (необязательно)' : language === 'es' ? 'Descripción (opcional)' : language === 'fr' ? 'Description (optionnel)' : language === 'de' ? 'Beschreibung (optional)' : language === 'it' ? 'Descrizione (opzionale)' : 'Description (optional)'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === 'he' ? 'תאר את הרשימה...' : language === 'ru' ? 'Опишите ваш список...' : language === 'es' ? 'Describe tu lista...' : language === 'fr' ? 'Décrivez votre liste...' : language === 'de' ? 'Beschreiben Sie Ihre Liste...' : language === 'it' ? 'Descrivi la tua lista...' : 'Describe your list...'}
                rows={3}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'he' ? 'צבע' : language === 'ru' ? 'Цвет' : language === 'es' ? 'Color' : language === 'fr' ? 'Couleur' : language === 'de' ? 'Farbe' : language === 'it' ? 'Colore' : 'Color'}</Label>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map(color => (
                  <Badge
                    key={color.value}
                    className={`cursor-pointer transition-all ${
                      formData.color === color.value
                        ? `bg-gradient-to-r ${color.class} text-white scale-110`
                        : 'bg-gray-200 text-gray-700'
                    }`}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                  >
                    {color.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <Label className="mb-0">
                {language === 'he' ? 'רשימה ציבורית' : language === 'ru' ? 'Публичный список' : language === 'es' ? 'Lista pública' : language === 'fr' ? 'Liste publique' : language === 'de' ? 'Öffentliche Liste' : language === 'it' ? 'Lista pubblica' : 'Public List'}
              </Label>
              <Switch
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
              />
            </div>
            <p className="text-xs text-gray-500">
              {language === 'he' 
                ? 'רשימות ציבוריות יכולות להיות מנוהות ע"י משתמשים אחרים'
                : language === 'ru' ? 'Публичные списки могут просматривать другие пользователи'
                : language === 'es' ? 'Las listas públicas pueden ser seguidas por otros usuarios'
                : language === 'fr' ? 'Les listes publiques peuvent être suivies par d\'autres utilisateurs'
                : language === 'de' ? 'Öffentliche Listen können von anderen Benutzern verfolgt werden'
                : language === 'it' ? 'Le liste pubbliche possono essere seguite da altri utenti'
                : 'Public lists can be followed by other users'}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {(createMutation.isLoading || updateMutation.isLoading) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingList ? t('save') : (language === 'he' ? 'צור' : language === 'ru' ? 'Создать' : language === 'es' ? 'Crear' : language === 'fr' ? 'Créer' : language === 'de' ? 'Erstellen' : language === 'it' ? 'Crea' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}