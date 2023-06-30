import React, { useContext, useEffect, useState } from 'react';
import { supabase } from '@app/api/initSupabase';

import { APIDate, APIGeneratedQuestion, SupabaseAnswer } from '@app/types/api';
import { useTheme } from '@rneui/themed';
import { Image } from 'react-native';

import { logErrors } from '@app/utils/errors';

import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import { i18n } from '@app/localization/i18n';
import { TouchableOpacity } from 'react-native';
import Pencil from '@app/icons/pencil';
import DateFeedback from '../../components/date/DateFeedback';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import NewLevel from '../../components/date/NewLevel';
import Card from '@app/components/date/Card';
import { Progress } from '@app/components/utils/Progress';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'OnDate'>) {
  const authContext = useContext(AuthContext);
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const padding = 20;

  const QUESTION_COUNT = 3;
  const [spentTimes, setSpentTimes] = useState<number[]>(new Array(QUESTION_COUNT));
  const [questions, setQuestions] = useState<APIGeneratedQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const currentQuestion = questions[questionIndex];
  const [currentDate, setCurrentDate] = useState<APIDate | undefined>(undefined);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [showNewLevel, setShowNewlevel] = useState<boolean>(false);
  function restart() {
    setLoading(true);
    setSpentTimes(new Array(QUESTION_COUNT));
    setQuestions([]);
    setQuestionIndex(0);
    setCurrentDate(undefined);
    setShowFeedback(false);
    setShowNewlevel(false);
  }
  useEffect(() => {
    const i = setInterval(() => {
      spentTimes[questionIndex] = (spentTimes[questionIndex] ?? 0) + 1;
      setSpentTimes(spentTimes);
    }, 1000);
    return () => clearInterval(i);
  }, [questionIndex]);

  const dateFields = 'id, couple_id, active, topic, level, created_at, updated_at';
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
    const res: SupabaseAnswer<APIGeneratedQuestion[] | null> = await supabase
      .from('generated_question')
      .select('id, date_id, question ,finished, feedback_score, skipped, created_at, updated_at')
      .eq('date_id', dateRes.data.id)
      .eq('skipped', false)
      .eq('finished', false)
      .order('created_at', { ascending: false })
      .limit(QUESTION_COUNT);
    if (res.error) {
      logErrors(res.error);
      return;
    }

    if (res.data) {
      setQuestions(res.data);
    } else {
      const res: SupabaseAnswer<APIGeneratedQuestion[] | null> = await supabase.functions.invoke(
        'generate-question',
        {
          body: { date_id: dateRes.data.id },
        },
      );
      if (res.error) {
        logErrors(res.error);
        return;
      }
      setQuestions(res.data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    restart();
    void getQuestion();
  }, [route.params]);

  const handleFinishDateButtonFinal = async (feedback: number | undefined) => {
    if (!currentDate) return;
    setLoading(true);
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const updateDict = { feedback_score: feedback };
      if (spentTimes[i] > 60) {
        updateDict['finished'] = true;
      } else {
        updateDict['skipped'] = true;
      }
      const questionReponse = await supabase
        .from('generated_question')
        .update(updateDict)
        .eq('id', q.id);
      if (questionReponse.error) {
        logErrors(questionReponse.error);
        return;
      }
    }

    const dateReponse = await supabase
      .from('date')
      .update({ active: false })
      .eq('id', currentDate.id);
    if (dateReponse.error) {
      logErrors(dateReponse.error);
      return;
    }
    setLoading(false);
    setShowFeedback(false);
    setShowNewlevel(true);
  };
  const handleChangeTopicsButton = () => {
    void localAnalytics().logEvent('DateChangeTopicPressed', {
      screen: 'DateChangeTopicPressed',
      action: 'Date change topic pressed',
      userId: authContext.userId,
    });
    void handleFinishDateButtonFinal(undefined);
    navigation.navigate('ConfigureDate', { refreshTimeStamp: new Date().toISOString() });
  };
  const isFirstQuestion = questionIndex === 0;
  const isLastQuestion = questionIndex === (questions?.length ?? 1) - 1;
  let fontSize = 32;
  if (currentQuestion?.question?.length > 190) {
    fontSize = 16;
  } else if (currentQuestion?.question.length > 60) {
    fontSize = 28;
  }
  const LeftComponent = isFirstQuestion ? (
    <View></View>
  ) : (
    <TouchableOpacity
      style={{
        borderRadius: 40,
        backgroundColor: theme.colors.grey1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 72,
        width: 72,
      }}
      onPress={() => {
        void localAnalytics().logEvent('DateGetPreviousQuestion', {
          screen: 'Date',
          action: 'GetPreviousQuestion',
          userId: authContext.userId,
          questionIndex: questionIndex - 1,
        });
        setQuestionIndex(questionIndex - 1);
      }}
    >
      <Image
        resizeMode="contain"
        style={{ height: 24, width: 24 }}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        source={require('../../../assets/images/arrow_left_black.png')}
      />
    </TouchableOpacity>
  );
  const RightComponent = isLastQuestion ? (
    <TouchableOpacity
      style={{
        borderRadius: 40,
        backgroundColor: theme.colors.black,
        alignItems: 'center',
        justifyContent: 'center',
        height: 72,
        width: 72,
      }}
      onPress={() => {
        void localAnalytics().logEvent('DateFinishDateCheckMarkClicked', {
          screen: 'Date',
          action: 'FinishDateCheckmarkPressed',
          userId: authContext.userId,
        });
        setShowFeedback(true);
      }}
    >
      <Image
        resizeMode="contain"
        style={{ height: 24, width: 24 }}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        source={require('../../../assets/images/checkmark_white.png')}
      />
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={{
        borderRadius: 40,
        backgroundColor: theme.colors.grey1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 72,
        width: 72,
      }}
      onPress={() => {
        void localAnalytics().logEvent('DateGetNextQuestion', {
          screen: 'Date',
          action: 'GetNextQuestion',
          userId: authContext.userId,
          questionIndex: questionIndex + 1,
        });
        setQuestionIndex(questionIndex + 1);
      }}
    >
      <Image
        resizeMode="contain"
        style={{ height: 24, width: 24 }}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        source={require('../../../assets/images/arrow_right_black.png')}
      />
    </TouchableOpacity>
  );

  return loading || !currentQuestion ? (
    <Loading></Loading>
  ) : showFeedback ? (
    <DateFeedback
      onPressBack={() => {
        void localAnalytics().logEvent('DateFeedbackGoBackPressed', {
          screen: 'DateFeedback',
          action: 'DateFeedback go back pressed',
          userId: authContext.userId,
        });
        setShowFeedback(false);
      }}
      onPressForward={(feedbackScore: number) => {
        void localAnalytics().logEvent('DateFeedbackChoicePressed', {
          screen: 'DateFeedback',
          action: 'DateFeedback choice pressed',
          userId: authContext.userId,
        });
        void handleFinishDateButtonFinal(feedbackScore);
      }}
    ></DateFeedback>
  ) : showNewLevel ? (
    <NewLevel></NewLevel>
  ) : (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.black,
      }}
    >
      <SafeAreaView style={{ flexGrow: 1, alignItems: 'center' }}>
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <FontText h3 style={{ color: theme.colors.white }}>
            {i18n.t('date.discuss')}
          </FontText>
          <TouchableOpacity
            onPress={() => void handleChangeTopicsButton()}
            style={{
              marginTop: 20,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: 7,
                paddingHorizontal: 20,
                borderRadius: 40,
                alignItems: 'center',
              }}
            >
              <Pencil></Pencil>
              <View style={{ marginLeft: 10 }}>
                <FontText style={{ color: theme.colors.white, fontSize: 18 }}>
                  {currentDate?.topic ?? ''},{' '}
                  {{
                    1: i18n.t('date.level.light'),
                    2: i18n.t('date.level.normal'),
                    3: i18n.t('date.level.deep'),
                  }[currentDate?.level || 1] ?? 'Light'}
                </FontText>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexGrow: 1,
            width: '100%',
          }}
        >
          <View
            style={{
              flexGrow: 1,
            }}
          >
            <Card animated={false}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding,
                  paddingVertical: padding * 2,
                  width: '100%',
                }}
              >
                <Progress theme="dark" current={questionIndex + 1} all={QUESTION_COUNT}></Progress>
                <FontText style={{ fontSize }}>{currentQuestion.question}</FontText>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  {LeftComponent}
                  {RightComponent}
                </View>
              </View>
            </Card>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
