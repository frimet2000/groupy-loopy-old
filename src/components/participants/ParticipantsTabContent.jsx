// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users, User, UserPlus, X, Dog } from 'lucide-react';
import ParticipantStats from './ParticipantStats';
import NifgashimParticipantsView from '../nifgashim/NifgashimParticipantsView';

export default function ParticipantsTabContent({
  trip,
  userProfiles,
  calculateAge,
  language,
  isRTL,
  isOrganizer,
  canEdit,
  setShowAddOrganizerDialog,
  setSelectedProfileEmail,
  setShowProfileDialog,
  handleRemoveOrganizer,
  formatDate,
  t
}) {
  const isNifgashimTrip = trip.activity_type === 'trek' && trip.title?.includes('נפגשים');

  return (
    <div className="space-y-6" dir={language === 'he' ? 'rtl' : 'ltr'}>
      {isNifgashimTrip ? (
        <NifgashimParticipantsView tripId={trip.id} language={language} isRTL={isRTL} />
      ) : (
        <>
          {/* Participant Statistics - visible to everyone */}
          <ParticipantStats
        trip={trip}
        userProfiles={userProfiles}
        calculateAge={calculateAge}
        language={language}
        isRTL={isRTL}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            {t('participants')} ({trip.current_participants || 1})
          </CardTitle>
        </CardHeader>
        <CardContent dir={language === 'he' ? 'rtl' : 'ltr'}>
          <TooltipProvider>
            <div className="space-y-4">
              {/* Organizers Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {language === 'he' ? 'מארגנים' : 'Organizers'}
                  </h3>
                  {isOrganizer && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddOrganizerDialog(true)}
                      className="gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      {language === 'he' ? 'הוסף' : 'Add'}
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {/* Main Organizer */}
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-600 text-white">
                        {(() => {
                          const displayName = userProfiles[trip.organizer_email]?.name || trip.organizer_name;
                          return typeof displayName === 'string' && displayName ? displayName.charAt(0) : 'O';
                        })()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium" dir={language === 'he' ? 'rtl' : 'ltr'}>
                        {userProfiles[trip.organizer_email]?.name || trip.organizer_name}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-emerald-600 font-semibold">
                          {language === 'he' ? 'מארגן ראשי' : 'Main Organizer'}
                        </p>
                        {(() => {
                          const organizer = trip.participants?.find((p) => p.email === trip.organizer_email);
                          if (!organizer) return null;

                          let total = 1;
                          if (organizer.family_members?.spouse) total++;
                          if (organizer.selected_children?.length > 0) total += organizer.selected_children.length;
                          if (organizer.family_members?.other && organizer.other_member_name) total++;

                          return (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs">
                              {total} {language === 'he' ? 'אנשים' : 'people'}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProfileEmail(trip.organizer_email);
                        setShowProfileDialog(true);
                      }}
                    >
                      <User className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Additional Organizers */}
                  {trip.additional_organizers?.map((organizer, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-emerald-500 text-white">
                          {(() => {
                            const displayName = userProfiles[organizer.email]?.name || organizer.name || organizer.email;
                            return typeof displayName === 'string' && displayName ? displayName.charAt(0) : 'O';
                          })()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium" dir={language === 'he' ? 'rtl' : 'ltr'}>
                          {userProfiles[organizer.email]?.name || organizer.name || organizer.email}
                        </p>
                        <p className="text-xs text-emerald-600">
                          {language === 'he' ? 'מארגן משותף' : 'Co-organizer'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProfileEmail(organizer.email);
                          setShowProfileDialog(true);
                        }}
                      >
                        <User className="w-4 h-4" />
                      </Button>
                      {isOrganizer && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOrganizer(organizer.email)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Participants Table */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>{language === 'he' ? 'כל המשתתפים' : 'All Participants'} ({trip.participants?.length || 0})</span>
                  <span className="text-xs text-gray-500">
                    ({(() => {
                      let total = 0;
                      (trip.participants || []).forEach((p) => {
                        total += 1;
                        if (p.family_members?.spouse) total++;
                        if (p.selected_children?.length > 0) total += p.selected_children.length;
                        if (p.family_members?.other && p.other_member_name) total++;
                      });
                      return total;
                    })()} {language === 'he' ? 'אנשים סה"כ' : 'total people'})
                  </span>
                </h3>

                {trip.participants?.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-start text-xs font-semibold text-gray-700">
                              {language === 'he' ? 'משתתף' : 'Participant'}
                            </th>
                            <th className="px-4 py-3 text-start text-xs font-semibold text-gray-700">
                              {language === 'he' ? 'מבוגרים' : 'Adults'}
                            </th>
                            <th className="px-4 py-3 text-start text-xs font-semibold text-gray-700">
                              {language === 'he' ? 'ילדים' : 'Children'}
                            </th>
                            <th className="px-4 py-3 text-start text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1">
                                <Dog className="w-4 h-4 text-amber-600" />
                              </div>
                            </th>
                            <th className="px-4 py-3 text-start text-xs font-semibold text-gray-700">
                              {language === 'he' ? 'מצטרף נוסף' : 'Other'}
                            </th>
                            <th className="px-4 py-3 text-start text-xs font-semibold text-gray-700">
                              {language === 'he' ? 'סה"כ' : 'Total'}
                            </th>
                            <th className="px-4 py-3 text-start text-xs font-semibold text-gray-700">
                              {language === 'he' ? 'תאריך' : 'Date'}
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700">
                              {language === 'he' ? 'פרופיל' : 'Profile'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {trip.participants.map((participant, index) => {
                            const participantProfile = userProfiles[participant.email];

                            let adultsCount = 1;
                            if (participant.family_members?.spouse) adultsCount++;

                            let childrenCount = participant.selected_children?.length || 0;
                            let childrenDetails = Array.isArray(participant.children_details) && participant.children_details.length > 0
                              ? participant.children_details
                              : [];

                            if (childrenDetails.length === 0 && childrenCount > 0 && participantProfile?.children_age_ranges) {
                              const details = [];
                              participant.selected_children.forEach((childId) => {
                                const child = participantProfile.children_age_ranges.find((c) => c.id === childId);
                                if (child) {
                                  details.push({
                                    age_range: child.age_range,
                                    gender: child.gender,
                                    name: child.name
                                  });
                                }
                              });
                              childrenDetails = details;
                            }

                            let otherCount = 0;
                            const otherDetails = [];
                            if (participant.family_members?.other && participant.other_member_name) {
                              otherCount++;
                              otherDetails.push(participant.other_member_name);
                            }

                            const hasPets = participant.family_members?.pets;
                            const totalPeople = adultsCount + childrenCount + otherCount;
                            const isOrganizerRow = participant.email === trip.organizer_email;

                            return (
                              <tr key={index} className={`hover:bg-gray-50 transition-colors ${isOrganizerRow ? 'bg-emerald-50/50' : ''}`}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                      <AvatarFallback className={isOrganizerRow ? 'bg-emerald-600 text-white' : 'bg-blue-100 text-blue-700'}>
                                        {(() => {
                                          const displayName = participantProfile?.name || participant.name;
                                          return typeof displayName === 'string' && displayName ? displayName.charAt(0) : 'P';
                                        })()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm" dir={language === 'he' ? 'rtl' : 'ltr'}>
                                        {participantProfile?.name || participant.name}
                                      </p>
                                      {isOrganizerRow && (
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs mt-0.5">
                                          {language === 'he' ? 'מארגן' : 'Organizer'}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                                    {adultsCount}
                                  </Badge>
                                  {adultsCount > 1 && (
                                    <p className="text-xs text-gray-500 mt-1">{language === 'he' ? '+ בן/בת זוג' : '+ Spouse'}</p>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {childrenCount > 0 ? (
                                    <Badge variant="secondary" className="bg-pink-100 text-pink-700">
                                      {childrenCount}
                                    </Badge>
                                  ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {hasPets ? (
                                    <div className="flex items-center gap-0.5">
                                      <Dog className="w-4 h-4 text-amber-600" />
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {otherCount > 0 ? (
                                    <div>
                                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                                        {otherCount}
                                      </Badge>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {otherDetails.map((detail, idx) => (
                                          <span key={idx} className="text-xs text-gray-600">
                                            {detail}{idx < otherDetails.length - 1 ? ',' : ''}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 font-bold border border-emerald-300">
                                    {totalPeople}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs text-gray-500">
                                    {formatDate(new Date(participant.joined_at), 'MMM d', language)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedProfileEmail(participant.email);
                                      setShowProfileDialog(true);
                                    }}
                                  >
                                    <User className="w-4 h-4" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {language === 'he' ? 'אין משתתפים עדיין' : 'No participants yet'}
                  </div>
                )}
              </div>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}