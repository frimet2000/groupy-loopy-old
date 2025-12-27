import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../components/LanguageContext";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createPageUrl } from "@/utils";
import { Shield, FileText, CheckCircle2 } from "lucide-react";

function getTos(language) {
  const sections = {
    he: [
      { title: "תנאי שימוש והצהרת אחריות – GROUPY LOOPY", body: "" },
      { title: "1. מהות השירות (הפלטפורמה 'כמות שהיא')", body: "Groupy Loopy (\"האפליקציה\") היא פלטפורמה טכנולוגית חינמית המחברת בין מטיילים באופן הדדי. האפליקציה משמשת כתווך פאסיבי בלבד ואינה מארגנת, מובילה, מממנת או מפקחת על טיולים." },
      { title: "2. ויתור מוחלט על אחריות (לקיחת סיכון)", body: "השימוש בטיולים ופעילויות שטח כרוך בסיכונים מובנים. בשימוש באפליקציה הנך מאשר/ת כי את/ה נושא/ת באחריות מלאה לבטיחותך. לא תחול אחריות מכל סוג על Groupy Loopy או המפתחים לכל נזק ישיר/עקיף. השירות חינמי, ועל כן מגבלת האחריות סבירה ומהותית לקיומו." },
      { title: "3. תוכן גולשים ובטיחות", body: "תיאורי טיול, מסלולים וזהויות משתמשים אינם מאומתים. באחריותך הבלעדית לבדוק אנשים ומסלולים. פרסום טיול אינו מהווה המלצה או אישור בטיחות." },
      { title: "4. שימוש בינלאומי וציות לחוק", body: "על המשתמשים לציית לחוקים המקומיים, לרבות היתרים, שימוש בקרקעות פרטיות, וכללי בטיחות במדינת היעד." },
      { title: "5. שיפוי", body: "הנך מתחייב/ת לשפות ולפצות את Groupy Loopy ומפתחיה על כל טענה, הפסד או הוצאה הנובעים משימושך באפליקציה או מהתנהלותך בפעילויות שנקבעו דרכה." },
      { title: "6. כשירות וגיל", body: "השימוש מיועד לבני 18+ בלבד. מי שקטין נדרש לאישור הורה/אפוטרופוס ולליווי מתאים." },
      { title: "7. אין ייעוץ מקצועי", body: "המידע בפלטפורמה אינו מהווה ייעוץ מקצועי (ניווט, רפואי, משפטי, ביטוחי). הסתמכות על המידע באחריותך בלבד." },
      { title: "8. כללי בטיחות והיערכות", body: "יש להצטייד בציוד מתאים, מים, מפות, ובדיקת מזג אוויר. יש לעדכן אנשי קשר, ולפעול לפי כללי זהירות בשטח." },
      { title: "9. תוכן אסור והסרה", body: "חל איסור על פרסום תוכן מטעה/מסית/מסוכן/פוגעני. אנו רשאים להסיר תכנים ולחסום משתמשים לפי שיקול דעתנו." },
      { title: "10. שינויים בשירות", body: "אנו רשאים לשנות, להשעות או להפסיק את השירות, כולו או חלקו, בכל עת ללא הודעה מוקדמת." },
      { title: "11. פרטיות", body: "השימוש כפוף למדיניות פרטיות. אנא עיינו במדיניות לפרטים על עיבוד מידע." },
      { title: "12. דין וסמכות שיפוט", body: "ככל שהדין מתיר, יחול דין ישראלי וסמכות שיפוט בישראל, אלא אם הוגדר אחרת בדין קוגנטי מקומי." },
      { title: "13. שינוי תנאים", body: "אנו רשאים לעדכן תנאים מעת לעת. המשך שימוש משמעו הסכמה לתנאים המעודכנים." },
      { title: "14. הפרדה ואכיפה", body: "אם הוראה כלשהי אינה ניתנת לאכיפה, שאר ההוראות יישארו בתוקף." },
      { title: "15. יצירת קשר", body: "לשאלות ניתן לפנות: frimet@gmail.com" }
    ],
    en: [
      { title: "Terms of Service & Legal Disclaimer – GROUPY LOOPY", body: "" },
      { title: "1. Nature of Service (As-Is Platform)", body: "Groupy Loopy (the \"App\") is a free, interactive platform connecting independent hikers. The App is a passive conduit and does not organize, lead, sponsor, or supervise trips." },
      { title: "2. Absolute Release of Liability (Assumption of Risk)", body: "Outdoor activities carry inherent risks. By using the App, you accept full responsibility for your safety. To the maximum extent permitted by law, Groupy Loopy and its developers are not liable for any damages. As a free service, this limitation is fundamental." },
      { title: "3. User-Generated Content (UGC) & Safety", body: "Trip details, routes, and user identities are not verified. You are solely responsible for vetting people and routes. Listings are not endorsements or safety certifications." },
      { title: "4. International Use & Compliance", body: "Users must comply with all local laws, permits, property rules, and safety codes." },
      { title: "5. Indemnification", body: "You agree to indemnify and hold harmless Groupy Loopy and its creators from any claims, losses, or legal fees arising from your use or conduct." },
      { title: "6. Eligibility & Age", body: "Service intended for users 18+. Minors require guardian consent and appropriate supervision." },
      { title: "7. No Professional Advice", body: "Information is not navigation, medical, legal, or insurance advice. Use at your own risk." },
      { title: "8. Safety & Preparedness", body: "Carry proper gear, water, maps, check weather, inform contacts, and follow field safety." },
      { title: "9. Prohibited Content & Removal", body: "No misleading, dangerous, harassing, or illegal content. We may remove content or suspend users at our discretion." },
      { title: "10. Service Changes", body: "We may modify, suspend, or discontinue the service at any time without notice." },
      { title: "11. Privacy", body: "Use is subject to our Privacy Policy." },
      { title: "12. Governing Law & Venue", body: "Subject to applicable law, Israeli law and courts shall apply unless mandatory local law dictates otherwise." },
      { title: "13. Changes to Terms", body: "We may update terms periodically. Continued use constitutes acceptance." },
      { title: "14. Severability", body: "If any provision is unenforceable, the remainder remains in effect." },
      { title: "15. Contact", body: "Questions: frimet@gmail.com" }
    ],
    ru: [
      { title: "Условия использования и отказ от ответственности – GROUPY LOOPY", body: "" },
      { title: "1. Характер сервиса (как есть)", body: "Groupy Loopy (\"Приложение\") — бесплатная платформа для связи самостоятельных туристов. Приложение — пассивный посредник и не организует/не руководит поездками." },
      { title: "2. Полный отказ от ответственности (принятие риска)", body: "Активности на природе несут риски. Используя Приложение, вы несёте полную ответственность за безопасность. В максимально разрешенной законом степени мы не несем ответственности за убытки. Как бесплатный сервис, это ограничение является фундаментальным." },
      { title: "3. Контент пользователей и безопасность", body: "Маршруты, описания и личности не проверяются. Вы сами проверяете людей и маршруты. Публикация не является рекомендацией или сертификатом безопасности." },
      { title: "4. Международное использование и соблюдение закона", body: "Вы обязаны соблюдать местные законы, разрешения и правила." },
      { title: "5. Возмещение убытков", body: "Вы соглашаетесь возмещать убытки Groupy Loopy и его создателям по любым претензиям, связанным с вашим использованием или поведением." },
      { title: "6. Допуск и возраст", body: "Сервис для пользователей 18+. Несовершеннолетним требуется согласие опекуна и надзор." },
      { title: "7. Отсутствие проф. консультаций", body: "Информация не является навигационной, медицинской, юридической или страховой консультацией." },
      { title: "8. Безопасность и готовность", body: "Снаряжение, вода, карты, проверка погоды, информирование контактов, соблюдение правил безопасности." },
      { title: "9. Запрещенный контент и удаление", body: "Запрещён вводящий в заблуждение/опасный/оскорбительный/незаконный контент. Мы можем удалять контент и блокировать пользователей." },
      { title: "10. Изменения сервиса", body: "Мы можем изменять/приостанавливать/прекращать сервис без уведомления." },
      { title: "11. Конфиденциальность", body: "Использование в соответствии с Политикой конфиденциальности." },
      { title: "12. Применимое право и юрисдикция", body: "При условии применимого права: израильское право и суды, если не предписано иное." },
      { title: "13. Изменение условий", body: "Мы можем обновлять условия; продолжение использования означает согласие." },
      { title: "14. Делимость", body: "Если положение неисполнимо, остальные действуют." },
      { title: "15. Контакты", body: "Вопросы: frimet@gmail.com" }
    ],
    es: [
      { title: "Términos de Servicio y Aviso Legal – GROUPY LOOPY", body: "" },
      { title: "1. Naturaleza del servicio (tal cual)", body: "Groupy Loopy (la \"App\") es una plataforma gratuita para conectar excursionistas. Actúa como intermediario pasivo y no organiza ni supervisa viajes." },
      { title: "2. Exención total de responsabilidad (asunción de riesgo)", body: "Las actividades al aire libre conllevan riesgos. Al usar la App, asumes plena responsabilidad por tu seguridad. No somos responsables por daños. Como servicio gratuito, esta limitación es fundamental." },
      { title: "3. Contenido generado por usuarios y seguridad", body: "No verificamos rutas, descripciones ni identidades. Eres responsable de evaluar personas y rutas. Un anuncio no implica respaldo ni certificación." },
      { title: "4. Uso internacional y cumplimiento", body: "Cumple todas las leyes locales, permisos y normas." },
      { title: "5. Indemnización", body: "Indemnizarás a Groupy Loopy y creadores por reclamaciones derivadas de tu uso o conducta." },
      { title: "6. Elegibilidad y edad", body: "Servicio para mayores de 18 años. Menores: consentimiento y supervisión." },
      { title: "7. Sin asesoramiento profesional", body: "La información no es consejo de navegación, médico, legal ni de seguros." },
      { title: "8. Seguridad y preparación", body: "Equipo adecuado, agua, mapas, clima, avisar contactos, seguir seguridad." },
      { title: "9. Contenido prohibido y retirada", body: "Prohibido contenido engañoso/peligroso/ofensivo/ilegal. Podemos retirar contenido y suspender usuarios." },
      { title: "10. Cambios en el servicio", body: "Podemos modificar/suspender/terminar sin aviso." },
      { title: "11. Privacidad", body: "Sujeto a nuestra Política de Privacidad." },
      { title: "12. Ley aplicable y fuero", body: "Salvo ley local imperativa, rige la ley israelí y tribunales de Israel." },
      { title: "13. Cambios en los términos", body: "Podemos actualizar; el uso continuo implica aceptación." },
      { title: "14. Divisibilidad", body: "Si una cláusula no es exigible, el resto sigue vigente." },
      { title: "15. Contacto", body: "Dudas: frimet@gmail.com" }
    ],
    fr: [
      { title: "Conditions d'utilisation et avis légal – GROUPY LOOPY", body: "" },
      { title: "1. Nature du service (en l'état)", body: "Groupy Loopy (l'\"App\") est une plateforme gratuite reliant des randonneurs. Elle agit comme intermédiaire passif et n'organise ni ne supervise les sorties." },
      { title: "2. Décharge totale de responsabilité (acceptation du risque)", body: "Les activités outdoor comportent des risques. En utilisant l'App, vous assumez votre sécurité. Aucune responsabilité dans les limites légales. En tant que service gratuit, cette limitation est essentielle." },
      { title: "3. Contenu généré par les utilisateurs et sécurité", body: "Les itinéraires, descriptions et identités ne sont pas vérifiés. Vous êtes seul responsable de vos choix. Une annonce n'est pas un aval ni une certification." },
      { title: "4. Usage international et conformité", body: "Respectez les lois locales, autorisations, règles de propriété et sécurité." },
      { title: "5. Indemnisation", body: "Vous indemniserez Groupy Loopy et ses créateurs pour toute réclamation liée à votre usage ou conduite." },
      { title: "6. Admissibilité et âge", body: "Service destiné aux 18+. Mineurs: consentement et supervision." },
      { title: "7. Pas de conseil professionnel", body: "Les informations ne constituent pas un conseil professionnel." },
      { title: "8. Sécurité et préparation", body: "Équipement, eau, cartes, météo, informer des contacts, règles de sécurité." },
      { title: "9. Contenu interdit et retrait", body: "Interdits: contenu trompeur/dangereux/offensant/illégal. Retrait/suspension possible." },
      { title: "10. Modifications du service", body: "Service modifiable/suspendu/arrêté sans préavis." },
      { title: "11. Confidentialité", body: "Soumis à notre politique de confidentialité." },
      { title: "12. Droit applicable et juridiction", body: "Sous réserve du droit applicable, droit israélien et tribunaux d'Israël." },
      { title: "13. Modification des conditions", body: "Mises à jour possibles. L'usage continu vaut acceptation." },
      { title: "14. Divisibilité", body: "Si une clause est inapplicable, le reste demeure." },
      { title: "15. Contact", body: "Questions: frimet@gmail.com" }
    ],
    de: [
      { title: "Nutzungsbedingungen & Haftungsausschluss – GROUPY LOOPY", body: "" },
      { title: "1. Art des Dienstes (wie besehen)", body: "Groupy Loopy (die \"App\") ist eine kostenlose Plattform zur Verbindung von Wanderern. Sie ist ein passiver Vermittler und organisiert keine Touren." },
      { title: "2. Vollständiger Haftungsausschluss (Risikoübernahme)", body: "Outdoor-Aktivitäten sind riskant. Mit der Nutzung übernehmen Sie volle Verantwortung. Im gesetzlich zulässigen Umfang keine Haftung. Als kostenloser Dienst ist dies grundlegend." },
      { title: "3. Nutzerinhalte & Sicherheit", body: "Routen, Beschreibungen und Identitäten werden nicht verifiziert. Sie prüfen eigenverantwortlich. Ein Eintrag ist keine Empfehlung oder Zertifizierung." },
      { title: "4. Internationale Nutzung & Compliance", body: "Beachten Sie lokale Gesetze, Genehmigungen und Regeln." },
      { title: "5. Freistellung", body: "Sie stellen Groupy Loopy und die Ersteller von Ansprüchen frei, die aus Ihrer Nutzung entstehen." },
      { title: "6. Zulässigkeit & Alter", body: "Dienst für 18+. Minderjährige: Zustimmung und Aufsicht." },
      { title: "7. Keine professionelle Beratung", body: "Informationen sind keine professionelle Beratung." },
      { title: "8. Sicherheit & Vorbereitung", body: "Ausrüstung, Wasser, Karten, Wetter, Kontakte informieren, Sicherheitsregeln." },
      { title: "9. Verbotene Inhalte & Entfernung", body: "Verboten: irreführend/gefährlich/beleidigend/illegal. Entfernen/Sperren möglich." },
      { title: "10. Dienständerungen", body: "Dienst kann jederzeit geändert/ausgesetzt/beendet werden." },
      { title: "11. Datenschutz", body: "Unterliegt unserer Datenschutzrichtlinie." },
      { title: "12. Anwendbares Recht & Gerichtsstand", body: "Vorbehaltlich geltenden Rechts: israelisches Recht und Gerichte." },
      { title: "13. Änderungen der Bedingungen", body: "Aktualisierungen möglich; weitere Nutzung = Zustimmung." },
      { title: "14. Salvatorische Klausel", body: "Ist eine Klausel unwirksam, bleibt der Rest gültig." },
      { title: "15. Kontakt", body: "Fragen: frimet@gmail.com" }
    ],
    it: [
      { title: "Termini di Servizio e Disclaimer – GROUPY LOOPY", body: "" },
      { title: "1. Natura del servizio (così com'è)", body: "Groupy Loopy (l'\"App\") è una piattaforma gratuita che collega escursionisti. Agisce come intermediario passivo e non organizza/guidi i viaggi." },
      { title: "2. Manleva totale (assunzione del rischio)", body: "Le attività outdoor comportano rischi. Usando l'App, accetti piena responsabilità. Nei limiti di legge, nessuna responsabilità per danni. Come servizio gratuito, questa limitazione è fondamentale." },
      { title: "3. Contenuti generati dagli utenti e sicurezza", body: "Itinerari, descrizioni e identità non sono verificati. Sei responsabile di verifiche. Un annuncio non è un avallo o certificazione." },
      { title: "4. Uso internazionale e conformità", body: "Rispetta leggi locali, permessi e regole." },
      { title: "5. Indennizzo", body: "Manlevi Groupy Loopy e creatori da reclami derivanti dal tuo uso o condotta." },
      { title: "6. Idoneità ed età", body: "Servizio per maggiori di 18 anni. Minori: consenso e supervisione." },
      { title: "7. Nessun consiglio professionale", body: "Le informazioni non sono consulenza professionale." },
      { title: "8. Sicurezza e preparazione", body: "Attrezzatura, acqua, mappe, meteo, informare contatti, regole di sicurezza." },
      { title: "9. Contenuti vietati e rimozione", body: "Vietato: contenuti fuorvianti/pericolosi/offensivi/illegali. Possibile rimozione/sospensione." },
      { title: "10. Modifiche al servizio", body: "Possiamo modificare/sospendere/terminare senza preavviso." },
      { title: "11. Privacy", body: "Soggetto alla nostra Privacy Policy." },
      { title: "12. Legge applicabile e foro competente", body: "Fatto salvo il diritto locale cogente: diritto israeliano e tribunali di Israele." },
      { title: "13. Modifiche ai termini", body: "Aggiornamenti possibili; uso continuato = accettazione." },
      { title: "14. Clausola di salvaguardia", body: "Se una clausola è invalida, il resto resta valido." },
      { title: "15. Contatti", body: "Domande: frimet@gmail.com" }
    ]
  };
  return sections[language] || sections.en;
}

export default function Legal() {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // If already accepted, go to dashboard without full reload
    (async () => {
      try {
        const me = await base44.auth.me();
        if (me?.terms_accepted) {
          navigate(createPageUrl("Dashboard"));
        }
      } catch {}
    })();
  }, [navigate]);

  const handleAccept = async () => {
    if (!checked) return;
    setSaving(true);
    await base44.auth.updateMe({ terms_accepted: true, terms_accepted_date: new Date().toISOString() });
    navigate(createPageUrl("Dashboard"));
  };

  const tos = getTos(language);

  const checkboxLabel = (
    language === 'he' ? 'אני מבין/ה שהאפליקציה היא כלי תווך חינמי ואני נושא/ת באחריות מלאה לבטחוני ולהתקשרויותי' :
    language === 'ru' ? 'Я понимаю, что это бесплатный посредник и беру полную ответственность за безопасность и взаимодействия' :
    language === 'es' ? 'Entiendo que es una herramienta intermediaria gratuita y asumo plena responsabilidad por mi seguridad e interacciones' :
    language === 'fr' ? "Je comprends que c'est un intermédiaire gratuit et j'assume l'entière responsabilité de ma sécurité et de mes interactions" :
    language === 'de' ? 'Ich verstehe, dass dies ein kostenloser Vermittler ist, und übernehme die volle Verantwortung für Sicherheit und Interaktionen' :
    language === 'it' ? 'Capisco che è uno strumento intermediario gratuito e mi assumo la piena responsabilità della mia sicurezza e interazioni' :
    'I understand that Groupy Loopy is a free intermediary tool and I take full responsibility for my own safety and interactions.'
  );

  const acceptText = (
    language === 'he' ? 'אני מסכים/ה ומקבל/ת' :
    language === 'ru' ? 'Принимаю условия' :
    language === 'es' ? 'Acepto' :
    language === 'fr' ? "J'accepte" :
    language === 'de' ? 'Ich akzeptiere' :
    language === 'it' ? 'Accetto' : 'Accept'
  );

  return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 py-6 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-3xl mx-auto">
        <Card className="border-0 shadow-xl">
          <CardHeader className="flex flex-row items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
              <Shield className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              {language === 'he' ? 'תנאי שימוש והצהרת אחריות' :
               language === 'ru' ? 'Условия и отказ от ответственности' :
               language === 'es' ? 'Términos y aviso legal' :
               language === 'fr' ? "Conditions & avis légal" :
               language === 'de' ? 'Bedingungen & Haftung' :
               language === 'it' ? 'Termini & Disclaimer' : 'Terms of Service & Disclaimer'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[60vh] md:h-[65vh] border rounded-lg bg-white">
              <ScrollArea className={`h-full p-4 md:p-6 ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <div className="space-y-5">
                  {tos.map((s, idx) => (
                    <div key={idx}>
                      <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-1">{s.title}</h3>
                      {s.body && <p className="text-sm md:text-base text-gray-700 leading-relaxed">{s.body}</p>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="mt-4 md:mt-6 flex items-start gap-3">
              <Checkbox id="tos" checked={checked} onCheckedChange={setChecked} className="mt-1" />
              <label htmlFor="tos" className="text-sm md:text-base text-gray-800 cursor-pointer leading-relaxed">
                {checkboxLabel}
              </label>
            </div>

            <Button
              onClick={handleAccept}
              disabled={!checked || saving}
              className="w-full mt-4 md:mt-6 bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
            >
              <CheckCircle2 className="w-5 h-5 mr-2" /> {acceptText}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}