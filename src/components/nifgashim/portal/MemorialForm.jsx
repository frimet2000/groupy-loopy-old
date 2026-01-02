import React, { useState } from 'react';
import { useLanguage } from '../../LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MemorialForm({ formData, setFormData }) {
  const { language, isRTL } = useLanguage();

  const translations = {
    he: {
      title: "בקשת הנצחה (אופציונלי)",
      subtitle: "שתפו אותנו בסיפור של יקירכם שנפל/ה למען המדינה",
      fallenName: "שם החלל/ה",
      fallenNamePlaceholder: "שם מלא",
      dateOfFall: "תאריך הנפילה",
      placeOfFall: "מקום הנפילה",
      placeOfFallPlaceholder: "לבנון, עזה, יהודה ושומרון...",
      familyRelation: "קרבה משפחתית",
      selectRelation: "בחר/י קרבה",
      parent: "הורה",
      sibling: "אח/אחות",
      spouse: "בן/בת זוג",
      child: "ילד/ה",
      grandparent: "סבא/סבתא",
      friend: "חבר/ה",
      other: "אחר",
      requesterInfo: "פרטי המבקש/ת",
      requesterName: "שם מלא",
      requesterEmail: "אימייל",
      requesterPhone: "טלפון",
      story: "סיפור ההנצחה",
      storyPlaceholder: "ספרו לנו על החלל/ה, מה אהב/ה, זיכרונות, ערכים...",
      optional: "אופציונלי"
    },
    en: {
      title: "Memorial Request (Optional)",
      subtitle: "Share with us the story of your loved one who fell for our country",
      fallenName: "Name of Fallen",
      fallenNamePlaceholder: "Full name",
      dateOfFall: "Date of Fall",
      placeOfFall: "Place of Fall",
      placeOfFallPlaceholder: "Lebanon, Gaza, Judea and Samaria...",
      familyRelation: "Family Relation",
      selectRelation: "Select relation",
      parent: "Parent",
      sibling: "Sibling",
      spouse: "Spouse",
      child: "Child",
      grandparent: "Grandparent",
      friend: "Friend",
      other: "Other",
      requesterInfo: "Requester Information",
      requesterName: "Full Name",
      requesterEmail: "Email",
      requesterPhone: "Phone",
      story: "Memorial Story",
      storyPlaceholder: "Tell us about the fallen, what they loved, memories, values...",
      optional: "Optional"
    },
    ru: {
      title: "Запрос на увековечение (по желанию)",
      subtitle: "Расскажите нам историю вашего близкого, павшего за нашу страну",
      fallenName: "Имя павшего",
      fallenNamePlaceholder: "Полное имя",
      dateOfFall: "Дата падения",
      placeOfFall: "Место падения",
      placeOfFallPlaceholder: "Ливан, Газа, Иудея и Самария...",
      familyRelation: "Семейное отношение",
      selectRelation: "Выберите отношение",
      parent: "Родитель",
      sibling: "Брат/Сестра",
      spouse: "Супруг/Супруга",
      child: "Ребенок",
      grandparent: "Дедушка/Бабушка",
      friend: "Друг",
      other: "Другое",
      requesterInfo: "Информация о заявителе",
      requesterName: "Полное имя",
      requesterEmail: "Email",
      requesterPhone: "Телефон",
      story: "История увековечения",
      storyPlaceholder: "Расскажите о павшем, что он/она любил/а, воспоминания, ценности...",
      optional: "По желанию"
    },
    es: {
      title: "Solicitud de memorial (opcional)",
      subtitle: "Comparta con nosotros la historia de su ser querido caído por nuestro país",
      fallenName: "Nombre del caído",
      fallenNamePlaceholder: "Nombre completo",
      dateOfFall: "Fecha de caída",
      placeOfFall: "Lugar de caída",
      placeOfFallPlaceholder: "Líbano, Gaza, Judea y Samaria...",
      familyRelation: "Relación familiar",
      selectRelation: "Seleccionar relación",
      parent: "Padre/Madre",
      sibling: "Hermano/Hermana",
      spouse: "Cónyuge",
      child: "Hijo/Hija",
      grandparent: "Abuelo/Abuela",
      friend: "Amigo/Amiga",
      other: "Otro",
      requesterInfo: "Información del solicitante",
      requesterName: "Nombre completo",
      requesterEmail: "Email",
      requesterPhone: "Teléfono",
      story: "Historia del memorial",
      storyPlaceholder: "Cuéntenos sobre el caído, qué amaba, recuerdos, valores...",
      optional: "Opcional"
    },
    fr: {
      title: "Demande de mémorial (facultatif)",
      subtitle: "Partagez avec nous l'histoire de votre proche tombé pour notre pays",
      fallenName: "Nom du défunt",
      fallenNamePlaceholder: "Nom complet",
      dateOfFall: "Date de la chute",
      placeOfFall: "Lieu de la chute",
      placeOfFallPlaceholder: "Liban, Gaza, Judée et Samarie...",
      familyRelation: "Relation familiale",
      selectRelation: "Sélectionner la relation",
      parent: "Parent",
      sibling: "Frère/Sœur",
      spouse: "Conjoint(e)",
      child: "Enfant",
      grandparent: "Grand-père/Grand-mère",
      friend: "Ami(e)",
      other: "Autre",
      requesterInfo: "Informations sur le demandeur",
      requesterName: "Nom complet",
      requesterEmail: "Email",
      requesterPhone: "Téléphone",
      story: "Histoire du mémorial",
      storyPlaceholder: "Parlez-nous du défunt, ce qu'il aimait, souvenirs, valeurs...",
      optional: "Facultatif"
    },
    de: {
      title: "Gedenkantrag (optional)",
      subtitle: "Teilen Sie mit uns die Geschichte Ihres geliebten Menschen, der für unser Land gefallen ist",
      fallenName: "Name des Gefallenen",
      fallenNamePlaceholder: "Vollständiger Name",
      dateOfFall: "Datum des Falls",
      placeOfFall: "Ort des Falls",
      placeOfFallPlaceholder: "Libanon, Gaza, Judäa und Samaria...",
      familyRelation: "Familienverhältnis",
      selectRelation: "Beziehung auswählen",
      parent: "Elternteil",
      sibling: "Geschwister",
      spouse: "Ehepartner",
      child: "Kind",
      grandparent: "Großeltern",
      friend: "Freund(in)",
      other: "Andere",
      requesterInfo: "Informationen zum Antragsteller",
      requesterName: "Vollständiger Name",
      requesterEmail: "E-Mail",
      requesterPhone: "Telefon",
      story: "Gedenkgeschichte",
      storyPlaceholder: "Erzählen Sie uns vom Gefallenen, was er/sie liebte, Erinnerungen, Werte...",
      optional: "Optional"
    },
    it: {
      title: "Richiesta memoriale (facoltativo)",
      subtitle: "Condividi con noi la storia del tuo caro caduto per il nostro paese",
      fallenName: "Nome del caduto",
      fallenNamePlaceholder: "Nome completo",
      dateOfFall: "Data della caduta",
      placeOfFall: "Luogo della caduta",
      placeOfFallPlaceholder: "Libano, Gaza, Giudea e Samaria...",
      familyRelation: "Relazione familiare",
      selectRelation: "Seleziona relazione",
      parent: "Genitore",
      sibling: "Fratello/Sorella",
      spouse: "Coniuge",
      child: "Figlio/Figlia",
      grandparent: "Nonno/Nonna",
      friend: "Amico/Amica",
      other: "Altro",
      requesterInfo: "Informazioni richiedente",
      requesterName: "Nome completo",
      requesterEmail: "Email",
      requesterPhone: "Telefono",
      story: "Storia del memoriale",
      storyPlaceholder: "Raccontaci del caduto, cosa amava, ricordi, valori...",
      optional: "Facoltativo"
    }
  };

  const trans = translations[language] || translations.en;

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8" />
          <div>
            <CardTitle className="text-2xl">{trans.title}</CardTitle>
            <CardDescription className="text-white opacity-90 mt-1">
              {trans.subtitle}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Fallen Info */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="fallen_name">{trans.fallenName}</Label>
            <Input
              id="fallen_name"
              value={formData.memorial?.fallen_name || ''}
              onChange={(e) => setFormData({
                ...formData, 
                memorial: {...(formData.memorial || {}), fallen_name: e.target.value}
              })}
              placeholder={trans.fallenNamePlaceholder}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_of_fall">{trans.dateOfFall}</Label>
              <Input
                id="date_of_fall"
                type="date"
                value={formData.memorial?.date_of_fall || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  memorial: {...(formData.memorial || {}), date_of_fall: e.target.value}
                })}
              />
            </div>

            <div>
              <Label htmlFor="place_of_fall">{trans.placeOfFall}</Label>
              <Input
                id="place_of_fall"
                value={formData.memorial?.place_of_fall || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  memorial: {...(formData.memorial || {}), place_of_fall: e.target.value}
                })}
                placeholder={trans.placeOfFallPlaceholder}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="family_relation">{trans.familyRelation}</Label>
            <Select 
              value={formData.memorial?.family_relation || ''} 
              onValueChange={(value) => setFormData({
                ...formData, 
                memorial: {...(formData.memorial || {}), family_relation: value}
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder={trans.selectRelation} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">{trans.parent}</SelectItem>
                <SelectItem value="sibling">{trans.sibling}</SelectItem>
                <SelectItem value="spouse">{trans.spouse}</SelectItem>
                <SelectItem value="child">{trans.child}</SelectItem>
                <SelectItem value="grandparent">{trans.grandparent}</SelectItem>
                <SelectItem value="friend">{trans.friend}</SelectItem>
                <SelectItem value="other">{trans.other}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Requester Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{trans.requesterInfo}</h3>
          
          <div>
            <Label htmlFor="requester_name">{trans.requesterName}</Label>
            <Input
              id="requester_name"
              value={formData.memorial?.requester_name || ''}
              onChange={(e) => setFormData({
                ...formData, 
                memorial: {...(formData.memorial || {}), requester_name: e.target.value}
              })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requester_email">{trans.requesterEmail}</Label>
              <Input
                id="requester_email"
                type="email"
                value={formData.memorial?.requester_email || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  memorial: {...(formData.memorial || {}), requester_email: e.target.value}
                })}
              />
            </div>

            <div>
              <Label htmlFor="requester_phone">{trans.requesterPhone}</Label>
              <Input
                id="requester_phone"
                value={formData.memorial?.requester_phone || ''}
                onChange={(e) => setFormData({
                  ...formData, 
                  memorial: {...(formData.memorial || {}), requester_phone: e.target.value}
                })}
              />
            </div>
          </div>
        </div>

        {/* Story */}
        <div>
          <Label htmlFor="story">{trans.story}</Label>
          <Textarea
            id="story"
            value={formData.memorial?.story || ''}
            onChange={(e) => setFormData({
              ...formData, 
              memorial: {...(formData.memorial || {}), story: e.target.value}
            })}
            placeholder={trans.storyPlaceholder}
            rows={6}
            className="resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
}