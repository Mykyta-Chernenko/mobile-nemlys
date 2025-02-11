import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthContext } from '@app/provider/AuthProvider';
import { MainStackParamList } from '@app/types/navigation';
import { supabase } from '@app/api/initSupabase';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import { logSupaErrors } from '@app/utils/errors';
import { localAnalytics } from '@app/utils/analytics';
import { i18n } from '@app/localization/i18n';
import { BACKGROUND_LIGHT_BEIGE_COLOR, CHECKUP_COLOR, MEDIUM_BEIGE_COLOR } from '@app/utils/colors';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { showName } from '@app/utils/strings';
import ContentBuddyPink from '@app/icons/content_buddy_pink';
import IconStar from '@app/icons/selected_star';
import PremiumLock from '@app/icons/premium_lock';
import { handleRemindPartner } from '@app/utils/sendNotification';
import V3LayeredGreyImage from '@app/components/explore/V3LayeredGreyImage';
import ContentCheckupIcon from '@app/icons/content_checkup';
import { contentListScreen } from '@app/types/domain';
import { getContentImageFromId } from '@app/utils/content';
import { PostgrestError } from '@supabase/supabase-js';
import V3ContentDetailInfoBlock from '@app/components/explore/V3ContentDetailInfoBlock';
import WaitingTimerYellow from '@app/icons/waiting_timer_yellow';
type Props = NativeStackScreenProps<MainStackParamList, 'V3ExploreCheckupDetail'>;

interface CheckupData {
  id: number;
  slug: string;
  title: string;
  research: string;
  description: string;
}

interface QuestionData {
  id: number;
  content: string;
}

interface AnswerData {
  [questionId: number]: number;
}

import Game1 from 'src/icons/game_1';
import Game2 from 'src/icons/game_2';
import Game3 from 'src/icons/game_3';
import Game4 from 'src/icons/game_4';
import Game5 from 'src/icons/game_5';
import { ContentFeedback } from '@app/components/content/ContentFeedback';
const getGameIcon = (value: number) => {
  switch (value) {
    case 1:
      return Game1;
    case 2:
      return Game2;
    case 3:
      return Game3;
    case 4:
      return Game4;
    case 5:
      return Game5;
    default:
      return Game3;
  }
};

const getAnswerLabel = (value: number) => {
  switch (value) {
    case 1:
      return i18n.t('slider_strongly_disagree');
    case 2:
      return i18n.t('slider_disagree');
    case 3:
      return i18n.t('slider_neutral');
    case 4:
      return i18n.t('slider_agree');
    case 5:
      return i18n.t('slider_strongly_agree');
    default:
      return i18n.t('slider_neutral');
  }
};

const getResultLabel = (value: number) => {
  switch (value) {
    case 1:
      return i18n.t('result_mostly_strongly_disagree');
    case 2:
      return i18n.t('result_mostly_disagree');
    case 3:
      return i18n.t('result_mostly_neutral');
    case 4:
      return i18n.t('result_mostly_agree');
    case 5:
      return i18n.t('result_mostly_strongly_agree');
    default:
      return i18n.t('result_mostly_neutral');
  }
};

export default function V3ExploreCheckupDetail({ route, navigation }: Props) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);

  const checkupId = route.params.id;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [checkupData, setCheckupData] = useState<CheckupData | null>(null);
  const [name, setName] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [finishedCount, setFinishedCount] = useState<number>(0);
  const [questionCount, setQuestionCount] = useState<number>(7);

  const [myAnswers, setMyAnswers] = useState<AnswerData>({});
  const [partnerAnswers, setPartnerAnswers] = useState<AnswerData>({});

  const [questionList, setQuestionList] = useState<QuestionData[]>([]);

  const [showSelected, setShowSelected] = useState<boolean>(false);
  const [instanceId, setInstanceId] = useState<number | null>(null);

  const [stateType, setStateType] = useState<
    'not_started' | 'me_finished_only' | 'partner_finished_only' | 'both_finished'
  >('not_started');

  const isFirstMount = useRef(true);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = authContext.userId;
      if (!userId) {
        setLoading(false);
        return;
      }

      localAnalytics().logEvent('V3CheckupDetailLoadingStarted', {
        userId,
        checkupId,
      });

      // Initiate all necessary queries
      const [
        userProfileRes,
        checkupRes,
        jobResult,
        jobCheckupResult,
        streakResult,
        premiumResult,
        questionCountQuery,
        questionListQuery,
        instanceQuery,
      ] = await Promise.all([
        supabase
          .from('user_profile')
          .select('user_id,first_name,partner_first_name,couple_id')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('content_checkup')
          .select('id, slug, title, research, description, couples_finished')
          .eq('id', checkupId)
          .single(),
        supabase.rpc('get_my_jobs'),
        supabase.from('job_content_checkup').select('job_slug').eq('content_checkup_id', checkupId),
        supabase.rpc('get_total_streak'),
        supabase.rpc('is_user_premium'),
        supabase
          .from('content_checkup_question')
          .select('id', { count: 'exact' })
          .eq('checkup_id', checkupId),
        supabase.from('content_checkup_question').select('id, content').eq('checkup_id', checkupId),
        supabase
          .from('content_checkup_couple_instance')
          .select(
            `id,
            finished_by,
            content_checkup_couple_instance_question_answer (
              question_id,
              answer,
              user_id
            )`,
          )
          .eq('checkup_id', checkupId)
          .maybeSingle(),
      ]);

      if (userProfileRes.error) throw userProfileRes.error;
      if (checkupRes.error) throw checkupRes.error;
      if (jobResult.error) throw jobResult.error;
      if (jobCheckupResult.error) throw jobCheckupResult.error;
      if (streakResult.error) throw streakResult.error;
      if (premiumResult.error) throw premiumResult.error;
      if (questionCountQuery.error) throw questionCountQuery.error;
      if (questionListQuery.error) throw questionListQuery.error;

      const { data: userProfile } = userProfileRes;
      const { data: checkupData } = checkupRes;
      const { data: jobs } = jobResult;
      const { data: jobCheckups } = jobCheckupResult;
      const { data: premiumStatus } = premiumResult;
      const { count: totalQuestions } = questionCountQuery;
      const { data: questionList } = questionListQuery;
      const { data: instanceData } = instanceQuery;

      // Set user and partner names
      setName(showName(userProfile.first_name));
      setPartnerName(showName(userProfile.partner_first_name) || i18n.t('home_partner'));

      // Set checkup data
      setCheckupData({
        id: checkupData.id,
        slug: checkupData.slug,
        title: checkupData.title,
        research: checkupData.research,
        description: checkupData.description,
      });

      setQuestionCount(totalQuestions || 7);
      setQuestionList(questionList || []);

      setFinishedCount(checkupData.couples_finished);
      setInstanceId(instanceData?.id || null);

      let isRecommended = false;
      const userJobs = jobs || [];
      if (jobCheckups && jobCheckups.length > 0) {
        const checkupSlugs = jobCheckups.map((row) => row.job_slug);
        isRecommended = checkupSlugs.some((slug) => userJobs.includes(slug));
      }
      setShowSelected(isRecommended);

      let instanceId: null | number = null;
      let userHasFinished = false;
      let partnerHasFinished = false;
      const myAnswersMap = {};
      const partnerAnswersMap = {};

      if (instanceData) {
        const finishedBy = instanceData.finished_by || [];
        userHasFinished = finishedBy.includes(userId);
        partnerHasFinished = finishedBy.some((uid) => uid !== userId);
        instanceId = instanceData.id;

        const answers = instanceData.content_checkup_couple_instance_question_answer || [];
        answers.forEach((ans) => {
          if (ans.user_id === userId) {
            myAnswersMap[ans.question_id] = ans.answer;
          } else {
            partnerAnswersMap[ans.question_id] = ans.answer;
          }
        });

        setMyAnswers(myAnswersMap);
        setPartnerAnswers(partnerAnswersMap);
      }
      let stateType: 'not_started' | 'both_finished' | 'partner_finished_only' | 'me_finished_only';
      if (!instanceId) {
        stateType = 'not_started';
      } else {
        if (userHasFinished && partnerHasFinished) {
          stateType = 'both_finished';
        } else if (partnerHasFinished) {
          stateType = 'partner_finished_only';
        } else if (userHasFinished) {
          stateType = 'me_finished_only';
        } else {
          stateType = 'not_started';
        }
      }
      setStateType(stateType);

      setIsPremium(premiumStatus || stateType !== 'not_started' || !!route.params.canActivate);

      localAnalytics().logEvent('V3CheckupDetailLoaded', {
        userId,
        checkupId,
        state: stateType,
      });
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [authContext.userId, checkupId, stateType]);

  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void fetchInitialData();
    }
  }, [route?.params?.refreshTimeStamp]);

  useEffect(() => {
    void fetchInitialData();
    isFirstMount.current = false;
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const timeToComplete = Math.round(questionCount * 0.7);

  const handleStartCheckup = () => {
    localAnalytics().logEvent('V3ExploreCheckupDetailStartClicked', {
      userId: authContext.userId,
      checkupId,
      isPremium,
    });
    if (isPremium) {
      navigation.navigate('V3CheckupStart', {
        id: checkupId,
        refreshTimeStamp: new Date().toISOString(),
        fromHome: route.params.fromHome,
      });
    } else {
      localAnalytics().logEvent('V3ExploreCheckupDetailRedirectPremium', {
        userId: authContext.userId,
      });
      navigation.navigate('V3PremiumOffer', {
        refreshTimeStamp: new Date().toISOString(),
        isOnboarding: false,
      });
    }
  };

  const handleButtonLabel = () => {
    if (stateType === 'not_started' || stateType === 'partner_finished_only') {
      return isPremium
        ? i18n.t('explore_checkup_detail_start_checkup')
        : i18n.t('explore_content_detail_start_free_trial');
    }
    if (stateType === 'me_finished_only') {
      return i18n.t('question_answer_remind_partner', { partnerName });
    }
    return null;
  };

  const handleButtonPress = async () => {
    if (stateType === 'not_started' || stateType === 'partner_finished_only') {
      handleStartCheckup();
    } else if (stateType === 'me_finished_only') {
      await handleRemindPartner(
        'CheckupDetail',
        partnerName,
        authContext.userId!,
        setLoading,
        {
          checkup_id: checkupId,
          type: 'remind_checkup',
        },
        navigation,
        'V3ExploreCheckupDetail',
        {
          id: checkupId,
          refreshTimeStamp: new Date().toISOString(),
          shouldGoBack: route.params.shouldGoBack,
          fromHome: route.params.fromHome,
        },
        true,
        true,
      );
    }
  };

  const mirrorIconStyle = {
    transform: [{ scaleX: -1 }],
  };

  const renderBothFinishedTopCard = () => {
    const myValues = Object.values(myAnswers) as number[];
    const partnerValues = Object.values(partnerAnswers) as number[];

    const myAvg = myValues.length
      ? myValues.reduce((acc, val) => acc + val, 0) / myValues.length
      : 0;
    const partnerAvg = partnerValues.length
      ? partnerValues.reduce((acc, val) => acc + val, 0) / partnerValues.length
      : 0;

    const myRounded = Math.round(myAvg);
    const partnerRounded = Math.round(partnerAvg);

    const myLabel = getResultLabel(myRounded);
    const partnerLabel = getResultLabel(partnerRounded);

    const MyIcon = getGameIcon(myRounded);
    const PartnerIcon = getGameIcon(partnerRounded);

    return (
      <View style={{ alignItems: 'center', marginBottom: 24, marginTop: 15 }}>
        <View style={{ marginBottom: 8 }}>
          <FontText small style={{ color: 'rgba(255,255,255,0.7)' }}>
            Results
          </FontText>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.white,
              borderRadius: 12,
              paddingVertical: 20,
              paddingHorizontal: 16,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {Array.from({ length: 5 }, (_, i) => {
                if (i === myRounded - 1) {
                  return <MyIcon key={i} width={32} height={32} style={mirrorIconStyle} />;
                }
                return (
                  <View
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                      marginTop: 22,
                    }}
                  />
                );
              })}
            </View>
            <View>
              <FontText style={{ textAlign: 'center' }}>{myLabel}</FontText>
              <FontText style={{ textAlign: 'center', opacity: 0.5 }}>{name}</FontText>
            </View>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.white,
              borderRadius: 12,
              paddingVertical: 20,
              paddingHorizontal: 16,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <View style={{ flexDirection: 'row', gap: 4 }}>
              {Array.from({ length: 5 }, (_, i) => {
                if (i === partnerRounded - 1) {
                  return <PartnerIcon key={i} width={32} height={32} />;
                }
                return (
                  <View
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                      marginTop: 22,
                    }}
                  />
                );
              })}
            </View>
            <View>
              <FontText style={{ textAlign: 'center' }}>{partnerLabel}</FontText>
              <FontText style={{ textAlign: 'center', opacity: 0.5 }}>{partnerName}</FontText>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderQuestionsAndAnswers = () => {
    return questionList.map((question, index) => {
      const questionNumber = index + 1;
      const myValue = myAnswers[question.id];
      const partnerValue = partnerAnswers[question.id];

      const myLabel = myValue ? getAnswerLabel(myValue) : '?';
      const partnerLabel = partnerValue ? getAnswerLabel(partnerValue) : '?';

      const MyIcon = getGameIcon(myValue || 3);
      const PartnerIcon = getGameIcon(partnerValue || 3);

      return (
        <View
          key={question.id}
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            gap: 16,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
              borderRadius: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FontText small>{questionNumber}</FontText>
          </View>
          <FontText>{question.content}</FontText>

          <View style={{ flexDirection: 'column', gap: 12, width: '100%' }}>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  gap: 16,
                  backgroundColor: theme.colors.white,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                  padding: 16,
                }}
              >
                <MyIcon width={32} height={32} style={mirrorIconStyle} />
                <View style={{ flex: 1, gap: 8 }}>
                  <FontText>{myLabel}</FontText>
                  <FontText small style={{ opacity: 0.5 }}>
                    {name}
                  </FontText>
                </View>
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  gap: 16,
                  backgroundColor: theme.colors.white,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                  padding: 16,
                }}
              >
                <PartnerIcon width={32} height={32} />
                <View style={{ flex: 1, gap: 8 }}>
                  <FontText>{partnerLabel}</FontText>
                  <FontText style={{ opacity: 0.5 }}>{partnerName}</FontText>
                </View>
              </View>
            </View>
          </View>
        </View>
      );
    });
  };

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: CHECKUP_COLOR }} />
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: theme.colors.white }}
      >
        <View style={{ flex: 1, backgroundColor: CHECKUP_COLOR }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <GoBackButton
              onPress={() => {
                localAnalytics().logEvent('V3CheckupDetailBackClicked', {
                  userId: authContext.userId,
                  checkupId,
                });
                if (route.params.fromHome) {
                  navigation.navigate('V3Home', {
                    refreshTimeStamp: new Date().toISOString(),
                  });
                } else if (navigation.canGoBack() && route.params.shouldGoBack) {
                  navigation.goBack();
                } else {
                  navigation.navigate(contentListScreen['checkup'], {
                    refreshTimeStamp: new Date().toISOString(),
                  });
                }
              }}
              theme="black"
              style={{ marginBottom: 5 }}
            />
          </View>

          {loading ? (
            <Loading />
          ) : (
            <ScrollView
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
              }
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View style={{ alignItems: 'center', marginBottom: 24, paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: 40,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <ContentCheckupIcon width={12} height={12} fill="#FFF" stroke="#FFF" />
                    <FontText small style={{ color: theme.colors.white }}>
                      {i18n.t('explore_checkup_detail_label_checkup')}
                    </FontText>
                  </View>
                </View>
                <FontText
                  h2
                  style={{ color: theme.colors.white, textAlign: 'center', marginBottom: 24 }}
                >
                  {checkupData?.title}
                </FontText>

                {stateType !== 'both_finished' && (
                  <>
                    <V3LayeredGreyImage image={getContentImageFromId(checkupId)} />
                    <FontText small style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                      {i18n.t('explore_content_detail_finished_count', {
                        count: finishedCount,
                      })}
                    </FontText>
                  </>
                )}

                {stateType === 'both_finished' && renderBothFinishedTopCard()}

                {stateType === 'me_finished_only' && (
                  <V3ContentDetailInfoBlock>
                    <WaitingTimerYellow width={24} height={24} />
                    <FontText small style={{ flex: 1 }}>
                      {i18n.t('explore_content_detail_finished_waiting_for', {
                        partnerName,
                      })}
                    </FontText>
                  </V3ContentDetailInfoBlock>
                )}

                {stateType === 'partner_finished_only' && (
                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      padding: 12,
                      backgroundColor: theme.colors.white,
                      borderRadius: 12,
                      marginBottom: 8,
                    }}
                  >
                    <ContentBuddyPink width={32} height={32} />
                    <FontText small style={{ flex: 1 }}>
                      {i18n.t('explore_checkup_detail_waiting_partner_message', {
                        partnerName,
                      })}
                    </FontText>
                  </View>
                )}
              </View>

              <View
                style={{
                  flex: 1,
                  backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: 50,
                }}
              >
                <>
                  {stateType !== 'both_finished' && (
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 24,
                      }}
                    >
                      {showSelected && (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: theme.colors.black,
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                            borderRadius: 40,
                          }}
                        >
                          <IconStar height={18} width={18} fill={theme.colors.white} />
                          <FontText small style={{ color: theme.colors.white, marginTop: 2 }}>
                            {i18n.t('explore_content_detail_selected')}
                          </FontText>
                        </View>
                      )}

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: MEDIUM_BEIGE_COLOR,
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: 40,
                        }}
                      >
                        <FontText small>
                          {i18n.t('explore_content_detail_time', {
                            minutes: timeToComplete,
                          })}
                        </FontText>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: MEDIUM_BEIGE_COLOR,
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: 40,
                        }}
                      >
                        <FontText small style={{ color: theme.colors.black }}>
                          {i18n.t('explore_detail_questions_count', {
                            count: questionCount,
                          })}
                        </FontText>
                      </View>
                    </View>
                  )}
                  <View style={{ marginBottom: 40 }}>
                    {(stateType === 'both_finished' || stateType === 'me_finished_only') && (
                      <ContentFeedback
                        title={i18n.t('content_feedback_checkup')}
                        contentType="checkup"
                        instanceId={instanceId}
                      />
                    )}
                    {stateType === 'both_finished' && (
                      <View style={{ marginBottom: 20 }}>
                        <FontText
                          h4
                          style={{
                            color: theme.colors.black,
                            marginBottom: 15,
                          }}
                        >
                          {i18n.t('explore_checkup_detail_answer_title')}
                        </FontText>
                        {renderQuestionsAndAnswers()}
                      </View>
                    )}
                    <FontText normal style={{ marginBottom: 20 }}>
                      {checkupData?.description}
                    </FontText>

                    {stateType !== 'both_finished' && (
                      <View style={{ marginBottom: 40 }}>
                        <FontText h4 style={{ color: theme.colors.black, marginBottom: 12 }}>
                          {i18n.t('how_does_it_work')}
                        </FontText>
                        <View style={{ gap: 8 }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: MEDIUM_BEIGE_COLOR,
                              borderRadius: 16,
                              padding: 16,
                            }}
                          >
                            <View
                              style={{
                                width: 24,
                                height: 24,
                                backgroundColor: theme.colors.black,
                                borderRadius: 40,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10,
                              }}
                            >
                              <FontText small style={{ color: BACKGROUND_LIGHT_BEIGE_COLOR }}>
                                1
                              </FontText>
                            </View>
                            <FontText small style={{ color: theme.colors.black, flex: 1 }}>
                              {i18n.t('explore_checkup_detail_step_one', {
                                count: questionCount,
                              })}
                            </FontText>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: MEDIUM_BEIGE_COLOR,
                              borderRadius: 16,
                              padding: 16,
                            }}
                          >
                            <View
                              style={{
                                width: 24,
                                height: 24,
                                backgroundColor: theme.colors.black,
                                borderRadius: 40,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10,
                              }}
                            >
                              <FontText small style={{ color: BACKGROUND_LIGHT_BEIGE_COLOR }}>
                                2
                              </FontText>
                            </View>
                            <FontText small style={{ color: theme.colors.black, flex: 1 }}>
                              {i18n.t('explore_checkup_detail_step_two', {
                                partnerName,
                              })}
                            </FontText>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              backgroundColor: MEDIUM_BEIGE_COLOR,
                              borderRadius: 16,
                              padding: 16,
                            }}
                          >
                            <View
                              style={{
                                width: 24,
                                height: 24,
                                backgroundColor: theme.colors.black,
                                borderRadius: 40,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 10,
                              }}
                            >
                              <FontText small style={{ color: BACKGROUND_LIGHT_BEIGE_COLOR }}>
                                3
                              </FontText>
                            </View>
                            <FontText small style={{ color: theme.colors.black, flex: 1 }}>
                              {i18n.t('explore_checkup_detail_step_three')}
                            </FontText>
                          </View>
                        </View>
                      </View>
                    )}

                    <FontText h4 style={{ color: theme.colors.black, marginBottom: 12 }}>
                      {i18n.t('explore_checkup_detail_research')}
                    </FontText>
                    <View
                      style={{
                        backgroundColor: MEDIUM_BEIGE_COLOR,
                        borderRadius: 16,
                        padding: 16,
                      }}
                    >
                      <FontText small style={{ color: theme.colors.black }}>
                        {checkupData?.research}
                      </FontText>
                    </View>
                  </View>
                </>
              </View>
            </ScrollView>
          )}

          {handleButtonLabel() && !loading && (
            <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
              <PrimaryButton
                buttonStyle={{ width: '100%' }}
                onPress={() => void handleButtonPress()}
              >
                {!isPremium &&
                  (stateType === 'not_started' || stateType === 'partner_finished_only') && (
                    <PremiumLock
                      width={24}
                      height={24}
                      stroke={theme.colors.white}
                      style={{ marginBottom: 2, marginRight: 4 }}
                    />
                  )}
                <FontText style={{ color: theme.colors.white }}>{handleButtonLabel()}</FontText>
              </PrimaryButton>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}
