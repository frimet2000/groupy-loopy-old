import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Upload, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';

export default function TripGallery({ trip, currentUserEmail, onUpdate }) {
  const { language } = useLanguage();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const photos = trip.photos || [];
  const isParticipant = trip.participants?.some(p => p.email === currentUserEmail);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(language === 'he' ? 'הקובץ גדול מדי (מקסימום 10MB)' : 'File too large (max 10MB)');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(language === 'he' ? 'נא לבחור תמונה' : 'Please select an image');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      
      const participant = trip.participants?.find(p => p.email === currentUserEmail);
      const newPhoto = {
        id: Date.now().toString(),
        url: file_url,
        caption: caption.trim(),
        uploader_email: currentUserEmail,
        uploader_name: participant?.name || 'Unknown',
        timestamp: new Date().toISOString()
      };

      const updatedPhotos = [...photos, newPhoto];
      await base44.entities.Trip.update(trip.id, { photos: updatedPhotos });
      
      onUpdate();
      setShowUploadDialog(false);
      setSelectedFile(null);
      setCaption('');
      setPreviewUrl('');
      toast.success(language === 'he' ? 'התמונה הועלתה בהצלחה' : 'Photo uploaded successfully');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהעלאת התמונה' : 'Error uploading photo');
    }
    setUploading(false);
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const updatedPhotos = photos.filter(p => p.id !== photoId);
      await base44.entities.Trip.update(trip.id, { photos: updatedPhotos });
      onUpdate();
      toast.success(language === 'he' ? 'התמונה נמחקה' : 'Photo deleted');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה במחיקה' : 'Error deleting');
    }
  };

  return (
    <>
      <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">
              {language === 'he' ? 'גלריית תמונות' : 'Gallery'}
            </h3>
            {photos.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {photos.length}
              </Badge>
            )}
          </div>
          {isParticipant && (
            <Button
              onClick={() => setShowUploadDialog(true)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              {language === 'he' ? 'העלה' : 'Upload'}
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <Camera className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-gray-900 font-medium mb-1">
              {language === 'he' ? 'אין תמונות עדיין' : 'No photos yet'}
            </p>
            <p className="text-sm text-gray-500">
              {language === 'he' 
                ? 'שתפו תמונות מהטיול'
                : 'Share photos from the trip'}
            </p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 gap-3">
            {photos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((photo) => (
              <div 
                key={photo.id} 
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-100 shadow-sm hover:shadow-md transition-all"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || 'Trip photo'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-2 left-2 right-2 text-white transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all">
                  <p className="text-xs font-medium truncate">
                    {photo.uploader_name}
                  </p>
                  {photo.caption && (
                    <p className="text-xs opacity-90 truncate mt-0.5">
                      {photo.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'he' ? 'העלה תמונה' : 'Upload Photo'}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' 
                ? 'שתף תמונה מהטיול עם שאר המשתתפים'
                : 'Share a photo from the trip with other participants'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {previewUrl ? (
              <div className="relative">
                <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  className="absolute top-2 right-2"
                >
                  {language === 'he' ? 'החלף תמונה' : 'Change Photo'}
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    {language === 'he' ? 'לחץ לבחירת תמונה' : 'Click to select photo'}
                  </p>
                </label>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'he' ? 'תיאור (אופציונלי)' : 'Caption (optional)'}
              </label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={language === 'he' ? 'כתוב משהו על התמונה...' : 'Write something about the photo...'}
                dir={language === 'he' ? 'rtl' : 'ltr'}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !selectedFile} className="bg-purple-600 hover:bg-purple-700">
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {language === 'he' ? 'העלה' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          {selectedPhoto && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-purple-100 text-purple-700">
                        {selectedPhoto.uploader_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{selectedPhoto.uploader_name}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(selectedPhoto.timestamp), 'MMM d, HH:mm')}
                      </p>
                    </div>
                  </div>
                  {selectedPhoto.uploader_email === currentUserEmail && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        handleDeletePhoto(selectedPhoto.id);
                        setSelectedPhoto(null);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <img src={selectedPhoto.url} alt={selectedPhoto.caption} className="w-full rounded-lg" />
                {selectedPhoto.caption && (
                  <p className="text-gray-700" dir={language === 'he' ? 'rtl' : 'ltr'}>
                    {selectedPhoto.caption}
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}