import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Heart, Check, X, Sparkles, Loader2, GripVertical, Calendar, Trash2, Info, Plus, Upload, Edit2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import MemorialDedications from './MemorialDedications';

export default function MemorialsManager({ tripId, showTrekDays = false }) {
  const { language, isRTL } = useLanguage();
  const queryClient = useQueryClient();
  const [aiDistributing, setAiDistributing] = useState(false);
  const [selectedMemorial, setSelectedMemorial] = useState(null);
  const [addMemorialDialog, setAddMemorialDialog] = useState(false);
  const [editingMemorial, setEditingMemorial] = useState(null);
  const [user, setUser] = useState(null);
  const [newMemorial, setNewMemorial] = useState({
    fallen_name: '',
    date_of_fall: '',
    place_of_fall: '',
    short_description: '',
    story: '',
    image_url: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const translations = {
    he: {
      title: "ניהול הנצחות",
      pending: "ממתין לאישור",
      approved: "מאושר",
      rejected: "נדחה",
      approve: "אשר",
      reject: "דחה",
      unassigned: "ללא יום משויך",
      aiDistribute: "חלוקה אוטומטית עם AI",
      distributing: "מחלק...",
      noMemorials: "אין בקשות הנצחה",
      fallenName: "שם החלל/ה",
      requester: "מבקש",
      relation: "קרבה",
      day: "יום",
      delete: "מחק",
      viewDetails: "פרטים",
      memorialDetails: "פרטי ההנצחה",
      dateOfFall: "תאריך נפילה",
      placeOfFall: "מקום נפילה",
      story: "סיפור",
      phone: "טלפון",
      email: "אימייל",
      close: "סגור",
      confirmDelete: "האם למחוק הנצחה זו?",
      deleted: "הוסר בהצלחה"
    },
    en: {
      title: "Memorial Management",
      pending: "Pending Approval",
      approved: "Approved",
      rejected: "Rejected",
      approve: "Approve",
      reject: "Reject",
      unassigned: "Unassigned to Day",
      aiDistribute: "Auto-Distribute with AI",
      distributing: "Distributing...",
      noMemorials: "No memorial requests",
      fallenName: "Name of Fallen",
      requester: "Requester",
      relation: "Relation",
      day: "Day",
      delete: "Delete",
      viewDetails: "Details",
      memorialDetails: "Memorial Details",
      dateOfFall: "Date of Fall",
      placeOfFall: "Place of Fall",
      story: "Story",
      phone: "Phone",
      email: "Email",
      close: "Close",
      confirmDelete: "Delete this memorial?",
      deleted: "Deleted successfully"
    },
    ru: {
      title: "Управление мемориалами",
      pending: "В ожидании",
      approved: "Одобрено",
      rejected: "Отклонено",
      approve: "Одобрить",
      reject: "Отклонить",
      unassigned: "Не назначен день",
      aiDistribute: "Автораспределение AI",
      distributing: "Распределение...",
      noMemorials: "Нет запросов",
      fallenName: "Имя павшего",
      requester: "Заявитель",
      relation: "Отношение",
      day: "День",
      delete: "Удалить",
      viewDetails: "Детали",
      memorialDetails: "Детали мемориала",
      dateOfFall: "Дата падения",
      placeOfFall: "Место падения",
      story: "История",
      phone: "Телефон",
      email: "Email",
      close: "Закрыть",
      confirmDelete: "Удалить этот мемориал?",
      deleted: "Удалено"
    },
    es: {
      title: "Gestión de memoriales",
      pending: "Pendiente",
      approved: "Aprobado",
      rejected: "Rechazado",
      approve: "Aprobar",
      reject: "Rechazar",
      unassigned: "Sin día asignado",
      aiDistribute: "Distribución automática AI",
      distributing: "Distribuyendo...",
      noMemorials: "Sin solicitudes",
      fallenName: "Nombre del caído",
      requester: "Solicitante",
      relation: "Relación",
      day: "Día",
      delete: "Eliminar",
      viewDetails: "Detalles",
      memorialDetails: "Detalles del memorial",
      dateOfFall: "Fecha de caída",
      placeOfFall: "Lugar de caída",
      story: "Historia",
      phone: "Teléfono",
      email: "Email",
      close: "Cerrar",
      confirmDelete: "¿Eliminar este memorial?",
      deleted: "Eliminado"
    },
    fr: {
      title: "Gestion des mémoriaux",
      pending: "En attente",
      approved: "Approuvé",
      rejected: "Rejeté",
      approve: "Approuver",
      reject: "Rejeter",
      unassigned: "Jour non assigné",
      aiDistribute: "Distribution auto AI",
      distributing: "Distribution...",
      noMemorials: "Pas de demandes",
      fallenName: "Nom du tombé",
      requester: "Demandeur",
      relation: "Relation",
      day: "Jour",
      delete: "Supprimer",
      viewDetails: "Détails",
      memorialDetails: "Détails du mémorial",
      dateOfFall: "Date de chute",
      placeOfFall: "Lieu de chute",
      story: "Histoire",
      phone: "Téléphone",
      email: "Email",
      close: "Fermer",
      confirmDelete: "Supprimer ce mémorial?",
      deleted: "Supprimé"
    },
    de: {
      title: "Gedenkstättenverwaltung",
      pending: "Ausstehend",
      approved: "Genehmigt",
      rejected: "Abgelehnt",
      approve: "Genehmigen",
      reject: "Ablehnen",
      unassigned: "Kein Tag zugewiesen",
      aiDistribute: "Auto-Verteilung AI",
      distributing: "Verteilen...",
      noMemorials: "Keine Anfragen",
      fallenName: "Name des Gefallenen",
      requester: "Antragsteller",
      relation: "Beziehung",
      day: "Tag",
      delete: "Löschen",
      viewDetails: "Details",
      memorialDetails: "Memorial Details",
      dateOfFall: "Todesdatum",
      placeOfFall: "Todesort",
      story: "Geschichte",
      phone: "Telefon",
      email: "Email",
      close: "Schließen",
      confirmDelete: "Dieses Memorial löschen?",
      deleted: "Gelöscht"
    },
    it: {
      title: "Gestione memoriali",
      pending: "In attesa",
      approved: "Approvato",
      rejected: "Rifiutato",
      approve: "Approva",
      reject: "Rifiuta",
      unassigned: "Giorno non assegnato",
      aiDistribute: "Distribuzione auto AI",
      distributing: "Distribuzione...",
      noMemorials: "Nessuna richiesta",
      fallenName: "Nome del caduto",
      requester: "Richiedente",
      relation: "Relazione",
      day: "Giorno",
      delete: "Elimina",
      viewDetails: "Dettagli",
      memorialDetails: "Dettagli memoriale",
      dateOfFall: "Data della caduta",
      placeOfFall: "Luogo della caduta",
      story: "Storia",
      phone: "Telefono",
      email: "Email",
      close: "Chiudi",
      confirmDelete: "Eliminare questo memoriale?",
      deleted: "Eliminato"
    }
  };

  const trans = translations[language] || translations.en;

  const { data: trip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => base44.entities.Trip.filter({ id: tripId }).then(res => res[0]),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    staleTime: 60000
  });

  const { data: memorials = [], isLoading: memorialsLoading } = useQuery({
    queryKey: ['memorials', tripId],
    queryFn: () => base44.entities.Memorial.filter({ trip_id: tripId }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    staleTime: 30000
  });

  const updateMemorialMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Memorial.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['memorials', tripId]);
      toast.success(language === 'he' ? 'עודכן בהצלחה' : 'Updated successfully');
    }
  });

  const deleteMemorialMutation = useMutation({
    mutationFn: (id) => base44.entities.Memorial.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['memorials', tripId]);
      toast.success(trans.deleted);
    }
  });

  const handleApprove = (memorial) => {
    updateMemorialMutation.mutate({
      id: memorial.id,
      data: { status: 'approved', approved_by: 'admin', approved_at: new Date().toISOString() }
    });
  };

  const handleReject = (memorial) => {
    updateMemorialMutation.mutate({
      id: memorial.id,
      data: { status: 'rejected' }
    });
  };

  const handleDelete = (memorial) => {
    if (confirm(trans.confirmDelete)) {
      deleteMemorialMutation.mutate(memorial.id);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Get the memorial
    const memorial = memorials.find(m => m.id === draggableId);
    if (!memorial) return;

    // Parse day from destination droppableId (e.g., "day-3" -> 3, "unassigned" -> null)
    const dayNumber = destination.droppableId === 'unassigned' 
      ? null 
      : parseInt(destination.droppableId.split('-')[1]);

    // Update memorial with new day assignment
    updateMemorialMutation.mutate({
      id: memorial.id,
      data: { display_on_date: dayNumber ? trip.trek_days.find(d => d.day_number === dayNumber)?.date : null }
    });
  };

  const handleAiDistribute = async () => {
    setAiDistributing(true);
    try {
      const approvedMemorials = memorials.filter(m => m.status === 'approved');
      const trekDays = trip?.trek_days || [];

      if (approvedMemorials.length === 0 || trekDays.length === 0) {
        toast.error(language === 'he' ? 'אין הנצחות או ימים' : 'No memorials or days');
        return;
      }

      // Use AI to distribute evenly
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You have ${approvedMemorials.length} memorial requests that need to be distributed across ${trekDays.length} trek days.
        
Trek days: ${trekDays.map((d, i) => `Day ${d.day_number} (${d.date})`).join(', ')}

Memorial requests: ${approvedMemorials.map((m, i) => `${i + 1}. ${m.fallen_name} (Requester: ${m.requester_name})`).join(', ')}

Distribute the memorials as evenly as possible across the days. Try to have 1-2 memorials per day maximum.
Return a JSON object mapping memorial indices (0-based) to day numbers. Example: {"0": 1, "1": 3, "2": 5}`,
        response_json_schema: {
          type: 'object',
          properties: {
            assignments: {
              type: 'object',
              additionalProperties: { type: 'number' }
            }
          }
        }
      });

      // Apply the AI assignments
      const assignments = response.assignments || {};
      const updates = [];

      for (const [index, dayNumber] of Object.entries(assignments)) {
        const memorial = approvedMemorials[parseInt(index)];
        const day = trekDays.find(d => d.day_number === dayNumber);
        if (memorial && day) {
          updates.push(
            base44.entities.Memorial.update(memorial.id, { display_on_date: day.date })
          );
        }
      }

      await Promise.all(updates);
      queryClient.invalidateQueries(['memorials', tripId]);
      toast.success(language === 'he' ? 'חולק בהצלחה' : 'Distributed successfully');
    } catch (error) {
      console.error(error);
      toast.error(language === 'he' ? 'שגיאה בחלוקה' : 'Error distributing');
    } finally {
      setAiDistributing(false);
    }
  };

  if (tripLoading || memorialsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Group memorials by status and day
  const pendingMemorials = memorials.filter(m => m.status === 'pending');
  const approvedMemorials = memorials.filter(m => m.status === 'approved');
  const unassignedMemorials = approvedMemorials.filter(m => !m.display_on_date);
  
  const memorialsByDay = {};
  approvedMemorials.forEach(memorial => {
    if (memorial.display_on_date) {
      const day = trip.trek_days.find(d => d.date === memorial.display_on_date);
      if (day) {
        if (!memorialsByDay[day.day_number]) {
          memorialsByDay[day.day_number] = [];
        }
        memorialsByDay[day.day_number].push(memorial);
      }
    }
  });

  const MemorialCard = ({ memorial, isDragging }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={`${isDragging ? 'shadow-2xl rotate-2' : 'cursor-pointer hover:shadow-lg'} transition-all`}
        onClick={() => memorial.status !== 'pending' && setSelectedMemorial(memorial)}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            {memorial.image_url && (
              <img
                src={memorial.image_url}
                alt={memorial.fallen_name}
                className="w-16 h-16 object-cover rounded-lg shadow-md"
              />
            )}
            <div className="flex-1">
              <div className="font-semibold">{memorial.fallen_name}</div>
              <div className="text-xs text-gray-600">
                {trans.requester}: {memorial.requester_name}
              </div>
              {memorial.family_relation && (
                <div className="text-xs text-gray-500">
                  {trans.relation}: {memorial.family_relation}
                </div>
              )}
            </div>
            {memorial.status === 'pending' && (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(memorial);
                  }}
                  className="text-green-600 hover:bg-green-50"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(memorial);
                  }}
                  className="text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500" />
          {trans.title}
        </h2>
        {approvedMemorials.length > 0 && (
          <Button
            onClick={handleAiDistribute}
            disabled={aiDistributing}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {aiDistributing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {trans.distributing}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {trans.aiDistribute}
              </>
            )}
          </Button>
        )}
      </div>

      {memorials.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            {trans.noMemorials}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Pending Memorials */}
          {pendingMemorials.length > 0 && (
            <Card className="border-2 border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-amber-500">{trans.pending}</Badge>
                  <span className="text-sm">({pendingMemorials.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingMemorials.map(memorial => (
                  <MemorialCard key={memorial.id} memorial={memorial} />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Drag and Drop Area */}
          {approvedMemorials.length > 0 && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="space-y-6">
                {/* Trek Days Display with Drop Zones */}
                {showTrekDays && trip?.trek_days && trip.trek_days.length > 0 && (
                  <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        {language === 'he' ? 'ימי הטראק - גרור הנצחה למלבן' : 'Trek Days - Drag memorial to box'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {[...trip.trek_days].sort((a, b) => a.day_number - b.day_number).map(day => (
                          <Droppable key={day.day_number} droppableId={`day-${day.day_number}`}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`bg-white rounded-lg p-3 border-2 transition-all min-h-[120px] ${
                                  snapshot.isDraggingOver 
                                    ? 'border-green-400 bg-green-50 shadow-lg scale-105' 
                                    : 'border-purple-200 hover:border-purple-400'
                                }`}
                              >
                                <div className="font-bold text-purple-900 mb-1">
                                  {language === 'he' ? `יום ${day.day_number}` : `Day ${day.day_number}`}
                                </div>
                                <div className="text-xs text-gray-600 line-clamp-2 mb-2">{day.daily_title}</div>
                                {day.date && (
                                  <div className="text-xs text-purple-600 mb-2">
                                    {format(new Date(day.date), 'MMM d')}
                                  </div>
                                )}
                                
                                {/* Show assigned memorials - draggable */}
                                {(memorialsByDay[day.day_number] || []).map((memorial, index) => (
                                  <Draggable key={memorial.id} draggableId={memorial.id} index={index}>
                                    {(dragProvided, dragSnapshot) => (
                                      <div
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        className="mt-1 group relative"
                                      >
                                        <div className={`text-xs bg-red-50 border border-red-200 rounded px-2 py-1 flex items-center gap-1 ${
                                          dragSnapshot.isDragging ? 'shadow-lg opacity-80' : ''
                                        }`}>
                                          <div {...dragProvided.dragHandleProps} className="cursor-move flex items-center gap-1 flex-1 min-w-0">
                                            <GripVertical className="w-2 h-2 text-gray-400 flex-shrink-0" />
                                            <Heart className="w-3 h-3 text-red-500 flex-shrink-0" />
                                            <span className="truncate">{memorial.fallen_name}</span>
                                          </div>
                                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-5 w-5 p-0 hover:bg-blue-100"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedMemorial(memorial);
                                              }}
                                            >
                                              <Info className="w-3 h-3 text-blue-600" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="h-5 w-5 p-0 hover:bg-red-100"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(memorial);
                                              }}
                                            >
                                              <Trash2 className="w-3 h-3 text-red-600" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Unassigned Memorials */}
                <Droppable droppableId="unassigned">
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`${
                        snapshot.isDraggingOver ? 'border-2 border-blue-400 bg-blue-50' : ''
                      } transition-all min-h-[100px]`}
                    >
                      <CardHeader>
                        <CardTitle className="text-sm">{trans.unassigned} ({unassignedMemorials.length})</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {unassignedMemorials.map((memorial, index) => (
                          <Draggable key={memorial.id} draggableId={memorial.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className="flex items-center gap-2">
                                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div className="flex-1">
                                    <MemorialCard memorial={memorial} isDragging={snapshot.isDragging} />
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {unassignedMemorials.length === 0 && (
                          <div className="text-center text-gray-400 py-4 text-sm">
                            {language === 'he' ? 'אין הנצחות שלא שויכו' : 'No unassigned memorials'}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </Droppable>
              </div>
            </DragDropContext>
          )}
        </>
      )}

      {/* Memorial Details Dialog */}
      <AnimatePresence>
        {selectedMemorial && (
          <Dialog open={!!selectedMemorial} onOpenChange={() => setSelectedMemorial(null)}>
            <DialogContent className="max-w-2xl sm:max-w-3xl max-h-[90vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                    <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" />
                    {trans.memorialDetails}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Image */}
                  {selectedMemorial.image_url && (
                    <motion.div 
                      className="flex justify-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-200 to-orange-200 rounded-2xl blur-xl opacity-50" />
                        <img
                          src={selectedMemorial.image_url}
                          alt={selectedMemorial.fallen_name}
                          className="relative w-48 h-48 sm:w-64 sm:h-64 object-cover rounded-2xl shadow-2xl border-4 border-white"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Name */}
                  <motion.div 
                    className="text-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-2xl p-6 sm:p-8 border-2 border-red-200 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                      {selectedMemorial.fallen_name}
                    </h3>
                    {selectedMemorial.date_of_fall && (
                      <p className="text-sm sm:text-base text-gray-700 font-medium">
                        {trans.dateOfFall}: {format(new Date(selectedMemorial.date_of_fall), 'dd/MM/yyyy')}
                      </p>
                    )}
                  </motion.div>

                  {/* Details Grid */}
                  <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {selectedMemorial.place_of_fall && (
                      <motion.div 
                        className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200 shadow-md"
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
                      >
                        <p className="text-xs font-semibold text-blue-900 mb-2">{trans.placeOfFall}</p>
                        <p className="text-sm sm:text-base text-blue-800 font-medium">{selectedMemorial.place_of_fall}</p>
                      </motion.div>
                    )}

                    {selectedMemorial.family_relation && (
                      <motion.div 
                        className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200 shadow-md"
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(168, 85, 247, 0.3)" }}
                      >
                        <p className="text-xs font-semibold text-purple-900 mb-2">{trans.relation}</p>
                        <p className="text-sm sm:text-base text-purple-800 font-medium">{selectedMemorial.family_relation}</p>
                      </motion.div>
                    )}

                    <motion.div 
                      className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200 shadow-md"
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(34, 197, 94, 0.3)" }}
                    >
                      <p className="text-xs font-semibold text-green-900 mb-2">{trans.requester}</p>
                      <p className="text-sm sm:text-base text-green-800 font-medium">{selectedMemorial.requester_name}</p>
                      {selectedMemorial.requester_phone && (
                        <p className="text-xs sm:text-sm text-green-700 mt-2" dir="ltr">{selectedMemorial.requester_phone}</p>
                      )}
                    </motion.div>

                    {selectedMemorial.requester_email && (
                      <motion.div 
                        className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border-2 border-amber-200 shadow-md"
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(251, 191, 36, 0.3)" }}
                      >
                        <p className="text-xs font-semibold text-amber-900 mb-2">{trans.email}</p>
                        <p className="text-xs sm:text-sm text-amber-800 break-all">{selectedMemorial.requester_email}</p>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Story */}
                  {selectedMemorial.story && (
                    <motion.div 
                      className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 rounded-2xl p-6 border-2 border-gray-200 shadow-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <p className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        {trans.story}
                      </p>
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedMemorial.story}
                      </p>
                    </motion.div>
                  )}

                  {/* Close Button */}
                  <motion.div 
                    className="flex justify-center pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      onClick={() => setSelectedMemorial(null)}
                      className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 px-8 sm:px-12 py-3 text-base shadow-lg hover:shadow-xl transition-all"
                    >
                      {trans.close}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}