// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const translations = {
  he: {
    title: 'הצהרת בריאות',
    subtitle: 'אנא קרא בעיון וודא שהבנת את ההצהרות להלן',
    declaration1: 'אני מצהיר/ה כי אני במצב בריאותי טוב ויכול/ה להשתתף בטיול זה',
    declaration2: 'אין לי מצבים רפואיים שעלולים להשפיע על יכולתי להשתתף בפעילויות',
    declaration3: 'הצהרה זו נכונה להיום ואני מאחראי/ת על מידע שגוי',
    agreeConfirm: 'אני מאשר/ת את הצהרות בריאותי',
    warning: 'חובה לאשר את הצהרות הבריאות כדי להמשיך'
  },
  en: {
    title: 'Health Declaration',
    subtitle: 'Please read carefully and confirm you understand the following statements',
    declaration1: 'I declare that I am in good health and able to participate in this trip',
    declaration2: 'I do not have any medical conditions that could affect my ability to participate in activities',
    declaration3: 'This declaration is true today and I am responsible for any false information',
    agreeConfirm: 'I confirm my health declarations',
    warning: 'You must confirm the health declarations to continue'
  },
  ru: {
    title: 'Медицинское заявление',
    subtitle: 'Пожалуйста, внимательно прочитайте и подтвердите, что вы понимаете следующие утверждения',
    declaration1: 'Я заявляю, что я в хорошем состоянии здоровья и могу участвовать в этой поездке',
    declaration2: 'У меня нет никаких заболеваний, которые могут повлиять на мою способность участвовать в деятельности',
    declaration3: 'Это заявление верно на сегодняшний день и я несу ответственность за любую ложную информацию',
    agreeConfirm: 'Я подтверждаю свои медицинские заявления',
    warning: 'Вы должны подтвердить медицинские заявления, чтобы продолжить'
  },
  es: {
    title: 'Declaración de Salud',
    subtitle: 'Por favor, lea cuidadosamente y confirme que entiende las siguientes declaraciones',
    declaration1: 'Declaro que estoy en buen estado de salud y puedo participar en este viaje',
    declaration2: 'No tengo ninguna condición médica que pueda afectar mi capacidad para participar en actividades',
    declaration3: 'Esta declaración es verdadera hoy y soy responsable de cualquier información falsa',
    agreeConfirm: 'Confirmo mis declaraciones de salud',
    warning: 'Debe confirmar las declaraciones de salud para continuar'
  },
  fr: {
    title: 'Déclaration de Santé',
    subtitle: 'Veuillez lire attentivement et confirmer que vous comprenez les déclarations suivantes',
    declaration1: 'Je déclare que je suis en bonne santé et capable de participer à ce voyage',
    declaration2: 'Je n\'ai pas de conditions médicales qui pourraient affecter ma capacité à participer à des activités',
    declaration3: 'Cette déclaration est véridique aujourd\'hui et je suis responsable de toute fausse information',
    agreeConfirm: 'Je confirme mes déclarations de santé',
    warning: 'Vous devez confirmer les déclarations de santé pour continuer'
  },
  de: {
    title: 'Gesundheitserklärung',
    subtitle: 'Bitte lesen Sie sorgfältig durch und bestätigen Sie, dass Sie die folgenden Aussagen verstehen',
    declaration1: 'Ich erkläre, dass ich in guter Gesundheit bin und an dieser Reise teilnehmen kann',
    declaration2: 'Ich habe keine medizinischen Zustände, die meine Fähigkeit zur Teilnahme an Aktivitäten beeinträchtigen könnten',
    declaration3: 'Diese Erklärung ist heute wahr und ich bin verantwortlich für falsche Informationen',
    agreeConfirm: 'Ich bestätige meine Gesundheitserklärungen',
    warning: 'Sie müssen die Gesundheitserklärungen bestätigen, um fortzufahren'
  },
  it: {
    title: 'Dichiarazione di Salute',
    subtitle: 'Si prega di leggere attentamente e confermare di aver compreso i seguenti statement',
    declaration1: 'Dichiaro di essere in buone condizioni di salute e idoneo a partecipare a questo viaggio',
    declaration2: 'Non ho condizioni mediche che potrebbero influire sulla mia capacità di partecipare alle attività',
    declaration3: 'Questa dichiarazione è vera oggi e sono responsabile di qualsiasi informazione falsa',
    agreeConfirm: 'Confermo le mie dichiarazioni di salute',
    warning: 'Devi confermare le dichiarazioni di salute per continuare'
  }
};

export default function HealthDeclaration({ accepted, onAccept, language = 'en' }) {
  const t = translations[language] || translations.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <CardTitle className="text-2xl">{t.title}</CardTitle>
          <p className="text-amber-50 mt-2 text-sm">{t.subtitle}</p>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Declarations */}
          <div className="space-y-4 bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
            <div className="space-y-3">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-800">{t.declaration1}</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-800">{t.declaration2}</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-800">{t.declaration3}</p>
              </div>
            </div>
          </div>

          {/* Warning Alert */}
          {!accepted && (
            <Alert className="border-2 border-amber-300 bg-amber-50">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <AlertDescription className="text-amber-900 font-semibold">
                {t.warning}
              </AlertDescription>
            </Alert>
          )}

          {/* Acceptance Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-amber-300 transition-colors">
            <Checkbox
              id="healthDeclaration"
              checked={accepted}
              onCheckedChange={onAccept}
              className="mt-1"
            />
            <Label 
              htmlFor="healthDeclaration" 
              className="cursor-pointer font-semibold text-gray-900 pt-0.5"
            >
              {t.agreeConfirm}
            </Label>
          </div>

          {/* Success Message */}
          {accepted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center gap-2"
            >
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <p className="text-green-800 font-semibold">
                {language === 'he' ? 'אושרה הצהרת בריאות' : language === 'ru' ? 'Медицинское заявление подтверждено' : language === 'es' ? 'Declaración de salud confirmada' : language === 'fr' ? 'Déclaration de santé confirmée' : language === 'de' ? 'Gesundheitserklärung bestätigt' : language === 'it' ? 'Dichiarazione di salute confermata' : 'Health declaration confirmed'}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}