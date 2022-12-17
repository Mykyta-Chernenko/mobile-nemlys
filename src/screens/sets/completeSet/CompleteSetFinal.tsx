import React from 'react';
import { Text } from '@rneui/themed';
import { MainStackParamList } from '@app/types/navigation';
import { i18n } from '@app/localization/i18n';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SurveyView from '@app/components/common/SurveyView';
import { supabase } from '@app/api/initSupabase';
import {
  APICoupleSetFeedbackAnswer,
  CoupleSetFeedback,
  InsertCoupleSetFeedback,
  SupabaseAnswer,
} from '@app/types/api';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'CompleteSetFinal'>) {
  const handlePress = async () => {
    const user = await supabase.auth.getUser();
    if (user.error) {
      alert(user.error.message ?? i18n.t('unexpected_error'));
      return;
    }
    const feedback: InsertCoupleSetFeedback = {
      user_id: user.data.user.id,
      couple_set_id: route.params.coupleSetId,
    };
    const coupleSetFeedback: SupabaseAnswer<CoupleSetFeedback> = await supabase
      .from('couple_set_feedback')
      .insert(feedback)
      .select()
      .single();
    if (coupleSetFeedback.error) {
      alert(coupleSetFeedback.error.message ?? i18n.t('unexpected_error'));
      return;
    }
    const answers: APICoupleSetFeedbackAnswer[] = route.params.userAnswers.map((a) => ({
      ...a,
      couple_set_feedback_id: coupleSetFeedback.data.id,
    }));
    const answersResponse = await supabase.from('couple_set_feedback_answer').insert(answers);
    if (answersResponse.error) {
      alert(answersResponse.error.message ?? i18n.t('unexpected_error'));
      return;
    }
    const coupleSetReponse = await supabase
      .from('couple_set')
      .update({ completed: true })
      .eq('id', route.params.coupleSetId);
    if (coupleSetReponse.error) {
      alert(coupleSetReponse.error.message ?? i18n.t('unexpected_error'));
      return;
    }
    navigation.navigate('SetHomeScreen', { refresh: true });
  };
  return (
    <SurveyView
      loading={false}
      title={''}
      buttonText={i18n.t('finish')}
      progress={1}
      showButton={true}
      onPress={() => void handlePress()}
      onBackPress={() => navigation.goBack()}
    >
      <Text h4>{i18n.t('set.chosen.finish.finish_title')}</Text>
    </SurveyView>
  );
}
