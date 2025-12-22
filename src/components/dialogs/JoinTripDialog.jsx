import React from 'react';
import { useLanguage } from '../LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Check, Dog } from 'lucide-react';
import TrekDaySelector from '../trek/TrekDaySelector';

export default function JoinTripDialog({ 
  open, 
  onOpenChange, 
  trip,
  user,
  joinMessage,
  setJoinMessage,
  accessibilityNeeds,
  setAccessibilityNeeds,
  familyMembers,
  setFamilyMembers,
  selectedChildren,
  setSelectedChildren,
  otherMemberName,
  setOtherMemberName,
  selectedTrekDays,
  setSelectedTrekDays,
  onJoin,
  isLoading,
  onShowTerms
}) {
  const { t, language } = useLanguage();
  
  const accessibilityTypes = ['wheelchair', 'visual_impairment', 'hearing_impairment', 'mobility_aid', 'stroller_friendly', 'elderly_friendly'];

  const handleClose = () => {
    onOpenChange(false);
    setJoinMessage('');
    setAccessibilityNeeds([]);
    setSelectedTrekDays([]);
    setFamilyMembers({ me: true, spouse: false, pets: false, other: false });
    setSelectedChildren([]);
    setOtherMemberName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[85vh] p-0 flex flex-col gap-0 m-0 sm:m-4 overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 pt-4 pb-3 border-b flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold">
            {language === 'he' ? 'בקשה להצטרפות לטיול' : 'Request to Join Trip'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {language === 'he' ? 'ספר למארגן מעט על עצמך' : 'Tell the organizer about yourself'}
          </p>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 overscroll-contain">
          <div className="space-y-4">
            {/* Message */}
            <div className="space-y-2" dir={language === 'he' ? 'rtl' : 'ltr'}>
              <Label className="text-xs sm:text-sm">
                {language === 'he' ? 'הודעה למארגן (אופציונלי)' : language === 'ru' ? 'Сообщение организатору (необязательно)' : language === 'es' ? 'Mensaje al organizador (opcional)' : language === 'fr' ? 'Message à l\'organisateur (optionnel)' : language === 'de' ? 'Nachricht an Organisator (optional)' : language === 'it' ? 'Messaggio all\'organizzatore (opzionale)' : 'Message to organizer (optional)'}
              </Label>
              <Textarea
                value={joinMessage}
                onChange={(e) => setJoinMessage(e.target.value)}
                placeholder={language === 'he' 
                  ? 'לדוגמה: שלום, אני בעל ניסיון בטיולים בדרום. יש לכם עוד מקום לאדם נוסף?'
                  : 'e.g., Hi, I have experience hiking in the south. Do you have room for one more?'}
                rows={3}
                dir={language === 'he' ? 'rtl' : 'ltr'}
                className="text-sm resize-none"
              />
            </div>

            {/* Trek Day Selection */}
            {trip.activity_type === 'trek' && trip.trek_days?.length > 0 && (
              <div dir={language === 'he' ? 'rtl' : 'ltr'}>
                <TrekDaySelector
                  trekDays={trip.trek_days}
                  selectedDays={selectedTrekDays}
                  setSelectedDays={setSelectedTrekDays}
                />
              </div>
            )}

            {/* Accessibility Needs */}
            <div className="space-y-2" dir={language === 'he' ? 'rtl' : 'ltr'}>
              <Label className="text-xs sm:text-sm">
                {t('myAccessibilityNeeds')} ({language === 'he' ? 'אופציונלי' : 'optional'})
              </Label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {accessibilityTypes.map(type => (
                  <Badge
                    key={type}
                    variant={accessibilityNeeds.includes(type) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all text-xs ${
                      accessibilityNeeds.includes(type) 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'hover:border-purple-500 hover:text-purple-600'
                    }`}
                    onClick={() => {
                      setAccessibilityNeeds(prev =>
                        prev.includes(type)
                          ? prev.filter(t => t !== type)
                          : [...prev, type]
                      );
                    }}
                  >
                    {t(type)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Family Members */}
            <div className="space-y-2" dir={language === 'he' ? 'rtl' : 'ltr'}>
              <Label className="text-xs sm:text-sm font-semibold">
                {language === 'he' ? 'מי מצטרף לטיול?' : 'Who is joining the trip?'}
              </Label>
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                {/* Me */}
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border-2 border-emerald-200">
                  <Checkbox
                    id="me"
                    checked={familyMembers.me}
                    disabled
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <label htmlFor="me" className="flex-1 text-sm font-medium cursor-not-allowed opacity-70">
                    {language === 'he' ? 'אני' : 'Me'}
                  </label>
                </div>
                
                {/* Spouse */}
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id="spouse"
                    checked={familyMembers.spouse}
                    onCheckedChange={(checked) => setFamilyMembers({...familyMembers, spouse: checked})}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <label htmlFor="spouse" className="flex-1 text-sm font-medium cursor-pointer">
                    {language === 'he' ? 'בן/בת זוג' : 'Spouse/Partner'}
                  </label>
                </div>

                {/* Children */}
                {user?.children_age_ranges && user.children_age_ranges.length > 0 && (() => {
                  const normalizedChildren = user.children_age_ranges.map((child, idx) => {
                    if (typeof child === 'string') {
                      return { id: `idx_${idx}`, name: null, age_range: child, gender: null };
                    }
                    return { ...child, id: child?.id || `idx_${idx}` };
                  });
                  
                  return (
                    <>
                      <Label className="text-xs font-semibold mt-2">
                        {language === 'he' ? 'ילדים' : 'Children'}
                      </Label>
                      {normalizedChildren.map((child, idx) => {
                        const refId = child.id;
                        return (
                          <div key={refId} className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                            <Checkbox
                              id={`child-${refId}`}
                              checked={selectedChildren.includes(refId)}
                              onCheckedChange={(checked) => {
                                setSelectedChildren(prev => 
                                  checked 
                                    ? [...prev, refId]
                                    : prev.filter(id => id !== refId)
                                );
                              }}
                              className="data-[state=checked]:bg-pink-600"
                            />
                            <label htmlFor={`child-${refId}`} className="flex-1 text-sm font-medium cursor-pointer">
                              {child.name || `${language === 'he' ? 'ילד' : 'Child'} ${idx + 1}`}
                              {child.age_range && (
                                <Badge variant="outline" className="ml-2 bg-pink-50 text-pink-700 text-xs">
                                  {child.age_range}
                                </Badge>
                              )}
                            </label>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}

                {/* Pets */}
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    id="pets"
                    checked={familyMembers.pets}
                    onCheckedChange={(checked) => setFamilyMembers({...familyMembers, pets: checked})}
                    className="data-[state=checked]:bg-amber-600"
                  />
                  <label htmlFor="pets" className="flex-1 text-sm font-medium cursor-pointer flex items-center gap-2">
                    <Dog className="w-4 h-4" />
                    {language === 'he' ? 'בעלי חיים' : 'Pets'}
                  </label>
                </div>

                {/* Other */}
                <div className="space-y-2" dir={language === 'he' ? 'rtl' : 'ltr'}>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id="other"
                      checked={familyMembers.other}
                      onCheckedChange={(checked) => {
                        setFamilyMembers({...familyMembers, other: checked});
                        if (!checked) setOtherMemberName('');
                      }}
                      className="data-[state=checked]:bg-purple-600"
                    />
                    <label htmlFor="other" className="flex-1 text-sm font-medium cursor-pointer">
                      {language === 'he' ? 'נוסף' : 'Other'}
                    </label>
                  </div>
                  
                  {familyMembers.other && (
                    <Input
                      value={otherMemberName}
                      onChange={(e) => setOtherMemberName(e.target.value)}
                      placeholder={language === 'he' ? 'שם האדם/ים הנוסף/ים' : 'Name of other person(s)'}
                      dir={language === 'he' ? 'rtl' : 'ltr'}
                      className="text-sm"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Terms Link */}
            <div className="bg-blue-50 p-3 rounded-lg text-center border border-blue-200" dir={language === 'he' ? 'rtl' : 'ltr'}>
              <p className="text-xs text-gray-700 mb-1">
                {language === 'he' ? 'מומלץ לקרוא את' : 'Recommended reading'}
              </p>
              <Button 
                type="button"
                variant="link"
                onClick={onShowTerms}
                className="text-blue-600 hover:text-blue-800 font-semibold underline h-auto p-0 text-xs"
              >
                {language === 'he' ? 'תנאי השימוש וכתב הויתור' : 'Terms and Waiver'}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer - Always Visible */}
        <div className="flex gap-3 px-4 sm:px-6 py-4 border-t flex-shrink-0 bg-white sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="flex-1 h-12 text-sm sm:text-base font-semibold border-2"
          >
            {t('cancel')}
          </Button>
          <Button 
            onClick={onJoin}
            disabled={isLoading || (trip.activity_type === 'trek' && selectedTrekDays.length === 0)}
            className="bg-emerald-600 hover:bg-emerald-700 flex-1 h-12 text-sm sm:text-base font-bold shadow-lg"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            {trip.approval_required === false
              ? (language === 'he' ? 'הצטרף עכשיו' : 'Join Now')
              : (language === 'he' ? 'שלח בקשה' : 'Send Request')
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}