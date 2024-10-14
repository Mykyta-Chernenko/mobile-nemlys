import { I18n } from 'i18n-js';
import * as arabic from './lang/arabic_modern.json';
import * as bengali from './lang/bengali.json';
import * as chinese_simplified from './lang/chinese_simplified.json';
import * as chinese_traditional from './lang/chinese_traditional.json';
import * as dutch from './lang/dutch.json';
import * as english from './lang/english.json';
import * as portugese from './lang/portugese.json';
import * as filipino from './lang/filipino.json';
import * as french from './lang/french.json';
import * as german from './lang/german.json';
import * as hindi from './lang/hindi.json';
import * as indonesian from './lang/indonesian.json';
import * as italian from './lang/italian.json';
import * as japanese from './lang/japanese.json';
import * as polish from './lang/polish.json';
import * as romanian from './lang/romanian.json';
import * as russian from './lang/russian.json';
import * as spanish from './lang/spanish.json';
import * as turkish from './lang/turkish.json';
import * as ukranian from './lang/ukranian.json';
import * as vietnamese from './lang/vietnamese.json';
import * as afrikaans from './lang/afrikaans.json';
import * as albanian from './lang/albanian.json';
import * as amharic from './lang/amharic.json';
import * as armenian from './lang/armenian.json';
import * as azerbaijani from './lang/azerbaijani.json';
import * as basque from './lang/basque.json';
import * as belarusian from './lang/belarusian.json';
import * as bulgarian from './lang/bulgarian.json';
import * as burmese from './lang/burmese.json';
import * as catalan from './lang/catalan.json';
import * as chineseHongKong from './lang/chinese_hk.json';
import * as croatian from './lang/croatian.json';
import * as czech from './lang/czech.json';
import * as danish from './lang/danish.json';
import * as estonian from './lang/estonian.json';
import * as finnish from './lang/finnish.json';
import * as galician from './lang/galician.json';
import * as georgian from './lang/georgian.json';
import * as greek from './lang/greek.json';
import * as gujarati from './lang/gujarati.json';
import * as hebrew from './lang/hebrew.json';
import * as hungarian from './lang/hungarian.json';
import * as icelandic from './lang/icelandic.json';
import * as kannada from './lang/kannada.json';
import * as kazakh from './lang/kazakh.json';
import * as khmer from './lang/khmer.json';
import * as korean from './lang/korean.json';
import * as kyrgyz from './lang/kyrgyz.json';
import * as latvian from './lang/latvian.json';
import * as lithuanian from './lang/lithuanian.json';
import * as macedonian from './lang/macedonian.json';
import * as malay from './lang/malay.json';
import * as malayalam from './lang/malayalam.json';
import * as marathi from './lang/marathi.json';
import * as mongolian from './lang/mongolian.json';
import * as nepali from './lang/nepali.json';
import * as norwegian from './lang/norwegian.json';
import * as persian from './lang/persian.json';
import * as punjabi from './lang/punjabi.json';
import * as romansh from './lang/romansh.json';
import * as serbian from './lang/serbian.json';
import * as sinhala from './lang/sinhala.json';
import * as slovak from './lang/slovak.json';
import * as slovenian from './lang/slovenian.json';
import * as swahili from './lang/swahili.json';
import * as swedish from './lang/swedish.json';
import * as tamil from './lang/tamil.json';
import * as telugu from './lang/telugu.json';
import * as thai from './lang/thai.json';
import * as urdu from './lang/urdu.json';
import * as zulu from './lang/zulu.json';
// 73 languages
export const LANGUAGES = [
  'en', // English
  'es', // Spanish
  'af', // Afrikaans
  'am', // Amharic
  'ar', // Arabic
  'az', // Azerbaijani
  'be', // Belarusian
  'bg', // Bulgarian
  'bn', // Bengali
  'ca', // Catalan
  'cs', // Czech
  'da', // Danish
  'de', // German
  'el', // Greek
  'et', // Estonian
  'eu', // Basque
  'fa', // Persian
  'fil', // Filipino
  'fi', // Finnish
  'fr', // French
  'gl', // Galician
  'gu', // Gujarati
  'he', // Hebrew
  'hi', // Hindi
  'hr', // Croatian
  'hu', // Hungarian
  'hy', // Armenian
  'id', // Indonesian
  'is', // Icelandic
  'it', // Italian
  'ja', // Japanese
  'ka', // Georgian
  'kk', // Kazakh
  'km', // Khmer
  'kn', // Kannada
  'ko', // Korean
  'ky', // Kyrgyz
  'lt', // Lithuanian
  'lv', // Latvian
  'ml', // Malayalam
  'mk', // Makedonian,
  'mn', // Mongolian
  'mr', // Marathi
  'ms', // Malay
  'my', // Burmese
  'ne', // Nepali
  'nl', // Dutch
  'no', // Norwegian
  'pa', // Punjabi
  'pl', // Polish
  'pt', // Portuguese
  'rm', // Romansh
  'ro', // Romanian
  'ru', // Russian
  'si', // Sinhala
  'sk', // Slovak
  'sl', // Slovenian
  'sq', // Albanian
  'sr', // Serbian
  'sv', // Swedish
  'sw', // Swahili
  'ta', // Tamil
  'te', // Telugu
  'th', // Thai
  'tr', // Turkish
  'uk', // Ukrainian
  'ur', // Urdu
  'vi', // Vietnamese
  'zh_cn', // Chinese (Simplified)
  'zh_hk', // Chinese (Hong Kong)
  'zh_tw', // Chinese (Traditional)
  'zu', // Zulu
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
    zh_hk: chineseHongKong,
    hi: hindi,
    ja: japanese,
    pt: portugese,
    fil: filipino,
    id: indonesian,
    pl: polish,
    ro: romanian,
    tr: turkish,
    uk: ukranian,
    ru: russian,
    vi: vietnamese,
    no: norwegian,
    af: afrikaans,
    sq: albanian,
    am: amharic,
    hy: armenian,
    az: azerbaijani,
    eu: basque,
    be: belarusian,
    bg: bulgarian,
    my: burmese,
    ca: catalan,
    hr: croatian,
    cs: czech,
    da: danish,
    et: estonian,
    fi: finnish,
    gl: galician,
    ka: georgian,
    el: greek,
    gu: gujarati,
    he: hebrew,
    hu: hungarian,
    is: icelandic,
    kn: kannada,
    kk: kazakh,
    km: khmer,
    ko: korean,
    ky: kyrgyz,
    lv: latvian,
    lt: lithuanian,
    mk: macedonian,
    ms: malay,
    ml: malayalam,
    mr: marathi,
    mn: mongolian,
    ne: nepali,
    fa: persian,
    pa: punjabi,
    rm: romansh,
    sr: serbian,
    si: sinhala,
    sk: slovak,
    sl: slovenian,
    sw: swahili,
    sv: swedish,
    ta: tamil,
    te: telugu,
    th: thai,
    ur: urdu,
    zu: zulu,
  },
  { defaultLocale: 'en', enableFallback: true },
);
i18n.enableFallback = true;

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

const filipinoSpeakingLocales = ['fil-PH'];

filipinoSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['fil'];
});

const indonesianSpeakingLocales = ['id-ID'];

indonesianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['id'];
});

const polishSpeakingLocales = ['pl-PL'];

polishSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['pl'];
});

const romanianSpeakingLocales = ['ro-RO'];

romanianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['ro'];
});

const turkishSpeakingLocales = ['tr-TR'];

turkishSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['tr'];
});

const ukranianSpeakingLocales = ['uk-UA', 'ru-UA'];

ukranianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['uk'];
});

const russianSpeakingLocales = ['ru-RU'];

russianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['ru'];
});

const vietnameseSpeakingLocales = ['vi-VN'];

vietnameseSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['vi'];
});

const afrikaansSpeakingLocales = ['af-ZA'];
const albanianSpeakingLocales = ['sq-AL'];
const amharicSpeakingLocales = ['am-ET'];
const armenianSpeakingLocales = ['hy-AM'];
const azerbaijaniSpeakingLocales = ['az-AZ'];
const basqueSpeakingLocales = ['eu-ES'];
const belarusianSpeakingLocales = ['be-BY'];
const bulgarianSpeakingLocales = ['bg-BG'];
const burmeseSpeakingLocales = ['my-MM'];
const catalanSpeakingLocales = ['ca-ES'];
const chineseHongKongSpeakingLocales = ['zh-HK'];
const croatianSpeakingLocales = ['hr-HR'];
const czechSpeakingLocales = ['cs-CZ'];
const danishSpeakingLocales = ['da-DK'];
const estonianSpeakingLocales = ['et-EE'];
const finnishSpeakingLocales = ['fi-FI'];

// Map locales to language translations
afrikaansSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['af'];
});

albanianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['sq'];
});

amharicSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['am'];
});

armenianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['hy'];
});

azerbaijaniSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['az'];
});

basqueSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['eu'];
});

belarusianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['be'];
});

bulgarianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['bg'];
});

burmeseSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['my'];
});

catalanSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['ca'];
});

chineseHongKongSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['zh_hk'];
});

croatianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['hr'];
});

czechSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['cs'];
});

danishSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['da'];
});

estonianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['et'];
});

finnishSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['fi'];
});

const galicianSpeakingLocales = ['gl-ES'];
const georgianSpeakingLocales = ['ka-GE'];
const greekSpeakingLocales = ['el-GR'];
const gujaratiSpeakingLocales = ['gu-IN'];
const hebrewSpeakingLocales = ['he-IL'];
const hungarianSpeakingLocales = ['hu-HU'];
const icelandicSpeakingLocales = ['is-IS'];
const kannadaSpeakingLocales = ['kn-IN'];
const kazakhSpeakingLocales = ['kk-KZ'];
const khmerSpeakingLocales = ['km-KH'];
const koreanSpeakingLocales = ['ko-KR'];
const kyrgyzSpeakingLocales = ['ky-KG'];
const latvianSpeakingLocales = ['lv-LV'];
const lithuanianSpeakingLocales = ['lt-LT'];
const macedonianSpeakingLocales = ['mk-MK'];
const malayMalaysiaSpeakingLocales = ['ms-MY'];
const malaySpeakingLocales = ['ms-SG', 'ms-BN'];
const malayalamSpeakingLocales = ['ml-IN'];
const marathiSpeakingLocales = ['mr-IN'];
const mongolianSpeakingLocales = ['mn-MN'];
const nepaliSpeakingLocales = ['ne-NP'];
const norwegianSpeakingLocales = ['no-NO', 'nb-NO', 'nn-NO'];

// Map locales to language translations
galicianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['gl'];
});

georgianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['ka'];
});

greekSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['el'];
});

gujaratiSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['gu'];
});

hebrewSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['he'];
});

hungarianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['hu'];
});

icelandicSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['is'];
});

kannadaSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['kn'];
});

kazakhSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['kk'];
});

khmerSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['km'];
});

koreanSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['ko'];
});

kyrgyzSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['ky'];
});
latvianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['lv'];
});

lithuanianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['lt'];
});

macedonianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['mk'];
});

malayMalaysiaSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['ms_MY'];
});

malaySpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['ms'];
});

malayalamSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['ml'];
});

marathiSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['mr'];
});

mongolianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['mn'];
});

nepaliSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['ne'];
});

norwegianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['no'];
});
const persianSpeakingLocales = [
  'fa', // General Persian
  'fa-AE', // UAE
  'fa-AF', // Afghanistan
  'fa-IR', // Iran
  'fa-US', // Persian (United States)
  'fa-GB', // Persian (United Kingdom)
  'fa-CA', // Persian (Canada)
  'fa-AU', // Persian (Australia)
  'fa-DE', // Persian (Germany)
  'fa-SE', // Persian (Sweden)
];
const punjabiSpeakingLocales = ['pa-IN', 'pa-PK'];
const romanshSpeakingLocales = ['rm-CH'];
const serbianSpeakingLocales = ['sr-RS', 'sr-BA', 'sr-ME'];
const sinhalaSpeakingLocales = ['si-LK'];
const slovakSpeakingLocales = ['sk-SK'];
const slovenianSpeakingLocales = ['sl-SI'];
const swahiliSpeakingLocales = ['sw-KE', 'sw-TZ', 'sw-UG'];
const swedishSpeakingLocales = ['sv-SE'];
const tamilSpeakingLocales = ['ta-IN', 'ta-LK', 'ta-SG'];
const teluguSpeakingLocales = ['te-IN'];
const thaiSpeakingLocales = ['th-TH'];
const urduSpeakingLocales = ['ur-PK', 'ur-IN'];
const zuluSpeakingLocales = ['zu-ZA'];

// Map locales to language translations
persianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['fa'];
});

punjabiSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['pa'];
});

romanshSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['rm'];
});

serbianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['sr'];
});

sinhalaSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['si'];
});

slovakSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['sk'];
});

slovenianSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['sl'];
});

swahiliSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['sw'];
});

swedishSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['sv'];
});

tamilSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['ta'];
});

teluguSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['te'];
});

thaiSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['th'];
});

urduSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['ur'];
});

zuluSpeakingLocales.forEach((locale) => {
  i18n.translations[locale] = i18n.translations['zu'];
});

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
  if (chineseHongKongSpeakingLocales.includes(locale) || locale === 'zh_hk') return '繁體中文';
  if (locale.startsWith('hi')) return 'हिन्दी';
  if (locale.startsWith('ja')) return '日本語';
  if (locale.startsWith('pt')) return 'Português';
  if (locale.startsWith('fil')) return 'Filipino';
  if (locale.startsWith('id')) return 'Bahasa Indonesia';
  if (locale.startsWith('pl')) return 'Polski';
  if (locale.startsWith('ro')) return 'Română';
  if (locale.startsWith('tr')) return 'Türkçe';
  if (locale.startsWith('uk')) return 'Українська';
  if (locale.startsWith('ru')) return 'Русский';
  if (locale.startsWith('vi')) return 'Tiếng Việt';
  if (norwegianSpeakingLocales.includes(locale) || locale === 'no') return 'Norsk';
  if (locale.startsWith('af')) return 'Afrikaans';
  if (locale.startsWith('sq')) return 'Shqip';
  if (locale.startsWith('am')) return 'አማርኛ';
  if (locale.startsWith('hy')) return 'Հայերեն';
  if (locale.startsWith('az')) return 'Azərbaycanca';
  if (locale.startsWith('eu')) return 'Euskara';
  if (locale.startsWith('be')) return 'Беларуская';
  if (locale.startsWith('bg')) return 'Български';
  if (locale.startsWith('my')) return 'မြန်မာစာ';
  if (locale.startsWith('ca')) return 'Català';
  if (locale.startsWith('hr')) return 'Hrvatski';
  if (locale.startsWith('cs')) return 'Čeština';
  if (locale.startsWith('da')) return 'Dansk';
  if (locale.startsWith('et')) return 'Eesti';
  if (locale.startsWith('fi')) return 'Suomi';
  if (locale.startsWith('gl')) return 'Galego';
  if (locale.startsWith('ka')) return 'ქართული';
  if (locale.startsWith('el')) return 'Ελληνικά';
  if (locale.startsWith('gu')) return 'ગુજરાતી';
  if (locale.startsWith('he')) return 'עברית';
  if (locale.startsWith('hi')) return 'हिन्दी';
  if (locale.startsWith('hu')) return 'Magyar';
  if (locale.startsWith('is')) return 'Íslenska';
  if (locale.startsWith('kn')) return 'ಕನ್ನಡ';
  if (locale.startsWith('kk')) return 'Қазақша';
  if (locale.startsWith('km')) return 'ភាសាខ្មែរ';
  if (locale.startsWith('ko')) return '한국어';
  if (locale.startsWith('ky')) return 'Кыргызча';
  if (locale.startsWith('lv')) return 'Latviešu';
  if (locale.startsWith('lt')) return 'Lietuvių';
  if (locale.startsWith('mk')) return 'Македонски';
  if (locale.startsWith('ms')) return 'Bahasa Malaysia';
  if (locale.startsWith('ml')) return 'മലയാളം';
  if (locale.startsWith('mr')) return 'मराठी';
  if (locale.startsWith('mn')) return 'Монгол';
  if (locale.startsWith('ne')) return 'नेपाली';
  if (locale.startsWith('fa')) return 'فارسی';
  if (locale.startsWith('pa')) return 'ਪੰਜਾਬੀ';
  if (locale.startsWith('rm')) return 'Rumantsch';
  if (locale.startsWith('sr')) return 'Српски';
  if (locale.startsWith('si')) return 'සිංහල';
  if (locale.startsWith('sk')) return 'Slovenčina';
  if (locale.startsWith('sl')) return 'Slovenščina';
  if (locale.startsWith('sw')) return 'Kiswahili';
  if (locale.startsWith('sv')) return 'Svenska';
  if (locale.startsWith('ta')) return 'தமிழ்';
  if (locale.startsWith('te')) return 'తెలుగు';
  if (locale.startsWith('th')) return 'ไทย';
  if (locale.startsWith('ur')) return 'اردو';
  if (locale.startsWith('zu')) return 'isiZulu';
  return 'English';
}
