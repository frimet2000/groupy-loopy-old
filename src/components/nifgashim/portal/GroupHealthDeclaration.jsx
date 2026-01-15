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
      title: "Заявление о здоровье и ответственности руководителя группы",
      responsibility: "Я заявляю, что несу полную ответственность за всех членов своей группы",
      health: "Я подтверждаю, что все члены группы здоровы и могут участвовать в походе",
      fullResponsibility: "Я несу полную ответственность за всех членов группы во все время",
      emergencies: "Я немедленно сообщу о любой чрезвычайной ситуации или проблеме со здоровьем",
      agreement: "Я согласен с указанными выше условиями и подтверждаю, что эта информация точна"
    },
    es: {
      title: "Declaración de Salud y Responsabilidad del Líder del Grupo",
      responsibility: "Por este medio declaro que soy totalmente responsable de todos los miembros de mi grupo",
      health: "Confirmo que todos los miembros del grupo están sanos y pueden participar en la caminata",
      fullResponsibility: "Asumo la responsabilidad total de todos los miembros del grupo en todo momento",
      emergencies: "Reportaré inmediatamente cualquier emergencia o problema de salud",
      agreement: "Estoy de acuerdo con los términos anteriores y confirmo que esta información es precisa"
    },
    fr: {
      title: "Déclaration de santé et responsabilité du chef de groupe",
      responsibility: "Je déclare par la présente que je suis entièrement responsable de tous les membres de mon groupe",
      health: "Je confirme que tous les membres du groupe sont en bonne santé et capables de participer à la randonnée",
      fullResponsibility: "J'assume l'entière responsabilité de tous les membres du groupe à tout moment",
      emergencies: "Je signalerai immédiatement toute situation d'urgence ou problème de santé",
      agreement: "J'accepte les conditions ci-dessus et confirme que ces informations sont exactes"
    },
    de: {
      title: "Gesundheitserklärung und Verantwortung des Gruppenleiters",
      responsibility: "Ich erkläre hiermit, dass ich vollständig verantwortlich für alle Mitglieder meiner Gruppe bin",
      health: "Ich bestätige, dass alle Gruppenmitglieder gesund sind und an der Wanderung teilnehmen können",
      fullResponsibility: "Ich übernehme die volle Verantwortung für alle Gruppenmitglieder jederzeit",
      emergencies: "Ich werde jeden Notfall oder jedes Gesundheitsproblem sofort melden",
      agreement: "Ich akzeptiere die obigen Bedingungen und bestätige, dass diese Informationen korrekt sind"
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