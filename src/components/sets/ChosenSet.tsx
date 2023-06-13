import React, { useEffect, useState } from 'react';
import { supabase } from '@app/api/initSupabase';
import { ViewSetHomeScreen } from './ViewSetHomeScreen';
import { APIDate, APIGeneratedQuestion, SupabaseAnswer } from '@app/types/api';
import { View } from 'react-native';
import { Icon, Slider, useTheme } from '@rneui/themed';
import { Loading } from '../utils/Loading';
import { i18n } from '@app/localization/i18n';
import { MainNavigationProp } from '@app/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { FontText } from '../utils/FontText';

import { logErrors } from '@app/utils/errors';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import ChooseDateTopics from './ChooseDateTopics';

export default function () {
  const navigation = useNavigation<MainNavigationProp>();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);

  const [currentQuestion, setCurrentQuestion] = useState<APIGeneratedQuestion | undefined>(
    undefined,
  );
  const [currentDate, setCurrentDate] = useState<APIDate | undefined>(undefined);
  const [showRating, setShowRating] = useState<boolean>(false);
  const [rating, setRating] = useState<number | undefined>(0);
  const [changingTopics, setChangingTopics] = useState<boolean>(false);
  const dateFields = 'id, couple_id, active, topics, modes, created_at, updated_at';
  async function getQuestion() {
    setLoading(true);
    const dateRes: SupabaseAnswer<APIDate> = await supabase
      .from('date')
      .select(dateFields)
      .eq('active', true)
      .single();
    if (dateRes.error) {
      logErrors(dateRes.error);
      return;
    }
    setCurrentDate(dateRes.data);
    const res: SupabaseAnswer<APIGeneratedQuestion | null> = await supabase
      .from('generated_question')
      .select('id, date_id, question ,finished, feedback_score, skipped, created_at, updated_at')
      .eq('date_id', dateRes.data.id)
      .eq('skipped', false)
      .eq('finished', false)
      .maybeSingle();
    if (res.error) {
      logErrors(res.error);
      return;
    }
    if (res.data) {
      setCurrentQuestion(res.data);
    } else {
      const res = await supabase.functions.invoke('generate-question', {
        body: { date_id: dateRes.data.id },
      });
      if (res.error) {
        logErrors(res.error);
        return;
      }
      setCurrentQuestion(res.data as APIGeneratedQuestion);
    }
    setLoading(false);
  }
  useEffect(() => {
    void getQuestion();
  }, []);

  const handleSkipButton = async () => {
    if (currentQuestion) {
      const questionReponse = await supabase
        .from('generated_question')
        .update({ skipped: true })
        .eq('id', currentQuestion.id);
      if (questionReponse.error) {
        logErrors(questionReponse.error);
        return;
      }
      setCurrentQuestion(undefined);
      await getQuestion();
    }
  };
  const handleNextQuestionButton = () => {
    if (currentQuestion && !rating && !showRating) {
      setShowRating(true);
    }
  };
  const handleNextAfterRatingSet = async (rating: number) => {
    if (currentQuestion && showRating && rating) {
      const updateDict = { finished: true, feedback_score: rating };
      const questionReponse = await supabase
        .from('generated_question')
        .update(updateDict)
        .eq('id', currentQuestion.id);
      if (questionReponse.error) {
        logErrors(questionReponse.error);
        return;
      }
    }
    setCurrentQuestion(undefined);
    setRating(undefined);
    setShowRating(false);
    await getQuestion();
  };
  const handleFinishDateButton = async () => {
    if (!currentDate) return;
    const dateReponse = await supabase
      .from('date')
      .update({ active: false })
      .eq('id', currentDate.id);
    if (dateReponse.error) {
      logErrors(dateReponse.error);
      return;
    }
    navigation.navigate('SetHomeScreen', { refreshTimeStamp: new Date().toISOString() });
  };
  const handleChangeTopicsButton = () => {
    setChangingTopics(true);
  };

  const handleTopicsChanged = async (topics: string[], modes: string[]) => {
    if (!currentDate || !currentQuestion) return;
    setLoading(true);
    const dateReponse = await supabase
      .from('date')
      .update({ topics: topics.join(','), modes: modes.join(',') })
      .eq('id', currentDate.id)
      .select(dateFields)
      .single();
    if (dateReponse.error) {
      logErrors(dateReponse.error);
      return;
    }
    const questionReponse = await supabase
      .from('generated_question')
      .delete()
      .eq('id', currentQuestion.id);
    if (questionReponse.error) {
      logErrors(questionReponse.error);
      return;
    }
    setCurrentDate(dateReponse.data);
    await getQuestion();
    setLoading(false);
    setChangingTopics(false);
  };
  return (
    <ViewSetHomeScreen>
      {loading ? (
        <Loading light />
      ) : (
        <View
          style={{
            flexGrow: 1,
            width: '100%',
            padding: 15,
          }}
        >
          <View
            style={{
              marginBottom: 25,
              marginTop: 10,
              flexDirection: 'column',
            }}
          >
            <View>
              <FontText style={{ color: theme.colors.white, fontSize: 18 }}>
                {i18n.t('date.on_date.title')}
              </FontText>
              <FontText style={{ color: theme.colors.white, fontSize: 18 }}>
                topics: {currentDate?.topics}
              </FontText>
              <FontText style={{ color: theme.colors.white, fontSize: 18 }}>
                modes: {currentDate?.modes}
              </FontText>
            </View>
            {showRating ? (
              <View>
                <FontText h3>How good was the question?</FontText>
                <Slider
                  value={0}
                  onValueChange={setRating}
                  maximumValue={100}
                  minimumValue={0}
                  step={1}
                  onSlidingComplete={(value) => void handleNextAfterRatingSet(value)}
                  allowTouchTrack
                  orientation="horizontal"
                  animateTransitions={true}
                  thumbStyle={{ height: 20, width: 16, backgroundColor: 'black' }}
                  thumbProps={{
                    children: (
                      <Icon
                        name="fire"
                        type="font-awesome"
                        size={20}
                        reverse
                        containerStyle={{ bottom: 20, right: 20 }}
                        color="#f50"
                      />
                    ),
                  }}
                />
              </View>
            ) : changingTopics ? (
              <ChooseDateTopics
                topics={currentDate!.topics.split(',')}
                modes={currentDate!.modes.split(',')}
                onNextPress={(topics: string[], modes: string[]) =>
                  void handleTopicsChanged(topics, modes)
                }
              ></ChooseDateTopics>
            ) : (
              <View>
                <View
                  style={{
                    borderRadius: 15,
                    borderColor: theme.colors.black,
                    borderWidth: 1,
                    padding: 15,
                  }}
                >
                  <FontText>{i18n.t('date.on_date.question')}</FontText>
                  <FontText h4> {currentQuestion?.question}</FontText>
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <PrimaryButton style={{ marginTop: 10 }} onPress={handleNextQuestionButton}>
                    {i18n.t('date.on_date.next_question')}
                  </PrimaryButton>
                  <PrimaryButton style={{ marginTop: 10 }} onPress={() => void handleSkipButton()}>
                    {i18n.t('date.on_date.skip_question')}
                  </PrimaryButton>
                  <PrimaryButton
                    style={{ marginTop: 10 }}
                    onPress={() => void handleFinishDateButton()}
                  >
                    {i18n.t('date.on_date.end_date')}
                  </PrimaryButton>
                  <PrimaryButton style={{ marginTop: 10 }} onPress={handleChangeTopicsButton}>
                    {i18n.t('date.on_date.change_topics')}
                  </PrimaryButton>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </ViewSetHomeScreen>
  );
}
