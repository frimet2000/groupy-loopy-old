import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Baby, User, Dog, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ParticipantStats({ trip, userProfiles, calculateAge, language, isRTL }) {
  // Calculate detailed statistics
  const stats = {
    totalFamilies: 0,
    totalAdults: 0,
    totalChildren: 0,
    totalPets: 0,
    totalOthers: 0,
    childrenByAge: {},
    adultsByType: { single: 0, couples: 0 }
  };

  const participants = trip.participants?.filter(p => p.email !== trip.organizer_email) || [];

  participants.forEach(participant => {
    stats.totalFamilies++;
    
    // Adults
    let adultsInFamily = 1;
    if (participant.family_members?.spouse) {
      adultsInFamily++;
      stats.adultsByType.couples++;
    } else {
      stats.adultsByType.single++;
    }
    stats.totalAdults += adultsInFamily;

    // Children
    const childrenCount = participant.selected_children?.length || 0;
    stats.totalChildren += childrenCount;
    
    // Group children by age
    if (childrenCount > 0) {
      const participantProfile = userProfiles[participant.email];
      participant.selected_children?.forEach(childId => {
        const child = participantProfile?.children_age_ranges?.find(c => c.id === childId);
        if (child && child.age_range) {
          stats.childrenByAge[child.age_range] = (stats.childrenByAge[child.age_range] || 0) + 1;
        }
      });
    }

    // Pets
    if (participant.family_members?.pets) stats.totalPets++;

    // Others
    if (participant.family_members?.other && participant.other_member_name) stats.totalOthers++;
  });

  const totalPeople = stats.totalAdults + stats.totalChildren + stats.totalOthers;

  // Create family composition examples for animation
  const familyCompositions = [];
  participants.forEach(participant => {
    const comp = {
      adults: participant.family_members?.spouse ? 2 : 1,
      children: participant.selected_children?.length || 0,
      pets: participant.family_members?.pets ? 1 : 0,
      others: (participant.family_members?.other && participant.other_member_name) ? 1 : 0
    };
    familyCompositions.push(comp);
  });

  return (
    <Card className="border-2 border-emerald-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600" />
          {language === 'he' ? 'סטטיסטיקת משתתפים' : 'Participant Statistics'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
            className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl p-4 text-center shadow-md hover:shadow-xl transition-all"
          >
            <User className="w-8 h-8 text-indigo-700 mx-auto mb-2" />
            <p className="text-3xl font-bold text-indigo-900">{stats.totalAdults}</p>
            <p className="text-xs text-indigo-700">{language === 'he' ? 'מבוגרים' : 'Adults'}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-4 text-center shadow-md hover:shadow-xl transition-all"
          >
            <Baby className="w-8 h-8 text-pink-700 mx-auto mb-2" />
            <p className="text-3xl font-bold text-pink-900">{stats.totalChildren}</p>
            <p className="text-xs text-pink-700">{language === 'he' ? 'ילדים' : 'Children'}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
            className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-4 text-center shadow-md hover:shadow-xl transition-all"
          >
            <Dog className="w-8 h-8 text-amber-700 mx-auto mb-2" />
            <p className="text-3xl font-bold text-amber-900">{stats.totalPets}</p>
            <p className="text-xs text-amber-700">{language === 'he' ? 'בעלי חיים' : 'Pets'}</p>
          </motion.div>

          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
            className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-4 text-center shadow-md hover:shadow-xl transition-all"
          >
            <UserPlus className="w-8 h-8 text-purple-700 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-900">{stats.totalOthers}</p>
            <p className="text-xs text-purple-700">{language === 'he' ? 'מצטרפים נוספים' : 'Other'}</p>
          </motion.div>
        </div>

        {/* Total People */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-center shadow-xl"
        >
          <p className="text-5xl font-bold text-white mb-2">{totalPeople}</p>
          <p className="text-white/90 font-medium">{language === 'he' ? 'סה״כ אנשים בטיול' : 'Total People in Trip'}</p>
        </motion.div>

        {/* Children Age Distribution */}
        {stats.totalChildren > 0 && Object.keys(stats.childrenByAge).length > 0 && (
          <div className="space-y-3">
            <p className="font-semibold text-gray-700 text-sm">
              {language === 'he' ? 'התפלגות גילאי ילדים' : 'Children Age Distribution'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(stats.childrenByAge).map(([range, count], idx) => (
                <motion.div
                  key={range}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + idx * 0.1 }}
                  className="bg-pink-50 rounded-lg p-2 text-center border border-pink-200"
                >
                  <p className="text-lg font-bold text-pink-700">{count}</p>
                  <p className="text-xs text-pink-600">{range}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Family Composition Visual */}
        <div className="space-y-4">
          <p className="font-semibold text-gray-700 text-sm">
            {language === 'he' ? 'הרכב משפחות' : 'Family Composition'}
          </p>
          <div className="space-y-3">
            {familyCompositions.map((family, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + idx * 0.15, type: "spring" }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 justify-center flex-wrap">
                  {/* Adults */}
                  {[...Array(family.adults)].map((_, i) => (
                    <motion.div
                      key={`adult-${i}`}
                      initial={{ scale: 0, rotate: -360 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: 0.9 + idx * 0.15 + i * 0.1,
                        type: "spring",
                        stiffness: 200
                      }}
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className="relative"
                    >
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <motion.div
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <span className="text-white text-xs font-bold">✓</span>
                      </motion.div>
                    </motion.div>
                  ))}

                  {/* Children */}
                  {[...Array(family.children)].map((_, i) => (
                    <motion.div
                      key={`child-${i}`}
                      initial={{ scale: 0, y: -50 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ 
                        delay: 1.0 + idx * 0.15 + i * 0.1,
                        type: "spring",
                        stiffness: 250,
                        damping: 10
                      }}
                      whileHover={{ scale: 1.3, y: -5 }}
                      className="relative"
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg">
                        <Baby className="w-6 h-6 text-white" />
                      </div>
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3
                        }}
                        className="absolute -top-1 -right-1 text-xl"
                      >
                        ✨
                      </motion.div>
                      {/* Age Badge */}
                      {(() => {
                        const participantProfile = userProfiles[participants[idx]?.email];
                        const child = participantProfile?.children_age_ranges?.[i];
                        if (child && child.age_range) {
                          return (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white rounded-full px-2 py-0.5 shadow-md border border-pink-200"
                            >
                              <span className="text-[10px] font-bold text-pink-700">{child.age_range}</span>
                            </motion.div>
                          );
                        }
                        return null;
                      })()}
                    </motion.div>
                  ))}

                  {/* Pets */}
                  {family.pets > 0 && (
                    <motion.div
                      initial={{ scale: 0, rotate: 360 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: 1.1 + idx * 0.15,
                        type: "spring",
                        stiffness: 150
                      }}
                      whileHover={{ scale: 1.2, rotate: -10 }}
                      className="relative"
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg">
                        <Dog className="w-6 h-6 text-white" />
                      </div>
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-1 -right-1 text-lg"
                      >
                        🦴
                      </motion.div>
                    </motion.div>
                  )}

                  {/* Others */}
                  {[...Array(family.others)].map((_, i) => (
                    <motion.div
                      key={`other-${i}`}
                      initial={{ scale: 0, x: 50 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{ 
                        delay: 1.2 + idx * 0.15 + i * 0.1,
                        type: "spring"
                      }}
                      whileHover={{ scale: 1.2 }}
                      className="relative"
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-lg">
                        <UserPlus className="w-6 h-6 text-white" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Family Total Badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 + idx * 0.15 }}
                  className="mt-3 text-center"
                >
                  <Badge variant="secondary" className="bg-gray-200 text-gray-700 font-bold">
                    {(() => {
                      const participant = participants[idx];
                      const participantProfile = userProfiles[participant?.email];
                      const participantName = participantProfile?.name || participant?.name;
                      const totalInFamily = family.adults + family.children + family.others;
                      
                      if (totalInFamily === 1) {
                        return language === 'he' 
                          ? `משתתף: ${participantName}`
                          : `Participant: ${participantName}`;
                      } else {
                        return language === 'he'
                          ? `המשפחה של ${participantName}: ${totalInFamily} אנשים`
                          : `${participantName}'s Family: ${totalInFamily} people`;
                      }
                    })()}
                  </Badge>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Adult Type Breakdown */}
        {stats.adultsByType.couples > 0 && (
          <div className="space-y-3">
            <p className="font-semibold text-gray-700 text-sm">
              {language === 'he' ? 'סוג משתתפים' : 'Participant Type'}
            </p>
            <div className="flex gap-3">
              {stats.adultsByType.couples > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="flex-1 bg-rose-50 rounded-lg p-3 text-center border border-rose-200"
                >
                  <p className="text-2xl font-bold text-rose-700">{stats.adultsByType.couples}</p>
                  <p className="text-xs text-rose-600">{language === 'he' ? 'זוגות' : 'Couples'}</p>
                </motion.div>
              )}
              {stats.adultsByType.single > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                  className="flex-1 bg-blue-50 rounded-lg p-3 text-center border border-blue-200"
                >
                  <p className="text-2xl font-bold text-blue-700">{stats.adultsByType.single}</p>
                  <p className="text-xs text-blue-600">{language === 'he' ? 'יחידים' : 'Singles'}</p>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Fun Facts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
          className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 border-2 border-emerald-200"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📊</span>
            <p className="font-bold text-emerald-900">
              {language === 'he' ? 'עובדות מעניינות' : 'Fun Facts'}
            </p>
          </div>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              • {language === 'he' ? `ממוצע של` : 'Average of'} {(totalPeople / Math.max(stats.totalFamilies, 1)).toFixed(1)} {language === 'he' ? 'אנשים למשפחה' : 'people per family'}
            </p>
            {stats.totalChildren > 0 && (
              <p>
                • {language === 'he' ? `ממוצע של` : 'Average of'} {(stats.totalChildren / participants.filter(p => (p.selected_children?.length || 0) > 0).length).toFixed(1)} {language === 'he' ? 'ילדים למשפחה עם ילדים' : 'children per family with kids'}
              </p>
            )}
            {stats.totalPets > 0 && (
              <p>
                • {stats.totalPets} {language === 'he' ? 'משפחות מביאות בעלי חיים' : 'families bringing pets'} 🐾
              </p>
            )}
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}