import { IS_SUPABASE_DEV } from './constants';

const realAnalytics = () => {
  const { analytics } = require('@react-native-firebase/analytics');
  return analytics();
};
export const localAnalytics = IS_SUPABASE_DEV ? () => ({ logEvent: () => {} }) : realAnalytics;
