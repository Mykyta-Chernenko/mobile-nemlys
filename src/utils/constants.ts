import { Platform } from 'react-native';
import { SUPPORT_EMAIL as SUPPORT_EMAIL_ENV } from 'react-native-dotenv';
import { SUPABASE_URL } from 'react-native-dotenv';
import { Native } from 'sentry-expo';
import * as Application from 'expo-application';
export const KEYBOARD_BEHAVIOR = Platform.OS == 'ios' ? 'padding' : 'height';

export const UNEXPECTED_ERROR = 'unexpected_error';
export const SUPPORT_EMAIL = SUPPORT_EMAIL_ENV || 'love.nemlys@gmail.com';
export const IS_SUPABASE_DEV = SUPABASE_URL === 'https://rpqzwvkyzulmvvldkqse.supabase.co';
Native.captureMessage(Application.nativeBuildVersion);
