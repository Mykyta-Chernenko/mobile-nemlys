import { Platform } from 'react-native';
import { SUPPORT_EMAIL as SUPPORT_EMAIL_ENV } from 'react-native-dotenv';

export const KEYBOARD_BEHAVIOR = Platform.OS == 'ios' ? 'padding' : 'height';

export const UNEXPECTED_ERROR = 'unexpected_error';
export const SUPPORT_EMAIL = SUPPORT_EMAIL_ENV || 'love.nemlys@gmail.com';
