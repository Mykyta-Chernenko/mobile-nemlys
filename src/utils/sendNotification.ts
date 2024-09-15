import { supabase } from '@app/api/initSupabase';
import { logErrorsWithMessage } from '@app/utils/errors';
import { i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';
import Toast from 'react-native-toast-message';

export const handleRemindPartner = async (
  questionId: number,
  partnerName: string,
  userId: string,
) => {
  const res = await supabase.functions.invoke('send-partner-notification', {
    body: { question_id: questionId, type: 'remind_answer' },
  });
  if (res.error) {
    logErrorsWithMessage(res.error, 'notify partner function returned error');
    return;
  }
  if (res.data?.error === 'NO_PARTNER_TOKEN') {
    Toast.show({
      type: 'error',
      text1: i18n.t('remind_no_notification', { partnerName }),
      visibilityTime: 5000,
    });
    void localAnalytics().logEvent('QuestionAnswerPartnerRemindedNoToken', {
      screen: 'QuestionAnswer',
      action: 'PartnerRemindedNoToken',
      questionId,
      userId,
    });
  } else {
    Toast.show({
      type: 'success',
      text1: i18n.t('remind_success', { partnerName }),
      visibilityTime: 5000,
    });
    void localAnalytics().logEvent('QuestionAnswerPartnerReminded', {
      screen: 'QuestionAnswer',
      action: 'PartnerReminded',
      questionId,
      userId: userId,
    });
  }
};
