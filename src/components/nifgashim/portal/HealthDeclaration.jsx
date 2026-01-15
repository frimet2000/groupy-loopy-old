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
    title: 'הצהרת בריאות וחוק משחרור אחריות',
    subtitle: 'אנא קרא בעיון. השתתפות בטיול תבחר זה היא על בסיס דעת קהל ואחריותך בלבד.',
    healthSection: 'הצהרת בריאות וכושר פיזי',
    healthText: 'אני מצהיר/ה בזאת כי אני בריא/ה, כשיר/ה וחזקתי מספיק לשתתף בטיול זה. אין לי מצבים רפואיים שעלולים להשפיע על יכולתי להשתתף בפעילויות פיזיות. הצהרה זו נכונה להיום ואני אחראי/ת לכל מידע שגוי או מסתר.',
    liabilitySection: 'משחרור אחריות וקבלת סיכונים',
    liabilityText: 'אני מודע/ת לכך שהשתתפות בטיול זה כרוכה בסיכונים פיזיים משמעותיים, כולל אך לא מוגבל ל: פציעות, מחלות, אובדן חיים וקשות נזק פיזי. אני לוקח/ת על עצמי באופן מלא וגמור את כל הסיכונים הללו. אני משחרר/ת ומשחרר/ת מכל אחריות את מארגני הטיול, Groupy Loopy, המדריכים, הנציגים, העובדים וכל צד שלישי הקשור לאירוע זה מכל דרישה, תביעה, הוצאה, נזק או אובדן הנובע מהשתתפותי בטיול זה.',
    organizerSection: 'אחריות מארגנים ויוצרי האתר',
    organizerText: 'מארגני הטיול, Groupy Loopy, יוצרי האתר וכל נציג שלהם אינם אחראים בשום צורה לכל פציעה, מחלה, אובדן חיים או נזקים אחרים שעלולים להיגרם במהלך הטיול או בעקבותיו. השתתפותי בטיול זה היא בחירה חופשית ומלאה בידיעה על כל הסיכונים.',
    agreeConfirm: 'אני מאשר/ת את הצהרת הבריאות וחוק משחרור האחריות',
    warning: 'חובה לאשר את ההצהרה כדי להמשיך'
  },
  en: {
    title: 'Health Declaration and Liability Waiver',
    subtitle: 'Please read carefully. Participation in this trek is entirely at your own discretion and risk.',
    healthSection: 'Health and Fitness Declaration',
    healthText: 'I hereby declare that I am in good health and physically fit to participate in this trek. I do not have any medical conditions that could affect my ability to participate in physical activities. This declaration is true today and I am responsible for any false or concealed information.',
    liabilitySection: 'Assumption of Risk and Liability Release',
    liabilityText: 'I acknowledge that participation in this trek involves significant inherent risks, including but not limited to: physical injury, illness, death, and serious physical damages. I assume all such risks in full. I hereby release and hold harmless the trek organizers, Groupy Loopy, guides, representatives, employees, and any third party associated with this event from any and all claims, demands, expenses, damages, or losses arising from my participation in this trek.',
    organizerSection: 'Organizer and Website Creator Liability',
    organizerText: 'Trek organizers, Groupy Loopy, website creators, and all their representatives are not responsible in any way for any injury, illness, death, or other damages that may occur during or as a result of the trek. My participation in this trek is a free and informed choice made with full knowledge of all risks involved.',
    agreeConfirm: 'I confirm the Health Declaration and Liability Waiver',
    warning: 'You must confirm the declaration to continue'
  },
  ru: {
    title: 'Медицинское заявление и отказ от ответственности',
    subtitle: 'Пожалуйста, внимательно прочитайте. Участие в этом походе осуществляется исключительно по вашему усмотрению и на ваш риск.',
    healthSection: 'Заявление о здоровье и физической подготовке',
    healthText: 'Я настоящим заявляю, что я в хорошем здоровье и физически готов к участию в этом походе. У меня нет никаких медицинских состояний, которые могут повлиять на мою способность участвовать в физических упражнениях. Это заявление верно сегодня, и я несу ответственность за любую ложную или скрытую информацию.',
    liabilitySection: 'Принятие риска и освобождение от ответственности',
    liabilityText: 'Я признаю, что участие в этом походе влечет за собой значительные присущие риски, включая, но не ограничиваясь: физические травмы, болезни, смерть и серьезные физические повреждения. Я полностью принимаю все такие риски. Я настоящим освобождаю и защищаю организаторов похода, Groupy Loopy, гидов, представителей, сотрудников и любую третью сторону, связанную с этим событием, от любых претензий, требований, расходов, убытков или потерь, вытекающих из моего участия в этом походе.',
    organizerSection: 'Ответственность организаторов и создателей сайта',
    organizerText: 'Организаторы походов, Groupy Loopy, создатели веб-сайтов и все их представители ни в коем случае не несут ответственности за какие-либо травмы, болезни, смерть или другие убытки, которые могут произойти во время или в результате похода. Мое участие в этом походе является свободным и осознанным выбором, сделанным с полным знанием всех связанных рисков.',
    agreeConfirm: 'Я подтверждаю Медицинское заявление и отказ от ответственности',
    warning: 'Вы должны подтвердить заявление, чтобы продолжить'
  },
  es: {
    title: 'Declaración de Salud y Exención de Responsabilidad',
    subtitle: 'Por favor, lea cuidadosamente. La participación en este trekking es enteramente a su discreción y riesgo.',
    healthSection: 'Declaración de Salud y Aptitud Física',
    healthText: 'Por este medio declaro que estoy en buen estado de salud y en condiciones físicas para participar en este trekking. No tengo ninguna condición médica que pueda afectar mi capacidad de participar en actividades físicas. Esta declaración es verdadera hoy y soy responsable de cualquier información falsa u oculta.',
    liabilitySection: 'Asunción de Riesgo y Exención de Responsabilidad',
    liabilityText: 'Reconozco que la participación en este trekking implica riesgos inherentes significativos, incluyendo pero no limitado a: lesiones físicas, enfermedades, muerte y daños físicos graves. Asumo completamente todos estos riesgos. Por este medio libero y eximo de responsabilidad a los organizadores del trekking, Groupy Loopy, guías, representantes, empleados y cualquier tercero asociado con este evento de cualquier reclamo, demanda, gasto, daño o pérdida derivado de mi participación en este trekking.',
    organizerSection: 'Responsabilidad de Organizadores y Creadores de Sitios Web',
    organizerText: 'Los organizadores del trekking, Groupy Loopy, creadores de sitios web y todos sus representantes no son responsables en modo alguno de ninguna lesión, enfermedad, muerte u otros daños que puedan ocurrir durante o como resultado del trekking. Mi participación en este trekking es una opción libre e informada tomada con pleno conocimiento de todos los riesgos involucrados.',
    agreeConfirm: 'Confirmo la Declaración de Salud y Exención de Responsabilidad',
    warning: 'Debes confirmar la declaración para continuar'
  },
  fr: {
    title: 'Déclaration de Santé et Décharge de Responsabilité',
    subtitle: 'Veuillez lire attentivement. La participation à cette randonnée est entièrement à votre discrétion et à vos risques.',
    healthSection: 'Déclaration de Santé et d\'Aptitude Physique',
    healthText: 'Je déclare par les présentes que je suis en bonne santé et physiquement apte à participer à cette randonnée. Je n\'ai pas de conditions médicales qui pourraient affecter ma capacité à participer à des activités physiques. Cette déclaration est véridique aujourd\'hui et je suis responsable de toute information fausse ou dissimulée.',
    liabilitySection: 'Acceptation des Risques et Décharge de Responsabilité',
    liabilityText: 'Je reconnais que la participation à cette randonnée comporte des risques inhérents importants, y compris mais non limité à: les blessures physiques, les maladies, le décès et les dommages physiques graves. J\'assume pleinement tous ces risques. Je libère et exonère par les présentes les organisateurs de la randonnée, Groupy Loopy, les guides, les représentants, les employés et tout tiers associé à cet événement de toute réclamation, demande, dépense, dommage ou perte découlant de ma participation à cette randonnée.',
    organizerSection: 'Responsabilité des Organisateurs et Créateurs de Sites Web',
    organizerText: 'Les organisateurs de randonnée, Groupy Loopy, les créateurs de sites Web et tous leurs représentants ne sont en aucun cas responsables de toute blessure, maladie, décès ou autre dommage pouvant survenir au cours ou à la suite de la randonnée. Ma participation à cette randonnée est un choix libre et éclairé pris avec une connaissance complète de tous les risques impliqués.',
    agreeConfirm: 'Je confirme la Déclaration de Santé et la Décharge de Responsabilité',
    warning: 'Vous devez confirmer la déclaration pour continuer'
  },
  de: {
    title: 'Gesundheitserklärung und Haftungsausschluss',
    subtitle: 'Bitte lesen Sie sorgfältig. Die Teilnahme an dieser Wanderung erfolgt ganz nach Ihrem Ermessen und auf Ihr Risiko hin.',
    healthSection: 'Gesundheits- und Fitnesserklärung',
    healthText: 'Ich erkläre hiermit, dass ich bei guter Gesundheit bin und physisch in der Lage bin, an dieser Wanderung teilzunehmen. Ich habe keine medizinischen Zustände, die meine Fähigkeit zur Teilnahme an physischen Aktivitäten beeinträchtigen könnten. Diese Erklärung ist heute wahr und ich bin verantwortlich für falsche oder verborgene Informationen.',
    liabilitySection: 'Risikoübernahme und Haftungsausschluss',
    liabilityText: 'Ich erkenne an, dass die Teilnahme an dieser Wanderung erhebliche Risiken mit sich bringt, einschließlich, aber nicht beschränkt auf: körperliche Verletzungen, Krankheiten, Tod und ernsthafte physische Schäden. Ich übernehme vollständig alle diese Risiken. Ich befreie und halte hiermit die Wanderungsorganisatoren, Groupy Loopy, Führer, Vertreter, Arbeitnehmer und alle mit diesem Ereignis verbundenen Dritten schadlos von allen Ansprüchen, Forderungen, Kosten, Schäden oder Verlusten, die sich aus meiner Teilnahme an dieser Wanderung ergeben.',
    organizerSection: 'Haftung von Organisatoren und Website-Erstellern',
    organizerText: 'Wanderungsorganisatoren, Groupy Loopy, Website-Ersteller und alle ihre Vertreter sind in keiner Weise verantwortlich für Verletzungen, Krankheiten, Tod oder andere Schäden, die während oder infolge der Wanderung auftreten können. Meine Teilnahme an dieser Wanderung ist eine freie und informierte Entscheidung, die mit vollem Verständnis aller beteiligten Risiken getroffen wird.',
    agreeConfirm: 'Ich bestätige die Gesundheitserklärung und den Haftungsausschluss',
    warning: 'Sie müssen die Erklärung bestätigen, um fortzufahren'
  },
  it: {
    title: 'Dichiarazione di Salute ed Esonero di Responsabilità',
    subtitle: 'Si prega di leggere attentamente. La partecipazione a questo trekking è interamente a vostra discrezione e rischio.',
    healthSection: 'Dichiarazione di Salute e Idoneità Fisica',
    healthText: 'Dichiaro per mezzo di questo che sono in buona salute e in condizioni fisiche per partecipare a questo trekking. Non ho condizioni mediche che potrebbero influire sulla mia capacità di partecipare ad attività fisiche. Questa dichiarazione è vera oggi e sono responsabile di qualsiasi informazione falsa o nascosta.',
    liabilitySection: 'Assunzione di Rischio ed Esonero di Responsabilità',
    liabilityText: 'Riconosco che la partecipazione a questo trekking comporta rischi inerenti significativi, inclusi ma non limitati a: lesioni fisiche, malattie, morte e gravi danni fisici. Assumo completamente tutti questi rischi. Per mezzo di questo libero e esonero da responsabilità gli organizzatori del trekking, Groupy Loopy, le guide, i rappresentanti, i dipendenti e qualsiasi terza parte associata a questo evento da qualsiasi reclamo, domanda, spesa, danno o perdita derivante dalla mia partecipazione a questo trekking.',
    organizerSection: 'Responsabilità di Organizzatori e Creatori di Siti Web',
    organizerText: 'Gli organizzatori del trekking, Groupy Loopy, i creatori di siti Web e tutti i loro rappresentanti non sono in alcun modo responsabili di alcuna lesione, malattia, morte o altro danno che possa verificarsi durante o in seguito al trekking. La mia partecipazione a questo trekking è una scelta libera e consapevole presa con piena consapevolezza di tutti i rischi coinvolti.',
    agreeConfirm: 'Confermo la Dichiarazione di Salute e l\'Esonero di Responsabilità',
    warning: 'Devi confermare la dichiarazione per continuare'
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