import { I18n } from 'i18n-js';
import * as en from './lang/en.json';
import * as es from './lang/es.json';
export const i18n = new I18n(
  {
    en,
    es,
  },
  { defaultLocale: 'en' },
);

const spanishSpeakingLocales = [
  'es-AR', // Argentina
  'es-BO', // Bolivia
  'es-CL', // Chile
  'es-CO', // Colombia
  'es-CR', // Costa Rica
  'es-CU', // Cuba
  'es-DO', // Dominican Republic
  'es-EC', // Ecuador
  'es-ES', // Spain
  'es-GT', // Guatemala
  'es-HN', // Honduras
  'es-MX', // Mexico
  'es-NI', // Nicaragua
  'es-PA', // Panama
  'es-PE', // Peru
  'es-PR', // Puerto Rico
  'es-PY', // Paraguay
  'es-SV', // El Salvador
  'es-UY', // Uruguay
  'es-VE', // Venezuela
];

spanishSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['es'];
});

i18n.enableFallback = true;

export function getDefaultLanguage(locale: string) {
  if (locale === 'en') return 'en';
  if (spanishSpeakingLocales.includes(locale)) return 'es';
  if (locale === 'es') return 'es';
  return 'en';
}
