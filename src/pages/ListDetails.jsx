import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '../components/LanguageContext';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TripCard from '../components/trips/TripCard';
import { ArrowLeft, ArrowRight, List, Loader2, Plus, X, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ListDetails() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const listId = urlParams.get('id');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: list, isLoading } = useQuery({
    queryKey: ['tripList', listId],
    queryFn: async () => {
      const lists = await base44.entities.TripList.filter({ id: listId });
      return lists[0];
    },
    enabled: !!listId,
  });

  const { data: allTrips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: () => base44.entities.Trip.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TripList.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tripList', listId]);
      toast.success(language === 'he' ? 'הרשימה עודכנה' : 'List updated');
    },
  });

  const listTrips = list?.trip_ids 
    ? allTrips.filter(trip => list.trip_ids.includes(trip.id))
    : [];

  const availableTrips = allTrips.filter(trip => 
    !list?.trip_ids?.includes(trip.id) && trip.status === 'open'
  );

  const handleAddTrip = (tripId) => {
    const updatedTripIds = [...(list.trip_ids || []), tripId];
    updateMutation.mutate({ id: list.id, data: { trip_ids: updatedTripIds } });
    setOpen(false);
  };

  const handleRemoveTrip = (tripId) => {
    const updatedTripIds = (list.trip_ids || []).filter(id => id !== tripId);
    updateMutation.mutate({ id: list.id, data: { trip_ids: updatedTripIds } });
  };

  if (isLoading || !list) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const colorClass = colorOptions.find(c => c.value === list.color)?.class || 'from-emerald-500 to-teal-600';

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className={`h-48 bg-gradient-to-r ${colorClass} relative`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-7xl mx-auto px-4 h-full flex flex-col justify-between py-6">
          <Button 
            variant="secondary" 
            size="icon"
            className="rounded-full bg-white/90 hover:bg-white w-10 h-10"
            onClick={() => navigate(-1)}
          >
            {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <List className="w-8 h-8 text-white" />
              {list.is_public ? (
                <Badge className="bg-white/20 text-white border-white/30">
                  <Unlock className="w-3 h-3 mr-1" />
                  {language === 'he' ? 'ציבורי' : language === 'ru' ? 'Публичный' : language === 'es' ? 'Público' : language === 'fr' ? 'Public' : language === 'de' ? 'Öffentlich' : language === 'it' ? 'Pubblico' : 'Public'}
                </Badge>
              ) : (
                <Badge className="bg-white/20 text-white border-white/30">
                  <Lock className="w-3 h-3 mr-1" />
                  {language === 'he' ? 'פרטי' : language === 'ru' ? 'Личный' : language === 'es' ? 'Privado' : language === 'fr' ? 'Privé' : language === 'de' ? 'Privat' : language === 'it' ? 'Privato' : 'Private'}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold text-white mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
              {list.name}
            </h1>
            {list.description && (
              <p className="text-white/90 text-lg" dir={isRTL ? 'rtl' : 'ltr'}>{list.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
        <Card className="mb-6 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">
                  {listTrips.length} {language === 'he' ? 'טיולים ברשימה' : language === 'ru' ? 'поездок в этом списке' : language === 'es' ? 'viajes en esta lista' : language === 'fr' ? 'voyages dans cette liste' : language === 'de' ? 'Reisen in dieser Liste' : language === 'it' ? 'viaggi in questa lista' : 'trips in this list'}
                </p>
              </div>
              {user?.email === list.user_email && (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                      <Plus className="w-4 h-4" />
                      {language === 'he' ? 'הוסף טיול' : language === 'ru' ? 'Добавить поездку' : language === 'es' ? 'Agregar viaje' : language === 'fr' ? 'Ajouter voyage' : language === 'de' ? 'Reise hinzufügen' : language === 'it' ? 'Aggiungi viaggio' : 'Add Trip'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <Command>
                      <CommandInput placeholder={language === 'he' ? 'חפש טיול...' : language === 'ru' ? 'Поиск поездки...' : language === 'es' ? 'Buscar viaje...' : language === 'fr' ? 'Rechercher voyage...' : language === 'de' ? 'Reise suchen...' : language === 'it' ? 'Cerca viaggio...' : 'Search trip...'} />
                      <CommandEmpty>
                        {language === 'he' ? 'לא נמצאו טיולים' : language === 'ru' ? 'Поездки не найдены' : language === 'es' ? 'No se encontraron viajes' : language === 'fr' ? 'Aucun voyage trouvé' : language === 'de' ? 'Keine Reisen gefunden' : language === 'it' ? 'Nessun viaggio trovato' : 'No trips found'}
                      </CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-y-auto">
                        {availableTrips.map(trip => {
                          const title = trip.title || trip.title_he || trip.title_en;
                          return (
                            <CommandItem
                              key={trip.id}
                              onSelect={() => handleAddTrip(trip.id)}
                              className="cursor-pointer"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{title}</p>
                                <p className="text-xs text-gray-500">{trip.location}</p>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </CardContent>
        </Card>

        {listTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listTrips.map(trip => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative group"
              >
                {user?.email === list.user_email && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    onClick={() => handleRemoveTrip(trip.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
                <TripCard trip={trip} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-500">
              {language === 'he' ? 'הרשימה ריקה. הוסף טיולים כדי להתחיל!' : language === 'ru' ? 'Список пуст. Добавьте поездки для начала!' : language === 'es' ? 'La lista está vacía. ¡Agrega viajes para comenzar!' : language === 'fr' ? 'La liste est vide. Ajoutez des voyages pour commencer !' : language === 'de' ? 'Liste ist leer. Fügen Sie Reisen hinzu, um zu beginnen!' : language === 'it' ? 'La lista è vuota. Aggiungi viaggi per iniziare!' : 'List is empty. Add trips to get started!'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

const colorOptions = [
  { value: 'emerald', label: 'Emerald', class: 'from-emerald-500 to-teal-600' },
  { value: 'blue', label: 'Blue', class: 'from-blue-500 to-indigo-600' },
  { value: 'purple', label: 'Purple', class: 'from-purple-500 to-pink-600' },
  { value: 'orange', label: 'Orange', class: 'from-orange-500 to-red-600' },
  { value: 'pink', label: 'Pink', class: 'from-pink-500 to-rose-600' },
];