// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '../../LanguageContext';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function GroupParticipantCount({ totalCount, onCountChange }) {
  const { language, isRTL } = useLanguage();
  const [error, setError] = useState('');

  const labels = {
    he: {
      title: "כמות משתתפים בקבוצה",
      count: "כמות משתתפים כוללת",
      required: "שדה חובה",
      invalid: "אנא הזן מספר חיובי",
      placeholder: "לדוגמה: 25"
    },
    en: {
      title: "Group Participant Count",
      count: "Total Number of Participants",
      required: "Required field",
      invalid: "Please enter a positive number",
      placeholder: "e.g., 25"
    },
    ru: {
      title: "Количество участников группы",
      count: "Общее количество участников",
      required: "Обязательное поле",
      invalid: "Пожалуйста, введите положительное число",
      placeholder: "например: 25"
    },
    es: {
      title: "Cantidad de participantes del grupo",
      count: "Número total de participantes",
      required: "Campo requerido",
      invalid: "Por favor ingrese un número positivo",
      placeholder: "p.ej., 25"
    },
    fr: {
      title: "Nombre de participants du groupe",
      count: "Nombre total de participants",
      required: "Champ obligatoire",
      invalid: "Veuillez entrer un nombre positif",
      placeholder: "par exemple: 25"
    },
    de: {
      title: "Teilnehmerzahl der Gruppe",
      count: "Gesamtzahl der Teilnehmer",
      required: "Erforderliches Feld",
      invalid: "Bitte geben Sie eine positive Zahl ein",
      placeholder: "z.B. 25"
    },
    it: {
      title: "Numero di partecipanti del gruppo",
      count: "Numero totale di partecipanti",
      required: "Campo obbligatorio",
      invalid: "Per favore inserisci un numero positivo",
      placeholder: "es., 25"
    }
  };

  const trans = labels[language] || labels.en;

  const handleChange = (e) => {
    const value = e.target.value;
    
    if (!value) {
      setError('');
      onCountChange(0);
      return;
    }

    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue) || numValue <= 0) {
      setError(trans.invalid);
      return;
    }

    setError('');
    onCountChange(numValue);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            {trans.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <Label className="text-gray-900 font-semibold">
                {trans.count} *
              </Label>
              <Input
                type="number"
                min="1"
                value={totalCount || ''}
                onChange={handleChange}
                placeholder={trans.placeholder}
                className={error ? 'border-red-500' : ''}
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>

            {totalCount > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-gray-600">
                  {language === 'he' 
                    ? `הקבוצה שלך כוללת ${totalCount} משתתפים`
                    : `Your group includes ${totalCount} participants`
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}