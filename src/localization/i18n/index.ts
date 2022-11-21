import { I18n } from 'i18n-js';
import * as en from './lang/en.json';
import * as ua from './lang/ua.json';
import * as nbNO from './lang/nb-NO.json';
export const i18n = new I18n(
  {
    en,
    ua,
    ['nb-NO']: nbNO,
  },
  { defaultLocale: 'en' },
);
i18n.enableFallback = true;
