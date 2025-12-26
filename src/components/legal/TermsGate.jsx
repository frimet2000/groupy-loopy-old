import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Loader2, Shield, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function TermsGate({ onAccept }) {
  const { language } = useLanguage();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    if (!accepted) {
      toast.error(language === 'he' ? 'יש לאשר את התנאים' : language === 'ru' ? 'Необходимо принять условия' : language === 'es' ? 'Debes aceptar los términos' : language === 'fr' ? 'Vous devez accepter les conditions' : language === 'de' ? 'Sie müssen die Bedingungen akzeptieren' : language === 'it' ? 'Devi accettare i termini' : 'You must accept the terms');
      return;
    }

    setLoading(true);
    try {
      await base44.auth.updateMe({
        terms_accepted: true,
        terms_accepted_date: new Date().toISOString()
      });
      toast.success(language === 'he' ? 'התנאים אושרו' : language === 'ru' ? 'Условия приняты' : language === 'es' ? 'Términos aceptados' : language === 'fr' ? 'Conditions acceptées' : language === 'de' ? 'Bedingungen akzeptiert' : language === 'it' ? 'Termini accettati' : 'Terms accepted');
      onAccept();
    } catch (error) {
      toast.error(language === 'he' ? 'שגיאה באישור התנאים' : 'Error accepting terms');
    }
    setLoading(false);
  };

  const getTermsContent = () => {
    if (language === 'he') {
      return {
        title: 'תנאי שימוש ותנאי אחריות משפטית - Groupy Loopy',
        sections: [
          {
            title: '1. אופי השירות (פלטפורמה "כמות שהיא")',
            content: 'Groupy Loopy (להלן: "האפליקציה") היא פלטפורמה טכנולוגית אינטראקטיבית חינמית שנועדה להקל על יצירת קשרים בין מטיילים עצמאיים. האפליקציה פועלת כמתווך פסיבי בלבד. האפליקציה אינה מארגנת, מובילה, נותנת חסות או מפקחת על אף אחד מהטיולים שמפורסמים על ידי המשתמשים שלה.'
          },
          {
            title: '2. שחרור מוחלט מאחריות (קבלת סיכון)',
            content: 'על ידי שימוש באפליקציה זו, אתה מאשר במפורש כי טיולים רגליים ופעילויות חוצות כוללים סיכונים מובנים, לרבות אך לא רק פציעה גופנית, סיכוני סביבה ונזק לרכוש.\n\nללא אחריות: במידה המקסימלית המותרת בחוק, Groupy Loopy והמפתחים שלה לא יהיו אחראים לכל נזק ישיר, עקיף או תוצאתי הנובע מהשתתפותך בכל פעילות המתואמת דרך האפליקציה.\n\nשירות חינמי: מכיוון שהאפליקציה ניתנת ללא תשלום, אתה מסכים שהגבלת אחריות זו היא סבירה ויסודית לקיום השירות.'
          },
          {
            title: '3. תוכן שנוצר על ידי משתמשים ובטיחות',
            content: 'האפליקציה אינה מאמתת את דיוק תיאורי הטיולים, את בטיחות המסלולים או זהות המשתמשים.\n\nעמית-לעמית: אתה אחראי באופן בלעדי לבדיקת האנשים שאתה פוגש והמסלולים שאתה בוחר לעקוב אחריהם.\n\nללא אישור: פרסום טיול באפליקציה אינו מהווה אישור או אישור בטיחות על ידי האפליקציה.'
          },
          {
            title: '4. שימוש בינלאומי ותאימות',
            content: 'משתמשים אחראים לציות לכל החוקים והתקנות המקומיות (למשל, היתרים, חוקי רכוש פרטי וקודי בטיחות) במדינה בה מתקיים הטיול.'
          },
          {
            title: '5. שיפוי',
            content: 'אתה מסכים לשפות ולהחזיק את Groupy Loopy ויוצריה חפים מפני כל תביעות, הפסדים או עלויות משפטיות הנובעים מהשימוש שלך באפליקציה או מהתנהגותך במהלך אירוע טיול מתואם.'
          },
          {
            title: '6. קניין רוחני',
            content: 'כל התוכן באפליקציה, לרבות עיצוב, לוגו וקוד, הם רכושה הבלעדי של Groupy Loopy. אסור להעתיק, לשכפל או להפיץ ללא אישור מפורש.'
          },
          {
            title: '7. פרטיות ואבטחת מידע',
            content: 'אנו מתחייבים להגן על פרטיותך. השימוש במידע שלך מפורט במדיניות הפרטיות שלנו. בעצם השימוש באפליקציה, אתה מסכים לאיסוף ולשימוש במידע כמתואר במדיניות הפרטיות.'
          },
          {
            title: '8. שינויים בתנאי השימוש',
            content: 'אנו שומרים לעצמנו את הזכות לשנות את תנאי השימוש בכל עת. שינויים יכנסו לתוקף מיד עם פרסומם באפליקציה. המשך שימושך באפליקציה מהווה הסכמה לתנאים המעודכנים.'
          },
          {
            title: '9. סיום שימוש',
            content: 'אנו שומרים לעצמנו את הזכות להשעות או לסיים את גישתך לאפליקציה בכל עת, ללא הודעה מוקדמת, אם נחשוד בהפרת תנאי שימוש אלה.'
          },
          {
            title: '10. דין ושיפוט',
            content: 'תנאי שימוש אלה יהיו כפופים ויפורשו בהתאם לחוקי מדינת ישראל. כל מחלוקת תידון בבתי המשפט המוסמכים בישראל.'
          }
        ],
        checkbox: 'אני מבין/ה ש-Groupy Loopy הוא כלי תיווך חינמי ואני לוקח/ת אחריות מלאה על הבטיחות והאינטראקציות שלי',
        mustScroll: 'יש לגלול עד הסוף כדי לקבל את התנאים',
        acceptButton: 'אני מקבל/ת את תנאי השימוש',
        warning: 'חשוב: קרא בעיון לפני קבלת התנאים'
      };
    } else if (language === 'ru') {
      return {
        title: 'Условия использования и юридический отказ от ответственности - Groupy Loopy',
        sections: [
          {
            title: '1. Характер услуги (Платформа "как есть")',
            content: 'Groupy Loopy ("Приложение") - это бесплатная интерактивная технологическая платформа, предназначенная для облегчения контактов между независимыми туристами. Приложение действует только как пассивный посредник. Приложение не организует, не ведет, не спонсирует и не контролирует ни одну из поездок, размещенных его пользователями.'
          },
          {
            title: '2. Абсолютное освобождение от ответственности',
            content: 'Используя это Приложение, вы прямо признаете, что пешие прогулки и активный отдых связаны с присущими рисками, включая, помимо прочего, физические травмы, опасности окружающей среды и материальный ущерб.\n\nОтсутствие ответственности: В максимальной степени, разрешенной законом, Groupy Loopy и ее разработчики не несут ответственности за любой прямой, косвенный или косвенный ущерб, возникший в результате вашего участия в любой деятельности, координируемой через Приложение.\n\nБесплатная услуга: Поскольку Приложение предоставляется бесплатно, вы соглашаетесь с тем, что это ограничение ответственности является разумным и основополагающим для существования услуги.'
          },
          {
            title: '3. Пользовательский контент и безопасность',
            content: 'Приложение не проверяет точность описаний поездок, безопасность маршрутов или личности пользователей.\n\nРавный-равному: Вы несете единоличную ответственность за проверку людей, которых вы встречаете, и маршрутов, которым вы решили следовать.\n\nБез одобрения: Размещение поездки в Приложении не является одобрением или сертификацией безопасности Приложением.'
          },
          {
            title: '4. Международное использование и соответствие',
            content: 'Пользователи несут ответственность за соблюдение всех местных законов и правил (например, разрешений, законов о частной собственности и кодексов безопасности) в стране, где проходит поход.'
          },
          {
            title: '5. Возмещение ущерба',
            content: 'Вы соглашаетесь возместить убытки и освободить Groupy Loopy и его создателей от любых претензий, убытков или судебных издержек, возникающих в результате вашего использования Приложения или вашего поведения во время любого координируемого похода.'
          },
          {
            title: '6. Интеллектуальная собственность',
            content: 'Весь контент Приложения, включая дизайн, логотип и код, является исключительной собственностью Groupy Loopy. Копирование, дублирование или распространение без явного разрешения запрещено.'
          },
          {
            title: '7. Конфиденциальность и безопасность данных',
            content: 'Мы обязуемся защищать вашу конфиденциальность. Использование вашей информации описано в нашей Политике конфиденциальности. Используя Приложение, вы соглашаетесь на сбор и использование информации, как описано в Политике конфиденциальности.'
          },
          {
            title: '8. Изменения в условиях использования',
            content: 'Мы оставляем за собой право изменять эти условия использования в любое время. Изменения вступают в силу немедленно после публикации в Приложении. Продолжение использования Приложения означает согласие с обновленными условиями.'
          },
          {
            title: '9. Прекращение использования',
            content: 'Мы оставляем за собой право приостановить или прекратить ваш доступ к Приложению в любое время без предварительного уведомления, если мы подозреваем нарушение этих условий использования.'
          },
          {
            title: '10. Применимое право и юрисдикция',
            content: 'Эти условия использования регулируются и толкуются в соответствии с законами государства Израиль. Любой спор будет рассматриваться в компетентных судах Израиля.'
          }
        ],
        checkbox: 'Я понимаю, что Groupy Loopy - это бесплатный посреднический инструмент, и я беру на себя полную ответственность за свою безопасность и взаимодействие',
        mustScroll: 'Необходимо прокрутить до конца, чтобы принять условия',
        acceptButton: 'Я принимаю условия использования',
        warning: 'Важно: внимательно прочитайте перед принятием условий'
      };
    } else if (language === 'es') {
      return {
        title: 'Términos de Servicio y Descargo de Responsabilidad Legal - Groupy Loopy',
        sections: [
          {
            title: '1. Naturaleza del Servicio (Plataforma "Tal Como Está")',
            content: 'Groupy Loopy (la "Aplicación") es una plataforma tecnológica interactiva gratuita destinada a facilitar conexiones entre excursionistas independientes. La Aplicación actúa solo como intermediario pasivo. La Aplicación no organiza, lidera, patrocina ni supervisa ninguno de los viajes listados por sus usuarios.'
          },
          {
            title: '2. Liberación Absoluta de Responsabilidad',
            content: 'Al usar esta Aplicación, reconoces expresamente que el senderismo y las actividades al aire libre implican riesgos inherentes, incluidos, entre otros, lesiones físicas, peligros ambientales y daños a la propiedad.\n\nSin Responsabilidad: En la máxima medida permitida por la ley, Groupy Loopy y sus desarrolladores no serán responsables de ningún daño directo, indirecto o consecuente que surja de tu participación en cualquier actividad coordinada a través de la Aplicación.\n\nServicio Gratuito: Dado que la Aplicación se proporciona de forma gratuita, aceptas que esta limitación de responsabilidad es razonable y fundamental para la existencia del servicio.'
          },
          {
            title: '3. Contenido Generado por Usuarios y Seguridad',
            content: 'La Aplicación no verifica la precisión de las descripciones de viajes, la seguridad de las rutas o las identidades de los usuarios.\n\nPunto a Punto: Eres el único responsable de investigar a las personas que conoces y las rutas que eliges seguir.\n\nSin Respaldo: La inclusión de un viaje en la Aplicación no constituye un respaldo o certificación de seguridad por parte de la Aplicación.'
          },
          {
            title: '4. Uso Internacional y Cumplimiento',
            content: 'Los usuarios son responsables de cumplir con todas las leyes y regulaciones locales (por ejemplo, permisos, leyes de propiedad privada y códigos de seguridad) en el país donde se realiza el senderismo.'
          },
          {
            title: '5. Indemnización',
            content: 'Aceptas indemnizar y eximir de responsabilidad a Groupy Loopy y sus creadores de cualquier reclamo, pérdida o tarifa legal que resulte de tu uso de la Aplicación o tu conducta durante cualquier evento de senderismo coordinado.'
          },
          {
            title: '6. Propiedad Intelectual',
            content: 'Todo el contenido de la Aplicación, incluido el diseño, el logotipo y el código, es propiedad exclusiva de Groupy Loopy. Está prohibido copiar, duplicar o distribuir sin permiso explícito.'
          },
          {
            title: '7. Privacidad y Seguridad de Datos',
            content: 'Nos comprometemos a proteger tu privacidad. El uso de tu información se detalla en nuestra Política de Privacidad. Al usar la Aplicación, aceptas la recopilación y el uso de información como se describe en la Política de Privacidad.'
          },
          {
            title: '8. Cambios en los Términos de Uso',
            content: 'Nos reservamos el derecho de modificar estos términos de uso en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la Aplicación. El uso continuado de la Aplicación constituye la aceptación de los términos actualizados.'
          },
          {
            title: '9. Terminación del Uso',
            content: 'Nos reservamos el derecho de suspender o finalizar tu acceso a la Aplicación en cualquier momento sin previo aviso si sospechamos de una violación de estos términos de uso.'
          },
          {
            title: '10. Ley Aplicable y Jurisdicción',
            content: 'Estos términos de uso se regirán e interpretarán de acuerdo con las leyes del Estado de Israel. Cualquier disputa será resuelta en los tribunales competentes de Israel.'
          }
        ],
        checkbox: 'Entiendo que Groupy Loopy es una herramienta de intermediación gratuita y asumo plena responsabilidad por mi seguridad e interacciones',
        mustScroll: 'Debes desplazarte hasta el final para aceptar los términos',
        acceptButton: 'Acepto los términos de uso',
        warning: 'Importante: lea cuidadosamente antes de aceptar los términos'
      };
    } else if (language === 'fr') {
      return {
        title: 'Conditions d\'Utilisation et Décharge de Responsabilité Juridique - Groupy Loopy',
        sections: [
          {
            title: '1. Nature du Service (Plateforme "Tel Quel")',
            content: 'Groupy Loopy (l\'« Application ») est une plateforme technologique interactive gratuite destinée à faciliter les connexions entre randonneurs indépendants. L\'Application agit uniquement comme intermédiaire passif. L\'Application n\'organise pas, ne dirige pas, ne sponsorise pas et ne supervise aucun des voyages listés par ses utilisateurs.'
          },
          {
            title: '2. Décharge Absolue de Responsabilité',
            content: 'En utilisant cette Application, vous reconnaissez expressément que la randonnée et les activités de plein air comportent des risques inhérents, y compris, mais sans s\'y limiter, les blessures physiques, les dangers environnementaux et les dommages matériels.\n\nAucune Responsabilité: Dans toute la mesure permise par la loi, Groupy Loopy et ses développeurs ne seront pas responsables des dommages directs, indirects ou consécutifs découlant de votre participation à toute activité coordonnée via l\'Application.\n\nService Gratuit: Étant donné que l\'Application est fournie gratuitement, vous acceptez que cette limitation de responsabilité soit raisonnable et fondamentale à l\'existence du service.'
          },
          {
            title: '3. Contenu Généré par les Utilisateurs et Sécurité',
            content: 'L\'Application ne vérifie pas l\'exactitude des descriptions de voyages, la sécurité des itinéraires ou les identités des utilisateurs.\n\nPeer-to-Peer: Vous êtes seul responsable de la vérification des personnes que vous rencontrez et des itinéraires que vous choisissez de suivre.\n\nAucun Approbation: L\'inscription d\'un voyage dans l\'Application ne constitue pas une approbation ou une certification de sécurité par l\'Application.'
          },
          {
            title: '4. Utilisation Internationale et Conformité',
            content: 'Les utilisateurs sont responsables du respect de toutes les lois et réglementations locales (par exemple, permis, lois sur la propriété privée et codes de sécurité) dans le pays où la randonnée a lieu.'
          },
          {
            title: '5. Indemnisation',
            content: 'Vous acceptez d\'indemniser et de dégager de toute responsabilité Groupy Loopy et ses créateurs de toute réclamation, perte ou frais juridiques résultant de votre utilisation de l\'Application ou de votre conduite lors de tout événement de randonnée coordonné.'
          },
          {
            title: '6. Propriété Intellectuelle',
            content: 'Tout le contenu de l\'Application, y compris la conception, le logo et le code, est la propriété exclusive de Groupy Loopy. La copie, la duplication ou la distribution sans autorisation explicite est interdite.'
          },
          {
            title: '7. Confidentialité et Sécurité des Données',
            content: 'Nous nous engageons à protéger votre vie privée. L\'utilisation de vos informations est détaillée dans notre Politique de Confidentialité. En utilisant l\'Application, vous acceptez la collecte et l\'utilisation des informations comme décrit dans la Politique de Confidentialité.'
          },
          {
            title: '8. Modifications des Conditions d\'Utilisation',
            content: 'Nous nous réservons le droit de modifier ces conditions d\'utilisation à tout moment. Les modifications entreront en vigueur immédiatement après leur publication dans l\'Application. L\'utilisation continue de l\'Application constitue l\'acceptation des conditions mises à jour.'
          },
          {
            title: '9. Résiliation de l\'Utilisation',
            content: 'Nous nous réservons le droit de suspendre ou de résilier votre accès à l\'Application à tout moment sans préavis si nous soupçonnons une violation de ces conditions d\'utilisation.'
          },
          {
            title: '10. Droit Applicable et Juridiction',
            content: 'Ces conditions d\'utilisation seront régies et interprétées conformément aux lois de l\'État d\'Israël. Tout litige sera résolu par les tribunaux compétents d\'Israël.'
          }
        ],
        checkbox: 'Je comprends que Groupy Loopy est un outil d\'intermédiation gratuit et j\'assume l\'entière responsabilité de ma sécurité et de mes interactions',
        mustScroll: 'Vous devez faire défiler jusqu\'à la fin pour accepter les conditions',
        acceptButton: 'J\'accepte les conditions d\'utilisation',
        warning: 'Important: lisez attentivement avant d\'accepter les conditions'
      };
    } else if (language === 'de') {
      return {
        title: 'Nutzungsbedingungen und Rechtlicher Haftungsausschluss - Groupy Loopy',
        sections: [
          {
            title: '1. Art des Dienstes ("Wie-Besehen"-Plattform)',
            content: 'Groupy Loopy (die "App") ist eine kostenlose, interaktive Technologieplattform, die dazu dient, Verbindungen zwischen unabhängigen Wanderern zu erleichtern. Die App fungiert nur als passiver Vermittler. Die App organisiert, leitet, sponsert oder überwacht keine der von ihren Nutzern aufgelisteten Reisen.'
          },
          {
            title: '2. Absolute Haftungsfreistellung',
            content: 'Durch die Nutzung dieser App erkennen Sie ausdrücklich an, dass Wandern und Outdoor-Aktivitäten inhärente Risiken bergen, einschließlich, aber nicht beschränkt auf körperliche Verletzungen, Umweltgefahren und Sachschäden.\n\nKeine Haftung: Im maximal gesetzlich zulässigen Umfang haften Groupy Loopy und seine Entwickler nicht für direkte, indirekte oder Folgeschäden, die aus Ihrer Teilnahme an einer über die App koordinierten Aktivität entstehen.\n\nKostenloser Dienst: Da die App kostenlos bereitgestellt wird, stimmen Sie zu, dass diese Haftungsbeschränkung angemessen und grundlegend für die Existenz des Dienstes ist.'
          },
          {
            title: '3. Benutzergenerierte Inhalte und Sicherheit',
            content: 'Die App überprüft nicht die Genauigkeit von Reisebeschreibungen, die Sicherheit von Routen oder die Identitäten der Benutzer.\n\nPeer-to-Peer: Sie sind allein verantwortlich für die Überprüfung der Personen, die Sie treffen, und der Routen, denen Sie folgen möchten.\n\nKeine Billigung: Die Auflistung einer Reise in der App stellt keine Billigung oder Sicherheitszertifizierung durch die App dar.'
          },
          {
            title: '4. Internationale Nutzung und Konformität',
            content: 'Benutzer sind verantwortlich für die Einhaltung aller örtlichen Gesetze und Vorschriften (z. B. Genehmigungen, Gesetze über Privateigentum und Sicherheitscodes) in dem Land, in dem die Wanderung stattfindet.'
          },
          {
            title: '5. Schadloshaltung',
            content: 'Sie stimmen zu, Groupy Loopy und seine Schöpfer von allen Ansprüchen, Verlusten oder Rechtsgebühren freizustellen und schadlos zu halten, die sich aus Ihrer Nutzung der App oder Ihrem Verhalten während einer koordinierten Wanderveranstaltung ergeben.'
          },
          {
            title: '6. Geistiges Eigentum',
            content: 'Alle Inhalte der App, einschließlich Design, Logo und Code, sind ausschließliches Eigentum von Groupy Loopy. Das Kopieren, Duplizieren oder Verbreiten ohne ausdrückliche Genehmigung ist verboten.'
          },
          {
            title: '7. Datenschutz und Datensicherheit',
            content: 'Wir verpflichten uns, Ihre Privatsphäre zu schützen. Die Verwendung Ihrer Informationen ist in unserer Datenschutzrichtlinie aufgeführt. Durch die Nutzung der App stimmen Sie der Erfassung und Verwendung von Informationen zu, wie in der Datenschutzrichtlinie beschrieben.'
          },
          {
            title: '8. Änderungen der Nutzungsbedingungen',
            content: 'Wir behalten uns das Recht vor, diese Nutzungsbedingungen jederzeit zu ändern. Änderungen treten sofort nach ihrer Veröffentlichung in der App in Kraft. Die fortgesetzte Nutzung der App stellt die Annahme der aktualisierten Bedingungen dar.'
          },
          {
            title: '9. Beendigung der Nutzung',
            content: 'Wir behalten uns das Recht vor, Ihren Zugriff auf die App jederzeit ohne vorherige Ankündigung auszusetzen oder zu beenden, wenn wir einen Verstoß gegen diese Nutzungsbedingungen vermuten.'
          },
          {
            title: '10. Anwendbares Recht und Gerichtsbarkeit',
            content: 'Diese Nutzungsbedingungen unterliegen den Gesetzen des Staates Israel und werden nach diesen ausgelegt. Jeder Streit wird vor den zuständigen Gerichten in Israel beigelegt.'
          }
        ],
        checkbox: 'Ich verstehe, dass Groupy Loopy ein kostenloses Vermittlungsinstrument ist und ich die volle Verantwortung für meine Sicherheit und Interaktionen übernehme',
        mustScroll: 'Sie müssen bis zum Ende scrollen, um die Bedingungen zu akzeptieren',
        acceptButton: 'Ich akzeptiere die Nutzungsbedingungen',
        warning: 'Wichtig: Lesen Sie sorgfältig, bevor Sie die Bedingungen akzeptieren'
      };
    } else if (language === 'it') {
      return {
        title: 'Termini di Servizio e Esclusione di Responsabilità Legale - Groupy Loopy',
        sections: [
          {
            title: '1. Natura del Servizio (Piattaforma "Come È")',
            content: 'Groupy Loopy (l\'"App") è una piattaforma tecnologica interattiva gratuita destinata a facilitare i collegamenti tra escursionisti indipendenti. L\'App agisce solo come intermediario passivo. L\'App non organizza, guida, sponsorizza o supervisiona nessuno dei viaggi elencati dai suoi utenti.'
          },
          {
            title: '2. Esclusione Assoluta di Responsabilità',
            content: 'Utilizzando questa App, riconosci espressamente che le escursioni e le attività all\'aperto comportano rischi intrinseci, tra cui, ma non limitati a, lesioni fisiche, pericoli ambientali e danni alla proprietà.\n\nNessuna Responsabilità: Nella misura massima consentita dalla legge, Groupy Loopy e i suoi sviluppatori non saranno responsabili per eventuali danni diretti, indiretti o consequenziali derivanti dalla tua partecipazione a qualsiasi attività coordinata tramite l\'App.\n\nServizio Gratuito: Dato che l\'App è fornita gratuitamente, accetti che questa limitazione di responsabilità sia ragionevole e fondamentale per l\'esistenza del servizio.'
          },
          {
            title: '3. Contenuto Generato dagli Utenti e Sicurezza',
            content: 'L\'App non verifica l\'accuratezza delle descrizioni dei viaggi, la sicurezza dei percorsi o le identità degli utenti.\n\nPeer-to-Peer: Sei l\'unico responsabile della verifica delle persone che incontri e dei percorsi che scegli di seguire.\n\nNessuna Approvazione: L\'elenco di un viaggio nell\'App non costituisce un\'approvazione o una certificazione di sicurezza da parte dell\'App.'
          },
          {
            title: '4. Uso Internazionale e Conformità',
            content: 'Gli utenti sono responsabili del rispetto di tutte le leggi e i regolamenti locali (ad es. permessi, leggi sulla proprietà privata e codici di sicurezza) nel paese in cui si svolge l\'escursione.'
          },
          {
            title: '5. Indennizzo',
            content: 'Accetti di indennizzare e tenere indenne Groupy Loopy e i suoi creatori da qualsiasi reclamo, perdita o spese legali derivanti dal tuo uso dell\'App o dalla tua condotta durante qualsiasi evento escursionistico coordinato.'
          },
          {
            title: '6. Proprietà Intellettuale',
            content: 'Tutti i contenuti dell\'App, incluso design, logo e codice, sono di proprietà esclusiva di Groupy Loopy. È vietato copiare, duplicare o distribuire senza autorizzazione esplicita.'
          },
          {
            title: '7. Privacy e Sicurezza dei Dati',
            content: 'Ci impegniamo a proteggere la tua privacy. L\'uso delle tue informazioni è dettagliato nella nostra Informativa sulla Privacy. Utilizzando l\'App, accetti la raccolta e l\'utilizzo delle informazioni come descritto nell\'Informativa sulla Privacy.'
          },
          {
            title: '8. Modifiche ai Termini di Utilizzo',
            content: 'Ci riserviamo il diritto di modificare questi termini di utilizzo in qualsiasi momento. Le modifiche entreranno in vigore immediatamente dopo la loro pubblicazione nell\'App. L\'uso continuato dell\'App costituisce l\'accettazione dei termini aggiornati.'
          },
          {
            title: '9. Cessazione dell\'Uso',
            content: 'Ci riserviamo il diritto di sospendere o terminare il tuo accesso all\'App in qualsiasi momento senza preavviso se sospettiamo una violazione di questi termini di utilizzo.'
          },
          {
            title: '10. Legge Applicabile e Giurisdizione',
            content: 'Questi termini di utilizzo saranno regolati e interpretati in conformità con le leggi dello Stato di Israele. Qualsiasi controversia sarà risolta dai tribunali competenti in Israele.'
          }
        ],
        checkbox: 'Comprendo che Groupy Loopy è uno strumento di intermediazione gratuito e mi assumo la piena responsabilità per la mia sicurezza e le mie interazioni',
        mustScroll: 'Devi scorrere fino alla fine per accettare i termini',
        acceptButton: 'Accetto i termini di utilizzo',
        warning: 'Importante: leggere attentamente prima di accettare i termini'
      };
    } else {
      return {
        title: 'Terms of Service & Legal Disclaimer – Groupy Loopy',
        sections: [
          {
            title: '1. Nature of Service (The "As-Is" Platform)',
            content: 'Groupy Loopy (the "App") is a free, interactive technology platform intended to facilitate connections between independent hikers. The App acts as a passive intermediary (conduit) only. The App does not organize, lead, sponsor, or supervise any of the trips listed by its users.'
          },
          {
            title: '2. Absolute Release of Liability (Assumption of Risk)',
            content: 'By using this App, you expressly acknowledge that hiking and outdoor activities involve inherent risks, including but not limited to physical injury, environmental hazards, and property damage.\n\nNo Liability: To the maximum extent permitted by law, Groupy Loopy and its developers shall not be liable for any direct, indirect, or consequential damages arising from your participation in any activity coordinated through the App.\n\nFree Service: As the App is provided free of charge, you agree that this limitation of liability is reasonable and fundamental to the existence of the service.'
          },
          {
            title: '3. User-Generated Content (UGC) & Safety',
            content: 'The App does not verify the accuracy of trip descriptions, the safety of routes, or the identities of users.\n\nPeer-to-Peer: You are solely responsible for vetting the individuals you meet and the routes you choose to follow.\n\nNo Endorsement: Listing a trip on the App does not constitute an endorsement or safety certification by the App.'
          },
          {
            title: '4. International Use & Compliance',
            content: 'Users are responsible for complying with all local laws and regulations (e.g., permits, private property laws, and safety codes) in the country where the hiking takes place.'
          },
          {
            title: '5. Indemnification',
            content: 'You agree to indemnify and hold harmless Groupy Loopy and its creators from any claims, losses, or legal fees resulting from your use of the App or your conduct during any coordinated hiking event.'
          },
          {
            title: '6. Intellectual Property',
            content: 'All content in the App, including design, logo, and code, is the exclusive property of Groupy Loopy. Copying, duplicating, or distributing without explicit permission is prohibited.'
          },
          {
            title: '7. Privacy and Data Security',
            content: 'We are committed to protecting your privacy. The use of your information is detailed in our Privacy Policy. By using the App, you agree to the collection and use of information as described in the Privacy Policy.'
          },
          {
            title: '8. Changes to Terms of Use',
            content: 'We reserve the right to modify these terms of use at any time. Changes will take effect immediately upon posting in the App. Continued use of the App constitutes acceptance of the updated terms.'
          },
          {
            title: '9. Termination of Use',
            content: 'We reserve the right to suspend or terminate your access to the App at any time without prior notice if we suspect a violation of these terms of use.'
          },
          {
            title: '10. Governing Law and Jurisdiction',
            content: 'These terms of use shall be governed by and construed in accordance with the laws of the State of Israel. Any dispute shall be resolved in the competent courts of Israel.'
          }
        ],
        checkbox: 'I understand that Groupy Loopy is a free intermediary tool and I take full responsibility for my own safety and interactions',
        mustScroll: 'You must scroll to the end to accept the terms',
        acceptButton: 'I accept the terms of use',
        warning: 'Important: Read carefully before accepting the terms'
      };
    }
  };

  const terms = getTermsContent();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <Card className="border-2 border-red-500 shadow-2xl">
          <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2" dir={language === 'he' ? 'rtl' : 'ltr'}>
                  {terms.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-100 p-3 rounded-lg">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span dir={language === 'he' ? 'rtl' : 'ltr'}>{terms.warning}</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="h-[50vh] px-6 py-4" onScroll={handleScroll}>
              <div className="space-y-6" dir={language === 'he' ? 'rtl' : 'ltr'}>
                {terms.sections.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {!scrolledToBottom && (
              <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200">
                <p className="text-sm text-yellow-800 text-center" dir={language === 'he' ? 'rtl' : 'ltr'}>
                  ⬇️ {terms.mustScroll}
                </p>
              </div>
            )}

            <div className="p-6 border-t bg-gray-50 space-y-4">
              <div className={`flex items-start gap-3 p-4 bg-white rounded-lg border-2 ${accepted ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
                <Checkbox
                  id="terms-accept"
                  checked={accepted}
                  onCheckedChange={setAccepted}
                  disabled={!scrolledToBottom}
                  className="mt-1"
                />
                <label
                  htmlFor="terms-accept"
                  className="text-sm font-medium leading-relaxed cursor-pointer flex-1"
                  dir={language === 'he' ? 'rtl' : 'ltr'}
                >
                  {terms.checkbox}
                </label>
                {accepted && <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />}
              </div>

              <Button
                onClick={handleAccept}
                disabled={!accepted || !scrolledToBottom || loading}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    {terms.acceptButton}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}