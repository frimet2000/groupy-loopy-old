import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Baby, User, Dog, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ParticipantStats({ trip, userProfiles, calculateAge, language, isRTL }) {
  console.log('🔍 === ParticipantStats DEBUG ===');
  console.log('Trip participants:', trip.participants);
  console.log('User profiles:', userProfiles);
  
  // Calculate detailed statistics
  const stats = {
    totalFamilies: 0,
    totalAdults: 0,
    totalChildren: 0,
    totalPets: 0,
    totalOthers: 0,
    childrenByAge: {},
    adultsByType: { single: 0, couples: 0 },
    parentsByAge: {}
  };

  const participants = trip.participants || [];

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
    
    // Group children by age - try participant first, fallback to profile
    console.log(`👶 Participant ${participant.email}:`, {
      childrenCount,
      children_details: participant.children_details,
      selected_children: participant.selected_children,
      profile_children: userProfiles[participant.email]?.children_age_ranges
    });
    
    if (childrenCount > 0) {
      if (participant.children_details?.length > 0) {
        console.log('✅ Using children_details from participant');
        participant.children_details.forEach(cd => {
          if (cd.age_range) {
            console.log('  Adding child age:', cd.age_range);
            stats.childrenByAge[cd.age_range] = (stats.childrenByAge[cd.age_range] || 0) + 1;
          }
        });
      } else if (participant.selected_children?.length > 0 && userProfiles[participant.email]?.children_age_ranges?.length > 0) {
        console.log('⚠️ Fallback to user profile children');
        participant.selected_children.forEach(childId => {
          const child = userProfiles[participant.email].children_age_ranges.find(c => c.id === childId);
          console.log('  Looking for child ID:', childId, 'Found:', child);
          if (child?.age_range) {
            console.log('  Adding child age:', child.age_range);
            stats.childrenByAge[child.age_range] = (stats.childrenByAge[child.age_range] || 0) + 1;
          }
        });
      } else {
        console.log('❌ No children details available');
      }
    }

    // Pets
    if (participant.family_members?.pets) stats.totalPets++;

    // Others
    if (participant.family_members?.other && participant.other_member_name) stats.totalOthers++;

    // Get parent ages - try participant snapshot first, then profile
    const profile = userProfiles[participant.email];
    const parentAge = participant.parent_age_range || profile?.parent_age_range;
    const spouseAge = participant.spouse_age_range || profile?.spouse_age_range;

    // Add user's age range
    if (parentAge) {
      stats.parentsByAge[parentAge] = (stats.parentsByAge[parentAge] || 0) + 1;
    }

    // Add spouse's age range if they're joining
    if (participant.family_members?.spouse && spouseAge) {
      stats.parentsByAge[spouseAge] = (stats.parentsByAge[spouseAge] || 0) + 1;
    }
  });

  const totalPeople = stats.totalAdults + stats.totalChildren + stats.totalOthers;
  
  console.log('📊 Final Stats:', {
    childrenByAge: stats.childrenByAge,
    parentsByAge: stats.parentsByAge,
    totalChildren: stats.totalChildren,
    totalAdults: stats.totalAdults
  });
  console.log('=== END DEBUG ===\n\n');

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
      <CardContent className="p-6 space-y-6" dir="rtl">
        {/* Compact Stats */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-4 shadow-lg">
          <div className="grid grid-cols-5 gap-3 text-center text-white">
            <div>
              <p className="text-2xl font-bold">{totalPeople}</p>
              <p className="text-[10px] opacity-90">{language === 'he' ? 'סה״כ' : 'Total'}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalAdults}</p>
              <p className="text-[10px] opacity-90">{language === 'he' ? 'מבוגרים' : 'Adults'}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalChildren}</p>
              <p className="text-[10px] opacity-90">{language === 'he' ? 'ילדים' : 'Kids'}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalPets}</p>
              <p className="text-[10px] opacity-90">{language === 'he' ? 'חיות' : 'Pets'}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalOthers}</p>
              <p className="text-[10px] opacity-90">{language === 'he' ? 'אחר' : 'Other'}</p>
            </div>
          </div>
        </div>

        {/* Children Age Distribution - Prominent */}
        {stats.totalChildren > 0 && Object.keys(stats.childrenByAge).length > 0 && (
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border-2 border-pink-200 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Baby className="w-5 h-5 text-pink-600" />
              <p className="font-bold text-pink-900 text-base">
                {language === 'he' ? 'התפלגות גילאי ילדים' : 'Children Age Distribution'}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(stats.childrenByAge).map(([range, count]) => (
                <motion.div
                  key={range}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-lg p-3 text-center border-2 border-pink-300 shadow-sm"
                >
                  <p className="text-2xl font-bold text-pink-700">{count}</p>
                  <p className="text-xs text-pink-600 font-semibold mt-1">{range}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Parent Age Distribution - Always show */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border-2 border-indigo-200 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-indigo-600" />
            <p className="font-bold text-indigo-900 text-base">
              {language === 'he' ? 'התפלגות גילאי הורים' : 'Parent Age Distribution'}
            </p>
          </div>
          {Object.keys(stats.parentsByAge).length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(stats.parentsByAge).map(([range, count]) => (
                <motion.div
                  key={range}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-lg p-3 text-center border-2 border-indigo-300 shadow-sm"
                >
                  <p className="text-2xl font-bold text-indigo-700">{count}</p>
                  <p className="text-xs text-indigo-600 font-semibold mt-1">{range}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4 text-center border border-indigo-200">
              <p className="text-sm text-indigo-600">
                {language === 'he' 
                  ? 'אין נתונים זמינים - המשתתפים לא מילאו את טווח הגילאים בפרופיל שלהם'
                  : 'No data available - participants haven\'t filled their age range in their profile'}
              </p>
            </div>
          )}
        </div>

        {/* Family Composition - Compact */}
        <div className="space-y-2 text-right">
          <p className="font-semibold text-gray-700 text-xs">
            {language === 'he' ? 'משפחות' : 'Families'}
          </p>
          <div className="space-y-2">
            {familyCompositions.map((family, idx) => {
              const participant = participants[idx];
              const participantName = participant?.name;
              const totalInFamily = family.adults + family.children + family.others;

              return (
                <div
                  key={idx}
                  className="bg-gray-50 rounded-lg p-2 border border-gray-200 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-gray-700">{participantName}</span>
                  <div className="flex items-center gap-1.5">
                    {family.adults > 0 && (
                      <span className="bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                        {family.adults}👤
                      </span>
                    )}
                    {family.children > 0 && (
                      <span className="bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                        {family.children}👶
                      </span>
                    )}
                    {family.pets > 0 && (
                      <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                        🐕
                      </span>
                    )}
                    {family.others > 0 && (
                      <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                        +{family.others}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>


      </CardContent>
    </Card>
  );
}