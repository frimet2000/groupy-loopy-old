import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { base44 } from '@/api/base44Client';
import { toast } from "sonner";
import { 
  MapPin, 
  Edit, 
  Trash2,
  Navigation,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import GoogleMapWrapper from './GoogleMapWrapper';

export default function MapSidebar({ trip, isOrganizer, onUpdate }) {
  const { language } = useLanguage();
  const [editDialog, setEditDialog] = useState(false);
  const [editingWaypoint, setEditingWaypoint] = useState(null);
  const [waypointForm, setWaypointForm] = useState({ name: '', description: '', latitude: 0, longitude: 0 });
  const [showMap, setShowMap] = useState(false);

  const waypoints = trip.waypoints || [];

  const handleMapClick = (e) => {
    if (!isOrganizer) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setEditingWaypoint(null);
    setWaypointForm({ 
      name: '', 
      description: '', 
      latitude: lat, 
      longitude: lng 
    });
    setEditDialog(true);
  };

  const handleEditWaypoint = (waypoint) => {
    setEditingWaypoint(waypoint);
    setWaypointForm({
      name: waypoint.name,
      description: waypoint.description || '',
      latitude: waypoint.latitude,
      longitude: waypoint.longitude
    });
    setEditDialog(true);
  };

  const handleSaveWaypoint = async () => {
    if (!waypointForm.name) {
      toast.error(language === 'he' ? 'נא למלא שם' : 'Please enter name');
      return;
    }

    const updatedWaypoints = [...waypoints];
    if (editingWaypoint) {
      const index = waypoints.findIndex(w => w.id === editingWaypoint.id);
      updatedWaypoints[index] = { ...editingWaypoint, ...waypointForm };
    } else {
      updatedWaypoints.push({
        id: Date.now().toString(),
        ...waypointForm,
        order: waypoints.length
      });
    }

    try {
      await base44.entities.Trip.update(trip.id, { waypoints: updatedWaypoints });
      onUpdate();
      setEditDialog(false);
      toast.success(language === 'he' ? 'נקודת ציון נשמרה' : 'Waypoint saved');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בשמירה' : 'Error saving');
    }
  };

  const handleDeleteWaypoint = async (waypointId) => {
    const updatedWaypoints = waypoints.filter(w => w.id !== waypointId);
    try {
      await base44.entities.Trip.update(trip.id, { waypoints: updatedWaypoints });
      onUpdate();
      toast.success(language === 'he' ? 'נקודת ציון נמחקה' : 'Waypoint deleted');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה במחיקה' : 'Error deleting');
    }
  };

  return (
    <>
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardContent className="p-4 space-y-4">
          {/* Interactive Map Section */}
          {showMap ? (
            <Card className="overflow-hidden border-2 border-emerald-200">
              <div className="relative">
                <div className="h-[400px] w-full">
                  <GoogleMapWrapper
                    center={{ lat: trip.latitude || 31.5, lng: trip.longitude || 34.75 }}
                    zoom={13}
                    onClick={handleMapClick}
                    markers={[
                      {
                        position: { lat: trip.latitude || 31.5, lng: trip.longitude || 34.75 },
                        label: 'S',
                        title: trip.location
                      },
                      ...waypoints.sort((a, b) => a.order - b.order).map((waypoint, index) => ({
                        position: { lat: waypoint.latitude, lng: waypoint.longitude },
                        label: String(index + 1),
                        title: waypoint.name
                      }))
                    ]}
                    polyline={waypoints.length > 0 ? {
                      path: [
                        { lat: trip.latitude || 31.5, lng: trip.longitude || 34.75 },
                        ...waypoints.sort((a, b) => a.order - b.order).map(w => ({ lat: w.latitude, lng: w.longitude }))
                      ],
                      color: '#10b981',
                      weight: 3,
                      opacity: 0.7
                    } : null}
                  />
                </div>
                
                {/* Map instructions overlay */}
                {isOrganizer && (
                  <div className="absolute top-2 left-2 right-2 bg-emerald-600 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium z-[400]">
                    <div className="flex items-center justify-between">
                      <span>
                        {language === 'he' 
                          ? '💡 לחץ על המפה להוספת נקודת ציון' 
                          : '💡 Click on map to add waypoint'}
                      </span>
                      <button
                        onClick={() => setShowMap(false)}
                        className="bg-white/20 hover:bg-white/30 rounded p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Button
              onClick={() => setShowMap(true)}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 gap-2 shadow-lg"
              size="lg"
            >
              <MapPin className="w-5 h-5" />
              {language === 'he' ? 'הצג מפה אינטראקטיבית' : 'Show Interactive Map'}
            </Button>
          )}

          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {waypoints.sort((a, b) => a.order - b.order).map((waypoint, index) => (
                <div key={waypoint.id} className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
                  <Badge className="bg-emerald-600">{index + 1}</Badge>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{waypoint.name}</p>
                    {waypoint.description && (
                      <p className="text-xs text-gray-600">{waypoint.description}</p>
                    )}
                  </div>
                  {isOrganizer && (
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleEditWaypoint(waypoint)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteWaypoint(waypoint.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {waypoints.length > 0 && (
            <a
              href={(() => {
                const sortedWaypoints = waypoints.sort((a, b) => a.order - b.order);
                const baseUrl = 'https://www.google.com/maps/dir/';
                const points = [
                  `${trip.latitude},${trip.longitude}`,
                  ...sortedWaypoints.map(w => `${w.latitude},${w.longitude}`)
                ];
                return baseUrl + points.join('/') + '/@' + points[0] + ',13z';
              })()}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2 shadow-lg" size="lg">
                <Navigation className="w-5 h-5" />
                {language === 'he' ? 'נווט עם כל נקודות הציון בגוגל מפות' : 'Navigate Full Route in Google Maps'}
              </Button>
            </a>
          )}
        </CardContent>
      </Card>

      {/* Edit Waypoint Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWaypoint 
                ? (language === 'he' ? 'ערוך נקודת ציון' : 'Edit Waypoint')
                : (language === 'he' ? 'הוסף נקודת ציון' : 'Add Waypoint')}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' 
                ? 'הוסף נקודת עניין במסלול הטיול'
                : 'Add a point of interest along the trail'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'שם' : 'Name'}
              </label>
              <Input
                value={waypointForm.name}
                onChange={(e) => setWaypointForm({ ...waypointForm, name: e.target.value })}
                placeholder={language === 'he' ? 'נקודת תצפית, מעיין, וכו׳' : 'Viewpoint, spring, etc.'}
                dir={language === 'he' ? 'rtl' : 'ltr'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'תיאור' : 'Description'}
              </label>
              <Textarea
                value={waypointForm.description}
                onChange={(e) => setWaypointForm({ ...waypointForm, description: e.target.value })}
                placeholder={language === 'he' ? 'תיאור קצר' : 'Brief description'}
                dir={language === 'he' ? 'rtl' : 'ltr'}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Latitude</label>
                <Input
                  type="number"
                  step="0.000001"
                  value={waypointForm.latitude}
                  onChange={(e) => setWaypointForm({ ...waypointForm, latitude: parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Longitude</label>
                <Input
                  type="number"
                  step="0.000001"
                  value={waypointForm.longitude}
                  onChange={(e) => setWaypointForm({ ...waypointForm, longitude: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog(false)}>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveWaypoint} className="bg-emerald-600 hover:bg-emerald-700">
              {language === 'he' ? 'שמור' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}