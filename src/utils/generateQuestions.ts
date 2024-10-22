import { supabase } from '@app/api/initSupabase';
import { logErrorsWithMessageWithoutAlert, logSupaErrors } from '@app/utils/errors';
import { sleep } from '@app/utils/date';
import { i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';
import { JobSlug } from '@app/types/domain';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { logout } from '@app/utils/auth';

async function attemptQuestionGeneration(dateId: number) {
  const [res, _] = await Promise.all([
    supabase.functions.invoke('generate-question-2', {
      body: { date_id: dateId },
    }),
    sleep(2000),
  ]);
  return res;
}

export async function generateQuestions(
  userId: string,
  coupleId: number,
  job: JobSlug,
  topic: string,
  level: number,
  withPartner: boolean,
  reflectionAnswer: string | undefined | null,
  navigation: NativeStackNavigationProp<MainStackParamList, 'GeneratingQuestion', undefined>,
) {
  void localAnalytics().logEvent('QuestionGeneratingStart', {
    screen: 'QuestionGenerating',
    action: 'QuestionGenerated',
    userId: userId,
    coupleId: coupleId,
    job: job,
    topic: topic,
    level: level,
    withPartner: withPartner,
    reflectionAnswer: reflectionAnswer,
  });

  const maxRetries = 3;
  let attemptCount = 0;
  let unauthorizedCount = 0;

  while (attemptCount < maxRetries) {
    const dateResponse = await supabase
      .from('date')
      .insert({
        couple_id: coupleId,
        active: true,
        job: job,
        topic: topic,
        level: level,
        with_partner: withPartner,
        issue: reflectionAnswer,
      })
      .select('id')
      .single();

    if (dateResponse.error) {
      logSupaErrors(dateResponse.error);
      return;
    }

    const dateId = dateResponse.data.id;
    const res = await attemptQuestionGeneration(dateId);

    if (!res.error) {
      void localAnalytics().logEvent('DateQuestionGenerated', {
        screen: 'Date',
        action: 'QuestionGenerated',
        userId: userId,
      });

      navigation.replace('OnDate', {
        id: dateId,
        refreshTimeStamp: new Date().toISOString(),
      });
      return;
    }
    const errorStatus = res?.error?.context?.status;
    if (errorStatus === 401) {
      unauthorizedCount++;
      const { error: authError } = await supabase.auth.refreshSession();
      if (authError) {
        void localAnalytics().logEvent('DateQuestionGeneratedAuthErrorLogout', {
          screen: 'Date',
          action: 'QuestionGeneratedAuthErrorLogout',
          userId: userId,
          error: authError,
        });
      }
      if (authError || unauthorizedCount === maxRetries) {
        await logout();
        await logout();
      }
    }

    attemptCount++;
    if (attemptCount === maxRetries) {
      logErrorsWithMessageWithoutAlert(res.error);
      alert(i18n.t('date_generating_questions_error'));
      void localAnalytics().logEvent('DateQuestionGeneratedErrorGoHome', {
        screen: 'Date',
        action: 'QuestionGeneratedErrorGoHome',
        userId: userId,
        error: res.error,
        status: errorStatus,
      });
      navigation.replace('Home', { refreshTimeStamp: new Date().toISOString() });
      return;
    }
    void localAnalytics().logEvent('DateQuestionGeneratedRetry', {
      screen: 'Date',
      action: 'QuestionGeneratedRetry',
      attemptCount: attemptCount + 1,
      error: res.error,
      status: errorStatus,
    });
  }
}
