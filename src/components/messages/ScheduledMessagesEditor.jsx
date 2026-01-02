import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '../LanguageContext';
import { Plus, Trash2, Clock, Calendar, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScheduledMessagesEditor({ scheduledMessages = [], onChange }) {
  const { language, isRTL } = useLanguage();
  const [editingMessage, setEditingMessage] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const translations = {
    he: {
      title: "הודעות מתוזמנות",
      addMessage: "הוסף הודעה",
      editMessage: "ערוך הודעה",
      date: "תאריך",
      time: "שעה",
      message: "הודעה",
      messageHe: "טקסט בעברית",
      messageEn: "טקסט באנגלית",
      messageRu: "טקסט ברוסית",
      messageEs: "טקסט בספרדית",
      messageFr: "טקסט בצרפתית",
      messageDe: "טקסט בגרמנית",
      messageIt: "טקסט באיטלקית",
      save: "שמור",
      cancel: "ביטול",
      delete: "מחק",
      noMessages: "אין הודעות מתוזמנות",
      sent: "נשלחה",
      scheduled: "מתוזמן"
    },
    en: {
      title: "Scheduled Messages",
      addMessage: "Add Message",
      editMessage: "Edit Message",
      date: "Date",
      time: "Time",
      message: "Message",
      messageHe: "Hebrew Text",
      messageEn: "English Text",
      messageRu: "Russian Text",
      messageEs: "Spanish Text",
      messageFr: "French Text",
      messageDe: "German Text",
      messageIt: "Italian Text",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      noMessages: "No scheduled messages",
      sent: "Sent",
      scheduled: "Scheduled"
    },
    ru: {
      title: "Запланированные сообщения",
      addMessage: "Добавить сообщение",
      editMessage: "Изменить сообщение",
      date: "Дата",
      time: "Время",
      message: "Сообщение",
      messageHe: "Текст на иврите",
      messageEn: "Текст на английском",
      messageRu: "Текст на русском",
      messageEs: "Текст на испанском",
      messageFr: "Текст на французском",
      messageDe: "Текст на немецком",
      messageIt: "Текст на итальянском",
      save: "Сохранить",
      cancel: "Отмена",
      delete: "Удалить",
      noMessages: "Нет запланированных сообщений",
      sent: "Отправлено",
      scheduled: "Запланировано"
    },
    es: {
      title: "Mensajes programados",
      addMessage: "Añadir mensaje",
      editMessage: "Editar mensaje",
      date: "Fecha",
      time: "Hora",
      message: "Mensaje",
      messageHe: "Texto en hebreo",
      messageEn: "Texto en inglés",
      messageRu: "Texto en ruso",
      messageEs: "Texto en español",
      messageFr: "Texto en francés",
      messageDe: "Texto en alemán",
      messageIt: "Texto en italiano",
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      noMessages: "No hay mensajes programados",
      sent: "Enviado",
      scheduled: "Programado"
    },
    fr: {
      title: "Messages programmés",
      addMessage: "Ajouter un message",
      editMessage: "Modifier le message",
      date: "Date",
      time: "Heure",
      message: "Message",
      messageHe: "Texte en hébreu",
      messageEn: "Texte en anglais",
      messageRu: "Texte en russe",
      messageEs: "Texte en espagnol",
      messageFr: "Texte en français",
      messageDe: "Texte en allemand",
      messageIt: "Texte en italien",
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      noMessages: "Aucun message programmé",
      sent: "Envoyé",
      scheduled: "Programmé"
    },
    de: {
      title: "Geplante Nachrichten",
      addMessage: "Nachricht hinzufügen",
      editMessage: "Nachricht bearbeiten",
      date: "Datum",
      time: "Zeit",
      message: "Nachricht",
      messageHe: "Hebräischer Text",
      messageEn: "Englischer Text",
      messageRu: "Russischer Text",
      messageEs: "Spanischer Text",
      messageFr: "Französischer Text",
      messageDe: "Deutscher Text",
      messageIt: "Italienischer Text",
      save: "Speichern",
      cancel: "Abbrechen",
      delete: "Löschen",
      noMessages: "Keine geplanten Nachrichten",
      sent: "Gesendet",
      scheduled: "Geplant"
    },
    it: {
      title: "Messaggi programmati",
      addMessage: "Aggiungi messaggio",
      editMessage: "Modifica messaggio",
      date: "Data",
      time: "Ora",
      message: "Messaggio",
      messageHe: "Testo in ebraico",
      messageEn: "Testo in inglese",
      messageRu: "Testo in russo",
      messageEs: "Testo in spagnolo",
      messageFr: "Testo in francese",
      messageDe: "Testo in tedesco",
      messageIt: "Testo in italiano",
      save: "Salva",
      cancel: "Annulla",
      delete: "Elimina",
      noMessages: "Nessun messaggio programmato",
      sent: "Inviato",
      scheduled: "Programmato"
    }
  };

  const trans = translations[language] || translations.en;

  const handleSave = (messageData) => {
    const updatedMessages = [...scheduledMessages];
    if (editingMessage) {
      const index = updatedMessages.findIndex(m => m.id === editingMessage.id);
      if (index >= 0) {
        updatedMessages[index] = { ...messageData, id: editingMessage.id };
      }
    } else {
      updatedMessages.push({
        ...messageData,
        id: Date.now().toString(),
        sent: false
      });
    }
    onChange(updatedMessages);
    setShowForm(false);
    setEditingMessage(null);
  };

  const handleDelete = (messageId) => {
    onChange(scheduledMessages.filter(m => m.id !== messageId));
  };

  return (
    <Card className="border-2 border-purple-100 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            {trans.title}
          </CardTitle>
          <Button
            size="sm"
            onClick={() => {
              setEditingMessage(null);
              setShowForm(true);
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            {trans.addMessage}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {showForm ? (
          <MessageForm
            message={editingMessage}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingMessage(null);
            }}
            translations={trans}
            language={language}
            isRTL={isRTL}
          />
        ) : scheduledMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>{trans.noMessages}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {scheduledMessages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={msg.sent ? 'bg-gray-50 border-gray-300' : 'bg-purple-50 border-purple-200'}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold">
                            {new Date(msg.scheduled_date).toLocaleDateString(language === 'he' ? 'he-IL' : language === 'ru' ? 'ru-RU' : language === 'es' ? 'es-ES' : language === 'fr' ? 'fr-FR' : language === 'de' ? 'de-DE' : language === 'it' ? 'it-IT' : 'en-US')}
                          </span>
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold">{msg.scheduled_time}</span>
                          <Badge className={msg.sent ? 'bg-gray-500' : 'bg-purple-600'}>
                            {msg.sent ? trans.sent : trans.scheduled}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700" dir={isRTL ? 'rtl' : 'ltr'}>
                          {msg.message?.[language] || msg.message?.en || msg.message?.he || ''}
                        </p>
                      </div>
                      {!msg.sent && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMessage(msg);
                              setShowForm(true);
                            }}
                          >
                            <MessageSquare className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(msg.id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MessageForm({ message, onSave, onCancel, translations, language, isRTL }) {
  const [formData, setFormData] = useState(message || {
    scheduled_date: '',
    scheduled_time: '09:00',
    message: {
      he: '',
      en: '',
      ru: '',
      es: '',
      fr: '',
      de: '',
      it: ''
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg border-2 border-purple-200">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>{translations.date} *</Label>
          <Input
            type="date"
            value={formData.scheduled_date}
            onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label>{translations.time} *</Label>
          <Input
            type="time"
            value={formData.scheduled_time}
            onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="font-semibold">{translations.message}</Label>
        
        <div>
          <Label className="text-sm text-gray-600">{translations.messageHe}</Label>
          <Textarea
            value={formData.message.he}
            onChange={(e) => setFormData({
              ...formData,
              message: { ...formData.message, he: e.target.value }
            })}
            rows={2}
            dir="rtl"
            placeholder="טקסט ההודעה בעברית"
          />
        </div>

        <div>
          <Label className="text-sm text-gray-600">{translations.messageEn}</Label>
          <Textarea
            value={formData.message.en}
            onChange={(e) => setFormData({
              ...formData,
              message: { ...formData.message, en: e.target.value }
            })}
            rows={2}
            placeholder="Message text in English"
          />
        </div>

        <div>
          <Label className="text-sm text-gray-600">{translations.messageRu}</Label>
          <Textarea
            value={formData.message.ru}
            onChange={(e) => setFormData({
              ...formData,
              message: { ...formData.message, ru: e.target.value }
            })}
            rows={2}
            placeholder="Текст сообщения на русском"
          />
        </div>

        <div>
          <Label className="text-sm text-gray-600">{translations.messageEs}</Label>
          <Textarea
            value={formData.message.es}
            onChange={(e) => setFormData({
              ...formData,
              message: { ...formData.message, es: e.target.value }
            })}
            rows={2}
            placeholder="Texto del mensaje en español"
          />
        </div>

        <div>
          <Label className="text-sm text-gray-600">{translations.messageFr}</Label>
          <Textarea
            value={formData.message.fr}
            onChange={(e) => setFormData({
              ...formData,
              message: { ...formData.message, fr: e.target.value }
            })}
            rows={2}
            placeholder="Texte du message en français"
          />
        </div>

        <div>
          <Label className="text-sm text-gray-600">{translations.messageDe}</Label>
          <Textarea
            value={formData.message.de}
            onChange={(e) => setFormData({
              ...formData,
              message: { ...formData.message, de: e.target.value }
            })}
            rows={2}
            placeholder="Nachrichtentext auf Deutsch"
          />
        </div>

        <div>
          <Label className="text-sm text-gray-600">{translations.messageIt}</Label>
          <Textarea
            value={formData.message.it}
            onChange={(e) => setFormData({
              ...formData,
              message: { ...formData.message, it: e.target.value }
            })}
            rows={2}
            placeholder="Testo del messaggio in italiano"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
          {translations.save}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          {translations.cancel}
        </Button>
      </div>
    </form>
  );
}