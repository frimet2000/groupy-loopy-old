// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLanguage } from '../../LanguageContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GroupHealthDeclaration({ accepted, onAccept, leaderName, language: passedLanguage }) {
  const { language: contextLanguage, isRTL } = useLanguage();
  const language = passedLanguage || contextLanguage;

  const declarations = {
    he: {
      title: "הצהרת בריאות",
      responsibility: "אני מצהיר/ה כי אני בריא/ה וכשיר/ה בפיזית להשתתף בטיול זה",
      health: "אין לי מצבים רפואיים למשוקעים להשפיע על יכולתי לשנוע את הפעילויות",
      fullResponsibility: "הצהרה זו נכונה להיום ואני אחראי/ת לכל מידע שגוי או מסתר",
      emergencies: "אני מודע/ת לכך שהשתתפות בטיול זה כרוכה בסיכונים פיזיים משמעותיים",
      agreement: "אני מאשר/ת את הצהרת הבריאות"
    },
    en: {
      title: "Health Declaration",
      responsibility: "I hereby declare that I am in good health and physically fit to participate in this trek",
      health: "I do not have any medical conditions that could affect my ability to participate in physical activities",
      fullResponsibility: "This declaration is true today and I am responsible for any false or concealed information",
      emergencies: "I acknowledge that participation in this trek involves significant inherent risks",
      agreement: "I confirm the Health Declaration"
    },
    ru: {
      title: "Медицинское заявление",
      responsibility: "Я заявляю, что я в хорошем здоровье и физически готов к участию в этом походе",
      health: "У меня нет никаких медицинских состояний, которые могут повлиять на мою способность участвовать в физических упражнениях",
      fullResponsibility: "Это заявление верно сегодня, и я несу ответственность за любую ложную или скрытую информацию",
      emergencies: "Я признаю, что участие в этом походе влечет за собой значительные присущие риски",
      agreement: "Я подтверждаю медицинское заявление"
    },
    es: {
      title: "Declaración de Salud",
      responsibility: "Por este medio declaro que estoy en buen estado de salud y en condiciones físicas para participar en este trekking",
      health: "No tengo ninguna condición médica que pueda afectar mi capacidad de participar en actividades físicas",
      fullResponsibility: "Esta declaración es verdadera hoy y soy responsable de cualquier información falsa u oculta",
      emergencies: "Reconozco que la participación en este trekking implica riesgos inherentes significativos",
      agreement: "Confirmo la Declaración de Salud"
    },
    fr: {
      title: "Déclaration de Santé",
      responsibility: "Je déclare par la présente que je suis en bonne santé et physiquement apte à participer à cette randonnée",
      health: "Je n'ai pas de conditions médicales qui pourraient affecter ma capacité à participer à des activités physiques",
      fullResponsibility: "Cette déclaration est véridique aujourd'hui et je suis responsable de toute information fausse ou dissimulée",
      emergencies: "Je reconnais que la participation à cette randonnée comporte des risques inhérents importants",
      agreement: "Je confirme la Déclaration de Santé"
    },
    de: {
      title: "Gesundheitserklärung",
      responsibility: "Ich erkläre hiermit, dass ich bei guter Gesundheit bin und physisch in der Lage bin, an dieser Wanderung teilzunehmen",
      health: "Ich habe keine medizinischen Zustände, die meine Fähigkeit zur Teilnahme an physischen Aktivitäten beeinträchtigen könnten",
      fullResponsibility: "Diese Erklärung ist heute wahr und ich bin verantwortlich für falsche oder verborgene Informationen",
      emergencies: "Ich erkenne an, dass die Teilnahme an dieser Wanderung erhebliche Risiken mit sich bringt",
      agreement: "Ich bestätige die Gesundheitserklärung"
    },
    it: {
      title: "Dichiarazione di salute e responsabilità del capo gruppo",
      responsibility: "Dichiaro con la presente che sono pienamente responsabile di tutti i membri del mio gruppo",
      health: "Confermo che tutti i membri del gruppo sono in buona salute e possono partecipare all'escursione",
      fullResponsibility: "Mi assumo la piena responsabilità di tutti i membri del gruppo in ogni momento",
      emergencies: "Segnaleró immediatamente qualsiasi emergenza o problema di salute",
      agreement: "Accetto i termini di cui sopra e confermo che queste informazioni sono accurate"
    }
  };

  const trans = declarations[language] || declarations.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-2 border-orange-200 bg-orange-50">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            {trans.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="p-4 bg-white border-l-4 border-orange-500 rounded">
            <p className="font-semibold text-gray-900">{leaderName}</p>
            <p className="text-sm text-gray-600 mt-1">{trans.responsibility}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-white rounded border border-gray-200">
              <div className="pt-1">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              </div>
              <p className="text-gray-700">{trans.health}</p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded border border-gray-200">
              <div className="pt-1">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              </div>
              <p className="text-gray-700">{trans.fullResponsibility}</p>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded border border-gray-200">
              <div className="pt-1">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              </div>
              <p className="text-gray-700">{trans.emergencies}</p>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-orange-200">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <Checkbox
                id="acceptDeclaration"
                checked={accepted}
                onCheckedChange={onAccept}
              />
              <Label htmlFor="acceptDeclaration" className="cursor-pointer font-semibold text-gray-900">
                {trans.agreement}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}