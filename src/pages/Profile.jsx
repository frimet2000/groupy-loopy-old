import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Mail, Save, Loader2, Settings, MapPin, Heart, Edit2, Upload, Camera, X, Dog, Users, AlertTriangle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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

const interests = ['nature', 'history', 'photography', 'birdwatching', 'archaeology', 'geology', 'botany', 'extreme_sports', 'family_friendly', 'romantic'];
const regions = ['north', 'center', 'south', 'jerusalem', 'negev', 'eilat'];
const parentAgeRanges = ['20-30', '30-40', '40-50', '50-60', '60+'];
const childrenAgeRanges = ['0-2', '3-6', '7-10', '11-14', '15-18', '18-21', '21+'];

export default function Profile() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    profile_image: '',
    bio: '',
    phone: '',
    preferred_regions: [],
    preferred_interests: [],
    home_region: '',
    fitness_level: 'moderate',
    vehicle_type: 'none',
    parent_age_ranges: [],
    children_age_ranges: [],
    travels_with_dog: false,
  });
  const [preferences, setPreferences] = useState({
    preferred_regions: [],
    preferred_interests: [],
    preferred_difficulty: '',
  });

  const urlParams = new URLSearchParams(window.location.search);
  const viewEmail = urlParams.get('email');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // If viewing another user's profile
        if (viewEmail && viewEmail !== userData.email) {
          const users = await base44.entities.User.list();
          const targetUser = users.find(u => u.email === viewEmail);
          if (targetUser) {
            setViewingUser(targetUser);
          }
          return;
        }
        
        // Viewing own profile
        setViewingUser(userData);
        const nameParts = userData.full_name?.split(' ') || ['', ''];
        setFormData({
          first_name: userData.first_name || nameParts[0] || '',
          last_name: userData.last_name || nameParts.slice(1).join(' ') || '',
          profile_image: userData.profile_image || '',
          bio: userData.bio || '',
          phone: userData.phone || '',
          preferred_regions: userData.preferred_regions || [],
          preferred_interests: userData.preferred_interests || [],
          home_region: userData.home_region || '',
          fitness_level: userData.fitness_level || 'moderate',
          vehicle_type: userData.vehicle_type || 'none',
          parent_age_ranges: userData.parent_age_ranges || [],
          children_age_ranges: userData.children_age_ranges || [],
          travels_with_dog: userData.travels_with_dog || false,
        });
        
        setPreferences({
          preferred_regions: userData.preferred_regions || [],
          preferred_interests: userData.preferred_interests || [],
          preferred_difficulty: userData.preferred_difficulty || '',
        });
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('Profile'));
      }
    };
    fetchUser();
  }, [viewEmail]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePreference = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('profile_image', file_url);
      
      // Save immediately to database
      await base44.auth.updateMe({ profile_image: file_url });
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      setViewingUser(updatedUser);
      
      toast.success(language === 'he' ? 'התמונה הועלתה' : language === 'ru' ? 'Изображение загружено' : language === 'es' ? 'Imagen cargada' : language === 'fr' ? 'Image téléchargée' : language === 'de' ? 'Bild hochgeladen' : language === 'it' ? 'Immagine caricata' : 'Image uploaded');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(language === 'he' ? 'שגיאה בהעלאת התמונה' : language === 'ru' ? 'Ошибка загрузки изображения' : language === 'es' ? 'Error al cargar imagen' : language === 'fr' ? 'Erreur de téléchargement de l\'image' : language === 'de' ? 'Fehler beim Hochladen des Bildes' : language === 'it' ? 'Errore nel caricamento dell\'immagine' : 'Error uploading image');
    }
    setImageUploading(false);
    e.target.value = '';
  };

  const handleCameraCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('profile_image', file_url);
      
      // Save immediately to database
      await base44.auth.updateMe({ profile_image: file_url });
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      setViewingUser(updatedUser);
      
      toast.success(language === 'he' ? 'התמונה צולמה והועלתה' : language === 'ru' ? 'Фото сделано и загружено' : language === 'es' ? 'Foto capturada y cargada' : language === 'fr' ? 'Photo capturée et téléchargée' : language === 'de' ? 'Foto aufgenommen und hochgeladen' : language === 'it' ? 'Foto scattata e caricata' : 'Photo captured and uploaded');
    } catch (error) {
      console.error('Camera capture error:', error);
      toast.error(language === 'he' ? 'שגיאה בצילום התמונה' : language === 'ru' ? 'Ошибка при съёмке фото' : language === 'es' ? 'Error al capturar foto' : language === 'fr' ? 'Erreur lors de la capture de la photo' : language === 'de' ? 'Fehler beim Aufnehmen des Fotos' : language === 'it' ? 'Errore durante lo scatto della foto' : 'Error capturing photo');
    }
    setImageUploading(false);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) {
      toast.error(language === 'he' ? 'נא למלא שם פרטי ושם משפחה' : language === 'ru' ? 'Пожалуйста, заполните имя и фамилию' : language === 'es' ? 'Por favor, completa nombre y apellido' : language === 'fr' ? 'Veuillez remplir le prénom et le nom' : language === 'de' ? 'Bitte Vor- und Nachname ausfüllen' : language === 'it' ? 'Compila nome e cognome' : 'Please fill in first and last name');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${formData.first_name} ${formData.last_name}`.trim();
      await base44.auth.updateMe({
        ...formData,
        full_name: fullName,
      });
      
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
      setEditMode(false);
      toast.success(language === 'he' ? 'הפרופיל עודכן בהצלחה' : language === 'ru' ? 'Профиль успешно обновлён' : language === 'es' ? 'Perfil actualizado exitosamente' : language === 'fr' ? 'Profil mis à jour avec succès' : language === 'de' ? 'Profil erfolgreich aktualisiert' : language === 'it' ? 'Profilo aggiornato con successo' : 'Profile updated successfully');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בעדכון הפרופיל' : language === 'ru' ? 'Ошибка обновления профиля' : language === 'es' ? 'Error al actualizar perfil' : language === 'fr' ? 'Erreur de mise à jour du profil' : language === 'de' ? 'Fehler beim Aktualisieren des Profils' : language === 'it' ? 'Errore nell\'aggiornamento del profilo' : 'Error updating profile');
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Delete user's trips first
      const userTrips = await base44.entities.Trip.filter({ organizer_email: user.email });
      for (const trip of userTrips) {
        await base44.entities.Trip.delete(trip.id);
      }
      
      // Delete user account
      await base44.entities.User.delete(user.id);
      
      toast.success(language === 'he' ? 'החשבון נמחק בהצלחה' : language === 'ru' ? 'Аккаунт успешно удалён' : language === 'es' ? 'Cuenta eliminada exitosamente' : language === 'fr' ? 'Compte supprimé avec succès' : language === 'de' ? 'Konto erfolgreich gelöscht' : language === 'it' ? 'Account eliminato con successo' : 'Account deleted successfully');
      
      // Logout and redirect
      await base44.auth.logout();
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה במחיקת החשבון' : language === 'ru' ? 'Ошибка при удалении аккаунта' : language === 'es' ? 'Error al eliminar cuenta' : language === 'fr' ? 'Erreur lors de la suppression du compte' : language === 'de' ? 'Fehler beim Löschen des Kontos' : language === 'it' ? 'Errore nell\'eliminazione dell\'account' : 'Error deleting account');
      setDeleting(false);
    }
  };

  if (!user || !viewingUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const isOwnProfile = user.email === viewingUser.email;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Profile Header */}
          <Card className="mb-6 border-0 shadow-lg overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-emerald-500 to-emerald-700" />
            <CardContent className="relative pt-0 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-10">
                <div className="relative">
                  {isOwnProfile && editMode ? (
                    <>
                      {formData.profile_image ? (
                        <img 
                          src={formData.profile_image} 
                          alt="Profile" 
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center border-4 border-white shadow-lg">
                          <Camera className="w-8 h-8 text-emerald-400" />
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 flex gap-1">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleCameraCapture}
                            className="hidden"
                          />
                          <div className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow-lg transition-all">
                            {imageUploading ? (
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : (
                              <Camera className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </label>
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <div className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center shadow-lg transition-all">
                            {imageUploading ? (
                              <Loader2 className="w-4 h-4 text-white animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </label>
                      </div>
                    </>
                  ) : (
                   <>
                     {viewingUser.profile_image ? (
                       <img 
                         src={viewingUser.profile_image} 
                         alt="Profile" 
                         className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                       />
                     ) : (
                       <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                         <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-2xl font-bold">
                           {(viewingUser.first_name?.charAt(0) || viewingUser.full_name?.charAt(0) || viewingUser.email?.charAt(0) || 'U').toUpperCase()}
                         </AvatarFallback>
                       </Avatar>
                     )}
                   </>
                  )}
                  </div>
                  <div className="text-center sm:text-start flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                   {viewingUser.first_name && viewingUser.last_name 
                     ? `${viewingUser.first_name} ${viewingUser.last_name}` 
                     : viewingUser.full_name}
                  </h1>
                  {isOwnProfile && (
                   <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2">
                     <Mail className="w-4 h-4" />
                     {viewingUser.email}
                   </p>
                  )}
                  {viewingUser.bio && !editMode && (
                   <p className="text-sm text-gray-600 mt-2">{viewingUser.bio}</p>
                  )}
                  </div>
                  <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                   {viewingUser.role === 'admin' ? (language === 'he' ? 'מנהל' : language === 'ru' ? 'Админ' : language === 'es' ? 'Admin' : language === 'fr' ? 'Admin' : language === 'de' ? 'Admin' : language === 'it' ? 'Admin' : 'Admin') : (language === 'he' ? 'משתמש' : language === 'ru' ? 'Пользователь' : language === 'es' ? 'Usuario' : language === 'fr' ? 'Utilisateur' : language === 'de' ? 'Benutzer' : language === 'it' ? 'Utente' : 'User')}
                  </Badge>
                  {isOwnProfile && !editMode && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setEditMode(true)}
                     className="gap-2"
                   >
                     <Edit2 className="w-4 h-4" />
                     {language === 'he' ? 'ערוך פרופיל' : language === 'ru' ? 'Редактировать профиль' : language === 'es' ? 'Editar perfil' : language === 'fr' ? 'Modifier le profil' : language === 'de' ? 'Profil bearbeiten' : language === 'it' ? 'Modifica profilo' : 'Edit Profile'}
                   </Button>
                  )}
                  </div>
              </div>
            </CardContent>
          </Card>

          {/* View Mode - User Info Cards */}
          {!isOwnProfile && !editMode && (
            <>
              {(viewingUser.phone || viewingUser.home_region || viewingUser.fitness_level || viewingUser.vehicle_type) && (
                <Card className="mb-6 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-indigo-600" />
                      {language === 'he' ? 'פרטים אישיים' : language === 'ru' ? 'Личная информация' : language === 'es' ? 'Información personal' : language === 'fr' ? 'Informations personnelles' : language === 'de' ? 'Persönliche Informationen' : language === 'it' ? 'Informazioni personali' : 'Personal Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {viewingUser.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">{language === 'he' ? 'טלפון:' : language === 'ru' ? 'Телефон:' : language === 'es' ? 'Teléfono:' : language === 'fr' ? 'Téléphone :' : language === 'de' ? 'Telefon:' : language === 'it' ? 'Telefono:' : 'Phone:'}</span>
                        <span>{viewingUser.phone}</span>
                      </div>
                    )}
                    {viewingUser.home_region && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">{language === 'he' ? 'אזור מגורים:' : language === 'ru' ? 'Домашний регион:' : language === 'es' ? 'Región de origen:' : language === 'fr' ? 'Région d\'origine :' : language === 'de' ? 'Heimatregion:' : language === 'it' ? 'Regione di residenza:' : 'Home Region:'}</span>
                        <span>{t(viewingUser.home_region)}</span>
                      </div>
                    )}
                    {viewingUser.fitness_level && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">{language === 'he' ? 'רמת כושר:' : language === 'ru' ? 'Уровень физической подготовки:' : language === 'es' ? 'Nivel de condición física:' : language === 'fr' ? 'Niveau de forme :' : language === 'de' ? 'Fitnesslevel:' : language === 'it' ? 'Livello di forma fisica:' : 'Fitness Level:'}</span>
                        <Badge variant="outline">
                          {viewingUser.fitness_level === 'low' ? (language === 'he' ? 'נמוכה' : language === 'ru' ? 'Низкий' : language === 'es' ? 'Bajo' : language === 'fr' ? 'Faible' : language === 'de' ? 'Niedrig' : language === 'it' ? 'Basso' : 'Low') :
                           viewingUser.fitness_level === 'moderate' ? (language === 'he' ? 'בינונית' : language === 'ru' ? 'Средний' : language === 'es' ? 'Moderado' : language === 'fr' ? 'Modéré' : language === 'de' ? 'Mittel' : language === 'it' ? 'Moderato' : 'Moderate') :
                           viewingUser.fitness_level === 'high' ? (language === 'he' ? 'גבוהה' : language === 'ru' ? 'Высокий' : language === 'es' ? 'Alto' : language === 'fr' ? 'Élevé' : language === 'de' ? 'Hoch' : language === 'it' ? 'Alto' : 'High') :
                           (language === 'he' ? 'גבוהה מאוד' : language === 'ru' ? 'Очень высокий' : language === 'es' ? 'Muy alto' : language === 'fr' ? 'Très élevé' : language === 'de' ? 'Sehr hoch' : language === 'it' ? 'Molto alto' : 'Very High')}
                        </Badge>
                      </div>
                    )}
                    {viewingUser.vehicle_type && viewingUser.vehicle_type !== 'none' && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">{language === 'he' ? 'סוג רכב:' : language === 'ru' ? 'Транспорт:' : language === 'es' ? 'Vehículo:' : language === 'fr' ? 'Véhicule :' : language === 'de' ? 'Fahrzeug:' : language === 'it' ? 'Veicolo:' : 'Vehicle:'}</span>
                        <Badge variant="outline">
                          {viewingUser.vehicle_type === 'regular' ? (language === 'he' ? 'רכב רגיל' : language === 'ru' ? 'Обычный' : language === 'es' ? 'Regular' : language === 'fr' ? 'Ordinaire' : language === 'de' ? 'Normal' : language === 'it' ? 'Normale' : 'Regular') :
                           (language === 'he' ? 'רכב שטח (4X4)' : language === 'ru' ? '4X4' : language === 'es' ? '4X4' : language === 'fr' ? '4X4' : language === 'de' ? '4X4' : language === 'it' ? '4X4' : '4X4')}
                        </Badge>
                      </div>
                    )}
                    {viewingUser.travels_with_dog && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Dog className="w-4 h-4" />
                        <span className="font-medium">{language === 'he' ? 'מטייל עם כלב' : language === 'ru' ? 'Путешествует с собакой' : language === 'es' ? 'Viaja con perro' : language === 'fr' ? 'Voyage avec un chien' : language === 'de' ? 'Reist mit Hund' : language === 'it' ? 'Viaggia con cane' : 'Travels with dog'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

                {((viewingUser.parent_age_ranges && viewingUser.parent_age_ranges.length > 0) ||
                  (viewingUser.children_age_ranges && viewingUser.children_age_ranges.length > 0)) && (
                  <Card className="mb-6 border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        {language === 'he' ? 'משפחה' : language === 'ru' ? 'Семья' : language === 'es' ? 'Familia' : language === 'fr' ? 'Famille' : language === 'de' ? 'Familie' : language === 'it' ? 'Famiglia' : 'Family'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {viewingUser.parent_age_ranges && viewingUser.parent_age_ranges.length > 0 && (
                        <div className="space-y-2">
                          <Label>{language === 'he' ? 'טווחי גילאי הורים' : language === 'ru' ? 'Возраст родителей' : language === 'es' ? 'Rangos de edad de padres' : language === 'fr' ? 'Tranches d\'âge des parents' : language === 'de' ? 'Altersgruppen Eltern' : language === 'it' ? 'Fasce d\'età genitori' : 'Parent Age Ranges'}</Label>
                          <div className="flex flex-wrap gap-2">
                            {viewingUser.parent_age_ranges.map(range => (
                              <Badge key={range} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                {range}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {viewingUser.children_age_ranges && viewingUser.children_age_ranges.length > 0 && (
                        <div className="space-y-2">
                          <Label>{language === 'he' ? 'טווחי גילאי ילדים' : language === 'ru' ? 'Возраст детей' : language === 'es' ? 'Rangos de edad de niños' : language === 'fr' ? 'Tranches d\'âge des enfants' : language === 'de' ? 'Altersgruppen Kinder' : language === 'it' ? 'Fasce d\'età bambini' : 'Children Age Ranges'}</Label>
                          <div className="flex flex-wrap gap-2">
                            {viewingUser.children_age_ranges.map(range => (
                              <Badge key={range} variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
                                {range}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

              {((viewingUser.preferred_regions && viewingUser.preferred_regions.length > 0) || 
                (viewingUser.preferred_interests && viewingUser.preferred_interests.length > 0)) && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-emerald-600" />
                      {language === 'he' ? 'העדפות טיולים' : language === 'ru' ? 'Предпочтения поездок' : language === 'es' ? 'Preferencias de viaje' : language === 'fr' ? 'Préférences de voyage' : language === 'de' ? 'Reisepräferenzen' : language === 'it' ? 'Preferenze di viaggio' : 'Trip Preferences'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {viewingUser.preferred_regions && viewingUser.preferred_regions.length > 0 && (
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          {language === 'he' ? 'אזורים מועדפים' : language === 'ru' ? 'Предпочитаемые регионы' : language === 'es' ? 'Regiones preferidas' : language === 'fr' ? 'Régions préférées' : language === 'de' ? 'Bevorzugte Regionen' : language === 'it' ? 'Regioni preferite' : 'Preferred Regions'}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {viewingUser.preferred_regions.map(region => (
                            <Badge key={region} className="bg-blue-600">
                              {t(region)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {viewingUser.preferred_interests && viewingUser.preferred_interests.length > 0 && (
                      <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-600" />
                          {language === 'he' ? 'תחומי עניין' : language === 'ru' ? 'Интересы' : language === 'es' ? 'Intereses' : language === 'fr' ? 'Intérêts' : language === 'de' ? 'Interessen' : language === 'it' ? 'Interessi' : 'Interests'}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {viewingUser.preferred_interests.map(interest => (
                            <Badge key={interest} className="bg-rose-600">
                              {t(interest)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Edit Mode - Personal Info */}
          {isOwnProfile && editMode && (
            <Card className="mb-6 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  {language === 'he' ? 'פרטים אישיים' : language === 'ru' ? 'Личная информация' : language === 'es' ? 'Información personal' : language === 'fr' ? 'Informations personnelles' : language === 'de' ? 'Persönliche Informationen' : language === 'it' ? 'Informazioni personali' : 'Personal Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'שם פרטי' : language === 'ru' ? 'Имя' : language === 'es' ? 'Nombre' : language === 'fr' ? 'Prénom' : language === 'de' ? 'Vorname' : language === 'it' ? 'Nome' : 'First Name'} *</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => handleChange('first_name', e.target.value)}
                      dir={language === 'he' ? 'rtl' : 'ltr'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'שם משפחה' : language === 'ru' ? 'Фамилия' : language === 'es' ? 'Apellido' : language === 'fr' ? 'Nom de famille' : language === 'de' ? 'Nachname' : language === 'it' ? 'Cognome' : 'Last Name'} *</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => handleChange('last_name', e.target.value)}
                      dir={language === 'he' ? 'rtl' : 'ltr'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'he' ? 'טלפון' : language === 'ru' ? 'Телефон' : language === 'es' ? 'Teléfono' : language === 'fr' ? 'Téléphone' : language === 'de' ? 'Telefon' : language === 'it' ? 'Telefono' : 'Phone'}</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder={language === 'he' ? '050-1234567' : '050-1234567'}
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === 'he' ? 'אודותיי' : language === 'ru' ? 'О себе' : language === 'es' ? 'Biografía' : language === 'fr' ? 'Bio' : language === 'de' ? 'Über mich' : language === 'it' ? 'Bio' : 'Bio'}</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder={language === 'he' 
                      ? 'ספר קצת על עצמך, מה אתה אוהב בטיולים...'
                      : language === 'ru'
                      ? 'Расскажите о себе, что вы любите в походах...'
                      : language === 'es'
                      ? 'Cuéntanos sobre ti, qué te gusta del senderismo...'
                      : language === 'fr'
                      ? 'Parlez-nous de vous, ce que vous aimez dans la randonnée...'
                      : language === 'de'
                      ? 'Erzählen Sie uns über sich, was Sie am Wandern lieben...'
                      : language === 'it'
                      ? 'Parlaci di te, cosa ami dell\'escursionismo...'
                      : 'Tell us about yourself, what you love about hiking...'}
                    rows={3}
                    dir={language === 'he' ? 'rtl' : 'ltr'}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'אזור מגורים' : language === 'ru' ? 'Домашний регион' : language === 'es' ? 'Región de origen' : language === 'fr' ? 'Région d\'origine' : language === 'de' ? 'Heimatregion' : language === 'it' ? 'Regione di residenza' : 'Home Region'}</Label>
                    <Select value={formData.home_region} onValueChange={(v) => handleChange('home_region', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'he' ? 'בחר אזור' : language === 'ru' ? 'Выберите регион' : language === 'es' ? 'Seleccionar región' : language === 'fr' ? 'Sélectionner région' : language === 'de' ? 'Region auswählen' : language === 'it' ? 'Seleziona regione' : 'Select region'} />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map(r => (
                          <SelectItem key={r} value={r}>{t(r)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'he' ? 'רמת כושר' : language === 'ru' ? 'Уровень физической подготовки' : language === 'es' ? 'Nivel de condición física' : language === 'fr' ? 'Niveau de forme' : language === 'de' ? 'Fitnesslevel' : language === 'it' ? 'Livello di forma fisica' : 'Fitness Level'}</Label>
                    <Select value={formData.fitness_level} onValueChange={(v) => handleChange('fitness_level', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          {language === 'he' ? 'נמוכה' : language === 'ru' ? 'Низкий' : language === 'es' ? 'Bajo' : language === 'fr' ? 'Faible' : language === 'de' ? 'Niedrig' : language === 'it' ? 'Basso' : 'Low'}
                        </SelectItem>
                        <SelectItem value="moderate">
                          {language === 'he' ? 'בינונית' : language === 'ru' ? 'Средний' : language === 'es' ? 'Moderado' : language === 'fr' ? 'Modéré' : language === 'de' ? 'Mittel' : language === 'it' ? 'Moderato' : 'Moderate'}
                        </SelectItem>
                        <SelectItem value="high">
                          {language === 'he' ? 'גבוהה' : language === 'ru' ? 'Высокий' : language === 'es' ? 'Alto' : language === 'fr' ? 'Élevé' : language === 'de' ? 'Hoch' : language === 'it' ? 'Alto' : 'High'}
                        </SelectItem>
                        <SelectItem value="very_high">
                          {language === 'he' ? 'גבוהה מאוד' : language === 'ru' ? 'Очень высокий' : language === 'es' ? 'Muy alto' : language === 'fr' ? 'Très élevé' : language === 'de' ? 'Sehr hoch' : language === 'it' ? 'Molto alto' : 'Very High'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'he' ? 'סוג רכב' : language === 'ru' ? 'Тип транспорта' : language === 'es' ? 'Tipo de vehículo' : language === 'fr' ? 'Type de véhicule' : language === 'de' ? 'Fahrzeugtyp' : language === 'it' ? 'Tipo di veicolo' : 'Vehicle Type'}</Label>
                  <Select value={formData.vehicle_type} onValueChange={(v) => handleChange('vehicle_type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        {language === 'he' ? 'אין רכב' : language === 'ru' ? 'Нет транспорта' : language === 'es' ? 'Sin vehículo' : language === 'fr' ? 'Pas de véhicule' : language === 'de' ? 'Kein Fahrzeug' : language === 'it' ? 'Nessun veicolo' : 'No vehicle'}
                      </SelectItem>
                      <SelectItem value="regular">
                        {language === 'he' ? 'רכב רגיל' : language === 'ru' ? 'Обычный автомобиль' : language === 'es' ? 'Vehículo regular' : language === 'fr' ? 'Véhicule ordinaire' : language === 'de' ? 'Normales Fahrzeug' : language === 'it' ? 'Veicolo normale' : 'Regular vehicle'}
                      </SelectItem>
                      <SelectItem value="4x4">
                        {language === 'he' ? 'רכב שטח (4X4)' : language === 'ru' ? 'Внедорожник 4X4' : language === 'es' ? 'Vehículo 4X4' : language === 'fr' ? 'Véhicule 4X4' : language === 'de' ? '4X4-Fahrzeug' : language === 'it' ? 'Veicolo 4X4' : '4X4 vehicle'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Dog className="w-5 h-5 text-blue-600" />
                    <Label className="cursor-pointer mb-0">
                      {language === 'he' ? 'מטייל עם כלב' : language === 'ru' ? 'Путешествует с собакой' : language === 'es' ? 'Viaja con perro' : language === 'fr' ? 'Voyage avec un chien' : language === 'de' ? 'Reist mit Hund' : language === 'it' ? 'Viaggia con cane' : 'Travels with dog'}
                    </Label>
                  </div>
                  <Switch
                    checked={formData.travels_with_dog}
                    onCheckedChange={(checked) => handleChange('travels_with_dog', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Family Info */}
          {isOwnProfile && editMode && (
            <Card className="mb-6 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  {language === 'he' ? 'מידע משפחתי' : language === 'ru' ? 'Семейная информация' : language === 'es' ? 'Información familiar' : language === 'fr' ? 'Informations familiales' : language === 'de' ? 'Familieninformationen' : language === 'it' ? 'Informazioni familiari' : 'Family Information'}
                </CardTitle>
                <CardDescription>
                  {language === 'he' 
                    ? 'הגדר את טווחי הגילאים של בני המשפחה המטיילים איתך'
                    : language === 'ru'
                    ? 'Укажите возрастные группы членов семьи, путешествующих с вами'
                    : language === 'es'
                    ? 'Establece rangos de edad de familiares que viajan contigo'
                    : language === 'fr'
                    ? 'Définissez les tranches d\'âge des membres de la famille voyageant avec vous'
                    : language === 'de'
                    ? 'Legen Sie Altersgruppen für mitreisende Familienmitglieder fest'
                    : language === 'it'
                    ? 'Imposta le fasce d\'età dei familiari che viaggiano con te'
                    : 'Set age ranges for family members traveling with you'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>{language === 'he' ? 'טווחי גילאי הורים' : language === 'ru' ? 'Возраст родителей' : language === 'es' ? 'Rangos de edad de padres' : language === 'fr' ? 'Tranches d\'âge des parents' : language === 'de' ? 'Altersgruppen Eltern' : language === 'it' ? 'Fasce d\'età genitori' : 'Parent Age Ranges'}</Label>
                  <div className="flex flex-wrap gap-2">
                    {parentAgeRanges.map(range => (
                      <Badge
                        key={range}
                        variant={formData.parent_age_ranges.includes(range) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all py-2 px-3 ${
                          formData.parent_age_ranges.includes(range) 
                            ? 'bg-purple-600 hover:bg-purple-700' 
                            : 'hover:border-purple-500 hover:text-purple-600'
                        }`}
                        onClick={() => togglePreference('parent_age_ranges', range)}
                      >
                        {range}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>{language === 'he' ? 'טווחי גילאי ילדים' : language === 'ru' ? 'Возраст детей' : language === 'es' ? 'Rangos de edad de niños' : language === 'fr' ? 'Tranches d\'âge des enfants' : language === 'de' ? 'Altersgruppen Kinder' : language === 'it' ? 'Fasce d\'età bambini' : 'Children Age Ranges'}</Label>
                  <div className="flex flex-wrap gap-2">
                    {childrenAgeRanges.map(range => (
                      <Badge
                        key={range}
                        variant={formData.children_age_ranges.includes(range) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all py-2 px-3 ${
                          formData.children_age_ranges.includes(range) 
                            ? 'bg-pink-600 hover:bg-pink-700' 
                            : 'hover:border-pink-500 hover:text-pink-600'
                        }`}
                        onClick={() => togglePreference('children_age_ranges', range)}
                      >
                        {range}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preferences */}
          {isOwnProfile && editMode && (
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  {language === 'he' ? 'העדפות טיולים' : language === 'ru' ? 'Предпочтения поездок' : language === 'es' ? 'Preferencias de viaje' : language === 'fr' ? 'Préférences de voyage' : language === 'de' ? 'Reisepräferenzen' : language === 'it' ? 'Preferenze di viaggio' : 'Trip Preferences'}
                </CardTitle>
                <CardDescription>
                  {language === 'he' 
                    ? 'הגדר את ההעדפות שלך לקבלת המלצות מותאמות אישית'
                    : language === 'ru'
                    ? 'Установите предпочтения для персональных рекомендаций'
                    : language === 'es'
                    ? 'Establece tus preferencias para recomendaciones personalizadas'
                    : language === 'fr'
                    ? 'Définissez vos préférences pour des recommandations personnalisées'
                    : language === 'de'
                    ? 'Legen Sie Ihre Präferenzen für personalisierte Empfehlungen fest'
                    : language === 'it'
                    ? 'Imposta le tue preferenze per raccomandazioni personalizzate'
                    : 'Set your preferences for personalized recommendations'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preferred Regions */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    {language === 'he' ? 'אזורים מועדפים' : language === 'ru' ? 'Предпочитаемые регионы' : language === 'es' ? 'Regiones preferidas' : language === 'fr' ? 'Régions préférées' : language === 'de' ? 'Bevorzugte Regionen' : language === 'it' ? 'Regioni preferite' : 'Preferred Regions'}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {regions.map(region => (
                      <Badge
                        key={region}
                        variant={formData.preferred_regions.includes(region) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all py-2 px-3 ${
                          formData.preferred_regions.includes(region) 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'hover:border-blue-500 hover:text-blue-600'
                        }`}
                        onClick={() => togglePreference('preferred_regions', region)}
                      >
                        {t(region)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Preferred Interests */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600" />
                    {language === 'he' ? 'תחומי עניין' : language === 'ru' ? 'Интересы' : language === 'es' ? 'Intereses' : language === 'fr' ? 'Intérêts' : language === 'de' ? 'Interessen' : language === 'it' ? 'Interessi' : 'Interests'}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {interests.map(interest => (
                      <Badge
                        key={interest}
                        variant={formData.preferred_interests.includes(interest) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all py-2 px-3 ${
                          formData.preferred_interests.includes(interest) 
                            ? 'bg-rose-600 hover:bg-rose-700' 
                            : 'hover:border-rose-500 hover:text-rose-600'
                        }`}
                        onClick={() => togglePreference('preferred_interests', interest)}
                      >
                        {t(interest)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {isOwnProfile && editMode && (
            <div className="flex gap-4 justify-end mt-6">
              <Button 
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  // Reset form data
                  const nameParts = user.full_name?.split(' ') || ['', ''];
                  setFormData({
                    first_name: user.first_name || nameParts[0] || '',
                    last_name: user.last_name || nameParts.slice(1).join(' ') || '',
                    profile_image: user.profile_image || '',
                    bio: user.bio || '',
                    phone: user.phone || '',
                    preferred_regions: user.preferred_regions || [],
                    preferred_interests: user.preferred_interests || [],
                    home_region: user.home_region || '',
                    fitness_level: user.fitness_level || 'moderate',
                    vehicle_type: user.vehicle_type || 'none',
                    parent_age_ranges: user.parent_age_ranges || [],
                    children_age_ranges: user.children_age_ranges || [],
                    travels_with_dog: user.travels_with_dog || false,
                  });
                }}
                disabled={loading}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                {t('cancel')}
              </Button>
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 gap-2 min-w-[140px]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {language === 'he' ? 'שמור שינויים' : language === 'ru' ? 'Сохранить изменения' : language === 'es' ? 'Guardar cambios' : language === 'fr' ? 'Enregistrer les modifications' : language === 'de' ? 'Änderungen speichern' : language === 'it' ? 'Salva modifiche' : 'Save Changes'}
              </Button>
            </div>
          )}

          {/* Delete Account Section */}
          {isOwnProfile && !editMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6"
            >
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {language === 'he' ? 'אזור מסוכן' : language === 'ru' ? 'Опасная зона' : language === 'es' ? 'Zona peligrosa' : language === 'fr' ? 'Zone dangereuse' : language === 'de' ? 'Gefahrenbereich' : language === 'it' ? 'Zona pericolosa' : 'Danger Zone'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
                    {language === 'he' 
                      ? 'מחיקת החשבון היא פעולה בלתי הפיכה. כל הנתונים שלך, כולל טיולים שארגנת, יימחקו לצמיתות.'
                      : language === 'ru'
                      ? 'Удаление аккаунта необратимо. Все ваши данные, включая организованные поездки, будут удалены навсегда.'
                      : language === 'es'
                      ? 'La eliminación de cuenta es irreversible. Todos tus datos, incluidos viajes organizados, se eliminarán permanentemente.'
                      : language === 'fr'
                      ? 'La suppression du compte est irréversible. Toutes vos données, y compris les voyages organisés, seront définitivement supprimées.'
                      : language === 'de'
                      ? 'Die Kontolöschung ist unwiderruflich. Alle Ihre Daten, einschließlich organisierter Reisen, werden dauerhaft gelöscht.'
                      : language === 'it'
                      ? 'L\'eliminazione dell\'account è irreversibile. Tutti i tuoi dati, compresi i viaggi organizzati, saranno eliminati permanentemente.'
                      : 'Account deletion is irreversible. All your data, including organized trips, will be permanently deleted.'}
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {language === 'he' ? 'מחק את החשבון שלי' : language === 'ru' ? 'Удалить мой аккаунт' : language === 'es' ? 'Eliminar mi cuenta' : language === 'fr' ? 'Supprimer mon compte' : language === 'de' ? 'Mein Konto löschen' : language === 'it' ? 'Elimina il mio account' : 'Delete My Account'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Delete Account Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent dir={language === 'he' ? 'rtl' : 'ltr'}>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-6 h-6" />
                {language === 'he' ? 'האם אתה בטוח?' : language === 'ru' ? 'Вы уверены?' : language === 'es' ? '¿Estás seguro?' : language === 'fr' ? 'Êtes-vous sûr ?' : language === 'de' ? 'Sind Sie sicher?' : language === 'it' ? 'Sei sicuro?' : 'Are you sure?'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base" dir={language === 'he' ? 'rtl' : 'ltr'}>
                {language === 'he' 
                  ? 'פעולה זו תמחק את חשבונך לצמיתות ולא ניתן לבטל אותה. כל הנתונים שלך יימחקו, כולל:'
                  : language === 'ru'
                  ? 'Это действие навсегда удалит ваш аккаунт и не может быть отменено. Все ваши данные будут удалены, включая:'
                  : language === 'es'
                  ? 'Esta acción eliminará permanentemente tu cuenta y no se puede deshacer. Todos tus datos serán eliminados, incluyendo:'
                  : language === 'fr'
                  ? 'Cette action supprimera définitivement votre compte et ne peut pas être annulée. Toutes vos données seront supprimées, y compris :'
                  : language === 'de'
                  ? 'Diese Aktion wird Ihr Konto dauerhaft löschen und kann nicht rückgängig gemacht werden. Alle Ihre Daten werden gelöscht, einschließlich:'
                  : language === 'it'
                  ? 'Questa azione eliminerà permanentemente il tuo account e non può essere annullata. Tutti i tuoi dati verranno eliminati, inclusi:'
                  : 'This action will permanently delete your account and cannot be undone. All your data will be deleted, including:'}
                <ul className="list-disc list-inside mt-3 space-y-1 text-gray-700">
                  <li>{language === 'he' ? 'פרטים אישיים' : language === 'ru' ? 'Личная информация' : language === 'es' ? 'Información personal' : language === 'fr' ? 'Informations personnelles' : language === 'de' ? 'Persönliche Informationen' : language === 'it' ? 'Informazioni personali' : 'Personal information'}</li>
                  <li>{language === 'he' ? 'טיולים שארגנת' : language === 'ru' ? 'Организованные поездки' : language === 'es' ? 'Viajes organizados' : language === 'fr' ? 'Voyages organisés' : language === 'de' ? 'Organisierte Reisen' : language === 'it' ? 'Viaggi organizzati' : 'Organized trips'}</li>
                  <li>{language === 'he' ? 'השתתפויות בטיולים' : language === 'ru' ? 'Участие в поездках' : language === 'es' ? 'Participaciones en viajes' : language === 'fr' ? 'Participations aux voyages' : language === 'de' ? 'Teilnahme an Reisen' : language === 'it' ? 'Partecipazioni a viaggi' : 'Trip participations'}</li>
                  <li>{language === 'he' ? 'טיולים שמורים' : language === 'ru' ? 'Сохранённые поездки' : language === 'es' ? 'Viajes guardados' : language === 'fr' ? 'Voyages sauvegardés' : language === 'de' ? 'Gespeicherte Reisen' : language === 'it' ? 'Viaggi salvati' : 'Saved trips'}</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>
                {language === 'he' ? 'ביטול' : language === 'ru' ? 'Отмена' : language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'de' ? 'Abbrechen' : language === 'it' ? 'Annulla' : 'Cancel'}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'he' ? 'מוחק...' : language === 'ru' ? 'Удаление...' : language === 'es' ? 'Eliminando...' : language === 'fr' ? 'Suppression...' : language === 'de' ? 'Löschen...' : language === 'it' ? 'Eliminazione...' : 'Deleting...'}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {language === 'he' ? 'כן, מחק את החשבון' : language === 'ru' ? 'Да, удалить аккаунт' : language === 'es' ? 'Sí, eliminar cuenta' : language === 'fr' ? 'Oui, supprimer le compte' : language === 'de' ? 'Ja, Konto löschen' : language === 'it' ? 'Sì, elimina account' : 'Yes, delete account'}
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}