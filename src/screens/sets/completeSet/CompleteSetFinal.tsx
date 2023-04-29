import React, { useContext, useEffect, useState } from 'react';
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
import { goBackToThePreviousQuestion } from './CompleteSetQuestion';
import { FontText } from '@app/components/utils/FontText';
import { logErrors } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import { View } from 'react-native';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { localAnalytics } from '@app/utils/analytics';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'CompleteSetFinal'>) {
  const [loading, setLoading] = useState(true);
  const [hasDiaryEntries, setHasDiaryEntries] = useState<boolean>(false);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    async function getDiaryEntries() {
      const res = await supabase
        .from('diary')
        .select('*', { count: 'exact' })
        .eq('user_id', authContext.userId);
      if (res.error) {
        logErrors(res.error);
        return;
      }
      setHasDiaryEntries(!!res.count);
      setLoading(false);
    }
    void getDiaryEntries();
  }, [authContext.userId, setLoading]);
  const handlePressBase = async () => {
    setLoading(true);
    void localAnalytics().logEvent('CompleteSetFinish', {
      screen: 'CompleteSetFinish',
      action: 'Finish button clicked',
      setId: route.params.setId,
      questionIndex: route.params.questionIndex,
      userId: authContext.userId,
    });
    const user = await supabase.auth.getUser();
    if (user.error) {
      logErrors(user.error);
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
      logErrors(coupleSetFeedback.error);
      return;
    }
    const answers: APICoupleSetFeedbackAnswer[] = route.params.userAnswers.map((a) => ({
      ...a,
      couple_set_feedback_id: coupleSetFeedback.data.id,
    }));
    const answersResponse = await supabase.from('couple_set_feedback_answer').insert(answers);
    if (answersResponse.error) {
      logErrors(answersResponse.error);
      return;
    }
    const coupleSetReponse = await supabase
      .from('couple_set')
      .update({ completed: true })
      .eq('id', route.params.coupleSetId);
    if (coupleSetReponse.error) {
      logErrors(coupleSetReponse.error);
      return;
    }
  };
  const handlePress = async () => {
    await handlePressBase();
    void localAnalytics().logEvent('CompleteSetFinalNavigateHome', {
      screen: 'CompleteSetFinal',
      action: 'Navigate home clicked',
      userId: authContext.userId,
    });
    navigation.navigate('SetHomeScreen', { refreshTimeStamp: new Date().toISOString() });
  };
  const diaryButtonPress = async () => {
    await handlePressBase();
    void localAnalytics().logEvent('CompleteSetFinalNavigateDiary', {
      screen: 'CompleteSetFinal',
      action: 'Navigate diary clicked',
      userId: authContext.userId,
    });
    navigation.navigate('Diary', { refreshTimeStamp: new Date().toISOString() });
  };
  return (
    <SurveyView
      loading={loading}
      title={''}
      buttonText={i18n.t('finish')}
      progress={1}
      showButton={true}
      onPress={() => void handlePress()}
      progressText={'progressText'}
      onBackPress={() =>
        goBackToThePreviousQuestion(
          navigation,
          route.params.userAnswers,
          route.params.userAnswers.length,
          route.params,
        )
      }
    >
      <View>
        <FontText style={{ fontSize: 18 }}>{i18n.t('set.chosen.finish.finish_title')}</FontText>
        {!hasDiaryEntries && (
          <View style={{ marginTop: 50 }}>
            <FontText style={{ fontSize: 20, width: '100%', textAlign: 'center' }}>
              {i18n.t('set.chosen.finish.diary')}
            </FontText>
            <PrimaryButton
              buttonStyle={{ marginTop: 5, width: '50%', alignSelf: 'center' }}
              onPress={() => void diaryButtonPress()}
            >
              {i18n.t('set.chosen.finish.diary_button')}
            </PrimaryButton>
          </View>
        )}
      </View>
    </SurveyView>
  );
}
