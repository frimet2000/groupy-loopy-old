import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Save, ArrowLeft, Calendar as CalendarIcon, MapPin, Image, 
  Sparkles, Loader2, Globe, Lock, X, Plus, Tag
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";


const translations = {
  en: {
    newJournal: 'New Journal Entry',
    editJournal: 'Edit Journal Entry',
    title: 'Title',
    titlePlaceholder: 'Give your story a title...',
    content: 'Your Story',
    contentPlaceholder: 'Write about your adventure...',
    travelDate: 'Travel Date',
    location: 'Location',
    locationPlaceholder: 'Where did you go?',
    coverImage: 'Cover Image',
    uploadCover: 'Upload Cover',
    addImages: 'Add Images',
    tags: 'Tags',
    tagsPlaceholder: 'Add tags...',
    visibility: 'Visibility',
    public: 'Public',
    private: 'Private',
    publicDesc: 'Anyone can see this journal',
    privateDesc: 'Only you can see this journal',
    save: 'Save',
    saving: 'Saving...',
    aiImprove: 'Improve with AI',
    aiImproving: 'Improving...',
    aiTooltip: 'Let AI help make your writing more engaging and professional',
    selectTrip: 'Link to Trip',
    noTrip: 'No linked trip',
    back: 'Back',
    saved: 'Journal saved!',
    improved: 'Text improved!',
  },
  he: {
    newJournal: 'רשומה חדשה ביומן',
    editJournal: 'עריכת רשומה',
    title: 'כותרת',
    titlePlaceholder: 'תנו לסיפור שלכם כותרת...',
    content: 'הסיפור שלכם',
    contentPlaceholder: 'כתבו על ההרפתקה שלכם...',
    travelDate: 'תאריך הטיול',
    location: 'מיקום',
    locationPlaceholder: 'לאן נסעתם?',
    coverImage: 'תמונת שער',
    uploadCover: 'העלאת שער',
    addImages: 'הוספת תמונות',
    tags: 'תגיות',
    tagsPlaceholder: 'הוסיפו תגיות...',
    visibility: 'נראות',
    public: 'ציבורי',
    private: 'פרטי',
    publicDesc: 'כולם יכולים לראות את היומן',
    privateDesc: 'רק אתם יכולים לראות',
    save: 'שמירה',
    saving: 'שומר...',
    aiImprove: 'שיפור עם AI',
    aiImproving: 'משפר...',
    aiTooltip: 'תנו ל-AI לעזור להפוך את הכתיבה למרתקת ומקצועית יותר',
    selectTrip: 'קישור לטיול',
    noTrip: 'ללא טיול מקושר',
    back: 'חזרה',
    saved: 'היומן נשמר!',
    improved: 'הטקסט שופר!',
  },
  ru: {
    newJournal: 'Новая запись',
    editJournal: 'Редактировать запись',
    title: 'Заголовок',
    titlePlaceholder: 'Дайте вашей истории название...',
    content: 'Ваша история',
    contentPlaceholder: 'Напишите о вашем приключении...',
    travelDate: 'Дата поездки',
    location: 'Место',
    locationPlaceholder: 'Куда вы ездили?',
    coverImage: 'Обложка',
    uploadCover: 'Загрузить обложку',
    addImages: 'Добавить фото',
    tags: 'Теги',
    tagsPlaceholder: 'Добавить теги...',
    visibility: 'Видимость',
    public: 'Публичный',
    private: 'Приватный',
    publicDesc: 'Все могут видеть этот дневник',
    privateDesc: 'Только вы можете видеть',
    save: 'Сохранить',
    saving: 'Сохранение...',
    aiImprove: 'Улучшить с AI',
    aiImproving: 'Улучшение...',
    aiTooltip: 'Позвольте AI сделать ваш текст более увлекательным',
    selectTrip: 'Связать с поездкой',
    noTrip: 'Без связанной поездки',
    back: 'Назад',
    saved: 'Дневник сохранён!',
    improved: 'Текст улучшен!',
  },
  es: {
    newJournal: 'Nueva Entrada',
    editJournal: 'Editar Entrada',
    title: 'Título',
    titlePlaceholder: 'Dale un título a tu historia...',
    content: 'Tu Historia',
    contentPlaceholder: 'Escribe sobre tu aventura...',
    travelDate: 'Fecha del Viaje',
    location: 'Ubicación',
    locationPlaceholder: '¿A dónde fuiste?',
    coverImage: 'Imagen de Portada',
    uploadCover: 'Subir Portada',
    addImages: 'Añadir Imágenes',
    tags: 'Etiquetas',
    tagsPlaceholder: 'Añadir etiquetas...',
    visibility: 'Visibilidad',
    public: 'Público',
    private: 'Privado',
    publicDesc: 'Todos pueden ver este diario',
    privateDesc: 'Solo tú puedes ver',
    save: 'Guardar',
    saving: 'Guardando...',
    aiImprove: 'Mejorar con AI',
    aiImproving: 'Mejorando...',
    aiTooltip: 'Deja que AI haga tu escritura más atractiva',
    selectTrip: 'Vincular a Viaje',
    noTrip: 'Sin viaje vinculado',
    back: 'Volver',
    saved: '¡Diario guardado!',
    improved: '¡Texto mejorado!',
  },
  fr: {
    newJournal: 'Nouvelle Entrée',
    editJournal: 'Modifier l\'Entrée',
    title: 'Titre',
    titlePlaceholder: 'Donnez un titre à votre histoire...',
    content: 'Votre Histoire',
    contentPlaceholder: 'Écrivez sur votre aventure...',
    travelDate: 'Date du Voyage',
    location: 'Lieu',
    locationPlaceholder: 'Où êtes-vous allé?',
    coverImage: 'Image de Couverture',
    uploadCover: 'Télécharger',
    addImages: 'Ajouter des Images',
    tags: 'Tags',
    tagsPlaceholder: 'Ajouter des tags...',
    visibility: 'Visibilité',
    public: 'Public',
    private: 'Privé',
    publicDesc: 'Tout le monde peut voir ce journal',
    privateDesc: 'Vous seul pouvez voir',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    aiImprove: 'Améliorer avec AI',
    aiImproving: 'Amélioration...',
    aiTooltip: 'Laissez l\'AI rendre votre écriture plus engageante',
    selectTrip: 'Lier au Voyage',
    noTrip: 'Pas de voyage lié',
    back: 'Retour',
    saved: 'Journal enregistré!',
    improved: 'Texte amélioré!',
  },
  de: {
    newJournal: 'Neuer Eintrag',
    editJournal: 'Eintrag Bearbeiten',
    title: 'Titel',
    titlePlaceholder: 'Geben Sie Ihrer Geschichte einen Titel...',
    content: 'Ihre Geschichte',
    contentPlaceholder: 'Schreiben Sie über Ihr Abenteuer...',
    travelDate: 'Reisedatum',
    location: 'Ort',
    locationPlaceholder: 'Wohin sind Sie gereist?',
    coverImage: 'Titelbild',
    uploadCover: 'Hochladen',
    addImages: 'Bilder Hinzufügen',
    tags: 'Tags',
    tagsPlaceholder: 'Tags hinzufügen...',
    visibility: 'Sichtbarkeit',
    public: 'Öffentlich',
    private: 'Privat',
    publicDesc: 'Jeder kann dieses Tagebuch sehen',
    privateDesc: 'Nur Sie können es sehen',
    save: 'Speichern',
    saving: 'Speichern...',
    aiImprove: 'Mit AI verbessern',
    aiImproving: 'Verbessern...',
    aiTooltip: 'Lassen Sie AI Ihren Text ansprechender gestalten',
    selectTrip: 'Mit Reise verknüpfen',
    noTrip: 'Keine verknüpfte Reise',
    back: 'Zurück',
    saved: 'Tagebuch gespeichert!',
    improved: 'Text verbessert!',
  },
  it: {
    newJournal: 'Nuova Voce',
    editJournal: 'Modifica Voce',
    title: 'Titolo',
    titlePlaceholder: 'Dai un titolo alla tua storia...',
    content: 'La Tua Storia',
    contentPlaceholder: 'Scrivi della tua avventura...',
    travelDate: 'Data del Viaggio',
    location: 'Luogo',
    locationPlaceholder: 'Dove sei andato?',
    coverImage: 'Immagine di Copertina',
    uploadCover: 'Carica',
    addImages: 'Aggiungi Immagini',
    tags: 'Tag',
    tagsPlaceholder: 'Aggiungi tag...',
    visibility: 'Visibilità',
    public: 'Pubblico',
    private: 'Privato',
    publicDesc: 'Tutti possono vedere questo diario',
    privateDesc: 'Solo tu puoi vedere',
    save: 'Salva',
    saving: 'Salvataggio...',
    aiImprove: 'Migliora con AI',
    aiImproving: 'Miglioramento...',
    aiTooltip: 'Lascia che l\'AI renda la tua scrittura più coinvolgente',
    selectTrip: 'Collega al Viaggio',
    noTrip: 'Nessun viaggio collegato',
    back: 'Indietro',
    saved: 'Diario salvato!',
    improved: 'Testo migliorato!',
  },
};

export default function JournalEditor() {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const t = translations[language] || translations.en;
  
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [aiImproving, setAiImproving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [journal, setJournal] = useState({
    title: '',
    content: '',
    travel_date: '',
    location: '',
    cover_image: '',
    images: [],
    tags: [],
    is_public: false,
    trip_id: '',
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        navigate(createPageUrl('Home'));
      }
    };
    fetchUser();
  }, []);

  // Fetch existing journal if editing
  const { data: existingJournal } = useQuery({
    queryKey: ['journal', editId],
    queryFn: () => base44.entities.TravelJournal.filter({ id: editId }),
    enabled: !!editId,
  });

  useEffect(() => {
    if (existingJournal && existingJournal.length > 0) {
      setJournal(existingJournal[0]);
    }
  }, [existingJournal]);

  // Fetch user's trips for linking
  const { data: trips = [] } = useQuery({
    queryKey: ['userTrips', user?.email],
    queryFn: () => base44.entities.Trip.filter({ organizer_email: user?.email }),
    enabled: !!user?.email,
  });

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingCover(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setJournal({ ...journal, cover_image: file_url });
    } catch (error) {
      toast.error('Error uploading image');
    }
    setUploadingCover(false);
  };

  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setUploadingImages(true);
    try {
      const uploadedImages = await Promise.all(
        files.map(async (file) => {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          return { url: file_url, caption: '' };
        })
      );
      setJournal({ ...journal, images: [...journal.images, ...uploadedImages] });
    } catch (error) {
      toast.error('Error uploading images');
    }
    setUploadingImages(false);
  };

  const removeImage = (index) => {
    const newImages = journal.images.filter((_, i) => i !== index);
    setJournal({ ...journal, images: newImages });
  };

  const addTag = () => {
    if (newTag.trim() && !journal.tags.includes(newTag.trim())) {
      setJournal({ ...journal, tags: [...journal.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setJournal({ ...journal, tags: journal.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleAIImprove = async () => {
    if (!journal.content.trim()) {
      toast.error(language === 'he' ? 'נא לכתוב טקסט לפני שיפור' : 'Please write some text first');
      return;
    }

    setAiImproving(true);
    try {
      const langName = language === 'he' ? 'Hebrew' : language === 'ru' ? 'Russian' : 
                       language === 'es' ? 'Spanish' : language === 'fr' ? 'French' :
                       language === 'de' ? 'German' : language === 'it' ? 'Italian' : 'English';
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional travel writer and editor. Improve the following travel journal entry to make it more engaging, vivid, and professional while keeping the author's voice and original meaning. Add sensory details, improve flow, and make it more captivating to read. Keep it in ${langName}. Maintain the same approximate length. Return only the improved text without any explanations or meta-comments:

${journal.content}`,
      });

      setJournal({ ...journal, content: result });
      toast.success(t.improved);
    } catch (error) {
      toast.error('Error improving text');
    }
    setAiImproving(false);
  };

  const handleSave = async () => {
    if (!journal.title.trim() || !journal.content.trim()) {
      toast.error(language === 'he' ? 'נא למלא כותרת ותוכן' : 'Please fill in title and content');
      return;
    }

    setSaving(true);
    try {
      const userName = (user.first_name && user.last_name) 
        ? `${user.first_name} ${user.last_name}` 
        : user.full_name;

      const journalData = {
        ...journal,
        author_email: user.email,
        author_name: userName,
      };

      if (editId) {
        await base44.entities.TravelJournal.update(editId, journalData);
      } else {
        await base44.entities.TravelJournal.create(journalData);
      }

      toast.success(t.saved);
      navigate(createPageUrl('TravelJournal'));
    } catch (error) {
      toast.error('Error saving journal');
    }
    setSaving(false);
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('TravelJournal'))}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </Button>
          <h1 className="font-bold text-lg">{editId ? t.editJournal : t.newJournal}</h1>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? t.saving : t.save}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Title */}
        <div>
          <Label className="text-base font-semibold">{t.title}</Label>
          <Input
            value={journal.title}
            onChange={(e) => setJournal({ ...journal, title: e.target.value })}
            placeholder={t.titlePlaceholder}
            className="mt-2 text-lg h-12"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        {/* Cover Image */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Image className="w-4 h-4" />
              {t.coverImage}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {journal.cover_image ? (
              <div className="relative rounded-xl overflow-hidden h-48">
                <img src={journal.cover_image} alt="Cover" className="w-full h-full object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => setJournal({ ...journal, cover_image: '' })}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="file" className="hidden" accept="image/*" onChange={handleCoverUpload} />
                {uploadingCover ? (
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                ) : (
                  <>
                    <Image className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">{t.uploadCover}</span>
                  </>
                )}
              </label>
            )}
          </CardContent>
        </Card>

        {/* Content with AI Button */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t.content}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIImprove}
                disabled={aiImproving}
                className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                {aiImproving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {aiImproving ? t.aiImproving : t.aiImprove}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t.aiTooltip}</p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={journal.content}
              onChange={(e) => setJournal({ ...journal, content: e.target.value })}
              placeholder={t.contentPlaceholder}
              className="min-h-[300px] text-base resize-none"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </CardContent>
        </Card>

        {/* Additional Images */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Image className="w-4 h-4" />
              {t.addImages}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {journal.images.map((img, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleImagesUpload} />
                {uploadingImages ? (
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                ) : (
                  <Plus className="w-6 h-6 text-gray-400" />
                )}
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Meta Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Date */}
          <div>
            <Label className="text-base font-semibold flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {t.travelDate}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full mt-2 justify-start">
                  {journal.travel_date ? format(new Date(journal.travel_date), 'PPP') : t.travelDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={journal.travel_date ? new Date(journal.travel_date) : undefined}
                  onSelect={(date) => setJournal({ ...journal, travel_date: date?.toISOString() })}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Location */}
          <div>
            <Label className="text-base font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {t.location}
            </Label>
            <Input
              value={journal.location}
              onChange={(e) => setJournal({ ...journal, location: e.target.value })}
              placeholder={t.locationPlaceholder}
              className="mt-2"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <Label className="text-base font-semibold flex items-center gap-2">
            <Tag className="w-4 h-4" />
            {t.tags}
          </Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {journal.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                {tag}
                <button onClick={() => removeTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder={t.tagsPlaceholder}
              className="w-32 h-8 text-sm"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        {/* Link to Trip */}
        {trips.length > 0 && (
          <div>
            <Label className="text-base font-semibold">{t.selectTrip}</Label>
            <Select
              value={journal.trip_id || 'none'}
              onValueChange={(value) => setJournal({ ...journal, trip_id: value === 'none' ? '' : value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.noTrip}</SelectItem>
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id}>
                    {trip.title || trip.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Visibility */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {journal.is_public ? (
                  <Globe className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-500" />
                )}
                <div>
                  <p className="font-semibold">{journal.is_public ? t.public : t.private}</p>
                  <p className="text-sm text-gray-500">
                    {journal.is_public ? t.publicDesc : t.privateDesc}
                  </p>
                </div>
              </div>
              <Switch
                checked={journal.is_public}
                onCheckedChange={(checked) => setJournal({ ...journal, is_public: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}