// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '../../LanguageContext';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GroupHealthDeclaration({ accepted, onAccept, leaderName }) {
  const { language, isRTL } = useLanguage();

  const declarations = {
    he: {
      title: "הצהרת בריאות מדריך הקבוצה",
      declarationText: `אני ${leaderName} ראש קבוצת מצהיר כי:

1. קראתי את כל הוראות הבטיחות ופרטי המסלולים אליהם נרשמנו.

2. וידאתי שכל חברי הקבוצה בריאים וכשירים להשתתף במסלולים אליהם נרשמנו.

3. אני אחראי להתנהגות תקינה של חברי קבוצתי בהתאם להוראות הבטיחות ונחיות מארגני המסע.

4. אני אדווח למארגני המסע על כל בעיה רפואית או בטיחותית שתיווצר מזמן השתתפותנו במסע, ואפעל בהתאם להוראותיהם.`,
      
      agreement: "אני מאשר/ת כי קראתי את ההצהרה, הבנתי את כל התוכן, וההסכמה שלי היא ברצוני החופשי",
      warning: "חובה לאשר הצהרה זו כדי להמשיך"
    },
    en: {
      title: "Group Leader Health Declaration",
      declarationText: `I ${leaderName}, group leader, declare that:

1. I have read all safety instructions and details of the routes to which we registered.

2. I have verified that all group members are healthy and fit to participate in the routes to which we registered.

3. I am responsible for the proper conduct of my group members in accordance with safety instructions and guidelines of the trek organizers.

4. I will report to the trek organizers any medical or safety issue that arises from the time of our participation in the trek, and will act according to their instructions.`,
      
      agreement: "I confirm that I have read the declaration, fully understand its contents, and my agreement is given of my own free will",
      warning: "You must confirm this declaration to continue"
    },
    ru: {
      title: "Декларация здоровья руководителя группы",
      declarationText: `Я ${leaderName}, руководитель группы, заявляю, что:

1. Я прочитал все инструкции по безопасности и детали маршрутов, на которые мы зарегистрированы.

2. Я убедился, что все члены группы здоровы и подходят для участия в маршрутах, на которые мы зарегистрированы.

3. Я отвечаю за надлежащее поведение членов моей группы в соответствии с инструкциями по безопасности и руководством организаторов похода.

4. Я сообщу организаторам похода о любой медицинской или проблеме безопасности, которая возникнет с момента нашего участия в походе, и буду действовать в соответствии с их инструкциями.`,
      
      agreement: "Я подтверждаю, что прочитал декларацию, полностью понимаю ее содержание, и мое согласие дано добровольно",
      warning: "Вы должны подтвердить эту декларацию, чтобы продолжить"
    },
    es: {
      title: "Declaración de Salud del Líder de Grupo",
      declarationText: `Yo ${leaderName}, líder del grupo, declaro que:

1. He leído todas las instrucciones de seguridad y detalles de las rutas a las que nos registramos.

2. He verificado que todos los miembros del grupo están sanos y aptos para participar en las rutas a las que nos registramos.

3. Soy responsable de la conducta adecuada de los miembros de mi grupo de acuerdo con las instrucciones de seguridad y pautas de los organizadores del trekking.

4. Informaré a los organizadores del trekking sobre cualquier problema médico o de seguridad que surja desde el momento de nuestra participación en el trekking, y actuaré de acuerdo con sus instrucciones.`,
      
      agreement: "Confirmo que he leído la declaración, entiendo completamente su contenido, y mi acuerdo se da por mi propia voluntad",
      warning: "Debe confirmar esta declaración para continuar"
    },
    fr: {
      title: "Déclaration de Santé du Chef de Groupe",
      declarationText: `Moi ${leaderName}, chef du groupe, déclare que:

1. J'ai lu toutes les instructions de sécurité et les détails des itinéraires auxquels nous nous sommes inscrits.

2. J'ai vérifié que tous les membres du groupe sont en bonne santé et aptes à participer aux itinéraires auxquels nous nous sommes inscrits.

3. Je suis responsable de la conduite appropriée des membres de mon groupe conformément aux instructions de sécurité et aux directives des organisateurs du trek.

4. Je signalerai aux organisateurs du trek tout problème médical ou de sécurité qui survient dès notre participation au trek, et j'agirai selon leurs instructions.`,
      
      agreement: "Je confirme que j'ai lu la déclaration, que j'en comprends pleinement le contenu, et que mon consentement est donné librement",
      warning: "Vous devez confirmer cette déclaration pour continuer"
    },
    de: {
      title: "Gesundheitserklärung des Gruppenleiters",
      declarationText: `Ich ${leaderName}, Gruppenleiter, erkläre, dass:

1. Ich alle Sicherheitsanweisungen und Details der Routen gelesen habe, für die wir uns angemeldet haben.

2. Ich überprüft habe, dass alle Gruppenmitglieder gesund und geeignet sind, an den Routen teilzunehmen, für die wir uns angemeldet haben.

3. Ich für das angemessene Verhalten meiner Gruppenmitglieder gemäß den Sicherheitsanweisungen und Richtlinien der Trek-Organisatoren verantwortlich bin.

4. Ich den Trek-Organisatoren jedes medizinische oder Sicherheitsproblem melden werde, das ab dem Zeitpunkt unserer Teilnahme am Trek auftritt, und entsprechend ihren Anweisungen handeln werde.`,
      
      agreement: "Ich bestätige, dass ich die Erklärung gelesen habe, ihren Inhalt vollständig verstehe, und mein Einverständnis freiwillig gegeben wird",
      warning: "Sie müssen diese Erklärung bestätigen, um fortzufahren"
    },
    it: {
      title: "Dichiarazione di Salute del Capo Gruppo",
      declarationText: `Io ${leaderName}, capo del gruppo, dichiaro che:

1. Ho letto tutte le istruzioni di sicurezza e i dettagli dei percorsi a cui ci siamo registrati.

2. Ho verificato che tutti i membri del gruppo sono sani e idonei a partecipare ai percorsi a cui ci siamo registrati.

3. Sono responsabile della condotta appropriata dei membri del mio gruppo in conformità con le istruzioni di sicurezza e le linee guida degli organizzatori del trek.

4. Segnalerò agli organizzatori del trek qualsiasi problema medico o di sicurezza che sorga dal momento della nostra partecipazione al trek, e agirò secondo le loro istruzioni.`,
      
      agreement: "Confermo di aver letto la dichiarazione, di comprendere pienamente il suo contenuto, e che il mio accordo è dato di mia libera volontà",
      warning: "Devi confermare questa dichiarazione per continuare"
    }
  };

  const trans = declarations[language] || declarations.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden border-2 border-red-300 max-h-[70vh] flex flex-col">
        <CardHeader className="bg-gradient-to-r from-red-700 to-red-900 text-white shrink-0">
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
            <AlertCircle className="w-7 h-7" />
            {trans.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {/* Declaration Text */}
          <div className="space-y-3 bg-blue-50 p-4 sm:p-6 rounded-lg border-2 border-blue-200">
            <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-medium">{trans.declarationText}</p>
          </div>

          {/* Warning Alert */}
          {!accepted && (
            <Alert className="border-2 border-red-300 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-900 font-semibold">
                {trans.warning}
              </AlertDescription>
            </Alert>
          )}

          {/* Acceptance Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-red-300 transition-colors sticky bottom-0">
            <Checkbox
              id="groupHealthDeclaration"
              checked={accepted}
              onCheckedChange={onAccept}
              className="mt-1 shrink-0"
            />
            <Label 
              htmlFor="groupHealthDeclaration" 
              className="cursor-pointer font-semibold text-gray-900 pt-0.5"
            >
              {trans.agreement}
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
                {language === 'he' ? 'אושרה הצהרת ראש הקבוצה' : language === 'ru' ? 'Заявление руководителя группы подтверждено' : language === 'es' ? 'Declaración del líder del grupo confirmada' : language === 'fr' ? 'Déclaration du chef de groupe confirmée' : language === 'de' ? 'Erklärung des Gruppenleiters bestätigt' : language === 'it' ? 'Dichiarazione del capo gruppo confermata' : 'Group leader declaration confirmed'}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}