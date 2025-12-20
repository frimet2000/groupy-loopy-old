import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Package, Plus, Trash2, Coffee, Utensils, Music, Tent, Flashlight, Eye, EyeOff, Users, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TripContributions({ trip, currentUserEmail, onUpdate }) {
  const { language, isRTL } = useLanguage();
  const [newItem, setNewItem] = useState('');
  const [adding, setAdding] = useState(false);
  const [visibility, setVisibility] = useState('everyone'); // 'everyone', 'only_me', 'selected'
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [showVisibilityDialog, setShowVisibilityDialog] = useState(false);

  // Get all my contributions with visibility settings
  const myContributions = trip.contributions?.filter(c => c.participant_email === currentUserEmail) || [];
  
  // Filter other participants' contributions based on visibility
  const otherContributions = trip.contributions?.filter(c => {
    if (c.participant_email === currentUserEmail) return false;
    
    // Check visibility
    if (c.visibility === 'only_me') return false;
    if (c.visibility === 'selected') {
      return c.visible_to?.includes(currentUserEmail);
    }
    return true; // 'everyone' or no visibility set (default)
  }) || [];

  const handleAddContribution = async () => {
    if (!newItem.trim()) {
      toast.error(language === 'he' ? 'נא להזין פריט' :
                   language === 'ru' ? 'Введите предмет' :
                   language === 'es' ? 'Ingresa un artículo' :
                   language === 'fr' ? 'Veuillez saisir un article' :
                   language === 'de' ? 'Bitte geben Sie einen Artikel ein' :
                   language === 'it' ? 'Inserisci un articolo' :
                   'Please enter an item');
      return;
    }

    setAdding(true);
    try {
      const participant = trip.participants?.find(p => p.email === currentUserEmail);
      const userName = participant?.name || currentUserEmail;

      const newContribution = {
        id: Date.now().toString(),
        participant_email: currentUserEmail,
        participant_name: userName,
        item: newItem.trim(),
        timestamp: new Date().toISOString(),
        visibility: visibility,
        visible_to: visibility === 'selected' ? selectedParticipants : []
      };

      const updatedContributions = [...(trip.contributions || []), newContribution];
      await base44.entities.Trip.update(trip.id, { contributions: updatedContributions });
      
      setNewItem('');
      setVisibility('everyone');
      setSelectedParticipants([]);
      onUpdate();
      toast.success(language === 'he' ? 'הפריט נוסף בהצלחה' :
                     language === 'ru' ? 'Предмет успешно добавлен' :
                     language === 'es' ? 'Artículo agregado exitosamente' :
                     language === 'fr' ? 'Article ajouté avec succès' :
                     language === 'de' ? 'Artikel erfolgreich hinzugefügt' :
                     language === 'it' ? 'Articolo aggiunto con successo' :
                     'Item added successfully');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהוספת פריט' :
                   language === 'ru' ? 'Ошибка добавления предмета' :
                   language === 'es' ? 'Error al agregar artículo' :
                   language === 'fr' ? 'Erreur lors de l\'ajout' :
                   language === 'de' ? 'Fehler beim Hinzufügen' :
                   language === 'it' ? 'Errore durante l\'aggiunta' :
                   'Error adding item');
    }
    setAdding(false);
  };

  const handleDeleteContribution = async (contributionId) => {
    try {
      const updatedContributions = trip.contributions.filter(c => c.id !== contributionId);
      await base44.entities.Trip.update(trip.id, { contributions: updatedContributions });
      onUpdate();
      toast.success(language === 'he' ? 'הפריט הוסר' :
                     language === 'ru' ? 'Предмет удален' :
                     language === 'es' ? 'Artículo eliminado' :
                     language === 'fr' ? 'Article supprimé' :
                     language === 'de' ? 'Artikel entfernt' :
                     language === 'it' ? 'Articolo rimosso' :
                     'Item removed');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה במחיקת פריט' :
                   language === 'ru' ? 'Ошибка удаления предмета' :
                   language === 'es' ? 'Error al eliminar artículo' :
                   language === 'fr' ? 'Erreur lors de la suppression' :
                   language === 'de' ? 'Fehler beim Löschen' :
                   language === 'it' ? 'Errore durante l\'eliminazione' :
                   'Error deleting item');
    }
  };

  const getVisibilityIcon = (contrib) => {
    if (contrib.visibility === 'only_me') return <Lock className="w-3 h-3 text-gray-500" />;
    if (contrib.visibility === 'selected') return <Users className="w-3 h-3 text-blue-500" />;
    return <Eye className="w-3 h-3 text-green-500" />;
  };

  const getVisibilityLabel = (contrib) => {
    if (contrib.visibility === 'only_me') return language === 'he' ? 'רק אני' : 'Only Me';
    if (contrib.visibility === 'selected') return language === 'he' ? 'נבחרים' : 'Selected';
    return language === 'he' ? 'כולם' : 'Everyone';
  };

  const otherParticipants = trip.participants?.filter(p => p.email !== currentUserEmail) || [];

  const suggestedItems = [
    { icon: Coffee, label: language === 'he' ? 'קפה' : language === 'ru' ? 'Кофе' : language === 'es' ? 'Café' : language === 'fr' ? 'Café' : language === 'de' ? 'Kaffee' : language === 'it' ? 'Caffè' : 'Coffee' },
    { icon: Utensils, label: language === 'he' ? 'אוכל' : language === 'ru' ? 'Еда' : language === 'es' ? 'Comida' : language === 'fr' ? 'Nourriture' : language === 'de' ? 'Essen' : language === 'it' ? 'Cibo' : 'Food' },
    { icon: Music, label: language === 'he' ? 'רמקול' : language === 'ru' ? 'Колонка' : language === 'es' ? 'Altavoz' : language === 'fr' ? 'Haut-parleur' : language === 'de' ? 'Lautsprecher' : language === 'it' ? 'Altoparlante' : 'Speaker' },
    { icon: Tent, label: language === 'he' ? 'ערסל' : language === 'ru' ? 'Гамак' : language === 'es' ? 'Hamaca' : language === 'fr' ? 'Hamac' : language === 'de' ? 'Hängematte' : language === 'it' ? 'Amaca' : 'Hammock' },
    { icon: Flashlight, label: language === 'he' ? 'פנס' : language === 'ru' ? 'Фонарь' : language === 'es' ? 'Linterna' : language === 'fr' ? 'Lampe' : language === 'de' ? 'Taschenlampe' : language === 'it' ? 'Torcia' : 'Flashlight' }
  ];

  return (
    <Card className="border-2 border-indigo-100">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-3" dir={isRTL ? 'rtl' : 'ltr'}>
          <Package className="w-6 h-6 text-indigo-600" />
          {language === 'he' ? 'מה אני מביא' : 
           language === 'ru' ? 'Что я беру' :
           language === 'es' ? 'Qué traigo' :
           language === 'fr' ? 'Ce que j\'apporte' :
           language === 'de' ? 'Was ich mitbringe' :
           language === 'it' ? 'Cosa porto' :
           'What I\'m Bringing'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Add New Item */}
        <div className="space-y-3">
          <div className="flex gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={language === 'he' ? 'למשל: קפה, ערסל, רמקול...' :
                           language === 'ru' ? 'напр., Кофе, Гамак, Колонка...' :
                           language === 'es' ? 'ej., Café, Hamaca, Altavoz...' :
                           language === 'fr' ? 'ex., Café, Hamac, Haut-parleur...' :
                           language === 'de' ? 'z.B., Kaffee, Hängematte, Lautsprecher...' :
                           language === 'it' ? 'es., Caffè, Amaca, Altoparlante...' :
                           'e.g., Coffee, Hammock, Speaker...'}
              onKeyDown={(e) => e.key === 'Enter' && handleAddContribution()}
              className="flex-1"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{language === 'he' ? 'כולם' : 'Everyone'}</span>
                  </div>
                </SelectItem>
                <SelectItem value="only_me">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>{language === 'he' ? 'רק אני' : 'Only Me'}</span>
                  </div>
                </SelectItem>
                <SelectItem value="selected">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{language === 'he' ? 'נבחרים' : 'Selected'}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {visibility === 'selected' && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowVisibilityDialog(true)}
              >
                <Users className="w-4 h-4" />
              </Button>
            )}
            <Button 
              onClick={handleAddContribution}
              disabled={adding || !newItem.trim() || (visibility === 'selected' && selectedParticipants.length === 0)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick Add Suggestions */}
          <div className="flex flex-wrap gap-2">
            {suggestedItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                  onClick={() => setNewItem(item.label)}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {item.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* My Contributions */}
        {myContributions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-indigo-900" dir={isRTL ? 'rtl' : 'ltr'}>
              {language === 'he' ? 'מה אני מביא:' :
               language === 'ru' ? 'Что я беру:' :
               language === 'es' ? 'Qué traigo:' :
               language === 'fr' ? 'Ce que j\'apporte :' :
               language === 'de' ? 'Was ich mitbringe:' :
               language === 'it' ? 'Cosa porto:' :
               'What I\'m Bringing:'}
            </h3>
            <div className="space-y-2">
              {myContributions.map((contribution) => (
                <motion.div
                  key={contribution.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
                      {contribution.item}
                    </span>
                    <Badge variant="outline" className="ml-auto text-xs gap-1">
                      {getVisibilityIcon(contribution)}
                      {getVisibilityLabel(contribution)}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteContribution(contribution.id)}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Other Participants' Contributions */}
        {otherContributions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700" dir={isRTL ? 'rtl' : 'ltr'}>
              {language === 'he' ? 'מה אחרים מביאים:' :
               language === 'ru' ? 'Что приносят другие:' :
               language === 'es' ? 'Qué traen otros:' :
               language === 'fr' ? 'Ce que les autres apportent :' :
               language === 'de' ? 'Was andere mitbringen:' :
               language === 'it' ? 'Cosa portano gli altri:' :
               'What Others are Bringing:'}
            </h3>
            <div className="space-y-2">
              {otherContributions.map((contribution) => (
                <motion.div
                  key={contribution.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-600 text-white text-xs">
                      {contribution.participant_name?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1" dir={isRTL ? 'rtl' : 'ltr'}>
                    <p className="font-medium text-sm text-gray-800">{contribution.participant_name}</p>
                    <p className="text-gray-600 text-sm">{contribution.item}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {myContributions.length === 0 && otherContributions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
              {language === 'he' 
                ? 'טרם נוספו פריטים. היה הראשון לציין מה אתה מביא לטיול!'
                : language === 'ru'
                ? 'Предметы еще не добавлены. Будьте первым, кто поделится, что берете!'
                : language === 'es'
                ? '¡Aún no se agregaron artículos. Sé el primero en compartir lo que traes!'
                : language === 'fr'
                ? 'Aucun article ajouté. Soyez le premier à partager ce que vous apportez !'
                : language === 'de'
                ? 'Noch keine Artikel hinzugefügt. Seien Sie der Erste, der teilt, was Sie mitbringen!'
                : language === 'it'
                ? 'Nessun articolo aggiunto. Sii il primo a condividere cosa porti!'
                : 'No items added yet. Be the first to share what you\'re bringing!'}
            </p>
          </div>
        )}
      </CardContent>

      {/* Select Participants Dialog */}
      <Dialog open={showVisibilityDialog} onOpenChange={setShowVisibilityDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle dir={isRTL ? 'rtl' : 'ltr'}>
              {language === 'he' ? 'בחר משתתפים' : 'Select Participants'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {otherParticipants.map((participant) => (
              <div key={participant.email} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                <Checkbox
                  checked={selectedParticipants.includes(participant.email)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedParticipants([...selectedParticipants, participant.email]);
                    } else {
                      setSelectedParticipants(selectedParticipants.filter(e => e !== participant.email));
                    }
                  }}
                />
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-indigo-600 text-white text-xs">
                    {participant.name?.charAt(0) || 'P'}
                  </AvatarFallback>
                </Avatar>
                <Label className="flex-1 cursor-pointer" dir={isRTL ? 'rtl' : 'ltr'}>
                  {participant.name}
                </Label>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowVisibilityDialog(false)}>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button onClick={() => setShowVisibilityDialog(false)} className="bg-indigo-600 hover:bg-indigo-700">
              {language === 'he' ? 'אישור' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}