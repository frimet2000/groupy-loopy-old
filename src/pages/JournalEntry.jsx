import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, Calendar, MapPin, Heart, Eye, Edit, Trash2, 
  Globe, Lock, Share2, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";
import { motion } from 'framer-motion';
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

const translations = {
  en: {
    back: 'Back',
    edit: 'Edit',
    delete: 'Delete',
    share: 'Share',
    views: 'views',
    likes: 'likes',
    deleteConfirm: 'Are you sure you want to delete this journal entry?',
    deleteDesc: 'This action cannot be undone.',
    cancel: 'Cancel',
    notFound: 'Journal not found',
    copied: 'Link copied!',
  },
  he: {
    back: 'חזרה',
    edit: 'עריכה',
    delete: 'מחיקה',
    share: 'שיתוף',
    views: 'צפיות',
    likes: 'לייקים',
    deleteConfirm: 'האם אתם בטוחים שברצונכם למחוק את הרשומה?',
    deleteDesc: 'לא ניתן לבטל פעולה זו.',
    cancel: 'ביטול',
    notFound: 'היומן לא נמצא',
    copied: 'הקישור הועתק!',
  },
  ru: {
    back: 'Назад',
    edit: 'Редактировать',
    delete: 'Удалить',
    share: 'Поделиться',
    views: 'просмотров',
    likes: 'лайков',
    deleteConfirm: 'Вы уверены, что хотите удалить эту запись?',
    deleteDesc: 'Это действие нельзя отменить.',
    cancel: 'Отмена',
    notFound: 'Дневник не найден',
    copied: 'Ссылка скопирована!',
  },
  es: {
    back: 'Volver',
    edit: 'Editar',
    delete: 'Eliminar',
    share: 'Compartir',
    views: 'vistas',
    likes: 'me gusta',
    deleteConfirm: '¿Estás seguro de que quieres eliminar esta entrada?',
    deleteDesc: 'Esta acción no se puede deshacer.',
    cancel: 'Cancelar',
    notFound: 'Diario no encontrado',
    copied: '¡Enlace copiado!',
  },
  fr: {
    back: 'Retour',
    edit: 'Modifier',
    delete: 'Supprimer',
    share: 'Partager',
    views: 'vues',
    likes: 'j\'aime',
    deleteConfirm: 'Êtes-vous sûr de vouloir supprimer cette entrée?',
    deleteDesc: 'Cette action ne peut pas être annulée.',
    cancel: 'Annuler',
    notFound: 'Journal non trouvé',
    copied: 'Lien copié!',
  },
  de: {
    back: 'Zurück',
    edit: 'Bearbeiten',
    delete: 'Löschen',
    share: 'Teilen',
    views: 'Aufrufe',
    likes: 'Gefällt mir',
    deleteConfirm: 'Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?',
    deleteDesc: 'Diese Aktion kann nicht rückgängig gemacht werden.',
    cancel: 'Abbrechen',
    notFound: 'Tagebuch nicht gefunden',
    copied: 'Link kopiert!',
  },
  it: {
    back: 'Indietro',
    edit: 'Modifica',
    delete: 'Elimina',
    share: 'Condividi',
    views: 'visualizzazioni',
    likes: 'mi piace',
    deleteConfirm: 'Sei sicuro di voler eliminare questa voce?',
    deleteDesc: 'Questa azione non può essere annullata.',
    cancel: 'Annulla',
    notFound: 'Diario non trovato',
    copied: 'Link copiato!',
  },
};

export default function JournalEntry() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const t = translations[language] || translations.en;
  
  const urlParams = new URLSearchParams(window.location.search);
  const journalId = urlParams.get('id');
  
  const [user, setUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [liking, setLiking] = useState(false);

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

  const { data: journals, isLoading } = useQuery({
    queryKey: ['journal', journalId],
    queryFn: () => base44.entities.TravelJournal.filter({ id: journalId }),
    enabled: !!journalId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity
  });

  const journal = journals?.[0];

  // Increment views on load
  useEffect(() => {
    if (journal && user && journal.author_email !== user.email) {
      base44.entities.TravelJournal.update(journal.id, {
        views: (journal.views || 0) + 1
      });
    }
  }, [journal?.id, user?.email]);

  const isOwner = user?.email === journal?.author_email;
  const hasLiked = journal?.likes?.some(l => l.email === user?.email);

  const handleLike = async () => {
    if (!user) {
      toast.error(language === 'he' ? 'יש להתחבר כדי לעשות לייק' : 'Please login to like');
      return;
    }

    setLiking(true);
    try {
      let newLikes = journal.likes || [];
      if (hasLiked) {
        newLikes = newLikes.filter(l => l.email !== user.email);
      } else {
        newLikes = [...newLikes, { email: user.email, timestamp: new Date().toISOString() }];
      }
      await base44.entities.TravelJournal.update(journal.id, { likes: newLikes });
      queryClient.invalidateQueries(['journal', journalId]);
    } catch (error) {
      toast.error('Error');
    }
    setLiking(false);
  };

  const handleDelete = async () => {
    try {
      await base44.entities.TravelJournal.delete(journal.id);
      toast.success(language === 'he' ? 'היומן נמחק' : 'Journal deleted');
      navigate(createPageUrl('TravelJournal'));
    } catch (error) {
      toast.error('Error deleting');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: journal.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t.copied);
      }
    } catch (err) {
      await navigator.clipboard.writeText(url);
      toast.success(t.copied);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <Skeleton className="h-72 w-full" />
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">{t.notFound}</h2>
          <Button onClick={() => navigate(createPageUrl('TravelJournal'))} className="mt-4">
            {t.back}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Cover Image */}
      <div className="relative h-72 md:h-96 bg-gradient-to-br from-emerald-100 to-teal-100">
        {journal.cover_image ? (
          <img
            src={journal.cover_image}
            alt={journal.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('TravelJournal'))}
          className="absolute top-4 left-4 text-white bg-black/20 hover:bg-black/40"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.back}
        </Button>

        {/* Actions */}
        {isOwner && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              onClick={() => navigate(createPageUrl('JournalEditor') + '?id=' + journal.id)}
              className="text-white bg-black/20 hover:bg-black/40"
            >
              <Edit className="w-4 h-4 mr-2" />
              {t.edit}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(true)}
              className="text-white bg-red-500/80 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            <Badge className={journal.is_public ? 'bg-emerald-600 mb-3' : 'bg-gray-600 mb-3'}>
              {journal.is_public ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
              {journal.is_public ? 'Public' : 'Private'}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">{journal.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              {journal.travel_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(journal.travel_date), 'MMMM d, yyyy')}
                </span>
              )}
              {journal.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {journal.location}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Author Info */}
        <Card className="mb-8">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-emerald-600 text-white">
                  {journal.author_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{journal.author_name}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(journal.created_date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-gray-500">
                <Eye className="w-4 h-4" />
                {journal.views || 0} {t.views}
              </span>
              <Button
                variant={hasLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                disabled={liking}
                className={hasLiked ? 'bg-rose-500 hover:bg-rose-600' : ''}
              >
                {liking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Heart className={`w-4 h-4 mr-1 ${hasLiked ? 'fill-white' : ''}`} />
                )}
                {journal.likes?.length || 0}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        {journal.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {journal.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-emerald-100 text-emerald-700">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: journal.content }}
        />

        {/* Gallery */}
        {journal.images?.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-4">
              {language === 'he' ? 'גלריה' : 'Gallery'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {journal.images.map((img, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="aspect-square rounded-xl overflow-hidden"
                >
                  <img
                    src={img.url}
                    alt={img.caption || ''}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}