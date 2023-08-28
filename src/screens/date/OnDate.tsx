import React, { useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@app/api/initSupabase';
import * as StoreReview from 'expo-store-review';
import { APIDate, APIGeneratedQuestion, SupabaseAnswer } from '@app/types/api';
import { useTheme, useThemeMode } from '@rneui/themed';
import { Image } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
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
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'OnDate'>) {
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('dark'));
    return unsubscribeFocus;
  }, [navigation]);

  const getCurrentUTCSeconds = () => {
    return Math.round(new Date().getTime() / 1000);
  };
  const authContext = useContext(AuthContext);
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const padding = 20;
  const [width, setWidth] = useState(1);
  const QUESTION_COUNT = 3;
  const [spentTimes, setSpentTimes] = useState<number[]>(new Array(QUESTION_COUNT));
  const [questions, setQuestions] = useState<APIGeneratedQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [startedDiscussionAt, setStartedDiscussionAt] = useState<number>(getCurrentUTCSeconds());
  const currentQuestion = questions[questionIndex];
  const [currentDate, setCurrentDate] = useState<APIDate | undefined>(undefined);
  const [dateCount, setDateCount] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [showNewLevel, setShowNewlevel] = useState<boolean>(false);
  const carouselRef = useRef(null) as any;
  function restart() {
    setLoading(true);
    setSpentTimes(new Array(QUESTION_COUNT));
    setQuestions([]);
    setQuestionIndex(0);
    setCurrentDate(undefined);
    setShowFeedback(false);
    setShowNewlevel(false);
    void localAnalytics().logEvent('OnDateLoaded', {
      screen: 'OnDate',
      action: 'loaded',
      userId: authContext.userId,
    });
  }
  const withPartner = currentDate?.with_partner ?? false;

  const dateFields = 'id, couple_id, with_partner, active, topic, level, created_at, updated_at';
  async function getData() {
    setLoading(true);
    const dateCountRes = await supabase
      .from('date')
      .select('*', { count: 'exact' })
      .eq('active', false);
    if (dateCountRes.error) {
      logErrors(dateCountRes.error);
      return;
    }
    setDateCount(dateCountRes.count || 0);
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

    if (res.data?.length) {
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

      setQuestions(res.data ?? []);
    }

    setLoading(false);
  }

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isFirstMount.current && route.params?.refreshTimeStamp) {
      restart();
      void getData();
    }
  }, [route.params?.refreshTimeStamp]);
  useEffect(() => {
    restart();
    void getData();
    isFirstMount.current = false;
  }, []);

  // const onRecorded = (url: string) => {
  //   const func = async (url: string) => {
  //     const res: SupabaseAnswer<{ summary: string } | null> = await supabase.functions.invoke(
  //       'save-conversation',
  //       {
  //         body: { questionId: currentQuestion.id, fileUrl: url },
  //       },
  //     );
  //     if (res.error) {
  //       logErrors(res.error);
  //       return;
  //     }
  //     console.log(res.data);
  //     alert(res.data?.summary || '');
  //   };
  //   void func(url);
  // };

  const handleFinishDateButtonFinal = async (feedback: number | undefined) => {
    if (!currentDate) return;
    setLoading(true);
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const updateDict = { feedback_score: feedback, seconds_spent: spentTimes[i] || 0 };
      if (spentTimes[i] > 60) {
        void localAnalytics().logEvent('DateFinishedQuestion', {
          screen: 'Date',
          action: 'finished question',
          questionIndex: i,
          userId: authContext.userId,
        });
        updateDict['finished'] = true;
      } else {
        void localAnalytics().logEvent('DateSkippedQuestion', {
          screen: 'Date',
          action: 'skipped question',
          questionIndex: i,
          userId: authContext.userId,
        });
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
      if ((feedback || 0) > 2 && dateCount > 0) {
        if (await StoreReview.hasAction()) {
          await StoreReview.requestReview();
        }
      }
    }

    const dateReponse = await supabase
      .from('date')
      .update({ active: false, updated_at: new Date() })
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
    navigation.navigate('ConfigureDate', {
      withPartner: route.params.withPartner,
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  const getFontSize = (index) => {
    if (questions[index]?.question?.length > 190) {
      return { h4: true };
    } else if (questions[index]?.question.length > 35) {
      return { h2: true };
    }
    return { h1: true };
  };
  const recordTimeSpent = (index: number) => {
    const newDiscussionAt = getCurrentUTCSeconds();
    const alredySpent = spentTimes[index] ?? 0;
    spentTimes[index] = alredySpent + newDiscussionAt - startedDiscussionAt;
    setStartedDiscussionAt(newDiscussionAt);
  };

  const handleNewIndex = (index: number) => {
    setQuestionIndex(index);
    carouselRef?.current?.scrollTo({ index, animated: true });
  };
  const LeftComponent = (index: number) =>
    index === 0 ? (
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
          const newIndex = questionIndex - 1;
          void localAnalytics().logEvent('DateGetPreviousQuestion', {
            screen: 'Date',
            action: 'GetPreviousQuestion',
            userId: authContext.userId,
            questionIndex: newIndex,
          });
          handleNewIndex(newIndex);
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
  const RightComponent = (index: number) =>
    index === (questions?.length ?? 1) - 1 ? (
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
          const newIndex = questionIndex + 1;
          void localAnalytics().logEvent('DateGetNextQuestion', {
            screen: 'Date',
            action: 'GetNextQuestion',
            userId: authContext.userId,
            questionIndex: newIndex,
          });
          handleNewIndex(newIndex);
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
      withPartner={withPartner}
      onPressBack={() => {
        void localAnalytics().logEvent('DateFeedbackGoBackPressed', {
          screen: 'DateFeedback',
          action: 'DateFeedback go back pressed',
          userId: authContext.userId,
        });
        setShowFeedback(false);
        setTimeout(() => {
          setQuestionIndex(2);
          carouselRef?.current?.scrollTo({ index: 2, animated: false });
        }, 0);
      }}
      onPressForward={(feedbackScore: number) => {
        void localAnalytics().logEvent('DateFeedbackChoicePressed', {
          screen: 'DateFeedback',
          action: 'DateFeedback choice pressed',
          feedback: feedbackScore,
          userId: authContext.userId,
        });
        void handleFinishDateButtonFinal(feedbackScore);
      }}
    ></DateFeedback>
  ) : showNewLevel ? (
    <NewLevel withPartner={withPartner}></NewLevel>
  ) : (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.black,
      }}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setWidth(width - padding * 2);
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
                paddingHorizontal: padding,
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
              <GestureHandlerRootView>
                <Carousel
                  ref={carouselRef}
                  vertical={false}
                  width={width}
                  loop={false}
                  autoPlay={false}
                  onScrollEnd={(index: number) => {
                    recordTimeSpent(questionIndex);
                    setQuestionIndex(index);
                  }}
                  mode="parallax"
                  modeConfig={{
                    parallaxScrollingScale: 1,
                    parallaxScrollingOffset: 0,
                  }}
                  data={questions}
                  renderItem={({ index }: { index: number }) => {
                    return (
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding,
                          paddingVertical: padding * 2,
                        }}
                      >
                        <Progress theme="dark" current={index + 1} all={QUESTION_COUNT}></Progress>
                        {/* <RecordingComponent
                          bucket="conversation-recordings"
                          onRecorded={onRecorded}
                        ></RecordingComponent> */}
                        <FontText {...getFontSize(index)}>{questions[index].question}</FontText>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                        >
                          {LeftComponent(index)}
                          {RightComponent(index)}
                        </View>
                      </View>
                    );
                  }}
                />
              </GestureHandlerRootView>
            </Card>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
