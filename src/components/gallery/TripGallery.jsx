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
import { Camera, Upload, Loader2, Image as ImageIcon, Trash2, Video } from 'lucide-react';
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-purple-600" />
              {language === 'he' ? 'גלריית תמונות' : 'Photo Gallery'}
            </CardTitle>
            {isParticipant && (
              <Button
                onClick={() => setShowUploadDialog(true)}
                className="bg-purple-600 hover:bg-purple-700 gap-2"
                size="sm"
              >
                <Upload className="w-4 h-4" />
                {language === 'he' ? 'העלה תמונה/וידאו' : 'Upload Photo/Video'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-300 mb-3" />
              <p className="text-gray-500">
                {language === 'he' 
                  ? 'אין תמונות עדיין. היו הראשונים להעלות!'
                  : 'No photos yet. Be the first to upload!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {photos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map((photo) => {
                const isVideo = photo.url?.match(/\.(mp4|webm|mov|avi|mkv)$/i);
                return (
                  <div 
                    key={photo.id} 
                    className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-gray-100"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    {isVideo ? (
                      <video
                        src={photo.url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Trip photo'}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Video className="w-10 h-10 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {photo.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        {photo.caption}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'he' ? 'העלה תמונה/וידאו' : 'Upload Photo/Video'}
            </DialogTitle>
            <DialogDescription>
              {language === 'he' 
                ? 'שתף תמונה או וידאו מהטיול עם שאר המשתתפים'
                : 'Share a photo or video from the trip with other participants'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {previewUrl ? (
              <div className="relative">
                {selectedFile?.type?.startsWith('video/') ? (
                  <video src={previewUrl} controls className="w-full rounded-lg max-h-64" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  className="absolute top-2 right-2"
                >
                  {language === 'he' ? 'החלף' : 'Change'}
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <div className="flex justify-center gap-2 mb-3">
                    <Camera className="w-10 h-10 text-gray-400" />
                    <Video className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600">
                    {language === 'he' ? 'לחץ לבחירת תמונה או וידאו' : 'Click to select photo or video'}
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
                {selectedPhoto.url?.match(/\.(mp4|webm|mov|avi|mkv)$/i) ? (
                  <video src={selectedPhoto.url} controls className="w-full rounded-lg" />
                ) : (
                  <img src={selectedPhoto.url} alt={selectedPhoto.caption} className="w-full rounded-lg" />
                )}
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