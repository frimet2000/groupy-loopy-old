import { format as dateFnsFormat } from 'date-fns';
import { he, enUS, fr, es, de, it, ru } from 'date-fns/locale';

const locales = {
  he: he,
  en: enUS,
  fr: fr,
  es: es,
  de: de,
  it: it,
  ru: ru
};

export function formatDate(date, formatOrLanguage = 'en', languageArg) {
  let language = formatOrLanguage;
  let formatString = null;

  // Handle (date, formatString, language) signature
  if (languageArg) {
    formatString = formatOrLanguage;
    language = languageArg;
  }

  const locale = locales[language] || enUS;
  
  // Default format string based on language if not provided
  if (!formatString) {
    formatString = language === 'he' ? 'd בMMM' : 'MMM d';
  }
  
  return dateFnsFormat(new Date(date), formatString, { locale });
}