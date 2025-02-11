import { supabase } from '@app/api/initSupabase';
import { logErrorsWithMessage, logSupaErrorsWithoutAlert, retryAsync } from '@app/utils/errors';
import { i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';
import Toast from 'react-native-toast-message';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PostgrestError } from '@supabase/supabase-js';

export const handleRemindPartner = async (
  prefix: string,
  partnerName: string,
  userId: string,
  setLoading: (l: boolean) => void,
  body: object,
  navigation: NativeStackNavigationProp<MainStackParamList, any, undefined>,
  nextScreen: string | undefined,
  screenParams: Record<string, any> | undefined,
  showNoPartnerNotificationError: boolean,
  showResultAndError,
) => {
  setLoading(true);
  void localAnalytics().logEvent(`${prefix}RemindPartnerStart`, {
    screen: prefix,
    action: 'RemindPartnerStart',
    userId,
    body,
    prefix,
  });
  try {
    const res = await retryAsync(prefix, async () => {
      const res = await supabase.functions.invoke('send-partner-notification', {
        body,
      });
      if (res.error) {
        throw res.error;
      }
      return res;
    });
    if (res.data?.error === 'UNKNOWN_TYPE') {
      void localAnalytics().logEvent(`${prefix}RemindPartnerUnknownType`, {
        screen: prefix,
        action: 'RemindPartnerUnknownType',
        userId,
        body,
      });
    } else if (res.data?.error === 'NO_PARTNER') {
      if (nextScreen) {
        void navigation.navigate('OnboardingInviteCode', {
          nextScreen,
          screenParams,
        });
      }
      void localAnalytics().logEvent(`${prefix}RemindPartnerNoPartner`, {
        screen: prefix,
        action: 'PartnerRemindedNoPartner',
        userId,
        nextScreen,
        screenParams,
      });
    } else if (res.data?.error === 'NO_PARTNER_TOKEN') {
      if (showNoPartnerNotificationError) {
        Toast.show({
          type: 'error',
          text1: i18n.t('remind_no_notification', { partnerName }),
          visibilityTime: 5000,
          onPress: () => Toast.hide(),
        });
      }
      void localAnalytics().logEvent(`${prefix}RemindPartnerNoToken`, {
        screen: prefix,
        action: 'PartnerRemindedNoToken',
        userId,
      });
    } else {
      if (showResultAndError) {
        Toast.show({
          type: 'success',
          text1: i18n.t('remind_success', { partnerName }),
          visibilityTime: 5000,
          onPress: () => Toast.hide(),
        });
      }
      void localAnalytics().logEvent(`${prefix}RemindPartnerPartnerReminded`, {
        screen: prefix,
        action: 'PartnerReminded',
        userId: userId,
      });
    }
  } catch (error) {
    if (showResultAndError) {
      logErrorsWithMessage(error, i18n.t('reminding_partner_error'));
    } else {
      logSupaErrorsWithoutAlert(error as PostgrestError);
    }
    return;
  } finally {
    setLoading(false);
  }
};
