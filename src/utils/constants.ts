import { Platform } from 'react-native';
import { SUPPORT_EMAIL as SUPPORT_EMAIL_ENV } from 'react-native-dotenv';
import { SUPABASE_URL } from 'react-native-dotenv';
import * as Localization from 'expo-localization';
import { getLanguageFromLocale } from '@app/localization/i18n';

export const KEYBOARD_BEHAVIOR = Platform.OS == 'ios' ? 'padding' : 'height';

export const UNEXPECTED_ERROR = 'unexpected_error_3';
export const SUPPORT_EMAIL = SUPPORT_EMAIL_ENV || 'love.nemlys@gmail.com';
export const IS_SUPABASE_DEV = SUPABASE_URL === 'https://rpqzwvkyzulmvvldkqse.supabase.co';
export const MIXPANEL_TOKEN = '8127e4147d55e7bb317c1c9afe1d92fa';
export const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
export const LOCALE = Localization.getLocales()?.[0]?.languageTag || 'en';
export const LANGUAGE_CODE = getLanguageFromLocale(LOCALE);

export const COUNTRY = Localization.getLocales()?.[0]?.regionCode || 'UNKNOWN';

export const GRANTED_NOTIFICATION_STATUS = 'granted';
export const DENIED_NOTIFICATION_STATUS = 'denied';
export const UNDETERMINED_NOTIFICATION_STATUS = 'undetermined';
export const HomeName = 'Home';
export const ONBOARDING_STEPS = 12;
