import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../components/LanguageContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Shield, AlertTriangle, FileText } from 'lucide-react';

export default function TermsOfService() {
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();

  const getContent = () => {
    const translations = {
      he: {
        title: 'תנאי שימוש והסכם משפטי',
        lastUpdate: 'עדכון אחרון: דצמבר 2025',
        warningTitle: 'אזהרה חשובה - קרא בעיון!',
        warningText: 'מסמך זה מכיל תנאי שימוש משפטיים מחייבים. השימוש בפלטפורמה מהווה הסכמה מלאה לתנאים אלה. אנא קרא בעיון רב לפני השימוש.',
        legalTitle: 'ייעוץ משפטי מומלץ',
        legalText: 'אנו ממליצים בחום להתייעץ עם עורך דין לפני השימוש בפלטפורמה, במיוחד אם אתה מתכנן לארגן טיולים. ייעוץ משפטי יכול לעזור לך להבין את זכויותיך וחובותיך בצורה מדויקת יותר.',
    sections: [
      {
        icon: Shield,
        title: '1. הגדרת הפלטפורמה ותפקידה',
        content: `פלטפורמת "The Groupy Loopy" (להלן: "הפלטפורמה") היא שירות דיגיטלי המתווך בין משתמשים המעוניינים לארגן טיולים (להלן: "מארגני טיולים") לבין משתמשים המעוניינים להצטרף לטיולים (להלן: "משתתפים").

הפלטפורמה משמשת אך ורק כמתווכת טכנולוגית, ואינה מארגנת, מנהלת, מפקחת, מאשרת או נוטלת כל אחריות על הטיולים המתפרסמים בה.`
      },
      {
        icon: AlertTriangle,
        title: '2. הצהרת אי-אחריות מלאה',
        content: `הפלטפורמה, בעליה, מפעיליה, עובדיה, ספקיה והמפתחים שלה (להלן ביחד: "הפלטפורמה") אינם נושאים בכל אחריות, ישירה או עקיפה, בגין:

• כל נזק גוף, פציעה, מחלה, מוות או נזק רכוש שייגרמו במהלך הטיול או בקשר אליו
• איכות, בטיחות, התאמה, או חוקיות של הטיולים המתפרסמים
• התנהגות, אמינות, כשירות או זהירות של מארגני הטיולים
• דיוק המידע המתפרסם על הטיולים
• תקלות טכניות, איבוד מידע או כשלים בפלטפורמה
• כל מעשה או מחדל של מארגן הטיול או משתתפים אחרים`
      },
      {
        icon: FileText,
        title: '3. אחריות מארגן הטיול',
        content: `מארגן הטיול נושא באחריות מלאה ובלעדית לכל היבטי הטיול, לרבות:

• בחירת מסלול מתאים ובטיחותי
• הערכת התאמת המסלול לרמת הכושר והניסיון של המשתתפים
• מתן אזהרות והוראות בטיחות מפורטות
• וידוא תנאי מזג אוויר ושטח בטוחים
• החלטות שנעשות במהלך הטיול
• טיפול במצבי חירום
• עמידה בכל החוקים והתקנות הרלוונטיים

מארגן הטיול מצהיר שהוא בעל ידע, ניסיון ויכולת הנדרשים לניהול הטיול, ומתחייב לפעול בזהירות המירבית לשמירה על בטיחות המשתתפים.`
      },
      {
        icon: AlertTriangle,
        title: '4. אחריות המשתתף',
        content: `כל משתתף בטיול נושא באחריות אישית מלאה ומצהיר כי:

• הוא בעל כושר גופני ובריאותי המתאים לטיול
• הוא ער לסיכונים הכרוכים בפעילות בטבע
• הוא נוטל על עצמו את כל הסיכונים הכרוכים בהשתתפות בטיול
• הוא יפעל בזהירות ובהתאם להוראות מארגן הטיול
• הוא יצויד בציוד מתאים ובמצב תקין
• הוא אחראי לבריאותו ולבטיחותו האישית
• הוא לא יסתמך על הפלטפורמה לקבלת מידע רפואי או בטיחותי`
      },
      {
        title: '5. ויתור על תביעות',
        content: `על ידי שימוש בפלטפורמה, כל משתמש (מארגן או משתתף) מוותר באופן סופי ובלתי חוזר על כל זכות תביעה, דרישה או טענה כלפי הפלטפורמה בגין:

• כל נזק גוף, רכוש, נפש או כלכלי שייגרם בקשר לטיול
• רשלנות, התרשלות או מעשה בלתי חוקי של מארגן הטיול או משתתף אחר
• אי-דיוק במידע, תקלות טכניות או כשלים בשירות

ויתור זה כולל גם ויתור על כל תביעה נגד מבטחי הפלטפורמה, נושאי משרה, עובדים וקבלני משנה שלה.`
      },
      {
        title: '6. שיפוי',
        content: `כל משתמש מתחייב לשפות את הפלטפורמה ולהגן עליה מפני כל תביעה, דרישה, הוצאה (לרבות שכר טרחת עורכי דין) או נזק שייגרמו לה כתוצאה מ:

• שימוש בפלטפורמה על ידי המשתמש
• הפרת תנאי שימוש אלה
• הפרת זכויות צד שלישי
• רשלנות או מעשה בלתי חוקי של המשתמש

התחייבות זו תישאר בתוקף גם לאחר סיום השימוש בפלטפורמה.`
      },
      {
        title: '7. המלצות בטיחות',
        content: `הפלטפורמה ממליצה (אך אינה מחייבת) למשתמשים:

• לבדוק את הרקע, הניסיון והמוניטין של מארגן הטיול
• להיפגש עם מארגן הטיול לפני הטיול
• לבדוק את מזג האוויר ותנאי השטח ביום הטיול
• להצטייד בציוד מתאים ותקין
• להביא מים, מזון, ערכת עזרה ראשונה ואמצעי תקשורת
• ליידע את מארגן הטיול על מגבלות בריאותיות או גופניות
• לערוך ביטוח נסיעות או ביטוח תאונות אישיות
• להימנע מטיולים שאינם מתאימים לרמת הכושר האישית

אולם, אחריות יישום המלצות אלו מוטלת על המשתמש בלבד, והפלטפורמה אינה נושאת באחריות אם המשתמש לא פעל בהתאם להן.`
      },
      {
        title: '8. הגבלת אחריות כספית',
        content: `ככל שבית משפט או רשות מוסמכת יקבעו כי לפלטפורמה אחריות כלשהי (חרף ויתור וסעיפי אי-האחריות דלעיל), אחריותה תהיה מוגבלת לסכום שלא יעלה על 100 ש"ח (מאה שקלים חדשים), או סכום דמי השימוש ששולמו על ידי המשתמש (הנמוך מבין השניים).

הפלטפורמה לא תהיה אחראית בכל מקרה לנזקים עקיפים, תוצאתיים, מיוחדים או עונשיים.`
      },
      {
        title: '9. דין וסמכות שיפוט',
        content: `על תנאי שימוש אלה יחולו אך ורק דיני מדינת ישראל. סמכות השיפוט הבלעדית בכל סכסוך הנובע מתנאי שימוש אלה תהיה לבתי המשפט המוסמכים בישראל.`
      },
      {
        title: '10. תוקף התנאים',
        content: `תנאי שימוש אלה מהווים את ההסכם המלא והבלעדי בין המשתמש לבין הפלטפורמה. הפלטפורמה שומרת לעצמה את הזכות לעדכן תנאים אלה בכל עת, והמשך השימוש בפלטפורמה יהווה הסכמה לתנאים המעודכנים.

אם נקבע כי סעיף מסוים בתנאים אלה בטל או בלתי אכיף, הדבר לא ישפיע על תוקפם של שאר הסעיפים.`
      },
      {
        title: '11. אישור והצהרה סופית',
        content: `על ידי שימוש בפלטפורמה, המשתמש מצהיר ומאשר כי:

• קרא והבין את תנאי השימוש במלואם
• מסכים לכל תנאי השימוש ללא סייג
• מבין שהפלטפורמה אינה נושאת באחריות לטיולים
• מקבל על עצמו את מלוא האחריות והסיכונים
• מוותר על כל תביעה כלפי הפלטפורמה
• יפעל בזהירות ובאחריות מלאה`
      }
    ]
      },
      en: {
        title: 'Terms of Service and Legal Agreement',
        lastUpdate: 'Last Updated: December 2025',
        warningTitle: 'Important Warning - Read Carefully!',
        warningText: 'This document contains binding legal terms of service. Use of the Platform constitutes full agreement to these terms. Please read carefully before use.',
        legalTitle: 'Legal Consultation Recommended',
        legalText: 'We strongly recommend consulting with a lawyer before using the Platform, especially if you plan to organize trips. Legal consultation can help you understand your rights and obligations more accurately.',
    sections: [
      {
        icon: Shield,
        title: '1. Platform Definition and Role',
        content: `"The Groupy Loopy" platform (hereinafter: "the Platform") is a digital service that mediates between users who wish to organize trips (hereinafter: "Trip Organizers") and users who wish to join trips (hereinafter: "Participants").

The Platform serves solely as a technological intermediary and does not organize, manage, supervise, approve, or assume any responsibility for trips published on it.`
      },
      {
        icon: AlertTriangle,
        title: '2. Complete Liability Disclaimer',
        content: `The Platform, its owners, operators, employees, suppliers, and developers (hereinafter collectively: "the Platform") bear no responsibility, direct or indirect, for:

• Any bodily injury, illness, death, or property damage that may occur during or in connection with the trip
• Quality, safety, suitability, or legality of published trips
• Behavior, reliability, competence, or prudence of trip organizers
• Accuracy of information published about trips
• Technical failures, loss of information, or system failures
• Any act or omission by the trip organizer or other participants`
      },
      {
        icon: FileText,
        title: '3. Trip Organizer Liability',
        content: `The trip organizer bears full and exclusive responsibility for all aspects of the trip, including:

• Selection of suitable and safe route
• Assessment of route suitability for participants' fitness and experience levels
• Providing detailed safety warnings and instructions
• Ensuring safe weather and terrain conditions
• Decisions made during the trip
• Handling emergency situations
• Compliance with all relevant laws and regulations

The trip organizer declares that they possess the knowledge, experience, and capability required to manage the trip, and commits to acting with maximum care to ensure participants' safety.`
      },
      {
        icon: AlertTriangle,
        title: '4. Participant Liability',
        content: `Each trip participant bears full personal responsibility and declares that:

• They possess physical and health fitness suitable for the trip
• They are aware of risks involved in outdoor activities
• They assume all risks associated with trip participation
• They will act carefully and according to organizer's instructions
• They will be equipped with appropriate and functional equipment
• They are responsible for their personal health and safety
• They will not rely on the Platform for medical or safety information`
      },
      {
        title: '5. Waiver of Claims',
        content: `By using the Platform, each user (organizer or participant) finally and irrevocably waives any right to claim, demand, or argue against the Platform regarding:

• Any bodily, property, mental, or economic damage caused in connection with the trip
• Negligence, carelessness, or illegal act by the trip organizer or another participant
• Inaccurate information, technical failures, or service malfunctions

This waiver includes waiver of any claim against the Platform's insurers, officers, employees, and subcontractors.`
      },
      {
        title: '6. Indemnification',
        content: `Each user undertakes to indemnify and defend the Platform against any claim, demand, expense (including attorney fees), or damage caused as a result of:

• User's use of the Platform
• Violation of these terms of service
• Violation of third-party rights
• User's negligence or illegal act

This obligation will remain in effect even after cessation of Platform use.`
      },
      {
        title: '7. Safety Recommendations',
        content: `The Platform recommends (but does not require) users to:

• Check the background, experience, and reputation of the trip organizer
• Meet with the trip organizer before the trip
• Check weather and terrain conditions on trip day
• Equip themselves with appropriate and functional equipment
• Bring water, food, first aid kit, and communication devices
• Inform the trip organizer about health or physical limitations
• Purchase travel insurance or personal accident insurance
• Avoid trips not suitable for personal fitness level

However, responsibility for implementing these recommendations lies solely with the user, and the Platform bears no responsibility if the user did not act accordingly.`
      },
      {
        title: '8. Financial Liability Limitation',
        content: `To the extent that a court or competent authority determines that the Platform has any liability (despite the waiver and disclaimer clauses above), its liability will be limited to an amount not exceeding 100 NIS (one hundred new Israeli shekels), or the amount of usage fees paid by the user (whichever is lower).

The Platform will not be liable under any circumstances for indirect, consequential, special, or punitive damages.`
      },
      {
        title: '9. Governing Law and Jurisdiction',
        content: `These terms of service shall be governed exclusively by the laws of the State of Israel. Exclusive jurisdiction for any dispute arising from these terms of service shall be with the competent courts in Israel.`
      },
      {
        title: '10. Terms Validity',
        content: `These terms of service constitute the complete and exclusive agreement between the user and the Platform. The Platform reserves the right to update these terms at any time, and continued use of the Platform will constitute acceptance of the updated terms.

If any provision in these terms is determined to be void or unenforceable, it will not affect the validity of the remaining provisions.`
      },
      {
        title: '11. Final Confirmation and Declaration',
        content: `By using the Platform, the user declares and confirms that:

• They have read and understood the terms of service in full
• They agree to all terms of service without reservation
• They understand that the Platform bears no responsibility for trips
• They assume full responsibility and risks
• They waive any claim against the Platform
• They will act carefully and with full responsibility`
      }
    ]
      },
      fr: {
        title: 'Conditions d\'utilisation et accord juridique',
        lastUpdate: 'Dernière mise à jour : Décembre 2025',
        warningTitle: 'Avertissement important - Lisez attentivement !',
        warningText: 'Ce document contient des conditions d\'utilisation juridiques contraignantes. L\'utilisation de la plateforme constitue un accord complet avec ces conditions. Veuillez lire attentivement avant utilisation.',
        legalTitle: 'Consultation juridique recommandée',
        legalText: 'Nous recommandons vivement de consulter un avocat avant d\'utiliser la plateforme, surtout si vous prévoyez d\'organiser des voyages. Une consultation juridique peut vous aider à mieux comprendre vos droits et obligations.',
        sections: [
          {
            icon: Shield,
            title: '1. Définition et rôle de la plateforme',
            content: `La plateforme "The Groupy Loopy" (ci-après : "la Plateforme") est un service numérique qui fait le lien entre les utilisateurs souhaitant organiser des voyages (ci-après : "Organisateurs") et les utilisateurs souhaitant rejoindre des voyages (ci-après : "Participants").

La Plateforme sert uniquement d'intermédiaire technologique et n'organise, ne gère, ne supervise, n'approuve ni n'assume aucune responsabilité pour les voyages publiés.`
          },
          {
            icon: AlertTriangle,
            title: '2. Clause de non-responsabilité complète',
            content: `La Plateforme, ses propriétaires, opérateurs, employés, fournisseurs et développeurs (ci-après collectivement : "la Plateforme") ne portent aucune responsabilité, directe ou indirecte, pour :

• Tout préjudice corporel, maladie, décès ou dommage matériel pouvant survenir pendant ou en lien avec le voyage
• Qualité, sécurité, pertinence ou légalité des voyages publiés
• Comportement, fiabilité, compétence ou prudence des organisateurs
• Exactitude des informations publiées sur les voyages
• Pannes techniques, perte d'informations ou défaillances du système
• Tout acte ou omission de l'organisateur ou d'autres participants`
          },
          {
            icon: FileText,
            title: '3. Responsabilité de l\'organisateur',
            content: `L'organisateur assume l'entière et exclusive responsabilité de tous les aspects du voyage, notamment :

• Sélection d'un itinéraire approprié et sûr
• Évaluation de l'adéquation de l'itinéraire aux niveaux de forme et d'expérience des participants
• Fourniture d'avertissements et d'instructions de sécurité détaillés
• Garantie de conditions météorologiques et de terrain sûres
• Décisions prises pendant le voyage
• Gestion des situations d'urgence
• Conformité avec toutes les lois et réglementations applicables

L'organisateur déclare posséder les connaissances, l'expérience et la capacité requises pour gérer le voyage, et s'engage à agir avec le plus grand soin pour assurer la sécurité des participants.`
          },
          {
            icon: AlertTriangle,
            title: '4. Responsabilité du participant',
            content: `Chaque participant assume l'entière responsabilité personnelle et déclare :

• Posséder une condition physique et sanitaire adaptée au voyage
• Être conscient des risques liés aux activités de plein air
• Assumer tous les risques associés à la participation au voyage
• Agir avec prudence et selon les instructions de l'organisateur
• Être équipé d'un matériel approprié et fonctionnel
• Être responsable de sa santé et de sa sécurité personnelles
• Ne pas compter sur la Plateforme pour obtenir des informations médicales ou de sécurité`
          },
          {
            title: '5. Renonciation aux réclamations',
            content: `En utilisant la Plateforme, chaque utilisateur (organisateur ou participant) renonce définitivement et irrévocablement à tout droit de réclamer, exiger ou contester la Plateforme concernant :

• Tout dommage corporel, matériel, mental ou économique causé en lien avec le voyage
• Négligence, imprudence ou acte illégal de l'organisateur ou d'un autre participant
• Informations inexactes, pannes techniques ou dysfonctionnements du service

Cette renonciation inclut également toute réclamation contre les assureurs, dirigeants, employés et sous-traitants de la Plateforme.`
          },
          {
            title: '6. Indemnisation',
            content: `Chaque utilisateur s'engage à indemniser et défendre la Plateforme contre toute réclamation, demande, dépense (y compris les frais d'avocat) ou dommage résultant de :

• Utilisation de la Plateforme par l'utilisateur
• Violation de ces conditions d'utilisation
• Violation des droits de tiers
• Négligence ou acte illégal de l'utilisateur

Cette obligation restera en vigueur même après la cessation de l'utilisation de la Plateforme.`
          },
          {
            title: '7. Recommandations de sécurité',
            content: `La Plateforme recommande (mais n'exige pas) aux utilisateurs de :

• Vérifier les antécédents, l'expérience et la réputation de l'organisateur
• Rencontrer l'organisateur avant le voyage
• Vérifier les conditions météorologiques et du terrain le jour du voyage
• S'équiper d'un matériel approprié et fonctionnel
• Apporter eau, nourriture, trousse de premiers soins et moyens de communication
• Informer l'organisateur des limitations de santé ou physiques
• Souscrire une assurance voyage ou une assurance accident personnelle
• Éviter les voyages inadaptés à son niveau de forme personnelle

Cependant, la responsabilité de la mise en œuvre de ces recommandations incombe uniquement à l'utilisateur, et la Plateforme ne porte aucune responsabilité si l'utilisateur n'a pas agi en conséquence.`
          },
          {
            title: '8. Limitation de responsabilité financière',
            content: `Dans la mesure où un tribunal ou une autorité compétente détermine que la Plateforme a une quelconque responsabilité (malgré les clauses de renonciation et de non-responsabilité ci-dessus), sa responsabilité sera limitée à un montant ne dépassant pas 100 NIS (cent nouveaux shekels israéliens), ou le montant des frais d'utilisation payés par l'utilisateur (le plus bas des deux).

La Plateforme ne sera en aucun cas responsable des dommages indirects, consécutifs, spéciaux ou punitifs.`
          },
          {
            title: '9. Droit applicable et juridiction',
            content: `Ces conditions d'utilisation sont régies exclusivement par les lois de l'État d'Israël. La juridiction exclusive pour tout litige découlant de ces conditions d'utilisation sera celle des tribunaux compétents en Israël.`
          },
          {
            title: '10. Validité des conditions',
            content: `Ces conditions d'utilisation constituent l'accord complet et exclusif entre l'utilisateur et la Plateforme. La Plateforme se réserve le droit de mettre à jour ces conditions à tout moment, et la poursuite de l'utilisation de la Plateforme constituera une acceptation des conditions mises à jour.

Si une disposition de ces conditions est jugée nulle ou inapplicable, cela n'affectera pas la validité des autres dispositions.`
          },
          {
            title: '11. Confirmation et déclaration finale',
            content: `En utilisant la Plateforme, l'utilisateur déclare et confirme :

• Avoir lu et compris les conditions d'utilisation dans leur intégralité
• Accepter toutes les conditions d'utilisation sans réserve
• Comprendre que la Plateforme n'assume aucune responsabilité pour les voyages
• Assumer l'entière responsabilité et les risques
• Renoncer à toute réclamation contre la Plateforme
• Agir avec prudence et en toute responsabilité`
          }
        ]
      },
      es: {
        title: 'Términos de servicio y acuerdo legal',
        lastUpdate: 'Última actualización: Diciembre 2025',
        warningTitle: '¡Advertencia importante - Lea atentamente!',
        warningText: 'Este documento contiene términos de servicio legales vinculantes. El uso de la Plataforma constituye un acuerdo completo con estos términos. Por favor, lea atentamente antes de usar.',
        legalTitle: 'Consulta legal recomendada',
        legalText: 'Recomendamos encarecidamente consultar con un abogado antes de usar la Plataforma, especialmente si planea organizar viajes. Una consulta legal puede ayudarlo a comprender mejor sus derechos y obligaciones.',
        sections: [
          {
            icon: Shield,
            title: '1. Definición y rol de la plataforma',
            content: `La plataforma "The Groupy Loopy" (en adelante: "la Plataforma") es un servicio digital que media entre usuarios que desean organizar viajes (en adelante: "Organizadores") y usuarios que desean unirse a viajes (en adelante: "Participantes").

La Plataforma sirve únicamente como intermediaria tecnológica y no organiza, gestiona, supervisa, aprueba ni asume ninguna responsabilidad por los viajes publicados.`
          },
          {
            icon: AlertTriangle,
            title: '2. Descargo completo de responsabilidad',
            content: `La Plataforma, sus propietarios, operadores, empleados, proveedores y desarrolladores (en adelante colectivamente: "la Plataforma") no asumen ninguna responsabilidad, directa o indirecta, por:

• Cualquier lesión corporal, enfermedad, muerte o daño a la propiedad que pueda ocurrir durante o en relación con el viaje
• Calidad, seguridad, idoneidad o legalidad de los viajes publicados
• Comportamiento, confiabilidad, competencia o prudencia de los organizadores
• Exactitud de la información publicada sobre los viajes
• Fallas técnicas, pérdida de información o fallas del sistema
• Cualquier acto u omisión del organizador u otros participantes`
          },
          {
            icon: FileText,
            title: '3. Responsabilidad del organizador',
            content: `El organizador asume la responsabilidad total y exclusiva de todos los aspectos del viaje, incluyendo:

• Selección de una ruta adecuada y segura
• Evaluación de la idoneidad de la ruta para los niveles de condición física y experiencia de los participantes
• Proporcionar advertencias e instrucciones de seguridad detalladas
• Garantizar condiciones meteorológicas y de terreno seguras
• Decisiones tomadas durante el viaje
• Manejo de situaciones de emergencia
• Cumplimiento de todas las leyes y regulaciones relevantes

El organizador declara poseer el conocimiento, experiencia y capacidad requeridos para gestionar el viaje, y se compromete a actuar con el máximo cuidado para garantizar la seguridad de los participantes.`
          },
          {
            icon: AlertTriangle,
            title: '4. Responsabilidad del participante',
            content: `Cada participante asume la responsabilidad personal completa y declara:

• Poseer condición física y de salud adecuada para el viaje
• Ser consciente de los riesgos involucrados en actividades al aire libre
• Asumir todos los riesgos asociados con la participación en el viaje
• Actuar con cuidado y según las instrucciones del organizador
• Estar equipado con equipo apropiado y funcional
• Ser responsable de su salud y seguridad personal
• No depender de la Plataforma para información médica o de seguridad`
          },
          {
            title: '5. Renuncia a reclamaciones',
            content: `Al usar la Plataforma, cada usuario (organizador o participante) renuncia final e irrevocablemente a cualquier derecho de reclamar, exigir o argumentar contra la Plataforma respecto a:

• Cualquier daño corporal, material, mental o económico causado en relación con el viaje
• Negligencia, descuido o acto ilegal del organizador u otro participante
• Información inexacta, fallas técnicas o mal funcionamiento del servicio

Esta renuncia incluye la renuncia a cualquier reclamación contra los aseguradores, funcionarios, empleados y subcontratistas de la Plataforma.`
          },
          {
            title: '6. Indemnización',
            content: `Cada usuario se compromete a indemnizar y defender a la Plataforma contra cualquier reclamación, demanda, gasto (incluidos honorarios de abogados) o daño causado como resultado de:

• Uso de la Plataforma por parte del usuario
• Violación de estos términos de servicio
• Violación de derechos de terceros
• Negligencia o acto ilegal del usuario

Esta obligación permanecerá vigente incluso después del cese del uso de la Plataforma.`
          },
          {
            title: '7. Recomendaciones de seguridad',
            content: `La Plataforma recomienda (pero no requiere) a los usuarios:

• Verificar los antecedentes, experiencia y reputación del organizador
• Reunirse con el organizador antes del viaje
• Verificar las condiciones meteorológicas y del terreno el día del viaje
• Equiparse con equipo apropiado y funcional
• Llevar agua, comida, botiquín de primeros auxilios y dispositivos de comunicación
• Informar al organizador sobre limitaciones de salud o físicas
• Contratar seguro de viaje o seguro de accidentes personales
• Evitar viajes inadecuados para su nivel de condición física personal

Sin embargo, la responsabilidad de implementar estas recomendaciones recae únicamente en el usuario, y la Plataforma no asume ninguna responsabilidad si el usuario no actuó en consecuencia.`
          },
          {
            title: '8. Limitación de responsabilidad financiera',
            content: `En la medida en que un tribunal o autoridad competente determine que la Plataforma tiene alguna responsabilidad (a pesar de las cláusulas de renuncia y descargo anteriores), su responsabilidad estará limitada a una cantidad que no exceda 100 NIS (cien nuevos shekels israelíes), o la cantidad de tarifas de uso pagadas por el usuario (lo que sea menor).

La Plataforma no será responsable bajo ninguna circunstancia por daños indirectos, consecuentes, especiales o punitivos.`
          },
          {
            title: '9. Ley aplicable y jurisdicción',
            content: `Estos términos de servicio se regirán exclusivamente por las leyes del Estado de Israel. La jurisdicción exclusiva para cualquier disputa que surja de estos términos de servicio será de los tribunales competentes en Israel.`
          },
          {
            title: '10. Validez de los términos',
            content: `Estos términos de servicio constituyen el acuerdo completo y exclusivo entre el usuario y la Plataforma. La Plataforma se reserva el derecho de actualizar estos términos en cualquier momento, y el uso continuado de la Plataforma constituirá la aceptación de los términos actualizados.

Si alguna disposición de estos términos se determina nula o inaplicable, no afectará la validez de las demás disposiciones.`
          },
          {
            title: '11. Confirmación y declaración final',
            content: `Al usar la Plataforma, el usuario declara y confirma:

• Haber leído y entendido los términos de servicio en su totalidad
• Aceptar todos los términos de servicio sin reservas
• Entender que la Plataforma no asume ninguna responsabilidad por los viajes
• Asumir la responsabilidad completa y los riesgos
• Renunciar a cualquier reclamación contra la Plataforma
• Actuar con cuidado y total responsabilidad`
          }
        ]
      },
      de: {
        title: 'Nutzungsbedingungen und rechtliche Vereinbarung',
        lastUpdate: 'Letzte Aktualisierung: Dezember 2025',
        warningTitle: 'Wichtiger Hinweis - Sorgfältig lesen!',
        warningText: 'Dieses Dokument enthält verbindliche rechtliche Nutzungsbedingungen. Die Nutzung der Plattform stellt eine vollständige Zustimmung zu diesen Bedingungen dar. Bitte lesen Sie sorgfältig vor der Nutzung.',
        legalTitle: 'Rechtsberatung empfohlen',
        legalText: 'Wir empfehlen dringend, vor der Nutzung der Plattform einen Anwalt zu konsultieren, insbesondere wenn Sie Reisen organisieren möchten. Eine Rechtsberatung kann Ihnen helfen, Ihre Rechte und Pflichten besser zu verstehen.',
        sections: [
          {
            icon: Shield,
            title: '1. Plattformdefinition und Rolle',
            content: `Die Plattform "The Groupy Loopy" (nachfolgend: "die Plattform") ist ein digitaler Dienst, der zwischen Benutzern vermittelt, die Reisen organisieren möchten (nachfolgend: "Organisatoren") und Benutzern, die an Reisen teilnehmen möchten (nachfolgend: "Teilnehmer").

Die Plattform dient ausschließlich als technologischer Vermittler und organisiert, verwaltet, beaufsichtigt, genehmigt oder übernimmt keine Verantwortung für veröffentlichte Reisen.`
          },
          {
            icon: AlertTriangle,
            title: '2. Vollständiger Haftungsausschluss',
            content: `Die Plattform, ihre Eigentümer, Betreiber, Mitarbeiter, Lieferanten und Entwickler (nachfolgend zusammen: "die Plattform") übernehmen keine Verantwortung, weder direkt noch indirekt, für:

• Jegliche Körperverletzung, Krankheit, Tod oder Sachschäden, die während oder im Zusammenhang mit der Reise auftreten können
• Qualität, Sicherheit, Eignung oder Rechtmäßigkeit veröffentlichter Reisen
• Verhalten, Zuverlässigkeit, Kompetenz oder Vorsicht der Organisatoren
• Genauigkeit der über Reisen veröffentlichten Informationen
• Technische Ausfälle, Informationsverluste oder Systemausfälle
• Jegliche Handlung oder Unterlassung des Organisators oder anderer Teilnehmer`
          },
          {
            icon: FileText,
            title: '3. Verantwortung des Organisators',
            content: `Der Organisator trägt die volle und ausschließliche Verantwortung für alle Aspekte der Reise, einschließlich:

• Auswahl einer geeigneten und sicheren Route
• Bewertung der Routeneignung für Fitness- und Erfahrungsniveaus der Teilnehmer
• Bereitstellung detaillierter Sicherheitswarnungen und -anweisungen
• Gewährleistung sicherer Wetter- und Geländebedingungen
• Während der Reise getroffene Entscheidungen
• Umgang mit Notfallsituationen
• Einhaltung aller relevanten Gesetze und Vorschriften

Der Organisator erklärt, dass er über das erforderliche Wissen, die Erfahrung und die Fähigkeit zur Leitung der Reise verfügt, und verpflichtet sich, mit größter Sorgfalt zu handeln, um die Sicherheit der Teilnehmer zu gewährleisten.`
          },
          {
            icon: AlertTriangle,
            title: '4. Verantwortung des Teilnehmers',
            content: `Jeder Teilnehmer trägt die volle persönliche Verantwortung und erklärt:

• Über körperliche und gesundheitliche Fitness zu verfügen, die für die Reise geeignet ist
• Sich der mit Outdoor-Aktivitäten verbundenen Risiken bewusst zu sein
• Alle mit der Teilnahme an der Reise verbundenen Risiken zu übernehmen
• Vorsichtig und gemäß den Anweisungen des Organisators zu handeln
• Mit geeigneter und funktionsfähiger Ausrüstung ausgestattet zu sein
• Für seine persönliche Gesundheit und Sicherheit verantwortlich zu sein
• Sich nicht auf die Plattform für medizinische oder Sicherheitsinformationen zu verlassen`
          },
          {
            title: '5. Verzicht auf Ansprüche',
            content: `Durch die Nutzung der Plattform verzichtet jeder Benutzer (Organisator oder Teilnehmer) endgültig und unwiderruflich auf jegliches Recht, Ansprüche, Forderungen oder Argumente gegen die Plattform geltend zu machen bezüglich:

• Jeglicher körperlicher, sachlicher, mentaler oder wirtschaftlicher Schäden im Zusammenhang mit der Reise
• Fahrlässigkeit, Unachtsamkeit oder illegale Handlungen des Organisators oder eines anderen Teilnehmers
• Ungenaue Informationen, technische Ausfälle oder Servicestörungen

Dieser Verzicht umfasst auch den Verzicht auf jegliche Ansprüche gegen die Versicherer, leitenden Angestellten, Mitarbeiter und Subunternehmer der Plattform.`
          },
          {
            title: '6. Schadloshaltung',
            content: `Jeder Benutzer verpflichtet sich, die Plattform zu entschädigen und zu verteidigen gegen jegliche Ansprüche, Forderungen, Ausgaben (einschließlich Anwaltsgebühren) oder Schäden, die entstehen durch:

• Nutzung der Plattform durch den Benutzer
• Verletzung dieser Nutzungsbedingungen
• Verletzung von Rechten Dritter
• Fahrlässigkeit oder illegale Handlung des Benutzers

Diese Verpflichtung bleibt auch nach Beendigung der Nutzung der Plattform bestehen.`
          },
          {
            title: '7. Sicherheitsempfehlungen',
            content: `Die Plattform empfiehlt (verlangt aber nicht) Benutzern:

• Hintergrund, Erfahrung und Ruf des Organisators zu überprüfen
• Sich vor der Reise mit dem Organisator zu treffen
• Wetter- und Geländebedingungen am Reisetag zu überprüfen
• Sich mit geeigneter und funktionsfähiger Ausrüstung auszustatten
• Wasser, Nahrung, Erste-Hilfe-Set und Kommunikationsgeräte mitzubringen
• Den Organisator über gesundheitliche oder körperliche Einschränkungen zu informieren
• Reiseversicherung oder Unfallversicherung abzuschließen
• Reisen zu vermeiden, die für das persönliche Fitnessniveau ungeeignet sind

Die Verantwortung für die Umsetzung dieser Empfehlungen liegt jedoch ausschließlich beim Benutzer, und die Plattform übernimmt keine Verantwortung, wenn der Benutzer nicht entsprechend gehandelt hat.`
          },
          {
            title: '8. Finanzielle Haftungsbeschränkung',
            content: `Soweit ein Gericht oder eine zuständige Behörde feststellt, dass die Plattform irgendeine Haftung hat (trotz der obigen Verzichts- und Haftungsausschlussklauseln), wird ihre Haftung auf einen Betrag begrenzt, der 100 NIS (einhundert neue israelische Schekel) oder den Betrag der vom Benutzer gezahlten Nutzungsgebühren nicht übersteigt (je nachdem, welcher niedriger ist).

Die Plattform haftet unter keinen Umständen für indirekte, Folge-, besondere oder Strafschäden.`
          },
          {
            title: '9. Anwendbares Recht und Gerichtsstand',
            content: `Diese Nutzungsbedingungen unterliegen ausschließlich den Gesetzen des Staates Israel. Die ausschließliche Zuständigkeit für jegliche aus diesen Nutzungsbedingungen entstehende Streitigkeiten liegt bei den zuständigen Gerichten in Israel.`
          },
          {
            title: '10. Gültigkeit der Bedingungen',
            content: `Diese Nutzungsbedingungen stellen die vollständige und ausschließliche Vereinbarung zwischen dem Benutzer und der Plattform dar. Die Plattform behält sich das Recht vor, diese Bedingungen jederzeit zu aktualisieren, und die fortgesetzte Nutzung der Plattform stellt die Akzeptanz der aktualisierten Bedingungen dar.

Sollte eine Bestimmung dieser Bedingungen für ungültig oder nicht durchsetzbar befunden werden, hat dies keinen Einfluss auf die Gültigkeit der übrigen Bestimmungen.`
          },
          {
            title: '11. Endgültige Bestätigung und Erklärung',
            content: `Durch die Nutzung der Plattform erklärt und bestätigt der Benutzer:

• Die Nutzungsbedingungen vollständig gelesen und verstanden zu haben
• Allen Nutzungsbedingungen ohne Vorbehalt zuzustimmen
• Zu verstehen, dass die Plattform keine Verantwortung für Reisen übernimmt
• Volle Verantwortung und Risiken zu übernehmen
• Auf jegliche Ansprüche gegen die Plattform zu verzichten
• Vorsichtig und mit voller Verantwortung zu handeln`
          }
        ]
      },
      it: {
        title: 'Termini di servizio e accordo legale',
        lastUpdate: 'Ultimo aggiornamento: Dicembre 2025',
        warningTitle: 'Avviso importante - Leggere attentamente!',
        warningText: 'Questo documento contiene termini di servizio legali vincolanti. L\'uso della Piattaforma costituisce pieno accordo con questi termini. Si prega di leggere attentamente prima dell\'uso.',
        legalTitle: 'Consulenza legale consigliata',
        legalText: 'Raccomandiamo vivamente di consultare un avvocato prima di utilizzare la Piattaforma, specialmente se si prevede di organizzare viaggi. Una consulenza legale può aiutare a comprendere meglio i propri diritti e obblighi.',
        sections: [
          {
            icon: Shield,
            title: '1. Definizione e ruolo della piattaforma',
            content: `La piattaforma "The Groupy Loopy" (di seguito: "la Piattaforma") è un servizio digitale che media tra utenti che desiderano organizzare viaggi (di seguito: "Organizzatori") e utenti che desiderano partecipare a viaggi (di seguito: "Partecipanti").

La Piattaforma funge esclusivamente da intermediario tecnologico e non organizza, gestisce, supervisiona, approva o assume alcuna responsabilità per i viaggi pubblicati.`
          },
          {
            icon: AlertTriangle,
            title: '2. Esclusione completa di responsabilità',
            content: `La Piattaforma, i suoi proprietari, operatori, dipendenti, fornitori e sviluppatori (di seguito collettivamente: "la Piattaforma") non assumono alcuna responsabilità, diretta o indiretta, per:

• Qualsiasi lesione fisica, malattia, morte o danno alla proprietà che possa verificarsi durante o in relazione al viaggio
• Qualità, sicurezza, idoneità o legalità dei viaggi pubblicati
• Comportamento, affidabilità, competenza o prudenza degli organizzatori
• Accuratezza delle informazioni pubblicate sui viaggi
• Guasti tecnici, perdita di informazioni o malfunzionamenti del sistema
• Qualsiasi atto o omissione dell'organizzatore o di altri partecipanti`
          },
          {
            icon: FileText,
            title: '3. Responsabilità dell\'organizzatore',
            content: `L'organizzatore assume la piena ed esclusiva responsabilità di tutti gli aspetti del viaggio, inclusi:

• Selezione di un percorso adeguato e sicuro
• Valutazione dell'idoneità del percorso per i livelli di forma fisica ed esperienza dei partecipanti
• Fornitura di avvisi e istruzioni di sicurezza dettagliati
• Garanzia di condizioni meteorologiche e del terreno sicure
• Decisioni prese durante il viaggio
• Gestione di situazioni di emergenza
• Conformità a tutte le leggi e regolamenti pertinenti

L'organizzatore dichiara di possedere le conoscenze, l'esperienza e la capacità richieste per gestire il viaggio, e si impegna ad agire con la massima cura per garantire la sicurezza dei partecipanti.`
          },
          {
            icon: AlertTriangle,
            title: '4. Responsabilità del partecipante',
            content: `Ogni partecipante assume la piena responsabilità personale e dichiara:

• Di possedere una condizione fisica e sanitaria adeguata per il viaggio
• Di essere consapevole dei rischi connessi alle attività all'aperto
• Di assumere tutti i rischi associati alla partecipazione al viaggio
• Di agire con cautela e secondo le istruzioni dell'organizzatore
• Di essere dotato di attrezzatura appropriata e funzionale
• Di essere responsabile della propria salute e sicurezza personale
• Di non fare affidamento sulla Piattaforma per informazioni mediche o di sicurezza`
          },
          {
            title: '5. Rinuncia ai reclami',
            content: `Utilizzando la Piattaforma, ogni utente (organizzatore o partecipante) rinuncia definitivamente e irrevocabilmente a qualsiasi diritto di reclamare, richiedere o argomentare contro la Piattaforma riguardo a:

• Qualsiasi danno fisico, materiale, mentale o economico causato in relazione al viaggio
• Negligenza, disattenzione o atto illegale dell'organizzatore o di un altro partecipante
• Informazioni inesatte, guasti tecnici o malfunzionamenti del servizio

Questa rinuncia include anche la rinuncia a qualsiasi reclamo contro gli assicuratori, funzionari, dipendenti e subappaltatori della Piattaforma.`
          },
          {
            title: '6. Indennizzo',
            content: `Ogni utente si impegna a indennizzare e difendere la Piattaforma da qualsiasi reclamo, richiesta, spesa (compresi gli onorari legali) o danno causato come risultato di:

• Uso della Piattaforma da parte dell'utente
• Violazione di questi termini di servizio
• Violazione dei diritti di terzi
• Negligenza o atto illegale dell'utente

Questo obbligo rimarrà in vigore anche dopo la cessazione dell'uso della Piattaforma.`
          },
          {
            title: '7. Raccomandazioni di sicurezza',
            content: `La Piattaforma raccomanda (ma non richiede) agli utenti di:

• Verificare il background, l'esperienza e la reputazione dell'organizzatore
• Incontrare l'organizzatore prima del viaggio
• Verificare le condizioni meteorologiche e del terreno il giorno del viaggio
• Dotarsi di attrezzatura appropriata e funzionale
• Portare acqua, cibo, kit di pronto soccorso e dispositivi di comunicazione
• Informare l'organizzatore su limitazioni di salute o fisiche
• Stipulare un'assicurazione di viaggio o un'assicurazione infortuni personale
• Evitare viaggi inadeguati per il proprio livello di forma fisica personale

Tuttavia, la responsabilità dell'implementazione di queste raccomandazioni spetta esclusivamente all'utente, e la Piattaforma non assume alcuna responsabilità se l'utente non ha agito di conseguenza.`
          },
          {
            title: '8. Limitazione della responsabilità finanziaria',
            content: `Nella misura in cui un tribunale o un'autorità competente determina che la Piattaforma ha una qualche responsabilità (nonostante le clausole di rinuncia ed esclusione di cui sopra), la sua responsabilità sarà limitata a un importo non superiore a 100 NIS (cento nuovi shekel israeliani), o all'importo delle tariffe di utilizzo pagate dall'utente (il minore tra i due).

La Piattaforma non sarà responsabile in nessun caso per danni indiretti, consequenziali, speciali o punitivi.`
          },
          {
            title: '9. Legge applicabile e giurisdizione',
            content: `Questi termini di servizio saranno regolati esclusivamente dalle leggi dello Stato di Israele. La giurisdizione esclusiva per qualsiasi controversia derivante da questi termini di servizio sarà quella dei tribunali competenti in Israele.`
          },
          {
            title: '10. Validità dei termini',
            content: `Questi termini di servizio costituiscono l'accordo completo ed esclusivo tra l'utente e la Piattaforma. La Piattaforma si riserva il diritto di aggiornare questi termini in qualsiasi momento, e l'uso continuato della Piattaforma costituirà l'accettazione dei termini aggiornati.

Se una qualsiasi disposizione di questi termini viene determinata nulla o non applicabile, ciò non influirà sulla validità delle altre disposizioni.`
          },
          {
            title: '11. Conferma e dichiarazione finale',
            content: `Utilizzando la Piattaforma, l'utente dichiara e conferma:

• Di aver letto e compreso i termini di servizio nella loro interezza
• Di accettare tutti i termini di servizio senza riserve
• Di comprendere che la Piattaforma non assume alcuna responsabilità per i viaggi
• Di assumere la piena responsabilità e i rischi
• Di rinunciare a qualsiasi reclamo contro la Piattaforma
• Di agire con cautela e piena responsabilità`
          }
        ]
      },
      ru: {
        title: 'Условия обслуживания и юридическое соглашение',
        lastUpdate: 'Последнее обновление: Декабрь 2025',
        warningTitle: 'Важное предупреждение - Прочтите внимательно!',
        warningText: 'Этот документ содержит обязательные юридические условия обслуживания. Использование Платформы означает полное согласие с этими условиями. Пожалуйста, внимательно прочитайте перед использованием.',
        legalTitle: 'Рекомендуется юридическая консультация',
        legalText: 'Мы настоятельно рекомендуем проконсультироваться с юристом перед использованием Платформы, особенно если вы планируете организовывать поездки. Юридическая консультация может помочь вам более точно понять ваши права и обязанности.',
        sections: [
          {
            icon: Shield,
            title: '1. Определение и роль платформы',
            content: `Платформа "The Groupy Loopy" (далее: "Платформа") - это цифровой сервис, который выступает посредником между пользователями, желающими организовать поездки (далее: "Организаторы"), и пользователями, желающими присоединиться к поездкам (далее: "Участники").

Платформа служит исключительно в качестве технологического посредника и не организует, не управляет, не контролирует, не одобряет и не несет никакой ответственности за поездки, опубликованные на ней.`
          },
          {
            icon: AlertTriangle,
            title: '2. Полный отказ от ответственности',
            content: `Платформа, ее владельцы, операторы, сотрудники, поставщики и разработчики (далее совместно: "Платформа") не несут никакой ответственности, прямой или косвенной, за:

• Любые телесные повреждения, болезни, смерть или имущественный ущерб, которые могут произойти во время поездки или в связи с ней
• Качество, безопасность, пригодность или законность опубликованных поездок
• Поведение, надежность, компетентность или осторожность организаторов поездок
• Точность информации, опубликованной о поездках
• Технические сбои, потерю информации или сбои системы
• Любое действие или бездействие организатора поездки или других участников`
          },
          {
            icon: FileText,
            title: '3. Ответственность организатора',
            content: `Организатор поездки несет полную и исключительную ответственность за все аспекты поездки, включая:

• Выбор подходящего и безопасного маршрута
• Оценка пригодности маршрута для уровня физподготовки и опыта участников
• Предоставление подробных предупреждений и инструкций по безопасности
• Обеспечение безопасных погодных и местностных условий
• Решения, принятые во время поездки
• Обработка чрезвычайных ситуаций
• Соблюдение всех соответствующих законов и нормативных актов

Организатор заявляет, что обладает знаниями, опытом и способностью, необходимыми для управления поездкой, и обязуется действовать с максимальной осторожностью для обеспечения безопасности участников.`
          },
          {
            icon: AlertTriangle,
            title: '4. Ответственность участника',
            content: `Каждый участник поездки несет полную личную ответственность и заявляет, что:

• Обладает физической подготовкой и здоровьем, подходящими для поездки
• Осознает риски, связанные с активным отдыхом
• Принимает на себя все риски, связанные с участием в поездке
• Будет действовать осторожно и в соответствии с инструкциями организатора
• Будет снабжен соответствующим и функциональным оборудованием
• Несет ответственность за свое личное здоровье и безопасность
• Не будет полагаться на Платформу в получении медицинской информации или информации по безопасности`
          },
          {
            title: '5. Отказ от претензий',
            content: `Используя Платформу, каждый пользователь (организатор или участник) окончательно и безвозвратно отказывается от любого права на претензии, требования или споры с Платформой в отношении:

• Любого телесного, имущественного, психического или экономического ущерба, причиненного в связи с поездкой
• Небрежности, халатности или незаконного действия организатора или другого участника
• Неточной информации, технических сбоев или неисправностей сервиса

Этот отказ включает также отказ от любых претензий к страховщикам, должностным лицам, сотрудникам и субподрядчикам Платформы.`
          },
          {
            title: '6. Возмещение ущерба',
            content: `Каждый пользователь обязуется возместить и защитить Платформу от любых претензий, требований, расходов (включая гонорары адвокатов) или ущерба, возникших в результате:

• Использования Платформы пользователем
• Нарушения этих условий обслуживания
• Нарушения прав третьих лиц
• Небрежности или незаконного действия пользователя

Это обязательство остается в силе даже после прекращения использования Платформы.`
          },
          {
            title: '7. Рекомендации по безопасности',
            content: `Платформа рекомендует (но не требует) пользователям:

• Проверить биографию, опыт и репутацию организатора поездки
• Встретиться с организатором перед поездкой
• Проверить погодные и местностные условия в день поездки
• Обеспечить себя соответствующим и функциональным оборудованием
• Взять воду, еду, аптечку первой помощи и средства связи
• Сообщить организатору о проблемах со здоровьем или физических ограничениях
• Оформить туристическую страховку или страхование от несчастных случаев
• Избегать поездок, не подходящих для личного уровня физподготовки

Однако ответственность за выполнение этих рекомендаций лежит исключительно на пользователе, и Платформа не несет ответственности, если пользователь не действовал соответствующим образом.`
          },
          {
            title: '8. Ограничение финансовой ответственности',
            content: `В той степени, в которой суд или компетентный орган определит, что Платформа несет какую-либо ответственность (несмотря на вышеуказанные положения об отказе и освобождении от ответственности), ее ответственность будет ограничена суммой, не превышающей 100 шекелей (сто новых израильских шекелей), или суммой платы за использование, уплаченной пользователем (в зависимости от того, что меньше).

Платформа ни в коем случае не несет ответственности за косвенный, последующий, особый или штрафной ущерб.`
          },
          {
            title: '9. Применимое право и юрисдикция',
            content: `Эти условия обслуживания регулируются исключительно законами Государства Израиль. Исключительная юрисдикция по любому спору, возникающему из этих условий обслуживания, принадлежит компетентным судам Израиля.`
          },
          {
            title: '10. Действительность условий',
            content: `Эти условия обслуживания представляют собой полное и исключительное соглашение между пользователем и Платформой. Платформа оставляет за собой право обновлять эти условия в любое время, и продолжение использования Платформы будет означать принятие обновленных условий.

Если какое-либо положение этих условий будет признано недействительным или не имеющим исковой силы, это не повлияет на действительность остальных положений.`
          },
          {
            title: '11. Окончательное подтверждение и заявление',
            content: `Используя Платформу, пользователь заявляет и подтверждает, что:

• Прочитал и понял условия обслуживания в полном объеме
• Соглашается со всеми условиями обслуживания без оговорок
• Понимает, что Платформа не несет ответственности за поездки
• Принимает на себя полную ответственность и риски
• Отказывается от любых претензий к Платформе
• Будет действовать осторожно и с полной ответственностью`
          }
        ]
      }
    };
    
    return translations[language] || translations.en;
  };
  
  const content = getContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          {isRTL ? <ArrowRight className="w-4 h-4 mr-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
          {language === 'he' ? 'חזרה' : 'Back'}
        </Button>

        <Card className="shadow-2xl border-0 mb-8">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl">{content.title}</CardTitle>
                <p className="text-red-100 text-sm mt-1">{content.lastUpdate}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-red-900 text-lg mb-2">
                    {content.warningTitle}
                  </h3>
                  <p className="text-red-800 leading-relaxed">
                    {content.warningText}
                  </p>
                </div>
              </div>
            </div>

            {content.sections.map((section, index) => (
              <div key={index} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                <div className="flex items-start gap-3 mb-3">
                  {section.icon && (
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <section.icon className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mt-1">{section.title}</h3>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line ml-13">
                  {section.content}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-amber-900 text-lg mb-2">
                {content.legalTitle}
              </h3>
              <p className="text-amber-800 leading-relaxed">
                {content.legalText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}