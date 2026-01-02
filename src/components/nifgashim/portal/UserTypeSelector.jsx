import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../../LanguageContext';
import { UserCheck, Users, UsersRound } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UserTypeSelector({ selectedType, onSelect }) {
  const { language, isRTL } = useLanguage();

  const translations = {
    he: {
      title: "איך תרצו להירשם?",
      individual: "אישי",
      individualDesc: "הרשמה עבור אדם אחד",
      family: "משפחתי",
      familyDesc: "הרשמה עבור משפחה",
      group: "קבוצה מאורגנת",
      groupDesc: "בית ספר, צבא, נוער - ללא תשלום"
    },
    en: {
      title: "How would you like to register?",
      individual: "Individual",
      individualDesc: "Registration for one person",
      family: "Family",
      familyDesc: "Registration for a family",
      group: "Organized Group",
      groupDesc: "School, military, youth - Free"
    },
    ru: {
      title: "Как вы хотите зарегистрироваться?",
      individual: "Индивидуально",
      individualDesc: "Регистрация для одного человека",
      family: "Семья",
      familyDesc: "Регистрация для семьи",
      group: "Организованная группа",
      groupDesc: "Школа, армия, молодежь - Бесплатно"
    },
    es: {
      title: "¿Cómo te gustaría registrarte?",
      individual: "Individual",
      individualDesc: "Registro para una persona",
      family: "Familia",
      familyDesc: "Registro para una familia",
      group: "Grupo organizado",
      groupDesc: "Escuela, militar, jóvenes - Gratis"
    },
    fr: {
      title: "Comment souhaitez-vous vous inscrire?",
      individual: "Individuel",
      individualDesc: "Inscription pour une personne",
      family: "Famille",
      familyDesc: "Inscription pour une famille",
      group: "Groupe organisé",
      groupDesc: "École, militaire, jeunesse - Gratuit"
    },
    de: {
      title: "Wie möchten Sie sich registrieren?",
      individual: "Einzeln",
      individualDesc: "Registrierung für eine Person",
      family: "Familie",
      familyDesc: "Registrierung für eine Familie",
      group: "Organisierte Gruppe",
      groupDesc: "Schule, Militär, Jugend - Kostenlos"
    },
    it: {
      title: "Come vorresti registrarti?",
      individual: "Individuale",
      individualDesc: "Registrazione per una persona",
      family: "Famiglia",
      familyDesc: "Registrazione per una famiglia",
      group: "Gruppo organizzato",
      groupDesc: "Scuola, militare, gioventù - Gratuito"
    }
  };

  const trans = translations[language] || translations.en;

  const types = [
    { id: 'individual', icon: UserCheck, title: trans.individual, desc: trans.individualDesc, color: 'from-blue-500 to-cyan-500' },
    { id: 'family', icon: Users, title: trans.family, desc: trans.familyDesc, color: 'from-purple-500 to-pink-500' },
    { id: 'group', icon: UsersRound, title: trans.group, desc: trans.groupDesc, color: 'from-emerald-500 to-teal-500' }
  ];

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <CardTitle className="text-2xl text-center">{trans.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {types.map((type, idx) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Button
                  variant={selectedType === type.id ? 'default' : 'outline'}
                  className={`w-full h-40 flex flex-col items-center justify-center gap-3 ${
                    selectedType === type.id
                      ? `bg-gradient-to-br ${type.color} text-white shadow-xl scale-105`
                      : 'hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onClick={() => onSelect(type.id)}
                >
                  <Icon className="w-12 h-12" />
                  <div className="text-center">
                    <div className="font-bold text-lg">{type.title}</div>
                    <div className="text-xs opacity-80">{type.desc}</div>
                  </div>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}