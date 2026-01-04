import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell, MapPin, CheckCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function PermissionsRequest() {
  const { language } = useLanguage();
  const [showDialog, setShowDialog] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
    const checkPermissions = async () => {
      // Check if permissions were already requested
      const permissionsRequested = localStorage.getItem('permissions_requested');
      if (permissionsRequested) return;

      // Detect if mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (!isMobile) {
        // Don't show on desktop
        localStorage.setItem('permissions_requested', 'true');
        return;
      }

      // Check notification permission
      if ('Notification' in window) {
        setNotificationGranted(Notification.permission === 'granted');
      }

      // Check location permission
      if ('geolocation' in navigator && navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          setLocationGranted(result?.state === 'granted');
        } catch (e) {
          console.log('Cannot check location permission');
        }
      }

      // Show dialog only if at least one permission is not granted
      const shouldShow = (
        ('Notification' in window && Notification.permission === 'default') ||
        ('geolocation' in navigator && !locationGranted)
      );

      if (shouldShow) {
        // Delay to not interrupt user immediately
        setTimeout(() => setShowDialog(true), 2000);
      }
    };

    checkPermissions();
  }, []);

  const requestNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error(language === 'he' ? 'הדפדפן לא תומך בהתראות' : 'Browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationGranted(true);
        toast.success(language === 'he' ? 'הרשאת התראות אושרה' : 'Notifications enabled');
        
        // Save to user profile
        await base44.auth.updateMe({ notifications_enabled: true });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const requestLocation = async () => {
    if (!('geolocation' in navigator)) {
      toast.error(language === 'he' ? 'הדפדפן לא תומך במיקום' : 'Browser does not support geolocation');
      return;
    }

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationGranted(true);
          toast.success(language === 'he' ? 'הרשאת מיקום אושרה' : 'Location enabled');
          
          // Save to user profile
          base44.auth.updateMe({ 
            location_enabled: true,
            last_location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          });
        },
        (error) => {
          toast.error(language === 'he' ? 'לא ניתן לגשת למיקום' : 'Cannot access location');
        }
      );
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('permissions_requested', 'true');
    setShowDialog(false);
  };

  const handleComplete = () => {
    localStorage.setItem('permissions_requested', 'true');
    setShowDialog(false);
    if (notificationGranted || locationGranted) {
      toast.success(language === 'he' ? 'ההרשאות נשמרו בהצלחה' : 'Permissions saved successfully');
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {language === 'he' ? 'הפעל הרשאות' : 'Enable Permissions'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {language === 'he' 
              ? 'קבל התראות על בקשות חדשות והמלצות מותאמות למיקום שלך'
              : 'Get notifications for new requests and location-based recommendations'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Notifications */}
          <div className="flex items-start gap-4 p-4 border rounded-lg hover:border-emerald-300 transition-colors">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Bell className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">
                {language === 'he' ? 'התראות' : 'Notifications'}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {language === 'he' 
                  ? 'קבל התראות כשמישהו מבקש להצטרף לטיולים שלך'
                  : 'Get notified when someone requests to join your trips'}
              </p>
              {notificationGranted ? (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {language === 'he' ? 'מאושר' : 'Enabled'}
                  </span>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={requestNotifications}
                  className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  {language === 'he' ? 'הפעל' : 'Enable'}
                </Button>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-4 p-4 border rounded-lg hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">
                {language === 'he' ? 'מיקום' : 'Location'}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {language === 'he' 
                  ? 'קבל המלצות לטיולים באזור שלך'
                  : 'Get trip recommendations in your area'}
              </p>
              {locationGranted ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {language === 'he' ? 'מאושר' : 'Enabled'}
                  </span>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={requestLocation}
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  {language === 'he' ? 'הפעל' : 'Enable'}
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            {language === 'he' ? 'דלג' : 'Skip'}
          </Button>
          <Button 
            onClick={handleComplete}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {language === 'he' ? 'סיום' : 'Done'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}