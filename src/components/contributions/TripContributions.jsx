import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Package, Plus, Trash2, Coffee, Utensils, Music, Tent, Flashlight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TripContributions({ trip, currentUserEmail, onUpdate }) {
  const { language, isRTL } = useLanguage();
  const [newItem, setNewItem] = useState('');
  const [adding, setAdding] = useState(false);

  const myContributions = trip.contributions?.filter(c => c.participant_email === currentUserEmail) || [];
  const otherContributions = trip.contributions?.filter(c => c.participant_email !== currentUserEmail) || [];

  const handleAddContribution = async () => {
    if (!newItem.trim()) {
      toast.error(language === 'he' ? 'נא להזין פריט' : 'Please enter an item');
      return;
    }

    setAdding(true);
    try {
      const participant = trip.participants?.find(p => p.email === currentUserEmail);
      const userName = participant?.name || currentUserEmail;

      const newContribution = {
        id: Date.now().toString(),
        participant_email: currentUserEmail,
        participant_name: userName,
        item: newItem.trim(),
        timestamp: new Date().toISOString()
      };

      const updatedContributions = [...(trip.contributions || []), newContribution];
      await base44.entities.Trip.update(trip.id, { contributions: updatedContributions });
      
      setNewItem('');
      onUpdate();
      toast.success(language === 'he' ? 'הפריט נוסף בהצלחה' : 'Item added successfully');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה בהוספת פריט' : 'Error adding item');
    }
    setAdding(false);
  };

  const handleDeleteContribution = async (contributionId) => {
    try {
      const updatedContributions = trip.contributions.filter(c => c.id !== contributionId);
      await base44.entities.Trip.update(trip.id, { contributions: updatedContributions });
      onUpdate();
      toast.success(language === 'he' ? 'הפריט הוסר' : 'Item removed');
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה במחיקת פריט' : 'Error deleting item');
    }
  };

  const suggestedItems = [
    { icon: Coffee, label: language === 'he' ? 'קפה' : 'Coffee' },
    { icon: Utensils, label: language === 'he' ? 'אוכל' : 'Food' },
    { icon: Music, label: language === 'he' ? 'רמקול' : 'Speaker' },
    { icon: Tent, label: language === 'he' ? 'ערסל' : 'Hammock' },
    { icon: Flashlight, label: language === 'he' ? 'פנס' : 'Flashlight' }
  ];

  return (
    <Card className="border-2 border-indigo-100">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardTitle className="flex items-center gap-3">
          <Package className="w-6 h-6 text-indigo-600" />
          {language === 'he' ? 'מה אני מביא' : 'What I\'m Bringing'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Add New Item */}
        <div className="space-y-3">
          <div className="flex gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={language === 'he' ? 'למשל: קפה, ערסל, רמקול...' : 'e.g., Coffee, Hammock, Speaker...'}
              onKeyDown={(e) => e.key === 'Enter' && handleAddContribution()}
              className="flex-1"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <Button 
              onClick={handleAddContribution}
              disabled={adding || !newItem.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Quick Add Suggestions */}
          <div className="flex flex-wrap gap-2">
            {suggestedItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                  onClick={() => setNewItem(item.label)}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {item.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* My Contributions */}
        {myContributions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-indigo-900">
              {language === 'he' ? 'מה אני מביא:' : 'What I\'m Bringing:'}
            </h3>
            <div className="space-y-2">
              {myContributions.map((contribution) => (
                <motion.div
                  key={contribution.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-800" dir={isRTL ? 'rtl' : 'ltr'}>
                      {contribution.item}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteContribution(contribution.id)}
                    className="hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Other Participants' Contributions */}
        {otherContributions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">
              {language === 'he' ? 'מה אחרים מביאים:' : 'What Others are Bringing:'}
            </h3>
            <div className="space-y-2">
              {otherContributions.map((contribution) => (
                <motion.div
                  key={contribution.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-600 text-white text-xs">
                      {contribution.participant_name?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1" dir={isRTL ? 'rtl' : 'ltr'}>
                    <p className="font-medium text-sm text-gray-800">{contribution.participant_name}</p>
                    <p className="text-gray-600 text-sm">{contribution.item}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {myContributions.length === 0 && otherContributions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">
              {language === 'he' 
                ? 'טרם נוספו פריטים. היה הראשון לציין מה אתה מביא לטיול!'
                : 'No items added yet. Be the first to share what you\'re bringing!'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}