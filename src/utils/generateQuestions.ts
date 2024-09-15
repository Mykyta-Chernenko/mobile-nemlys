import { supabase } from '@app/api/initSupabase';
import { logErrorsWithMessageWithoutAlert, logSupaErrors } from '@app/utils/errors';
import { sleep } from '@app/utils/date';
import { i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';
import { JobSlug } from '@app/types/domain';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export async function generateQuestions(
  userId: string,
  coupleId: number,
  job: JobSlug,
  topic: string,
  level: number,
  withPartner: boolean,
  reflectionAnswerId: number | undefined | null,
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
    reflectionAnswerId: reflectionAnswerId,
  });
  const dateReponse = await supabase
    .from('date')
    .insert({
      couple_id: coupleId,
      active: true,
      job: job,
      topic: topic,
      level: level,
      with_partner: withPartner,
      reflection_answer_id: reflectionAnswerId,
    })
    .select('id')
    .single();
  if (dateReponse.error) {
    logSupaErrors(dateReponse.error);
    return;
  }
  const dateId = dateReponse.data.id;
  const request = supabase.functions.invoke('generate-question-2', {
    body: { date_id: dateId },
  });

  const [res, _] = await Promise.all([request, sleep(2000)]);
  if (res.error) {
    logErrorsWithMessageWithoutAlert(res.error);
    alert(i18n.t('date.generating_questions_error'));
    void localAnalytics().logEvent('DateQuestionGeneratedErrorGoHome', {
      screen: 'Date',
      action: 'QuestionGeneratedErrorGoHome',
      userId: userId,
    });
    navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
    return;
  }

  void localAnalytics().logEvent('DateQuestionGenerated', {
    screen: 'Date',
    action: 'QuestionGenerated',
    userId: userId,
  });
  navigation.navigate('OnDate', {
    id: dateId,
    refreshTimeStamp: new Date().toISOString(),
  });
}
