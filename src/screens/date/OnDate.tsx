import React, { useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@app/api/initSupabase';
import * as StoreReview from 'expo-store-review';
import { APIDate, APIGeneratedQuestion, SupabaseAnswer } from '@app/types/api';
import { useTheme, useThemeMode } from '@rneui/themed';
import { Image, Platform } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { logErrors } from '@app/utils/errors';
import { captureScreen } from 'react-native-view-shot';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import { i18n } from '@app/localization/i18n';
import { TouchableOpacity } from 'react-native';
import Share from '@app/icons/share';
import Stop from '@app/icons/stop';
import DateFeedback from '../../components/date/DateFeedback';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import Card from '@app/components/date/Card';
import { Progress } from '@app/components/utils/Progress';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ScreenCapture from 'expo-screen-capture';
import FakeRecordButton from '@app/components/date/FakeRecordButton';
import OnDateStopPopup from '@app/components/date/OnDateStopPopup';
import * as Sharing from 'expo-sharing';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'OnDate'>) {
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('dark'));
    return unsubscribeFocus;
  }, [navigation, setMode]);

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
  const carouselRef = useRef(null) as any;
  const [isSharing, setIsSharing] = useState(false);
  function restart() {
    setLoading(true);
    setSpentTimes(new Array(QUESTION_COUNT));
    setQuestions([]);
    setQuestionIndex(0);
    setCurrentDate(undefined);
    setShowFeedback(false);

    void localAnalytics().logEvent('OnDateLoaded', {
      screen: 'OnDate',
      action: 'loaded',
      userId: authContext.userId,
    });
    setLoading(false);
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
      .order('created_at', { ascending: true })
      .limit(QUESTION_COUNT);
    if (res.error) {
      logErrors(res.error);
      return;
    }

    if (res.data?.length) {
      setQuestions(res.data);
    } else {
      void localAnalytics().logEvent('DateRegeneratingQuestions', {
        screen: 'OnDate',
        action: 'RegeneratingQuestions',
        userId: authContext.userId,
      });
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
    void localAnalytics().logEvent('OnDateGetDataCompleted', {
      screen: 'OnDate',
      action: 'GetDataCompleted',
      userId: authContext.userId,
    });
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
  // record if people take screenshots
  useEffect(() => {
    // we need media permission on android so skip it
    if (Platform.OS === 'ios') {
      const subscription = ScreenCapture.addScreenshotListener(() => {
        void localAnalytics().logEvent('OnDateScreenshotTaken', {
          screen: 'OnDate',
          action: 'ScreenshotTaken',
          userId: authContext.userId,
        });
      });
      return () => subscription.remove();
    }
  }, [authContext.userId]);

  // const viewRef: Ref<ViewShot> = useRef(null);

  const shareScreen = async () => {
    try {
      // const capturedUri = await captureRef(viewRef, {
      //   format: 'png',
      //   quality: 1,
      // });

      const capturedUri = await captureScreen({
        format: 'png',
        quality: 1,
      });
      await Sharing.shareAsync('file://' + capturedUri, {
        mimeType: 'image/jpeg',
      });
    } catch (err) {
      logErrors(err);
    }
  };

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

  const [showStopPopup, setShowStopPopup] = useState(false);

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
    }
    const userProfileData = await supabase
      .from('user_profile')
      .select('showed_rating')
      .eq('user_id', authContext.userId)
      .single();
    if (userProfileData.error) {
      logErrors(userProfileData.error);
      return;
    }
    if ((feedback || 0) == 4 && (!userProfileData.data.showed_rating || dateCount % 5 === 0)) {
      if (await StoreReview.hasAction()) {
        await StoreReview.requestReview();
        const updateProfile = await supabase
          .from('user_profile')
          .update({ showed_rating: true, updated_at: new Date() })
          .eq('user_id', authContext.userId);
        if (updateProfile.error) {
          logErrors(updateProfile.error);
          return;
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
    const shouldShowNotificationBanner = await getShouldShowNotificationBanner();
    void localAnalytics().logEvent('OnDateGoFinish', {
      screen: 'Date',
      action: 'GoToNotification',
      userId: authContext.userId,
      shouldShowNotificationBanner,
    });
    if (shouldShowNotificationBanner) {
      navigation.navigate('OnDateNotification', { withPartner });
    } else {
      navigation.navigate('OnDateNewLevel', {
        withPartner,
        refreshTimeStamp: new Date().toISOString(),
      });
    }
  };
  const getShouldShowNotificationBanner = async () => {
    const profileResponse: SupabaseAnswer<{
      id: number;
      ios_expo_token: string | null;
      android_expo_token: string | null;
    }> = await supabase
      .from('user_profile')
      .select('id, ios_expo_token, android_expo_token')
      .eq('user_id', authContext.userId)
      .single();
    if (profileResponse.error) {
      logErrors(profileResponse.error);
      return;
    }
    let hasToken = false;
    if (Platform.OS === 'ios' && profileResponse.data.ios_expo_token) {
      hasToken = true;
    } else if (Platform.OS === 'android' && profileResponse.data.android_expo_token) {
      hasToken = true;
    }
    return (
      !hasToken &&
      (dateCount === 0 ||
        dateCount === 4 ||
        dateCount === 9 ||
        dateCount === 14 ||
        dateCount === 34)
    );
  };

  const handleStopInitiate = () => {
    const lastQuestion = questionIndex === QUESTION_COUNT - 1;
    void localAnalytics().logEvent('DateFinishDateStopClicked', {
      screen: 'Date',
      action: 'FinishDateStopClicked',
      userId: authContext.userId,
      lastQuestion,
    });
    if (lastQuestion) {
      setShowFeedback(true);
    } else {
      setShowStopPopup(true);
    }
  };
  const handleStopConfirm = async () => {
    void localAnalytics().logEvent('DateFinishDateStopConfirm', {
      screen: 'Date',
      action: 'FinishDateStopConfirm',
      userId: authContext.userId,
    });
    await handleFinishDateButtonFinal(undefined);
    navigation.navigate('Home', {
      refreshTimeStamp: new Date().toISOString(),
    });
  };
  const handleStopCancel = () => {
    void localAnalytics().logEvent('DateFinishDateStopCancel', {
      screen: 'Date',
      action: 'FinishDateStopCancel',
      userId: authContext.userId,
    });
    setShowStopPopup(false);
  };

  const handleSharePress = async () => {
    void localAnalytics().logEvent('DateSharePressed', {
      screen: 'Date',
      action: 'SharePressed',
      userId: authContext.userId,
      questionIndex,
    });
    setIsSharing(true);
    const loadTime = new Promise((resolve) => setTimeout(() => resolve(1), 100));
    await loadTime;
    await shareScreen();
    setIsSharing(false);
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

  const recordGoToPreviousCard = (index: number, swipe = false) => {
    void localAnalytics().logEvent('DateGetPreviousQuestion', {
      screen: 'Date',
      action: 'GetPreviousQuestion',
      userId: authContext.userId,
      questionIndex: index,
      swipe,
    });
  };
  const recordGoToNextCard = (index: number, swipe = false) => {
    void localAnalytics().logEvent('DateGetNextQuestion', {
      screen: 'Date',
      action: 'GetNextQuestion',
      userId: authContext.userId,
      questionIndex: index,
      swipe,
    });
  };
  const handleNewIndex = (index: number) => {
    void localAnalytics().logEvent('DateNavigateQuestionsButton', {
      screen: 'Date',
      action: 'NavigateQuestionsButtonPressed',
      userId: authContext.userId,
      questionIndex: index,
    });
    carouselRef?.current?.scrollTo({ index, animated: true });
  };
  const LeftComponent = (index: number) =>
    index === 0 ? (
      <View style={{ height: 72, width: 72 }}></View>
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
  ) : (
    <View
      // ref={viewRef}
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
            marginTop: '5%',
          }}
        >
          <FontText h3 style={{ color: theme.colors.white }}>
            {i18n.t('date.discuss')}
          </FontText>

          <View style={{ flexDirection: 'row' }}>
            {isSharing ? (
              <View
                style={{
                  marginTop: 20,
                  marginHorizontal: 5,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: 7,
                    paddingHorizontal: 12,
                    borderRadius: 40,
                    alignItems: 'center',
                  }}
                >
                  <View style={{ marginLeft: 10, padding: 2.5 }}>
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
              </View>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => void handleSharePress()}
                  style={{
                    marginTop: 20,
                    marginHorizontal: 5,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      padding: 7,
                      paddingHorizontal: 12,
                      borderRadius: 40,
                      alignItems: 'center',
                    }}
                  >
                    <Share color={theme.colors.grey2}></Share>
                    <View style={{ marginLeft: 5 }}>
                      <FontText style={{ color: theme.colors.grey2, fontSize: 18 }}>
                        {i18n.t('date.share')}
                      </FontText>
                    </View>
                  </View>
                </TouchableOpacity>
                {currentDate && showStopPopup && (
                  <OnDateStopPopup
                    dateId={currentDate.id}
                    onClose={handleStopCancel}
                    onConfirm={() => void handleStopConfirm()}
                  ></OnDateStopPopup>
                )}
                <TouchableOpacity
                  onPress={() => void handleStopInitiate()}
                  style={{
                    marginTop: 20,
                    marginHorizontal: 5,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      padding: 7,
                      paddingHorizontal: 12,
                      borderRadius: 40,
                      alignItems: 'center',
                    }}
                  >
                    <Stop color={theme.colors.grey2}></Stop>
                    <View style={{ marginLeft: 5 }}>
                      <FontText style={{ color: theme.colors.grey2, fontSize: 18 }}>
                        {i18n.t('date.stop')}
                      </FontText>
                    </View>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
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
                    if (index > questionIndex) {
                      recordGoToNextCard(index, true);
                    } else {
                      recordGoToPreviousCard(index, true);
                    }
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
                        {isSharing && (
                          <View
                            style={{
                              position: 'absolute',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 1,
                              marginTop: 70,
                            }}
                          >
                            <Image
                              source={require('../../../assets/images/app_share_icon.png')}
                              style={{ height: 32, width: 32 }}
                            ></Image>
                            <FontText
                              style={{
                                fontSize: 24,
                                color: theme.colors.primary,
                                marginTop: 5,
                                marginLeft: 5,
                              }}
                            >
                              {i18n.t('nemlys')}
                            </FontText>
                          </View>
                        )}
                        <FontText {...getFontSize(index)}>{questions[index].question}</FontText>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%',
                          }}
                        >
                          {LeftComponent(index)}
                          {withPartner && (
                            <FakeRecordButton
                              questionIndex={index}
                              dateCount={dateCount}
                            ></FakeRecordButton>
                          )}
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
