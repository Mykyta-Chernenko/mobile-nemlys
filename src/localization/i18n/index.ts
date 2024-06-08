import { I18n } from 'i18n-js';
import * as italian from './lang/italian.json';
import * as french from './lang/french.json';
import * as arabic from './lang/arabic_modern.json';
import * as bengali from './lang/bengali.json';
import * as chinese_simplified from './lang/chinese_simplified.json';
import * as chinese_traditional from './lang/chinese_traditional.json';
import * as dutch from './lang/dutch.json';
import * as english from './lang/english.json';
import * as german from './lang/german.json';
import * as hindi from './lang/hindi.json';
import * as japanese from './lang/japanese.json';
import * as spanish from './lang/spanish.json';
import * as portugese from './lang/portugese.json';

export const LANGUAGES = [
  'en', // English
  'es', // Spanish
  'ar', // Arabic
  'bn', // Bengali
  'zh_cn', // Chinese (Simplified)
  'zh_tw', // Chinese (Traditional)
  'nl', // Dutch
  'fr', // French
  'de', // German
  'hi', // Hindi
  'it', // Italian
  'ja', // Japanese
  'pt', // Portuguese
];

export const i18n = new I18n(
  {
    en: english,
    es: spanish,
    nl: dutch,
    de: german,
    it: italian,
    fr: french,
    ar: arabic,
    bn: bengali,
    zh_cn: chinese_simplified,
    zh_tw: chinese_traditional,
    hi: hindi,
    ja: japanese,
    pt: portugese,
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

const dutchSpeakingLocales = [
  'nl-NL', // Netherlands
  'nl-BE', // Belgium
  'nl-SR', // Suriname
  'nl-AW', // Aruba
  'nl-CW', // Curaçao
  'nl-SX', // Sint Maarten
  'nl-BQ', // Caribbean Netherlands which includes Bonaire, Sint Eustatius, and Saba
];

dutchSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['nl'];
});

const germanSpeakingLocales = [
  'de-DE', // Germany
  'de-AT', // Austria
  'de-CH', // Switzerland
  'de-LU', // Luxembourg
  'de-LI', // Liechtenstein
];

germanSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['de'];
});

const italianSpeakingLocales = [
  'it-IT', // Italy
  'it-CH', // Switzerland
  'it-SM', // San Marino
  'it-VA', // Vatican City
];

italianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['it'];
});

const frenchSpeakingLocales = [
  'fr-FR', // France
  'fr-BE', // Belgium
  'fr-CH', // Switzerland
  'fr-CA', // Canada
  'fr-LU', // Luxembourg
  'fr-MC', // Monaco
];

frenchSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['fr'];
});

const arabicSpeakingLocales = [
  'ar-AE', // United Arab Emirates
  'ar-BH', // Bahrain
  'ar-DZ', // Algeria
  'ar-EG', // Egypt
  'ar-IQ', // Iraq
  'ar-JO', // Jordan
  'ar-KW', // Kuwait
  'ar-LB', // Lebanon
  'ar-LY', // Libya
  'ar-MA', // Morocco
  'ar-OM', // Oman
  'ar-QA', // Qatar
  'ar-SA', // Saudi Arabia
  'ar-SD', // Sudan
  'ar-SY', // Syria
  'ar-TN', // Tunisia
  'ar-YE', // Yemen
];

arabicSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['ar'];
});

const bengaliSpeakingLocales = [
  'bn-BD', // Bangladesh
  'bn-IN', // India
];

bengaliSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['bn'];
});

const chineseSimplifiedSpeakingLocales = [
  'zh-CN', // China
  'zh-SG', // Singapore
];

chineseSimplifiedSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['zh_cn'];
});

const chineseTraditionalSpeakingLocales = [
  'zh-TW', // Taiwan
  'zh-HK', // Hong Kong
  'zh-MO', // Macau
];

chineseTraditionalSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['zh_tw'];
});

const hindiSpeakingLocales = [
  'hi-IN', // India
];

hindiSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['hi'];
});

const japaneseSpeakingLocales = [
  'ja-JP', // Japan
];

japaneseSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['ja'];
});

const portugeseSpeakingLocales = [
  'pt-BR', // Brazil
  'pt-PT', // Portugal
  'pt-MZ', // Mozambique
  'pt-AO', // Angola
  'pt-CV', // Cape Verde
  'pt-GW', // Guinea-Bissau
  'pt-ST', // São Tomé and Príncipe
];

portugeseSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['pt'];
});

export function getDefaultLanguage(locale: string) {
  if (locale.startsWith('en')) return 'en';
  if (locale.startsWith('es')) return 'es';
  if (locale.startsWith('nl')) return 'nl';
  if (locale.startsWith('de')) return 'de';
  if (locale.startsWith('it')) return 'it';
  if (locale.startsWith('fr')) return 'fr';
  if (locale.startsWith('ar')) return 'ar';
  if (locale.startsWith('bn')) return 'bn';
  if (chineseSimplifiedSpeakingLocales.includes(locale) || locale === 'zh_cn') return 'zh_cn';
  if (chineseTraditionalSpeakingLocales.includes(locale) || locale == 'zh_tw') return 'zh_tw';
  if (locale.startsWith('hi')) return 'hi';
  if (locale.startsWith('ja')) return 'ja';
  if (locale.startsWith('pt')) return 'pt';
  return 'en';
}

export function getFullLanguageByLocale(locale: string) {
  if (locale.startsWith('es')) return 'Español';
  if (locale.startsWith('nl')) return 'Nederlandse';
  if (locale.startsWith('de')) return 'Deutsch';
  if (locale.startsWith('it')) return 'Italiano';
  if (locale.startsWith('fr')) return 'Français';
  if (locale.startsWith('ar')) return 'العربية';
  if (locale.startsWith('bn')) return 'বাংলা';
  if (chineseSimplifiedSpeakingLocales.includes(locale) || locale === 'zh_cn') return '简体中文';
  if (chineseTraditionalSpeakingLocales.includes(locale) || locale == 'zh_tw') return '繁體中文';
  if (locale.startsWith('hi')) return 'हिन्दी';
  if (locale.startsWith('ja')) return '日本語';
  if (locale.startsWith('pt')) return 'Português';
  return 'English';
}
