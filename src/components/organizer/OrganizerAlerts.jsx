import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Users, AlertCircle, MessageCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDate } from '../utils/dateFormatter';

export default function OrganizerAlerts({ userEmail }) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [dismissedAlerts, setDismissedAlerts] = React.useState(() => {
    const saved = localStorage.getItem('dismissedAlerts');
    return saved ? JSON.parse(saved) : [];
  });

  const { data: myTrips = [] } = useQuery({
    queryKey: ['myOrganizedTrips', userEmail],
    queryFn: async () => {
      const trips = await base44.entities.Trip.list();
      return trips.filter(t => 
        t.organizer_email === userEmail || 
        t.additional_organizers?.some(o => o.email === userEmail)
      );
    },
    enabled: !!userEmail,
    refetchInterval: 10000, // Check every 10 seconds
  });

  // Calculate alerts
  const alerts = [];

  myTrips.forEach(trip => {
    const title = trip.title || trip.title_he || trip.title_en;
    
    // Alert: Pending join requests
    if (trip.pending_requests?.length > 0) {
      alerts.push({
        id: `pending-${trip.id}`,
        tripId: trip.id,
        type: 'pending_requests',
        title: language === 'he' 
          ? `${trip.pending_requests.length} בקשות הצטרפות חדשות`
          : `${trip.pending_requests.length} new join requests`,
        description: language === 'he'
          ? `"${title}" - ממתינים לאישור שלך`
          : `"${title}" - waiting for your approval`,
        icon: Users,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        count: trip.pending_requests.length
      });
    }

    // Alert: Almost full
    if (trip.max_participants && !trip.flexible_participants) {
      const spotsLeft = trip.max_participants - (trip.current_participants || 1);
      const percentageFull = ((trip.current_participants || 1) / trip.max_participants) * 100;
      
      if (percentageFull >= 80 && spotsLeft > 0) {
        alerts.push({
          id: `almost-full-${trip.id}`,
          tripId: trip.id,
          type: 'almost_full',
          title: language === 'he'
            ? `נותרו ${spotsLeft} מקומות בלבד!`
            : `Only ${spotsLeft} spots left!`,
          description: language === 'he'
            ? `"${title}" - ${Math.round(percentageFull)}% מלא`
            : `"${title}" - ${Math.round(percentageFull)}% full`,
          icon: AlertCircle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          count: spotsLeft
        });
      }
    }

    // Alert: Unread messages
    const tripMessages = trip.messages || [];
    const myLastSeen = tripMessages.findLastIndex(m => m.sender_email === userEmail);
    const unreadCount = myLastSeen >= 0 
      ? tripMessages.length - myLastSeen - 1
      : tripMessages.length;
    
    if (unreadCount > 0 && tripMessages[tripMessages.length - 1]?.sender_email !== userEmail) {
      const alertId = `unread-${trip.id}`;
      
      if (!dismissedAlerts.includes(alertId)) {
        alerts.push({
          id: alertId,
          tripId: trip.id,
          type: 'unread_messages',
          title: language === 'he'
            ? `${unreadCount} הודעות חדשות`
            : `${unreadCount} new messages`,
          description: language === 'he'
            ? `"${title}" - הודעה אחרונה: ${tripMessages[tripMessages.length - 1]?.content?.substring(0, 30)}...`
            : `"${title}" - Last: ${tripMessages[tripMessages.length - 1]?.content?.substring(0, 30)}...`,
          icon: MessageCircle,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          count: unreadCount
        });
      }
    }

    // Alert: Trip starting soon (within 24 hours)
    const tripDate = new Date(trip.date);
    const now = new Date();
    const hoursUntil = (tripDate - now) / (1000 * 60 * 60);
    
    if (hoursUntil > 0 && hoursUntil <= 24) {
      alerts.push({
        id: `starting-soon-${trip.id}`,
        tripId: trip.id,
        type: 'starting_soon',
        title: language === 'he'
          ? `הטיול מתחיל בקרוב!`
          : `Trip starting soon!`,
        description: language === 'he'
          ? `"${title}" - בעוד ${Math.round(hoursUntil)} שעות`
          : `"${title}" - in ${Math.round(hoursUntil)} hours`,
        icon: Bell,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        urgent: true
      });
    }
  });

  const handleAlertClick = (alert) => {
    // Dismiss alert permanently after click
    const updated = [...dismissedAlerts, alert.id];
    setDismissedAlerts(updated);
    localStorage.setItem('dismissedAlerts', JSON.stringify(updated));
    
    // Navigate to trip details and open chat tab
    navigate(createPageUrl('TripDetails') + '?id=' + alert.tripId + '#chat');
    // Trigger chat tab after navigation
    setTimeout(() => {
      const chatTab = document.querySelector('[value="chat"]');
      if (chatTab) chatTab.click();
    }, 100);
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map(alert => (
        <motion.div
          key={alert.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card 
            className={`${alert.bgColor} border-2 ${alert.borderColor} shadow-lg cursor-pointer hover:shadow-xl transition-all`}
            onClick={() => handleAlertClick(alert)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white/80 ${alert.urgent ? 'animate-pulse' : ''}`}>
                  <alert.icon className={`w-5 h-5 ${alert.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">
                      {alert.title}
                    </h3>
                    {alert.count > 0 && (
                      <Badge className={`${alert.color} bg-white/80 text-xs`}>
                        {alert.count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {alert.description}
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 ${alert.color} flex-shrink-0 ${language === 'he' ? 'rotate-180' : ''}`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}