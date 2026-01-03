// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Heart, MapPin, User, Check, X, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemorialSchedule({ trip, participants, onUpdateParticipant }) {
  // Local state for memorials to handle drag and drop immediately
  const [memorials, setMemorials] = useState([]);

  useEffect(() => {
    // Extract memorials from participants
    const extractedMemorials = participants
      .filter(p => p.memorial)
      .map(p => ({
        ...p.memorial,
        participantId: p.id,
        participantName: p.name,
        // Default status if not present
        status: p.memorial.status || 'pending', // pending, approved, rejected
        assigned_day: p.memorial.assigned_day || null
      }));
    setMemorials(extractedMemorials);
  }, [participants]);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const updatedMemorials = [...memorials];
    const movedMemorialIndex = updatedMemorials.findIndex(m => m.participantId.toString() === draggableId);
    
    if (movedMemorialIndex === -1) return;

    const movedMemorial = updatedMemorials[movedMemorialIndex];

    // Identify target container
    if (destination.droppableId === 'approved-bank') {
      movedMemorial.assigned_day = null;
    } else if (destination.droppableId.startsWith('day-')) {
      const dayNum = parseInt(destination.droppableId.replace('day-', ''));
      movedMemorial.assigned_day = dayNum;
    }

    setMemorials(updatedMemorials);
    
    // Propagate update to parent/backend
    // In a real app, this would be an API call
    // For now, we simulate updating the participant object
    onUpdateParticipant(movedMemorial.participantId, {
      memorial: {
        ...movedMemorial,
        assigned_day: movedMemorial.assigned_day
      }
    });
  };

  const handleApprove = (memorial) => {
    const updatedMemorials = memorials.map(m => 
      m.participantId === memorial.participantId 
        ? { ...m, status: 'approved' } 
        : m
    );
    setMemorials(updatedMemorials);
    
    onUpdateParticipant(memorial.participantId, {
      memorial: {
        ...memorial,
        status: 'approved'
      }
    });
    
    toast.success(`ההנצחה של ${memorial.fallen_name} אושרה`);
  };

  const handleReject = (memorial) => {
    // Implementation for reject if needed
    const updatedMemorials = memorials.map(m => 
        m.participantId === memorial.participantId 
          ? { ...m, status: 'rejected', assigned_day: null } 
          : m
      );
      setMemorials(updatedMemorials);
      
      onUpdateParticipant(memorial.participantId, {
        memorial: {
          ...memorial,
          status: 'rejected',
          assigned_day: null
        }
      });
      toast.info(`ההנצחה של ${memorial.fallen_name} נדחתה`);
  };

  // Group memorials
  const pendingMemorials = memorials.filter(m => m.status === 'pending');
  const approvedUnassigned = memorials.filter(m => m.status === 'approved' && !m.assigned_day);
  
  // Generate days array based on trip duration
  const tripDays = Array.from({ length: trip.duration_value || 5 }, (_, i) => i + 1);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-8 p-4">
        
        {/* Pending Requests Section */}
        {pendingMemorials.length > 0 && (
          <Card className="border-orange-200 bg-orange-50/30">
            <CardHeader>
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                בקשות הנצחה ממתינות לאישור ({pendingMemorials.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingMemorials.map((memorial) => (
                  <Card key={memorial.participantId} className="bg-white border-orange-100 shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900">{memorial.fallen_name}</h4>
                          <p className="text-xs text-gray-500">
                            מבקש/ת: {memorial.participantName}
                          </p>
                        </div>
                        <Heart className="w-4 h-4 text-orange-400" />
                      </div>
                      
                      {memorial.story && (
                        <p className="text-sm text-gray-600 line-clamp-2 bg-gray-50 p-2 rounded">
                          "{memorial.story}"
                        </p>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(memorial)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          אשר
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                          onClick={() => handleReject(memorial)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          דחה
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Approved Bank (Draggable Source) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-purple-600" />
                מאגר הנצחות מאושרות
                <Badge variant="secondary" className="ml-auto">{approvedUnassigned.length}</Badge>
              </h3>
              
              <Droppable droppableId="approved-bank">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-3 min-h-[100px] rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-purple-50' : 'bg-gray-50/50'
                    } p-2`}
                  >
                    {approvedUnassigned.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-lg">
                        אין הנצחות זמינות לשיבוץ
                      </div>
                    )}
                    
                    {approvedUnassigned.map((memorial, index) => (
                      <Draggable 
                        key={memorial.participantId.toString()} 
                        draggableId={memorial.participantId.toString()} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              bg-white p-3 rounded-lg border shadow-sm group hover:border-purple-300 transition-all
                              ${snapshot.isDragging ? 'shadow-xl ring-2 ring-purple-400 rotate-2' : ''}
                            `}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                              <span className="font-bold text-gray-800">{memorial.fallen_name}</span>
                            </div>
                            <div className="text-xs text-gray-500 pr-6">
                              {memorial.participantName}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>

          {/* Days Grid (Droppable Targets) */}
          <div className="lg:col-span-3">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              שיבוץ לימי הטיול
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {tripDays.map((dayNum) => {
                // Get start date from trip date
                const tripStartDate = new Date(trip.date || new Date());
                const currentDayDate = new Date(tripStartDate);
                currentDayDate.setDate(tripStartDate.getDate() + (dayNum - 1));
                
                const dayMemorials = memorials.filter(m => m.assigned_day === dayNum && m.status === 'approved');

                return (
                  <Droppable key={dayNum} droppableId={`day-${dayNum}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                          bg-white rounded-lg p-3 border-2 transition-all min-h-[150px] flex flex-col
                          ${snapshot.isDraggingOver ? 'border-purple-500 bg-purple-50 ring-4 ring-purple-100' : 'border-purple-100 hover:border-purple-300'}
                        `}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-bold text-purple-900">יום {dayNum}</div>
                            <div className="text-xs text-purple-600 mt-0.5">
                              {currentDayDate.toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-white text-xs">
                            {dayMemorials.length}
                          </Badge>
                        </div>

                        <div className="flex-1 space-y-2">
                          {dayMemorials.map((memorial, index) => (
                            <Draggable 
                              key={memorial.participantId.toString()} 
                              draggableId={memorial.participantId.toString()} 
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`
                                    bg-purple-50 p-2 rounded border border-purple-200 text-sm shadow-sm
                                    ${snapshot.isDragging ? 'opacity-50' : ''}
                                  `}
                                >
                                  <div className="font-semibold text-purple-900 line-clamp-1">
                                    {memorial.fallen_name}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                        
                        {dayMemorials.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex-1 flex items-center justify-center text-xs text-gray-300 border-2 border-dashed border-gray-100 rounded">
                            גרירה לכאן
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
