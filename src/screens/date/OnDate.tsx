import React, { useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@app/api/initSupabase';
import * as StoreReview from 'expo-store-review';
import { APIDate, APIGeneratedQuestion, SupabaseAnswer } from '@app/types/api';
import { useTheme, useThemeMode } from '@rneui/themed';
import { Image, Platform } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { logErrorsWithMessage, logSupaErrors } from '@app/utils/errors';
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
import OnDateStopPopup from '@app/components/date/OnDateStopPopup';
import * as Sharing from 'expo-sharing';
import { recreateNotificationList, removeOldNotification } from '@app/utils/notification';
import * as Notifications from 'expo-notifications';
import { calculateEveningTimeAfterDays, getNow, sleep } from '@app/utils/date';
import { GRANTED_NOTIFICATION_STATUS } from '@app/utils/constants';
import {
  NOTIFICATION_IDENTIFIERS,
  NOTIFICATION_SUBTYPE,
  NOTIFICATION_TYPE,
} from '@app/types/domain';
import { getPremiumDetails } from '@app/api/premium';
import { capitalize } from '@app/utils/strings';
import { shuffle } from 'lodash';
import _ from 'lodash';
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
  const [scrollInProgress, setScrollInProgress] = useState<boolean>(false);
  const [startedDiscussionAt, setStartedDiscussionAt] = useState<number>(getCurrentUTCSeconds());
  const currentQuestion = questions[questionIndex];
  const [currentDate, setCurrentDate] = useState<APIDate | undefined>(undefined);
  const [dateCount, setDateCount] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const carouselRef = useRef(null) as any;
  const [isSharing, setIsSharing] = useState(false);

  function restart() {
    void createFinishDateNotifications();
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

  const dateFields =
    'id, couple_id, with_partner, active, topic, level, job, created_at, updated_at';
  async function getData() {
    setLoading(true);

    const dateCountRes = await supabase
      .from('date')
      .select('*', { count: 'exact' })
      .eq('active', false);
    if (dateCountRes.error) {
      logSupaErrors(dateCountRes.error);
      return;
    }
    setDateCount(dateCountRes.count || 0);
    const dateRes = await supabase.from('date').select(dateFields).eq('active', true).single();

    if (dateRes.error) {
      logSupaErrors(dateRes.error);
      return;
    }
    setCurrentDate(dateRes.data);
    const res = await supabase
      .from('generated_question')
      .select('id, date_id, question ,finished, feedback_score, skipped, created_at, updated_at')
      .eq('date_id', dateRes.data.id)
      .order('created_at', { ascending: true })
      .limit(QUESTION_COUNT);
    if (res.error) {
      logSupaErrors(res.error);
      return;
    }

    // if doesn't want to generate questions and call api
    // res.data = [
    //   {
    //     id: 918,
    //     date_id: dateRes.data.id,
    //     question: 'question',
    //     finished: false,
    //     feedback_score: undefined,
    //     skipped: false,
    //     created_at: getNow().toISOString(),
    //     updated_at: getNow().toISOString(),
    //   },
    //   {
    //     id: 917,
    //     date_id: dateRes.data.id,
    //     question: 'question',
    //     finished: false,
    //     feedback_score: undefined,
    //     skipped: false,
    //     created_at: getNow().toISOString(),
    //     updated_at: getNow().toISOString(),
    //   },
    //   {
    //     id: 916,
    //     date_id: dateRes.data.id,
    //     question: 'question',
    //     finished: false,
    //     feedback_score: undefined,
    //     skipped: false,
    //     created_at: getNow().toISOString(),
    //     updated_at: getNow().toISOString(),
    //   },
    // ];

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
        logSupaErrors(res.error);
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
          currentQuestion,
        });
      });
      return () => subscription.remove();
    }
  }, [authContext.userId]);

  const shareScreen = async () => {
    try {
      const capturedUri = await captureScreen({
        format: 'png',
        quality: 1,
      });
      await Sharing.shareAsync('file://' + capturedUri, {
        mimeType: 'image/jpeg',
      });
    } catch (e) {
      logErrorsWithMessage(e, (e?.message as string) || '');
    }
  };

  const [showStopPopup, setShowStopPopup] = useState(false);
  const finishDateIdentifier = NOTIFICATION_IDENTIFIERS.FINISH_DATE + authContext.userId!;
  async function createFinishDateNotifications() {
    const notificationOrder = shuffle([
      NOTIFICATION_SUBTYPE.FINISH_DATE_1,
      NOTIFICATION_SUBTYPE.FINISH_DATE_2,
    ]);
    const trigerSeconds = [30 * 60, 4 * 60 * 60];
    const notifications = (
      _.zip(notificationOrder, trigerSeconds) as [NOTIFICATION_SUBTYPE, number][]
    ).map(([subtype, seconds]) => ({
      screen: 'Home',
      title: i18n.t(`notification.finish_date.${subtype}.title`),
      body: i18n.t(`notification.finish_date.${subtype}.body`),
      trigger: {
        seconds,
        repeats: false,
      },
      subtype,
    }));
    await recreateNotificationList(
      authContext.userId!,
      finishDateIdentifier,
      [
        ...notifications,
        {
          screen: 'Home',
          title: i18n.t(`notification.finish_date.${NOTIFICATION_SUBTYPE.FINISH_DATE_1}.title`),
          body: i18n.t(`notification.finish_date.${NOTIFICATION_SUBTYPE.FINISH_DATE_1}.body`),
          trigger: {
            seconds: calculateEveningTimeAfterDays(1),
            repeats: false,
          },
          subtype: NOTIFICATION_SUBTYPE.FINISH_DATE_1,
        },
        {
          screen: 'Home',
          title: i18n.t(`notification.finish_date.${NOTIFICATION_SUBTYPE.FINISH_DATE_2}.title`),
          body: i18n.t(`notification.finish_date.${NOTIFICATION_SUBTYPE.FINISH_DATE_2}.body`),
          trigger: {
            seconds: calculateEveningTimeAfterDays(7),
            repeats: false,
          },
          subtype: NOTIFICATION_SUBTYPE.FINISH_DATE_2,
        },
      ],
      NOTIFICATION_TYPE.FINISH_DATE,
      [
        ...notificationOrder,
        NOTIFICATION_SUBTYPE.FINISH_DATE_1,
        NOTIFICATION_SUBTYPE.FINISH_DATE_2,
      ].join(':'),
    );
  }
  async function createAfterDateNotifications() {
    const afterDateIdentifier = NOTIFICATION_IDENTIFIERS.DATE + authContext.userId!;
    void removeOldNotification(finishDateIdentifier);
    const notificationOrder = shuffle([
      NOTIFICATION_SUBTYPE.AFTER_DATE_1,
      NOTIFICATION_SUBTYPE.AFTER_DATE_2,
      NOTIFICATION_SUBTYPE.AFTER_DATE_3,
      NOTIFICATION_SUBTYPE.AFTER_DATE_4,
      NOTIFICATION_SUBTYPE.AFTER_DATE_5,
    ]);
    const trigerSeconds = [...Array(10)].map((_, i) => calculateEveningTimeAfterDays(i + 1));
    const notifications = (
      _.zip([...notificationOrder, ...notificationOrder], trigerSeconds) as [
        NOTIFICATION_SUBTYPE,
        number,
      ][]
    ).map(([subtype, seconds]) => ({
      screen: 'Home',
      title: i18n.t(`notification.after_date.${subtype}.title`),
      body: i18n.t(`notification.after_date.${subtype}.body`),
      trigger: {
        seconds,
        repeats: false,
      },
      subtype,
    }));
    await recreateNotificationList(
      authContext.userId!,
      afterDateIdentifier,
      [
        ...notifications,
        {
          screen: 'Home',
          title: i18n.t(`notification.after_date.${NOTIFICATION_SUBTYPE.AFTER_DATE_1}.title`),
          body: i18n.t(`notification.after_date.${NOTIFICATION_SUBTYPE.AFTER_DATE_1}.body`),
          trigger: {
            seconds: calculateEveningTimeAfterDays(20),
            repeats: false,
          },
          subtype: NOTIFICATION_SUBTYPE.AFTER_DATE_1,
        },
        {
          screen: 'Home',
          title: i18n.t(`notification.after_date.${NOTIFICATION_SUBTYPE.AFTER_DATE_1}.title`),
          body: i18n.t(`notification.after_date.${NOTIFICATION_SUBTYPE.AFTER_DATE_1}.body`),
          trigger: {
            seconds: calculateEveningTimeAfterDays(40),
            repeats: false,
          },
          subtype: NOTIFICATION_SUBTYPE.AFTER_DATE_1,
        },
      ],
      NOTIFICATION_TYPE.AFTER_DATE,
      [
        ...notificationOrder,
        ...notificationOrder,
        NOTIFICATION_SUBTYPE.AFTER_DATE_1,
        NOTIFICATION_SUBTYPE.AFTER_DATE_2,
      ].join(':'),
    );
  }

  const handleFinishDateButtonFinal = async (feedback: number | undefined) => {
    if (!currentDate) return;
    // const recordingRes = await recordButtonRef.current?.stopRecording();

    setLoading(true);

    const [shouldShowNotificationBanner, _] = await Promise.all([
      getShouldShowNotificationBanner(),
      finishSaveDate(feedback),
    ]);

    void localAnalytics().logEvent('OnDateGoFinish', {
      screen: 'Date',
      action: 'GoToNotification',
      userId: authContext.userId,
      shouldShowNotificationBanner,
    });

    const data = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', authContext.userId!)
      .single();
    if (data.error) {
      logSupaErrors(data.error);
      return;
    }

    void createAfterDateNotifications();
    const { error, count } = await supabase
      .from('date')
      .select('*', { count: 'exact' })
      .eq('active', false)
      .eq('stopped', false);
    if (error) {
      logSupaErrors(error);
      return;
    }

    try {
      const { premiumState, todayDateCount, dailyDatesLimit } = await getPremiumDetails(
        authContext.userId!,
      );

      // the user has just finished the daily sets, prompt trial every 3 days on average
      if (premiumState === 'free' && todayDateCount >= dailyDatesLimit && Math.random() < 1 / 3) {
        void localAnalytics().logEvent('NewLevelNavigateToPremiumTrial', {
          screen: 'NewLevel',
          action: 'NavigateToPremiumTrial',
          userId: authContext.userId,
        });
        navigation.navigate('PremiumOffer', { refreshTimeStamp: new Date().toISOString() });
      } else if (shouldShowNotificationBanner) {
        navigation.navigate('OnDateNotification', { withPartner, isOnboarding: false });
      } else {
        if ((count || 0) === 1 && withPartner) {
          void localAnalytics().logEvent('NewLevelFirstDateFinished', {
            screen: 'NewLevel',
            action: 'FirstDateFinished',
            userId: authContext.userId,
          });
        } else {
          void localAnalytics().logEvent('NewLevelDateFinished', {
            screen: 'NewLevel',
            action: 'DateFinished',
            userId: authContext.userId,
          });
        }

        navigation.navigate('Home', {
          refreshTimeStamp: new Date().toISOString(),
        });
      }
    } catch (e) {
      logErrorsWithMessage(e, (e?.message as string) || '');
    }
  };
  const finishSaveDate = async (feedback: number | undefined) => {
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
        logSupaErrors(questionReponse.error);
        return;
      }
    }
    const userProfileData = await supabase
      .from('user_profile')
      .select('showed_rating')
      .eq('user_id', authContext.userId!)
      .single();
    if (userProfileData.error) {
      logSupaErrors(userProfileData.error);
      return;
    }
    if (
      dateCount > 1 &&
      (feedback || 0) > 2 &&
      (!userProfileData.data.showed_rating || dateCount % 5 === 0)
    ) {
      if (await StoreReview.hasAction()) {
        await StoreReview.requestReview();
        const updateProfile = await supabase
          .from('user_profile')
          .update({ showed_rating: true, updated_at: getNow().toISOString() })
          .eq('user_id', authContext.userId!);
        if (updateProfile.error) {
          logSupaErrors(updateProfile.error);
          return;
        }
      }
    }

    const dateReponse = await supabase
      .from('date')
      .update({ active: false, updated_at: getNow().toISOString() })
      .eq('id', currentDate!.id);
    if (dateReponse.error) {
      logSupaErrors(dateReponse.error);
      return;
    }
  };
  // const recordButtonRef = useRef<RecordButtonRef>(null);

  // const saveRecording = async (recordUri: string | undefined, secondsSpent: number) => {
  //   void localAnalytics().logEvent('OnDateRecordingStartTrySavingSummary', {
  //     screen: 'OnDateRecording',
  //     action: 'SavedConversationSummary',
  //     userId: authContext.userId,
  //     currentDate,
  //     recordingUri: recordUri,
  //     secondsSpent,
  //   });
  //   if (currentDate && recordUri) {
  //     try {
  //       const file = Buffer.from(
  //         await FileSystem.readAsStringAsync(recordUri, {
  //           encoding: FileSystem.EncodingType.Base64,
  //         }),
  //         'base64',
  //       );

  //       const timestamp = getNow().valueOf().toString();
  //       const name =
  //         authContext.userId! +
  //         '/' +
  //         timestamp +
  //         Audio.RecordingOptionsPresets.HIGH_QUALITY.ios.extension;
  //       const bucket = 'conversation-recordings';
  //       const res = await supabase.storage.from(bucket).upload(name, file);
  //       if (res.error) {
  //         logSupaErrors(res.error);
  //       }

  //       void supabase.functions
  //         .invoke('save-conversation', {
  //           body: {
  //             dateId: currentDate.id,
  //             fileUrl: res.data?.path,
  //             seconds_spent: secondsSpent,
  //           },
  //         })
  //         .then((result) => {
  //           if (result.error) {
  //             logErrorsWithMessageWithoutAlert(result.error);
  //           } else {
  //             void localAnalytics().logEvent('OnDateRecordingSavedConversationSummary', {
  //               screen: 'OnDateRecording',
  //               action: 'SavedConversationSummary',
  //               userId: authContext.userId,
  //             });
  //           }
  //         });
  //     } catch (e) {
  //         logErrorsWithMessage(e, (e?.message as string) || '');
  //     }
  //   }
  // };

  const [notificationStatus, setNotificationStatus] = useState<string | undefined>(undefined);
  useEffect(() => {
    const getCurrentToken = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationStatus(status);
    };
    void getCurrentToken();
  }, []);
  const getShouldShowNotificationBanner = async () => {
    const profileResponse = await supabase
      .from('user_profile')
      .select('id, ios_expo_token, android_expo_token')
      .eq('user_id', authContext.userId!)
      .single();
    if (profileResponse.error) {
      logSupaErrors(profileResponse.error);
      return;
    }
    const hasToken = notificationStatus === GRANTED_NOTIFICATION_STATUS;
    return (
      !hasToken &&
      (dateCount === 1 ||
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
      goToFeedback();
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
      currentQuestion,
    });
    setIsSharing(true);
    await sleep(200);
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
    if (scrollInProgress) {
      void localAnalytics().logEvent('DateNavigateScrollAlreadyInProgress', {
        screen: 'Date',
        action: 'NavigateScrollAlreadyInProgress',
        userId: authContext.userId,
        questionIndex: index,
      });
      return;
    }
    void localAnalytics().logEvent('DateNavigateQuestionsButton', {
      screen: 'Date',
      action: 'NavigateQuestionsButtonPressed',
      userId: authContext.userId,
      questionIndex: index,
    });
    setScrollInProgress(true);
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

  const goToFeedback = () => {
    // await recordButtonRef.current?.stopRecording();
    setShowFeedback(true);
  };

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
          void goToFeedback();
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
                      {capitalize(currentDate?.job ?? '')}, {currentDate?.topic ?? ''},{' '}
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
                    setScrollInProgress(false);
                    setQuestionIndex(index);
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
