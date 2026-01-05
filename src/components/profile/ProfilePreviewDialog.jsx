// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MapPin, Heart, User as UserIcon, Dog } from 'lucide-react';



export default function ProfilePreviewDialog({ open, onOpenChange, userEmail, userName }) {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userEmail || !open) return;
      
      setLoading(true);
      try {
        let profile = null;
        if (isAuthenticated) {
          const users = await base44.entities.User.list();
          profile = users.find(u => u.email === userEmail);
        }
        
        // If profile not found but we have userName, create a basic profile
        if (!profile && userName) {
          setUserProfile({
            email: userEmail,
            full_name: userName,
            first_name: userName.split(' ')[0] || '',
            last_name: userName.split(' ').slice(1).join(' ') || ''
          });
        } else {
          setUserProfile(profile);
        }
      } catch (error) {
        // Fallback to userName if available
        if (userName) {
          setUserProfile({
            email: userEmail,
            full_name: userName,
            first_name: userName.split(' ')[0] || '',
            last_name: userName.split(' ').slice(1).join(' ') || ''
          });
        }
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [userEmail, userName, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-emerald-600" />
            {language === 'he' ? 'פרופיל משתמש' : 'User Profile'}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        ) : userProfile ? (
          <ScrollArea className="max-h-[65vh] pr-4">
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                {userProfile.profile_image ? (
                  <img 
                    src={userProfile.profile_image} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full object-cover border-4 border-emerald-100"
                  />
                ) : (
                  <Avatar className="w-20 h-20 border-4 border-emerald-100">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-xl font-bold">
                      {(() => {
                        const firstName = typeof userProfile.first_name === 'string' ? userProfile.first_name : '';
                        const fullName = typeof userProfile.full_name === 'string' ? userProfile.full_name : '';
                        const email = typeof userProfile.email === 'string' ? userProfile.email : '';
                        return (firstName.charAt(0) || fullName.charAt(0) || email.charAt(0) || 'U').toUpperCase();
                      })()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {userProfile.first_name && userProfile.last_name 
                      ? `${userProfile.first_name} ${userProfile.last_name}` 
                      : userProfile.full_name}
                  </h2>
                  {userProfile.bio && (
                    <p className="text-sm text-gray-600 mt-1">{userProfile.bio}</p>
                  )}
                </div>
              </div>

              {/* Personal Info */}
              {(userProfile.home_region || userProfile.fitness_level || userProfile.vehicle_type) && (
                <>
                  <Separator />
                  <div className="space-y-3" dir={language === 'he' ? 'rtl' : 'ltr'}>
                    {userProfile.home_region && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">
                          {language === 'he' ? 'אזור:' : 'Region:'}
                        </span>
                        <span>{t(userProfile.home_region)}</span>
                      </div>
                    )}
                    {userProfile.fitness_level && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">
                          {language === 'he' ? 'רמת כושר:' : 'Fitness:'}
                        </span>
                        <Badge variant="outline">
                          {userProfile.fitness_level === 'low' ? (language === 'he' ? 'נמוכה' : 'Low') :
                           userProfile.fitness_level === 'moderate' ? (language === 'he' ? 'בינונית' : 'Moderate') :
                           userProfile.fitness_level === 'high' ? (language === 'he' ? 'גבוהה' : 'High') :
                           (language === 'he' ? 'גבוהה מאוד' : 'Very High')}
                        </Badge>
                      </div>
                    )}
                    {userProfile.vehicle_type && userProfile.vehicle_type !== 'none' && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">
                          {language === 'he' ? 'רכב:' : 'Vehicle:'}
                        </span>
                        <Badge variant="outline">
                          {userProfile.vehicle_type === 'regular' 
                            ? (language === 'he' ? 'רכב רגיל' : 'Regular') 
                            : (language === 'he' ? 'רכב שטח 4X4' : '4X4')}
                        </Badge>
                      </div>
                    )}
                    {userProfile.travels_with_dog && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Dog className="w-4 h-4 text-amber-600" />
                        <span className="font-medium">
                          {language === 'he' ? 'מטייל עם כלב' : 'Travels with dog'}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Family */}
              {(userProfile.parent_age_range || userProfile.birth_date || userProfile.spouse_age_range || userProfile.spouse_birth_date || (userProfile.children_age_ranges && userProfile.children_age_ranges.length > 0) || (userProfile.children_birth_dates && userProfile.children_birth_dates.length > 0)) && (
                <>
                  <Separator />
                  <div className="space-y-3" dir={language === 'he' ? 'rtl' : 'ltr'}>
                    <Label className="text-base font-semibold">
                      {language === 'he' ? 'משפחה' : 'Family'}
                    </Label>
                    {(userProfile.parent_age_range || userProfile.birth_date) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">
                          {language === 'he' ? 'גילי:' : 'My age:'}
                        </span>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {userProfile.parent_age_range || userProfile.birth_date}
                        </Badge>
                      </div>
                    )}
                    {(userProfile.spouse_age_range || userProfile.spouse_birth_date) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">
                          {language === 'he' ? 'גיל בן/בת הזוג:' : 'Spouse age:'}
                        </span>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {userProfile.spouse_age_range || userProfile.spouse_birth_date}
                        </Badge>
                      </div>
                    )}
                    {/* Unified Children List */}
                    {((userProfile.children_age_ranges && userProfile.children_age_ranges.length > 0) || (userProfile.children_birth_dates && userProfile.children_birth_dates.length > 0)) && (
                      <div className="space-y-2">
                        <Label className="text-sm">
                          {language === 'he' ? 'ילדים:' : 'Children:'}
                        </Label>
                        <div className="space-y-1">
                          {(userProfile.children_age_ranges && userProfile.children_age_ranges.length > 0 
                            ? userProfile.children_age_ranges 
                            : userProfile.children_birth_dates
                          ).map((child, idx) => {
                            const range = child.age_range || child.birth_date;
                            const genderLabel = child.gender === 'male' 
                              ? (language === 'he' ? 'בן' : 'Boy')
                              : child.gender === 'female'
                              ? (language === 'he' ? 'בת' : 'Girl')
                              : '';
                            return (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${child.gender === 'male' ? 'bg-blue-500' : child.gender === 'female' ? 'bg-pink-500' : 'bg-gray-400'}`}></span>
                                <Badge variant="outline" className="bg-pink-50 text-pink-700 font-bold">
                                  {range}
                                </Badge>
                                {genderLabel && (
                                  <span className="text-xs text-gray-500">{genderLabel}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Preferences */}
              {((userProfile.preferred_regions && userProfile.preferred_regions.length > 0) || 
                (userProfile.preferred_interests && userProfile.preferred_interests.length > 0)) && (
                <>
                  <Separator />
                  <div className="space-y-4" dir={language === 'he' ? 'rtl' : 'ltr'}>
                    <Label className="text-base font-semibold">
                      {language === 'he' ? 'העדפות' : 'Preferences'}
                    </Label>
                    {userProfile.preferred_regions && userProfile.preferred_regions.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          {language === 'he' ? 'אזורים מועדפים' : 'Preferred Regions'}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {userProfile.preferred_regions.map(region => (
                            <Badge key={region} className="bg-blue-600">
                              {t(region)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {userProfile.preferred_interests && userProfile.preferred_interests.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-600" />
                          {language === 'he' ? 'תחומי עניין' : 'Interests'}
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {userProfile.preferred_interests.map(interest => (
                            <Badge key={interest} className="bg-rose-600">
                              {t(interest)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {language === 'he' ? 'לא נמצא משתמש' : 'User not found'}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
