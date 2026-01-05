import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BookOpen, Globe, Lock, Heart, Eye, Calendar, MapPin, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const translations = {
  en: {
    title: 'Travel Journal',
    subtitle: 'Document your adventures and share your stories',
    newEntry: 'New Entry',
    myJournals: 'My Journals',
    publicJournals: 'Public Journals',
    noJournals: 'No journal entries yet',
    startWriting: 'Start documenting your travels',
    views: 'views',
    likes: 'likes',
    public: 'Public',
    private: 'Private',
  },
  he: {
    title: 'יומן מסע',
    subtitle: 'תעדו את ההרפתקאות שלכם ושתפו את הסיפורים',
    newEntry: 'רשומה חדשה',
    myJournals: 'היומנים שלי',
    publicJournals: 'יומנים ציבוריים',
    noJournals: 'אין רשומות עדיין',
    startWriting: 'התחילו לתעד את המסעות שלכם',
    views: 'צפיות',
    likes: 'לייקים',
    public: 'ציבורי',
    private: 'פרטי',
  },
  ru: {
    title: 'Дневник путешествий',
    subtitle: 'Документируйте свои приключения и делитесь историями',
    newEntry: 'Новая запись',
    myJournals: 'Мои записи',
    publicJournals: 'Публичные записи',
    noJournals: 'Записей пока нет',
    startWriting: 'Начните документировать свои путешествия',
    views: 'просмотров',
    likes: 'лайков',
    public: 'Публичный',
    private: 'Приватный',
  },
  es: {
    title: 'Diario de Viaje',
    subtitle: 'Documenta tus aventuras y comparte tus historias',
    newEntry: 'Nueva Entrada',
    myJournals: 'Mis Diarios',
    publicJournals: 'Diarios Públicos',
    noJournals: 'Sin entradas todavía',
    startWriting: 'Empieza a documentar tus viajes',
    views: 'vistas',
    likes: 'me gusta',
    public: 'Público',
    private: 'Privado',
  },
  fr: {
    title: 'Journal de Voyage',
    subtitle: 'Documentez vos aventures et partagez vos histoires',
    newEntry: 'Nouvelle Entrée',
    myJournals: 'Mes Journaux',
    publicJournals: 'Journaux Publics',
    noJournals: 'Pas encore d\'entrées',
    startWriting: 'Commencez à documenter vos voyages',
    views: 'vues',
    likes: 'j\'aime',
    public: 'Public',
    private: 'Privé',
  },
  de: {
    title: 'Reisetagebuch',
    subtitle: 'Dokumentieren Sie Ihre Abenteuer und teilen Sie Ihre Geschichten',
    newEntry: 'Neuer Eintrag',
    myJournals: 'Meine Tagebücher',
    publicJournals: 'Öffentliche Tagebücher',
    noJournals: 'Noch keine Einträge',
    startWriting: 'Beginnen Sie, Ihre Reisen zu dokumentieren',
    views: 'Aufrufe',
    likes: 'Gefällt mir',
    public: 'Öffentlich',
    private: 'Privat',
  },
  it: {
    title: 'Diario di Viaggio',
    subtitle: 'Documenta le tue avventure e condividi le tue storie',
    newEntry: 'Nuova Voce',
    myJournals: 'I Miei Diari',
    publicJournals: 'Diari Pubblici',
    noJournals: 'Nessuna voce ancora',
    startWriting: 'Inizia a documentare i tuoi viaggi',
    views: 'visualizzazioni',
    likes: 'mi piace',
    public: 'Pubblico',
    private: 'Privato',
  },
};

export default function TravelJournal() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('my');
  const t = translations[language] || translations.en;

  const handleDeleteJournal = async (e, journalId) => {
    e.stopPropagation();
    if (!confirm(language === 'he' ? 'האם למחוק את היומן?' : 'Delete this journal?')) return;
    try {
      await base44.entities.TravelJournal.delete(journalId);
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      toast.success(language === 'he' ? 'היומן נמחק' : 'Journal deleted');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה במחיקה' : 'Error deleting');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        console.log('Not logged in');
      }
    };
    fetchUser();
  }, []);

  const { data: journals = [], isLoading } = useQuery({
    queryKey: ['journals'],
    queryFn: () => base44.entities.TravelJournal.list('-created_date'),
  });

  const myJournals = journals.filter(j => j.author_email === user?.email);
  const publicJournals = journals.filter(j => j.is_public && j.author_email !== user?.email);

  const JournalCard = ({ journal }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="cursor-pointer"
      onClick={() => navigate(createPageUrl('JournalEntry') + '?id=' + journal.id)}
    >
      <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300">
        <div className="relative h-48 bg-gradient-to-br from-emerald-100 to-teal-100">
          {journal.cover_image ? (
            <img
              src={journal.cover_image}
              alt={journal.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-emerald-300" />
            </div>
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            {user?.role === 'admin' && (
              <button
                onClick={(e) => handleDeleteJournal(e, journal.id)}
                className="p-1.5 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <Badge className={journal.is_public ? 'bg-emerald-600' : 'bg-gray-600'}>
              {journal.is_public ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
              {journal.is_public ? (t?.public || 'Public') : (t?.private || 'Private')}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{journal.title}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
            {journal.travel_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(journal.travel_date), 'MMM d, yyyy')}
              </span>
            )}
            {journal.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {journal.location}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {journal.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {journal.likes?.length || 0}
              </span>
            </div>
            <span className="text-xs">{journal.author_name}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BookOpen className="w-20 h-20 text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{t?.noJournals || 'No journals yet'}</h3>
      <p className="text-gray-500 mb-6">{t?.startWriting || 'Start writing'}</p>
      <Button
        onClick={() => navigate(createPageUrl('JournalEditor'))}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        {t?.newEntry || 'New Entry'}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 pb-24">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{t?.title || 'Travel Journal'}</h1>
              <p className="text-emerald-100 text-lg">{t?.subtitle || 'Document your adventures'}</p>
            </div>
            {user && (
              <Button
                onClick={() => navigate(createPageUrl('JournalEditor'))}
                className="bg-white text-emerald-700 hover:bg-emerald-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t?.newEntry || 'New Entry'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="my" className="gap-2">
              <Pencil className="w-4 h-4" />
              {t?.myJournals || 'My Journals'}
            </TabsTrigger>
            <TabsTrigger value="public" className="gap-2">
              <Globe className="w-4 h-4" />
              {t?.publicJournals || 'Public Journals'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : myJournals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myJournals.map((journal) => (
                  <JournalCard key={journal.id} journal={journal} />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value="public">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : publicJournals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicJournals.map((journal) => (
                  <JournalCard key={journal.id} journal={journal} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Globe className="w-20 h-20 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">{t?.noJournals || 'No journals yet'}</h3>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}