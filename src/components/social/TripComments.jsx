import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";
import { MessageCircle, Send, Trash2, Heart } from 'lucide-react';
import { format } from 'date-fns';

export default function TripComments({ trip, currentUser, onUpdate }) {
  const { language } = useLanguage();
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const comments = trip.comments || [];
  const likes = trip.likes || [];
  const hasLiked = likes.some(like => like.email === currentUser?.email);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const userName = (currentUser.first_name && currentUser.last_name) 
        ? `${currentUser.first_name} ${currentUser.last_name}` 
        : currentUser.full_name;

      const newComment = {
        id: Date.now().toString(),
        author_email: currentUser.email,
        author_name: userName,
        content: commentText,
        timestamp: new Date().toISOString()
      };

      const updatedComments = [...comments, newComment];
      await base44.entities.Trip.update(trip.id, { comments: updatedComments });
      
      setCommentText('');
      onUpdate();
      toast.success(language === 'he' ? 'התגובה נוספה' : language === 'ru' ? 'Комментарий добавлен' : language === 'es' ? 'Comentario agregado' : language === 'fr' ? 'Commentaire ajouté' : language === 'de' ? 'Kommentar hinzugefügt' : language === 'it' ? 'Commento aggiunto' : 'Comment added');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהוספת תגובה' : language === 'ru' ? 'Ошибка добавления комментария' : language === 'es' ? 'Error al agregar comentario' : language === 'fr' ? 'Erreur d\'ajout du commentaire' : language === 'de' ? 'Fehler beim Hinzufügen des Kommentars' : language === 'it' ? 'Errore nell\'aggiungere il commento' : 'Error adding comment');
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const updatedComments = comments.filter(c => c.id !== commentId);
      await base44.entities.Trip.update(trip.id, { comments: updatedComments });
      onUpdate();
      toast.success(language === 'he' ? 'התגובה נמחקה' : language === 'ru' ? 'Комментарий удален' : language === 'es' ? 'Comentario eliminado' : language === 'fr' ? 'Commentaire supprimé' : language === 'de' ? 'Kommentar gelöscht' : language === 'it' ? 'Commento eliminato' : 'Comment deleted');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה במחיקה' : language === 'ru' ? 'Ошибка удаления' : language === 'es' ? 'Error al eliminar' : language === 'fr' ? 'Erreur de suppression' : language === 'de' ? 'Fehler beim Löschen' : language === 'it' ? 'Errore nell\'eliminare' : 'Error deleting');
    }
  };

  const handleToggleLike = async () => {
    try {
      const updatedLikes = hasLiked
        ? likes.filter(like => like.email !== currentUser.email)
        : [...likes, { email: currentUser.email, timestamp: new Date().toISOString() }];
      
      await base44.entities.Trip.update(trip.id, { likes: updatedLikes });
      onUpdate();
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה' : language === 'ru' ? 'Ошибка' : language === 'es' ? 'Error' : language === 'fr' ? 'Erreur' : language === 'de' ? 'Fehler' : language === 'it' ? 'Errore' : 'Error');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            {language === 'he' ? 'תגובות ולייקים' : language === 'ru' ? 'Комментарии и лайки' : language === 'es' ? 'Comentarios y me gusta' : language === 'fr' ? 'Commentaires et likes' : language === 'de' ? 'Kommentare & Likes' : language === 'it' ? 'Commenti e mi piace' : 'Comments & Likes'}
          </CardTitle>
          <Button
            variant={hasLiked ? "default" : "outline"}
            size="sm"
            onClick={handleToggleLike}
            className={hasLiked ? "bg-red-600 hover:bg-red-700" : ""}
          >
            <Heart className={`w-4 h-4 mr-2 ${hasLiked ? 'fill-current' : ''}`} />
            {likes.length}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-emerald-100 text-emerald-700">
              {currentUser?.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={language === 'he' ? 'הוסף תגובה...' : language === 'ru' ? 'Добавить комментарий...' : language === 'es' ? 'Agregar comentario...' : language === 'fr' ? 'Ajouter un commentaire...' : language === 'de' ? 'Kommentar hinzufügen...' : language === 'it' ? 'Aggiungi commento...' : 'Add a comment...'}
              rows={2}
              className="mb-2"
              dir={language === 'he' ? 'rtl' : 'ltr'}
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="w-4 h-4 mr-2" />
              {language === 'he' ? 'שלח' : language === 'ru' ? 'Отправить' : language === 'es' ? 'Enviar' : language === 'fr' ? 'Envoyer' : language === 'de' ? 'Senden' : language === 'it' ? 'Invia' : 'Send'}
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-3 mt-6">
          {comments.length === 0 ? (
            <p className="text-center py-6 text-gray-500 text-sm">
              {language === 'he' ? 'אין תגובות עדיין' : language === 'ru' ? 'Комментариев пока нет' : language === 'es' ? 'Aún no hay comentarios' : language === 'fr' ? 'Pas encore de commentaires' : language === 'de' ? 'Noch keine Kommentare' : language === 'it' ? 'Nessun commento ancora' : 'No comments yet'}
            </p>
          ) : (
            comments.slice().reverse().map(comment => (
              <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gray-200 text-gray-700">
                    {comment.author_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-semibold text-sm">{comment.author_name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {format(new Date(comment.timestamp), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    {comment.author_email === currentUser?.email && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="h-6 w-6 p-0 text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700" dir={language === 'he' ? 'rtl' : 'ltr'}>
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}