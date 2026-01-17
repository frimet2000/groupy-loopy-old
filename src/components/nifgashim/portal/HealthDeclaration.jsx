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
    title: 'הצהרת בריאות ומודעות לסיכונים',
    subtitle: 'אנא קרא בעיון את ההצהרה הבאה',
    section1: 'הצהרת בריאות',
    section1Text: `אני מצהיר/ה כי:

• אני בריא/ה ומסוגל/ת להשתתף במסע זה
• אין לי מגבלות רפואיות המונעות השתתפות בפעילות פיזית
• אני מתחייב/ת לדווח על כל בעיה רפואית במהלך המסע`,
    
    section2: 'מודעות לסיכונים',
    section2Text: `אני מודע/ת כי השתתפות במסע כוללת פעילות פיזית ומאמץ, ועלולה להיות כרוכה בסיכונים רגילים לפעילות מסוג זה.

אני מקבל/ת על עצמי את האחריות האישית לבריאותי ולרווחתי במהלך המסע.`,
    
    section3: 'משחרור מאחריות',
    section3Text: `אני מבין/ה כי מארגני המסע עשו את המיטב כדי להבטיח חוויה בטוחה ומהנה. עם זאת, אני משחרר/ת את המארגנים והפלטפורמה Groupy Loopy מאחריות בגין אירועים בלתי צפויים או תאונות.`,
    
    section4: '',
    section4Text: '',
    
    section5: '',
    section5Text: '',
    
    section6: '',
    section6Text: '',
    
    section7: '',
    section7Text: '',
    
    agreeConfirm: 'אני מאשר/ת שקראתי את ההצהרה ומבין/ה את התוכן',
    warning: 'חובה לאשר את ההצהרה כדי להמשיך'
  },
  en: {
    title: 'Health Declaration, Assumption of Risk, and Comprehensive Release of Liability',
    subtitle: 'Please read this document carefully in its entirety. This is a legally binding agreement.',
    section1: 'Health Declaration and Physical Fitness Certification',
    section1Text: `By signing this document, I declare and certify that:

a) I am in good physical health and possess sufficient physical fitness to participate in this trek and all its activities.
b) I am of legal age and any age-related restrictions have been fully considered with my physician.
c) I have no medical conditions, including but not limited to: heart disease, high blood pressure, diabetes, asthma, epilepsy, or any other medical condition that would place me at increased risk.
d) I am not taking any medications that would compromise my ability to participate in strenuous physical activity.
e) I have not had surgery in recent months and do not have any active injuries or physical limitations.
f) I have the sole judgment to determine my fitness to participate in this trek safely.
g) All information provided by me is true and accurate, and I am responsible for any false or concealed information.`,
    
    section2: 'Full Understanding of Inherent Risks',
    section2Text: `I fully acknowledge and understand that participation in this trek involves significant and unavoidable physical risks, including but not limited to:
- Serious or fatal injuries (fractures, sprains, contusions, lacerations, trauma)
- Illness including allergic reactions, infections, dehydration, heat exhaustion, heat stroke
- Sudden cardiac death or acute myocardial infarction
- Death
- Partial or complete paralysis
- Traumatic brain injury or spinal cord injury

I understand that these risks are potentially fatal, including death.`,
    
    section3: 'Voluntary Assumption of Risk',
    section3Text: `I voluntarily, knowingly, and with full understanding and appreciation of the dangers involved, assume all risks of participation in this trek. I acknowledge that these risks cannot be entirely eliminated even with the best medical care and most experienced guides. I choose to participate with full knowledge and acceptance of all these risks.`,
    
    section4: 'Release of Liability and Indemnification',
    section4Text: `In consideration of being permitted to participate in this trek, I hereby release, discharge, and hold harmless:

1. The trek organizer and the entity organizing this trek
2. Groupy Loopy and all its owners and related entities
3. All trek guides, support staff, and any employees
4. Any emergency medical personnel or emergency services called upon
5. The state, county, or jurisdiction in which any portion of this trek occurs
6. Any third party in any way related to this trek

From any and all claims, demands, causes of action, damages, penalties, fines, costs, attorney's fees, and liabilities (including psychological damages, loss of reputation, diminution of enjoyment of life, and loss of family relationships) that I, my heirs, or my estate might bring or claim as a result of any:
- Injury, illness, disability, or death that occurs during or results from participation in the trek
- Damage to personal property or financial loss
- Disruption or cancellation of the trek for any reason
- Actions or statements of other participants or staff`,
    
    section5: 'No Liability of Organizers and Website Creator',
    section5Text: `The trek organizer, Groupy Loopy, website creators, and all related parties shall have no liability whatsoever for:
- Any injury, illness, disability, or death that occurs during or results from the trek
- Any damage or loss resulting from the trek
- Any medical negligence or errors in treatment
- Provision or withholding of emergency care
- Weather conditions or acts of nature
- Misconduct by any guide or other participant

They are under no obligation to inspect, investigate, or report on your medical condition. You alone are responsible for assessing your fitness to participate.`,
    
    section6: 'Authorization for Use of Personal Information in Emergencies',
    section6Text: `I authorize the use and release of my personal information, including my name, photograph, date of birth, emergency contacts, and all medical information provided, to trek staff and emergency medical personnel in the event of a medical emergency.`,
    
    section7: 'Voluntary Agreement Without Duress',
    section7Text: `I affirm that my signature on this document is given voluntarily, with full understanding, and without any pressure, threat, or coercion. I have read this document carefully, understand all its terms, have had the opportunity to ask questions, and understand the legal significance of this document.`,
    
    agreeConfirm: 'I confirm that I have read the entire health declaration and liability release agreement, fully understand its contents, and my agreement is given of my own free will',
    warning: 'You must confirm this declaration to continue'
  },
  ru: {
    title: 'Декларация о здоровье, принятие риска и полный отказ от ответственности',
    subtitle: 'Пожалуйста, внимательно прочитайте весь документ. Это юридически обязывающее соглашение.',
    section1: 'Декларация о здоровье и физической подготовке',
    section1Text: `Подписывая этот документ, я заявляю и подтверждаю следующее:

а) Я в хорошем физическом здоровье и обладаю достаточной физической подготовкой для участия в этом походе и всех его видах деятельности.
б) Я достаточного возраста, и все возрастные ограничения были полностью рассмотрены моим врачом.
в) У меня нет медицинских состояний, включая, но не ограничиваясь: заболевания сердца, высокое кровяное давление, диабет, астма, эпилепсия или любое другое медицинское состояние, которое создало бы для меня повышенный риск.
г) Я не принимаю никаких лекарств, которые могли бы помешать моей способности участвовать в напряженной физической деятельности.
д) Я не перенес операцию в последние месяцы и не имею никаких активных травм или физических ограничений.
е) Я полностью должен определить свою пригодность к безопасному участию в этом походе.
ж) Вся информация, предоставленная мной, верна и точна, и я отвечаю за любую ложную или скрытую информацию.`,
    
    section2: 'Полное понимание присущих рисков',
    section2Text: `Я полностью осознаю и понимаю, что участие в этом походе связано со значительными и неизбежными физическими рисками, включая, но не ограничиваясь:
- Серьезные или смертельные травмы (переломы, растяжения, ушибы, порезы, травмы)
- Болезни, включая аллергические реакции, инфекции, обезвоживание, тепловое истощение, тепловой удар
- Внезапная сердечная смерть или острый инфаркт миокарда
- Смерть
- Частичный или полный паралич
- Черепно-мозговая травма или травма спинного мозга

Я понимаю, что эти риски потенциально смертельны, включая смерть.`,
    
    section3: 'Добровольное принятие риска',
    section3Text: `Я добровольно, осознанно и полностью понимая опасность, принимаю все риски участия в этом походе. Я признаю, что эти риски не могут быть полностью устранены даже при наилучшем медицинском обслуживании и наиболее опытных гидах. Я выбираю участвовать с полным осознанием и принятием всех этих рисков.`,
    
    section4: 'Отказ от ответственности и возмещение убытков',
    section4Text: `В качестве условия для участия в этом походе я настоящим освобождаю, снимаю с себя и принимаю на себя ответственность перед:

1. Организатором похода и организацией, проводящей этот поход
2. Groupy Loopy и всеми его владельцами и связанными организациями
3. Всеми гидами, вспомогательным персоналом и любыми сотрудниками
4. Любым персоналом неотложной медицинской помощи или спасательными службами
5. Штатом, округом или юрисдикцией, в которой происходит какая-либо часть похода
6. Любой третьей стороной, каким-либо образом связанной с походом

От любых и всех претензий, исков, исков, убытков, штрафов, штрафов, затрат, судебных сборов и обязательств (включая психологический ущерб, потерю репутации, снижение качества жизни и разрыв семейных отношений), которые я, мои наследники или мое имущество можем подать в результате:
- Травмы, болезни, инвалидности или смерти, которые происходят во время или в результате участия в походе
- Ущерб личному имуществу или финансовые потери
- Нарушение или отмена похода по какой-либо причине
- Действия или высказывания других участников или персонала`,
    
    section5: 'Отсутствие ответственности организаторов и создателей сайта',
    section5Text: `Организатор похода, Groupy Loopy, создатели веб-сайтов и все связанные стороны не несут никакой ответственности за:
- Любую травму, болезнь, инвалидность или смерть, которая происходит во время или в результате похода
- Любые убытки или потери, вытекающие из похода
- Любую медицинскую небрежность или ошибки в лечении
- Предоставление или невозможность оказания неотложной помощи
- Погодные условия или стихийные бедствия
- Недобросовестное поведение любого гида или другого участника

Они не обязаны проверять, расследовать или сообщать о вашем медицинском состоянии. Только вы несете ответственность за оценку своей пригодности к участию.`,
    
    section6: 'Авторизация использования личной информации при чрезвычайных ситуациях',
    section6Text: `Я разрешаю использование и раскрытие моей личной информации, включая мое имя, фотографию, дату рождения, экстренные контакты и всю предоставленную медицинскую информацию, персоналу похода и медицинскому персоналу в случае медицинской чрезвычайной ситуации.`,
    
    section7: 'Добровольное соглашение без принуждения',
    section7Text: `Я подтверждаю, что моя подпись на этом документе дана добровольно, с полным пониманием и без какого-либо давления, угрозы или принуждения. Я прочитал этот документ внимательно, понимаю все его положения, имел возможность задать вопросы и понимаю юридическое значение этого документа.`,
    
    agreeConfirm: 'Я подтверждаю, что прочитал всю декларацию о здоровье и соглашение об отказе от ответственности, полностью понимаю его содержание, и мое согласие дано добровольно',
    warning: 'Вы должны подтвердить эту декларацию, чтобы продолжить'
  },
  es: {
    title: 'Declaración de Salud, Aceptación de Riesgo y Renuncia Integral de Responsabilidad',
    subtitle: 'Por favor, lea este documento completo cuidadosamente. Este es un acuerdo legalmente vinculante.',
    section1: 'Declaración de Salud y Certificación de Aptitud Física',
    section1Text: `Al firmar este documento, declaro y certifico lo siguiente:

a) Estoy en buen estado de salud física y poseo la aptitud física suficiente para participar en este trekking y en todas sus actividades.
b) Tengo la edad legal requerida y todas las restricciones de edad han sido plenamente consideradas por mi médico.
c) No tengo condiciones médicas, incluyendo pero no limitado a: enfermedades cardíacas, presión arterial alta, diabetes, asma, epilepsia, o cualquier otra condición médica que me pusiera en riesgo aumentado.
d) No estoy tomando medicamentos que comprometan mi capacidad de participar en actividades físicas extenuantes.
e) No he tenido cirugía recientemente y no tengo lesiones activas o limitaciones físicas.
f) Tengo la facultad exclusiva para determinar mi aptitud para participar en este trekking de manera segura.
g) Toda la información proporcionada por mí es verdadera y precisa, y soy responsable de cualquier información falsa u oculta.`,
    
    section2: 'Comprensión Total de Riesgos Inherentes',
    section2Text: `Reconozco plenamente que la participación en este trekking implica riesgos físicos significativos e inevitables, incluyendo pero no limitado a:
- Lesiones graves o fatales (fracturas, esguinces, contusiones, laceraciones, traumatismos)
- Enfermedad incluyendo reacciones alérgicas, infecciones, deshidratación, agotamiento por calor, golpe de calor
- Muerte cardíaca súbita o infarto agudo de miocardio
- Muerte
- Parálisis parcial o completa
- Lesión cerebral traumática o lesión de la médula espinal

Entiendo que estos riesgos son potencialmente fatales, incluyendo la muerte.`,
    
    section3: 'Aceptación Voluntaria de Riesgo',
    section3Text: `Voluntaria, consciente y con comprensión total de los peligros involucrados, asumo todos los riesgos de participación en este trekking. Reconozco que estos riesgos no pueden eliminarse completamente incluso con la mejor atención médica y los guías más experimentados. Elijo participar con conocimiento completo y aceptación de todos estos riesgos.`,
    
    section4: 'Renuncia de Responsabilidad e Indemnización',
    section4Text: `Como condición para participar en este trekking, por este medio renuncio, libero y exonero de responsabilidad a:

1. El organizador del trekking y la entidad que organiza este trekking
2. Groupy Loopy y todos sus propietarios y entidades relacionadas
3. Todos los guías de trekking, personal de apoyo y cualquier empleado
4. Cualquier personal de emergencia médica o servicios de emergencia que pueda ser llamado
5. El estado, condado o jurisdicción en el que ocurra cualquier parte del trekking
6. Cualquier tercero de cualquier manera relacionado con el trekking

De cualquier y todos los reclamos, demandas, causas de acción, daños, multas, penalizaciones, costos, honorarios de abogados y pasivos (incluyendo daño psicológico, pérdida de reputación, disminución del disfrute de la vida, y pérdida de relaciones familiares) que yo, mis herederos, o mi patrimonio pueda presentar como resultado de cualquier:
- Lesión, enfermedad, discapacidad o muerte que ocurra durante o como resultado de la participación en el trekking
- Daño a la propiedad personal o pérdida financiera
- Disrupción o cancelación del trekking por cualquier razón
- Acciones o declaraciones de otros participantes o personal`,
    
    section5: 'Sin Responsabilidad de Organizadores y Creadores de Sitios Web',
    section5Text: `El organizador del trekking, Groupy Loopy, creadores de sitios web y todas las partes relacionadas no tendrán responsabilidad alguna por:
- Cualquier lesión, enfermedad, discapacidad o muerte que ocurra durante o como resultado del trekking
- Cualquier daño o pérdida resultante del trekking
- Cualquier negligencia médica o errores en el tratamiento
- Provisión o retención de atención de emergencia
- Condiciones climáticas o actos de la naturaleza
- Mala conducta de cualquier guía u otro participante

No están obligados a inspeccionar, investigar o informar sobre su condición médica. Solo usted es responsable de evaluar su aptitud para participar.`,
    
    section6: 'Autorización para Uso de Información Personal en Emergencias',
    section6Text: `Autorizo el uso y la divulgación de mi información personal, incluyendo mi nombre, fotografía, fecha de nacimiento, contactos de emergencia y toda la información médica proporcionada, al personal del trekking y al personal médico de emergencia en caso de una emergencia médica.`,
    
    section7: 'Acuerdo Voluntario Sin Coacción',
    section7Text: `Afirmo que mi firma en este documento se da voluntariamente, con comprensión total, y sin ninguna presión, amenaza o coacción. He leído este documento cuidadosamente, entiendo todos sus términos, he tenido la oportunidad de hacer preguntas, y entiendo el significado legal de este documento.`,
    
    agreeConfirm: 'Confirmo que he leído la declaración de salud completa y el acuerdo de renuncia de responsabilidad, entiendo completamente su contenido, y mi acuerdo se da por mi propia voluntad',
    warning: 'Debe confirmar esta declaración para continuar'
  },
  fr: {
    title: 'Déclaration de Santé, Acceptation des Risques et Renonciation Complète de Responsabilité',
    subtitle: 'Veuillez lire ce document complètement avec soin. Ceci est un accord juridiquement contraignant.',
    section1: 'Déclaration de Santé et Certification d\'Aptitude Physique',
    section1Text: `En signant ce document, je déclare et certifie que:

a) Je suis en bon état de santé physique et je possède l\'aptitude physique suffisante pour participer à cette randonnée et à toutes ses activités.
b) Je suis d\'âge légal et toutes les restrictions d\'âge ont été pleinement examinées par mon médecin.
c) Je n\'ai pas de conditions médicales, y compris mais non limité à: maladie cardiaque, hypertension artérielle, diabète, asthme, épilepsie, ou toute autre condition médicale qui me mettrait à risque accru.
d) Je ne prends pas de médicaments qui compromettent ma capacité à participer à une activité physique intense.
e) Je n\'ai pas eu de chirurgie récemment et je n\'ai pas de blessures actives ou de limitations physiques.
f) J\'ai le seul jugement pour déterminer mon aptitude à participer à cette randonnée en toute sécurité.
g) Toutes les informations fournies par moi sont vraies et exactes, et je suis responsable de toute information fausse ou dissimulée.`,
    
    section2: 'Compréhension Complète des Risques Inhérents',
    section2Text: `Je reconnais pleinement que la participation à cette randonnée implique des risques physiques significatifs et inévitables, y compris mais non limité à:
- Blessures graves ou mortelles (fractures, entorses, contusions, lacérations, traumatismes)
- Maladie y compris réactions allergiques, infections, déshydratation, épuisement par la chaleur, coup de chaleur
- Mort cardiaque subite ou infarctus aigu du myocarde
- Mort
- Paralysie partielle ou complète
- Lésion cérébrale traumatique ou lésion de la moelle épinière

Je comprends que ces risques sont potentiellement mortels, y compris la mort.`,
    
    section3: 'Acceptation Volontaire des Risques',
    section3Text: `Je volontairement, consciemment et en comprenant pleinement les dangers impliqués, accepte tous les risques de participation à cette randonnée. Je reconnais que ces risques ne peuvent pas être entièrement éliminés même avec les meilleurs soins médicaux et les guides les plus expérimentés. Je choisis de participer avec une connaissance complète et une acceptation de tous ces risques.`,
    
    section4: 'Renonciation de Responsabilité et Indemnisation',
    section4Text: `En tant que condition pour participer à cette randonnée, je renonce par la présente, libère et exonère de responsabilité:

1. L\'organisateur de la randonnée et l\'entité organisant cette randonnée
2. Groupy Loopy et tous ses propriétaires et entités connexes
3. Tous les guides de randonnée, le personnel de soutien et tout employé
4. Tout personnel médical d\'urgence ou services d\'urgence qui pourrait être appelé
5. L\'État, le comté ou la juridiction dans laquelle se déroule toute partie de la randonnée
6. Toute tierce partie de quelque façon que ce soit liée à la randonnée

De toutes les réclamations, demandes, causes d\'action, dommages, amendes, pénalités, frais, honoraires d\'avocat et responsabilités (y compris les dommages psychologiques, la perte de réputation, la diminution du plaisir de la vie, et la rupture des relations familiales) que moi, mes héritiers, ou ma succession pourrait présenter en raison de:
- Une blessure, une maladie, une invalidité ou un décès qui se produit pendant ou résultant de la participation à la randonnée
- Les dommages aux biens personnels ou les pertes financières
- La perturbation ou l\'annulation de la randonnée pour quelque raison que ce soit
- Les actions ou les déclarations d\'autres participants ou du personnel`,
    
    section5: 'Aucune Responsabilité des Organisateurs et Créateurs de Sites Web',
    section5Text: `L\'organisateur de la randonnée, Groupy Loopy, les créateurs de sites Web et toutes les parties connexes ne seront responsables en aucune manière pour:
- Toute blessure, maladie, invalidité ou décès qui se produit pendant ou en raison de la randonnée
- Tout dommage ou perte résultant de la randonnée
- Toute négligence médicale ou erreurs de traitement
- La fourniture ou la retenue des soins d\'urgence
- Les conditions météorologiques ou les actes de la nature
- Inconduite de tout guide ou autre participant

Ils ne sont tenus d\'inspecter, enquêter ou signaler votre état de santé. Vous seul êtes responsable d\'évaluer votre aptitude à participer.`,
    
    section6: 'Autorisation d\'Utilisation des Informations Personnelles en Cas d\'Urgence',
    section6Text: `J\'autorise l\'utilisation et la divulgation de mes informations personnelles, y compris mon nom, ma photographie, ma date de naissance, mes contacts d\'urgence et toutes les informations médicales fournies, au personnel de la randonnée et au personnel médical d\'urgence en cas d\'urgence médicale.`,
    
    section7: 'Accord Volontaire Sans Contrainte',
    section7Text: `Je certifie que ma signature sur ce document est donnée volontairement, en toute connaissance et sans aucune pression, menace ou contrainte. J\'ai lu ce document avec soin, je comprends tous ses termes, j\'ai eu l\'occasion de poser des questions, et je comprends la portée juridique de ce document.`,
    
    agreeConfirm: 'Je confirme que j\'ai lu la déclaration de santé complète et l\'accord de renonciation de responsabilité, que j\'en comprends pleinement le contenu, et que mon consentement est donné librement',
    warning: 'Vous devez confirmer cette déclaration pour continuer'
  },
  de: {
    title: 'Gesundheitserklärung, Risikoübernahme und umfassender Haftungsausschluss',
    subtitle: 'Bitte lesen Sie dieses Dokument vollständig und sorgfältig. Dies ist eine rechtlich bindende Vereinbarung.',
    section1: 'Gesundheitserklärung und Bescheinigung der physischen Eignung',
    section1Text: `Durch Unterzeichnung dieses Dokuments erkläre und bestätige ich:

a) Ich bin in guter körperlicher Gesundheit und besitze ausreichende körperliche Fitness, um an dieser Wanderung und allen ihren Aktivitäten teilzunehmen.
b) Ich bin volljährig und alle Altersbeschränkungen wurden vollständig von meinem Arzt berücksichtigt.
c) Ich habe keine medizinischen Zustände, einschließlich, aber nicht beschränkt auf: Herzerkrankungen, Bluthochdruck, Diabetes, Asthma, Epilepsie oder einen anderen medizinischen Zustand, der mich einem erhöhten Risiko aussetzen würde.
d) Ich nehme keine Medikamente, die meine Fähigkeit, an anstrengender körperlicher Aktivität teilzunehmen, beeinträchtigen würden.
e) Ich hatte in letzter Zeit keine Operation und habe keine aktiven Verletzungen oder körperlichen Einschränkungen.
f) Ich habe das alleinige Ermessen, meine Eignung zur sicheren Teilnahme an dieser Wanderung zu bestimmen.
g) Alle von mir bereitgestellten Informationen sind wahr und genau, und ich bin für falsche oder verborgene Informationen verantwortlich.`,
    
    section2: 'Vollständiges Verständnis der inhärenten Risiken',
    section2Text: `Ich erkenne vollständig an, dass die Teilnahme an dieser Wanderung mit erheblichen und unvermeidlichen körperlichen Risiken verbunden ist, einschließlich, aber nicht beschränkt auf:
- Schwere oder tödliche Verletzungen (Frakturen, Verstauchungen, Prellungen, Schnitte, Traumata)
- Krankheit, einschließlich allergischer Reaktionen, Infektionen, Dehydration, Hitzeerschöpfung, Hitzschlag
- Plötzlicher Herztod oder akuter Myokardinfarkt
- Tod
- Teilweise oder vollständige Lähmung
- Traumatische Hirnverletzung oder Rückenmarksverletzung

Ich verstehe, dass diese Risiken potenziell tödlich sind, einschließlich des Todes.`,
    
    section3: 'Freiwillige Risikoübernahme',
    section3Text: `Ich übernahme freiwillig, bewusst und mit vollständigem Verständnis der damit verbundenen Gefahren alle Risiken der Teilnahme an dieser Wanderung. Ich erkenne an, dass diese Risiken auch mit der besten medizinischen Versorgung und erfahrensten Führern nicht vollständig eliminiert werden können. Ich entscheide mich zur Teilnahme mit vollständigem Wissen und Verständnis aller dieser Risiken.`,
    
    section4: 'Haftungsausschluss und Schadloshaltung',
    section4Text: `Als Bedingung für die Teilnahme an dieser Wanderung entlasse, befreie und halte schadlos:

1. Den Wanderungsorganisator und die Organisation, die diese Wanderung durchführt
2. Groupy Loopy und alle seine Eigentümer und verwandten Unternehmen
3. Alle Wanderungsführer, Supportpersonal und alle Mitarbeiter
4. Alle Notfallmediziner oder Notfalldienste, die eventuell angefordert werden
5. Den Staat, Kreis oder die Gerichtsbarkeit, in dem ein Teil dieser Wanderung stattfindet
6. Jeden dritten, der auf irgendeine Weise mit der Wanderung verbunden ist

Von allen Ansprüchen, Forderungen, Rechtsansprüchen, Schadensersatz, Geldstrafen, Bußgeldern, Kosten, Anwaltsgebühren und Haftungen (einschließlich psychischer Schäden, Reputationsverlust, Minderung der Lebensfreude und Verlust von Familienbeziehungen), die ich, meine Erben oder mein Nachlass erheben könnte, als Ergebnis von:
- Verletzungen, Krankheiten, Behinderungen oder Todesfällen, die während oder infolge der Wanderung auftreten
- Schäden am persönlichen Eigentum oder Geldverluste
- Unterbrechung oder Absage der Wanderung aus irgendeinem Grund
- Handlungen oder Aussagen anderer Teilnehmer oder des Personals`,
    
    section5: 'Keine Haftung der Organisatoren und Website-Ersteller',
    section5Text: `Der Wanderungsorganisator, Groupy Loopy, Website-Ersteller und alle verwandten Parteien haften in keiner Weise für:
- Verletzungen, Krankheiten, Behinderungen oder Todesfälle, die während oder infolge der Wanderung auftreten
- Jegliche Schäden oder Verluste, die sich aus der Wanderung ergeben
- Jegliche ärztliche Fahrlässigkeit oder Behandlungsfehler
- Bereitstellung oder Verweigerung von Notfallversorgung
- Wetterbedingungen oder Naturereignisse
- Fehlverhalten eines Führers oder anderen Teilnehmers

Sie sind nicht verpflichtet, Ihren medizinischen Zustand zu überprüfen, zu untersuchen oder zu berichten. Sie allein sind verantwortlich für die Bewertung Ihrer Eignung zur Teilnahme.`,
    
    section6: 'Genehmigung zur Verwendung persönlicher Informationen in Notfällen',
    section6Text: `Ich genehmige die Verwendung und Offenlegung meiner persönlichen Informationen, einschließlich meines Namens, meines Fotos, meines Geburtsdatums, meiner Notfallkontakte und aller bereitgestellten medizinischen Informationen, an Wanderungspersonal und medizinisches Notfallpersonal im Falle einer medizinischen Notfallsituation.`,
    
    section7: 'Freiwillige Vereinbarung ohne Zwang',
    section7Text: `Ich bestätige, dass meine Unterzeichnung dieses Dokuments freiwillig erfolgt, mit vollständigem Verständnis und ohne Druck, Drohung oder Zwang. Ich habe dieses Dokument sorgfältig gelesen, verstehe alle seine Bedingungen, hatte die Gelegenheit, Fragen zu stellen, und verstehe die rechtliche Bedeutung dieses Dokuments.`,
    
    agreeConfirm: 'Ich bestätige, dass ich die vollständige Gesundheitserklärung und den Haftungsausschlussvertrag gelesen habe, seinen Inhalt vollständig verstehe, und mein Einverständnis freiwillig gegeben wird',
    warning: 'Sie müssen diese Erklärung bestätigen, um fortzufahren'
  },
  it: {
    title: 'Dichiarazione di Salute, Assunzione dei Rischi e Completo Esonero di Responsabilità',
    subtitle: 'Per favore, leggi questo documento completamente con attenzione. Questo è un accordo legalmente vincolante.',
    section1: 'Dichiarazione di Salute e Certificazione di Idoneità Fisica',
    section1Text: `Firmando questo documento, dichiaro e certifico quanto segue:

a) Sono in buono stato di salute fisica e possiedo la sufficiente idoneità fisica per partecipare a questo trekking e a tutte le sue attività.
b) Sono in età legale e tutte le restrizioni di età sono state pienamente considerate dal mio medico.
c) Non ho condizioni mediche, incluso ma non limitato a: malattie cardiache, pressione sanguigna alta, diabete, asma, epilessia, o qualsiasi altra condizione medica che mi metterebbe a rischio aumentato.
d) Non sto assumendo alcun medicinale che comprometta la mia capacità di partecipare a attività fisica intensa.
e) Non ho subito chirurgia di recente e non ho lesioni attive o limitazioni fisiche.
f) Ho il solo giudizio per determinare la mia idoneità a partecipare a questo trekking in sicurezza.
g) Tutte le informazioni fornite da me sono vere e accurate, e sono responsabile di qualsiasi informazione falsa o nascosta.`,
    
    section2: 'Piena Comprensione dei Rischi Inerenti',
    section2Text: `Riconosco pienamente che la partecipazione a questo trekking implica rischi fisici significativi e inevitabili, incluso ma non limitato a:
- Lesioni gravi o mortali (fratture, distorsioni, contusioni, lacerazioni, traumi)
- Malattia incluse reazioni allergiche, infezioni, disidratazione, esaurimento da calore, colpo di calore
- Morte cardiaca improvvisa o infarto acuto del miocardio
- Morte
- Paralisi parziale o completa
- Lesione cerebrale traumatica o lesione del midollo spinale

Comprendo che questi rischi sono potenzialmente mortali, inclusa la morte.`,
    
    section3: 'Assunzione Volontaria dei Rischi',
    section3Text: `Volontariamente, consapevolmente e comprendendo pienamente i pericoli coinvolti, assumo tutti i rischi di partecipazione a questo trekking. Riconosco che questi rischi non possono essere completamente eliminati anche con la migliore assistenza medica e le guide più esperte. Scelgo di partecipare con piena consapevolezza e accettazione di tutti questi rischi.`,
    
    section4: 'Esonero da Responsabilità e Indennizzo',
    section4Text: `Come condizione per partecipare a questo trekking, rilascio, sciolgo e esonero da responsabilità:

1. L\'organizzatore del trekking e l\'organizzazione che conduce questo trekking
2. Groupy Loopy e tutti i suoi proprietari ed entità correlate
3. Tutte le guide del trekking, il personale di supporto e qualsiasi dipendente
4. Qualsiasi personale medico di emergenza o servizi di emergenza che potrebbe essere chiamato
5. Lo stato, la contea o la giurisdizione in cui si svolge qualsiasi parte del trekking
6. Qualsiasi terza parte in qualsiasi modo correlata al trekking

Da qualsiasi e da tutti i reclami, domande, cause di azione, danni, ammende, penalità, costi, onorari degli avvocati e responsabilità (inclusi danni psicologici, perdita di reputazione, diminuzione del godimento della vita, e perdita di relazioni familiari) che io, i miei eredi, o il mio patrimonio potrebbe presentare a causa di:
- Lesioni, malattia, disabilità o morte che si verificano durante o a causa della partecipazione al trekking
- Danno alla proprietà personale o perdite finanziarie
- Interruzione o cancellazione del trekking per qualsiasi motivo
- Azioni o dichiarazioni di altri partecipanti o personale`,
    
    section5: 'Nessuna Responsabilità degli Organizzatori e Creatori di Siti Web',
    section5Text: `L\'organizzatore del trekking, Groupy Loopy, creatori di siti web e tutte le parti correlate non saranno responsabili in alcun modo per:
- Qualsiasi lesione, malattia, disabilità o morte che si verificano durante o a causa del trekking
- Qualsiasi danno o perdita derivante dal trekking
- Qualsiasi negligenza medica o errori nel trattamento
- Fornitura o mancata fornitura di assistenza di emergenza
- Condizioni meteorologiche o atti della natura
- Cattiva condotta di qualsiasi guida o altro partecipante

Non sono tenuti a ispezionare, indagare o segnalare le tue condizioni mediche. Solo tu sei responsabile della valutazione della tua idoneità a partecipare.`,
    
    section6: 'Autorizzazione per l\'Utilizzo di Informazioni Personali in Emergenze',
    section6Text: `Autorizzo l\'uso e la divulgazione delle mie informazioni personali, inclusi il mio nome, foto, data di nascita, contatti di emergenza e tutte le informazioni mediche fornite, al personale del trekking e al personale medico di emergenza in caso di emergenza medica.`,
    
    section7: 'Accordo Volontario Senza Coercizione',
    section7Text: `Affermo che la mia firma su questo documento è data volontariamente, con piena comprensione, e senza alcuna pressione, minaccia o coercizione. Ho letto questo documento con attenzione, comprendo tutti i suoi termini, ho avuto l\'opportunità di fare domande, e comprendo il significato legale di questo documento.`,
    
    agreeConfirm: 'Confermo di aver letto la dichiarazione di salute completa e l\'accordo di esonero da responsabilità, comprendo pienamente il suo contenuto, e il mio accordo è dato di mia libera volontà',
    warning: 'Devi confermare questa dichiarazione per continuare'
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
      <Card className="overflow-hidden max-h-[70vh] flex flex-col">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shrink-0">
          <CardTitle className="text-xl md:text-2xl">{t.title}</CardTitle>
          <p className="text-blue-50 mt-1 text-sm">{t.subtitle}</p>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Section 1 */}
          <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-bold text-base text-blue-900">{t.section1}</h3>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{t.section1Text}</p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2 bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-bold text-base text-green-900">{t.section2}</h3>
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{t.section2Text}</p>
          </div>

          {/* Section 3 */}
          {t.section3Text && (
            <div className="space-y-2 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h3 className="font-bold text-base text-indigo-900">{t.section3}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{t.section3Text}</p>
            </div>
          )}

          {/* Warning Alert */}
          {!accepted && (
            <Alert className="border-2 border-red-300 bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-900 font-semibold">
                {t.warning}
              </AlertDescription>
            </Alert>
          )}

          {/* Acceptance Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-red-300 transition-colors sticky bottom-0">
            <Checkbox
              id="healthDeclaration"
              checked={accepted}
              onCheckedChange={onAccept}
              className="mt-1 shrink-0"
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