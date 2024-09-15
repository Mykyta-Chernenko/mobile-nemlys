import React, { useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '@app/api/initSupabase';
import * as StoreReview from 'expo-store-review';
import { APIDate, APIGeneratedQuestion } from '@app/types/api';
import { useTheme, useThemeMode } from '@rneui/themed';
import { RefreshControl, View } from 'react-native';
import { logErrorsWithMessage, logSupaErrors } from '@app/utils/errors';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import DateFeedback from '../../components/date/DateFeedback';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import {
  createAfterDateNotifications,
  createFinishDateNotifications,
} from '@app/utils/notification';
import * as Notifications from 'expo-notifications';
import { getNow } from '@app/utils/date';
import { GRANTED_NOTIFICATION_STATUS } from '@app/utils/constants';

import { getPremiumDetails, PremiumState } from '@app/api/premium';
import { getFontSize } from '@app/utils/strings';
import Card from '@app/components/date/Card';
import { ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Loading } from '@app/components/utils/Loading';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { jobs } from '@app/screens/menu/Home';
import RegenerateIcon from '@app/icons/regenerate';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { useDatePolling } from '@app/api/getNewActiveDates';
import { CloseButton } from '@app/components/buttons/CloseButton';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'OnDate'>) {
  const { id, refreshTimeStamp } = route.params;
  const { setMode } = useThemeMode();

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isFirstMount.current && route.params?.refreshTimeStamp) {
      void onRefresh();
    }
  }, [refreshTimeStamp]);

  useEffect(() => {
    void onRefresh();
    isFirstMount.current = false;
  }, []);

  const onRefresh = () => {
    setMode('dark');
    setLoading(true);
    reset();
    void getData().then(() => setLoading(false));
  };

  const getCurrentUTCSeconds = () => {
    return Math.round(new Date().getTime() / 1000);
  };
  const authContext = useContext(AuthContext);
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const padding = 20;
  const QUESTION_COUNT = 1;
  const [questions, setQuestions] = useState<APIGeneratedQuestion[]>([]);
  const [startedDiscussionAt, setStartedDiscussionAt] = useState<number>(getCurrentUTCSeconds());
  const [currentDate, setCurrentDate] = useState<APIDate | undefined>(undefined);
  const [dateCount, setDateCount] = useState<number>(0);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);

  const [premiumState, setPremiumState] = useState<PremiumState>('free');
  const [dailyDatesLimit, setDailyDatesLimit] = useState(0);
  const [todayDateCount, setTodayDateCount] = useState(0);
  const [canStartDate, setCanStartDate] = useState(false);
  const freeDatesLeft = Math.max(dailyDatesLimit - todayDateCount, 0);
  const [hasPartner, setHasPartner] = useState(false);
  const [coupleId, setCoupleId] = useState<null | number>(null);

  function reset() {
    void createFinishDateNotifications(authContext.userId!);
    setQuestions([]);
    setCurrentDate(undefined);
    setShowFeedback(false);
    setDateCount(0);
    setStartedDiscussionAt(getCurrentUTCSeconds());
    setPremiumState('free');
    setDailyDatesLimit(0);
    setTodayDateCount(0);
    setCanStartDate(false);
    setHasPartner(false);
  }

  const isPremium = premiumState === 'premium' || premiumState === 'trial';
  const withPartner = currentDate?.with_partner ?? false;

  const getData = async () => {
    try {
      const dateFields =
        'id, couple_id, created_by, with_partner, active, topic, level, job, created_at, updated_at, reflection_answer_id';

      const [dateCountRes, dateRes, premiumDetails, hasPartnerRes, userProfileRes] =
        await Promise.all([
          supabase
            .from('date')
            .select('*', { count: 'exact' })
            .eq('active', false)
            .eq('created_by', authContext.userId!),

          supabase.from('date').select(dateFields).eq('id', id).single(),

          getPremiumDetails(authContext.userId!),

          supabase.rpc('has_partner'),
          supabase
            .from('user_profile')
            .select('couple_id')
            .eq('user_id', authContext.userId!)
            .single(),
        ]);

      if (dateCountRes.error) {
        logSupaErrors(dateCountRes.error);
        return;
      }

      if (dateRes.error || !dateRes.data.active) {
        void localAnalytics().logEvent('DateIsNoLongerActiveGoHome', {
          screen: 'OnDate',
          action: 'IsNoLongerActiveGoHome',
          userId: authContext.userId,
        });
        navigation.navigate('Home', {
          refreshTimeStamp: new Date().toISOString(),
        });
        return;
      }
      if (userProfileRes.error) {
        logSupaErrors(userProfileRes.error);
        return;
      }
      setCoupleId(userProfileRes.data.couple_id);

      const questionsRes = await supabase
        .from('generated_question')
        .select(
          `
        id,
        date_id,
        question,
        finished,
        feedback_score,
        skipped,
        created_at,
        updated_at
        `,
        )
        .eq('date_id', dateRes.data.id)
        .order('created_at', { ascending: true })
        .limit(QUESTION_COUNT);

      if (questionsRes.error) {
        logSupaErrors(questionsRes.error);
        return;
      }

      if (questionsRes.data?.length) {
        setQuestions([...questionsRes.data.map((x, i) => ({ ...x, index: i }))]);
      } else {
        void localAnalytics().logEvent('OnDateHasNoQuestionsGoHome', {
          screen: 'OnDate',
          action: 'HasNoQuestionsGoHome',
          userId: authContext.userId,
        });
        const dateUpdateRes = await supabase
          .from('date')
          .update({ active: false, updated_at: getNow().toISOString() })
          .eq('id', dateRes.data.id);

        if (dateUpdateRes.error) {
          logSupaErrors(dateUpdateRes.error);
          return;
        }

        navigation.navigate('Home', {
          refreshTimeStamp: new Date().toISOString(),
        });
        return;
      }

      void localAnalytics().logEvent('OnDateGetDataCompleted', {
        screen: 'OnDate',
        action: 'GetDataCompleted',
        userId: authContext.userId,
      });

      if (hasPartnerRes.error) {
        logSupaErrors(hasPartnerRes.error);
        return;
      }

      setDateCount(dateCountRes.count || 0);
      setCurrentDate(dateRes.data);
      setHasPartner(hasPartnerRes.data);
      setDailyDatesLimit(premiumDetails.dailyDatesLimit);
      setTodayDateCount(
        premiumDetails.todayDateCount + (dateRes.data?.created_by == authContext.userId ? 1 : 0),
      );
      setPremiumState(premiumDetails.premiumState);
    } catch (error) {
      logErrorsWithMessage(error, 'Error in getData on Date');
    }
  };

  useEffect(() => {
    setCanStartDate(isPremium || freeDatesLeft > 0);
  }, [isPremium, freeDatesLeft]);
  const isFocused = useIsFocused() && !!currentDate && !!coupleId;
  useDatePolling(
    hasPartner,
    currentDate?.id,
    navigation,
    authContext.userId!,
    coupleId || 0,
    isFocused,
    currentDate?.created_at,
  );
  const handleFinishDateButtonFinal = async (feedback: number | undefined) => {
    if (!currentDate) return;
    setShowFeedback(false);
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

    void createAfterDateNotifications(authContext.userId!);

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
        navigation.navigate('PremiumOffer', {
          refreshTimeStamp: new Date().toISOString(),
          isOnboarding: false,
        });
      } else if (shouldShowNotificationBanner) {
        navigation.navigate('OnDateNotification', { withPartner, isOnboarding: false });
      } else {
        if ((dateCount || 0) === 0) {
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
      const timeSpent = getCurrentUTCSeconds() - startedDiscussionAt;
      const updateDict = {
        feedback_score: feedback,
        seconds_spent: timeSpent,
      };
      if (timeSpent > 60) {
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

  const regenerate = async () => {
    void localAnalytics().logEvent('OnDateRegenerateClicked', {
      screen: 'OnDate',
      action: 'RegenerateClicked',
      userId: authContext.userId,
    });

    if (canStartDate) {
      setLoading(true);
      const dateRes = await supabase
        .from('date')
        .update({ active: false, updated_at: getNow().toISOString() })
        .eq('id', id);
      if (dateRes.error) {
        logSupaErrors(dateRes.error);
        return;
      }
      navigation.navigate('GeneratingQuestion', {
        withPartner: !!currentDate!.with_partner,
        topic: currentDate!.topic,
        job: currentDate!.job,
        level: currentDate!.level,
        reflectionAnswerId: currentDate!.reflection_answer_id,
        refreshTimeStamp: new Date().toISOString(),
      });
      setLoading(false);
      return;
    } else {
      navigation.navigate('PremiumOffer', {
        refreshTimeStamp: new Date().toISOString(),
        isOnboarding: false,
        shouldGoBack: true,
      });
    }
  };
  const answer = () => {
    if (currentDate?.with_partner) return;
    void localAnalytics().logEvent('OnDateAnswerClicked', {
      screen: 'OnDate',
      action: 'AnswerClicked',
      userId: authContext.userId,
    });

    navigation.navigate('QuestionAnswer', { questionId: questions[0]?.id, fromDate: true });
  };

  const JobIcon = currentDate?.job ? jobs.find((job) => job.slug === currentDate?.job)?.icon : null;

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
    void localAnalytics().logEvent('DateFinishDateCloseClicked', {
      screen: 'Date',
      action: 'FinishDateCloseClicked',
      userId: authContext.userId,
    });
    if (withPartner && Math.random() < 1 / 5) {
      goToFeedback();
    } else {
      void handleStopConfirm();
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
  const goToFeedback = () => {
    setShowFeedback(true);
  };

  return loading ? (
    <Loading></Loading>
  ) : showFeedback ? (
    <DateFeedback
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
    >
      <SafeAreaView style={{ flexGrow: 1, alignItems: 'center' }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
          }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
        >
          <View
            style={{
              alignItems: 'center',
              marginTop: '5%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingHorizontal: 20,
                flexGrow: 1,
                width: '100%',
              }}
            >
              <View style={{ flexDirection: 'column', width: '100%' }}>
                <FontText h3 style={{ color: theme.colors.white, textAlign: 'center' }}>
                  {withPartner ? i18n.t('date_discuss') : i18n.t('date_answer')}
                </FontText>
                {JobIcon && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginVertical: 8,
                    }}
                  >
                    <JobIcon width={24} height={24} />
                    <FontText style={{ color: '#87778D', marginLeft: 2, fontSize: 13 }}>
                      {currentDate?.topic === 'General'
                        ? i18n.t('date.topic.surprise')
                        : currentDate?.topic?.slice(0, 25)}
                      {currentDate?.topic && ', '}
                      {{
                        1: i18n.t('date.level.light'),
                        2: i18n.t('date.level.normal'),
                        3: i18n.t('date.level.deep'),
                      }[currentDate?.level || 1] ?? i18n.t('date.level.normal')}
                    </FontText>
                  </View>
                )}
              </View>
              <View style={{ position: 'absolute', right: 10 }}>
                <CloseButton onPress={handleStopInitiate} theme="black"></CloseButton>
              </View>
            </View>
          </View>
          <View
            style={{
              flexGrow: 1,
              width: '100%',
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
                {!isPremium ? (
                  <View
                    style={{
                      backgroundColor: theme.colors.grey0,
                      padding: 10,
                      paddingHorizontal: 15,
                      borderRadius: 40,
                      marginBottom: 10,
                    }}
                  >
                    <FontText>
                      {i18n.t('premium.banner.topics_left', {
                        total: dailyDatesLimit,
                        left: freeDatesLeft,
                      })}
                    </FontText>
                  </View>
                ) : (
                  <View></View>
                )}
                <FontText {...getFontSize(questions[0]?.question ?? '')}>
                  {questions[0]?.question}
                </FontText>
                <View
                  style={{
                    marginTop: 10,
                    marginHorizontal: -padding,
                    width: '100%',
                  }}
                >
                  <SecondaryButton
                    buttonStyle={{ backgroundColor: theme.colors.grey1 }}
                    onPress={() => void regenerate()}
                  >
                    <RegenerateIcon></RegenerateIcon>
                    <FontText h4>{i18n.t('on_date_regenerate')}</FontText>
                  </SecondaryButton>
                  {!withPartner && (
                    <PrimaryButton
                      buttonStyle={{ marginTop: 10 }}
                      onPress={() => void answer()}
                      title={i18n.t('on_date_answer')}
                    ></PrimaryButton>
                  )}
                </View>
              </View>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
