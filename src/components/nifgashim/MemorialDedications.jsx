import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Send, Loader2, MessageCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function MemorialDedications({ memorial, user, tripId }) {
  const { language, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [newDedication, setNewDedication] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translations = {
    he: {
      dedications: "הקדשות וזיכרונות",
      addDedication: "הוסף הקדשה אישית",
      placeholder: "שתף זיכרון או הקדשה אישית...",
      submit: "שלח",
      noDedications: "היו הראשונים להוסיף הקדשה",
      dedicationAdded: "ההקדשה נוספה בהצלחה",
      loginRequired: "יש להתחבר כדי להוסיף הקדשה"
    },
    en: {
      dedications: "Dedications & Memories",
      addDedication: "Add Personal Dedication",
      placeholder: "Share a memory or personal dedication...",
      submit: "Submit",
      noDedications: "Be the first to add a dedication",
      dedicationAdded: "Dedication added successfully",
      loginRequired: "Please login to add a dedication"
    },
    ru: {
      dedications: "Посвящения и воспоминания",
      addDedication: "Добавить посвящение",
      placeholder: "Поделитесь воспоминанием...",
      submit: "Отправить",
      noDedications: "Будьте первым",
      dedicationAdded: "Посвящение добавлено",
      loginRequired: "Войдите для добавления"
    },
    es: {
      dedications: "Dedicatorias y Recuerdos",
      addDedication: "Agregar Dedicatoria",
      placeholder: "Comparte un recuerdo...",
      submit: "Enviar",
      noDedications: "Sé el primero en agregar",
      dedicationAdded: "Dedicatoria agregada",
      loginRequired: "Inicia sesión para agregar"
    },
    fr: {
      dedications: "Dédicaces et Souvenirs",
      addDedication: "Ajouter une Dédicace",
      placeholder: "Partagez un souvenir...",
      submit: "Envoyer",
      noDedications: "Soyez le premier à ajouter",
      dedicationAdded: "Dédicace ajoutée",
      loginRequired: "Connectez-vous pour ajouter"
    },
    de: {
      dedications: "Widmungen und Erinnerungen",
      addDedication: "Widmung hinzufügen",
      placeholder: "Teile eine Erinnerung...",
      submit: "Senden",
      noDedications: "Sei der Erste",
      dedicationAdded: "Widmung hinzugefügt",
      loginRequired: "Bitte einloggen"
    },
    it: {
      dedications: "Dediche e Ricordi",
      addDedication: "Aggiungi Dedica",
      placeholder: "Condividi un ricordo...",
      submit: "Invia",
      noDedications: "Sii il primo ad aggiungere",
      dedicationAdded: "Dedica aggiunta",
      loginRequired: "Accedi per aggiungere"
    }
  };

  const trans = translations[language] || translations.en;

  const updateMemorialMutation = useMutation({
    mutationFn: (newDedications) => 
      base44.entities.Memorial.update(memorial.id, { dedications: newDedications }),
    onSuccess: () => {
      queryClient.invalidateQueries(['memorials', tripId]);
      toast.success(trans.dedicationAdded);
    }
  });

  const handleSubmitDedication = async () => {
    if (!user) {
      toast.error(trans.loginRequired);
      return;
    }

    if (!newDedication.trim()) return;

    setIsSubmitting(true);
    
    const dedication = {
      id: `ded_${Date.now()}`,
      author_email: user.email,
      author_name: user.full_name || user.first_name || user.email.split('@')[0],
      content: newDedication.trim(),
      timestamp: new Date().toISOString()
    };

    const existingDedications = memorial.dedications || [];
    await updateMemorialMutation.mutateAsync([...existingDedications, dedication]);
    
    setNewDedication('');
    setIsSubmitting(false);
  };

  const dedications = memorial.dedications || [];

  return (
    <Card className="bg-gradient-to-br from-rose-50 to-orange-50 border-2 border-rose-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5 text-rose-600" />
          {trans.dedications}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Dedication Form */}
        <div className="space-y-3">
          <Textarea
            placeholder={trans.placeholder}
            value={newDedication}
            onChange={(e) => setNewDedication(e.target.value)}
            className="min-h-[80px] bg-white/80 border-rose-200 focus:border-rose-400"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
          <Button
            onClick={handleSubmitDedication}
            disabled={isSubmitting || !newDedication.trim()}
            className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {trans.submit}
          </Button>
        </div>

        {/* Dedications List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {dedications.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                <Heart className="w-8 h-8 mx-auto mb-2 text-rose-300" />
                {trans.noDedications}
              </div>
            ) : (
              dedications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((dedication, idx) => (
                <motion.div
                  key={dedication.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-lg p-4 shadow-sm border border-rose-100"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 border-2 border-rose-200">
                      <AvatarFallback className="bg-gradient-to-br from-rose-400 to-orange-400 text-white">
                        {dedication.author_name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-900">
                          {dedication.author_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(dedication.timestamp), 'dd/MM/yy HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {dedication.content}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}