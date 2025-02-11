import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import { i18n } from '@app/localization/i18n';
import { logSupaErrors } from '@app/utils/errors';
import { localAnalytics } from '@app/utils/analytics';
import { useTheme } from '@rneui/themed';
import { MainStackParamList } from '@app/types/navigation';
import { BACKGROUND_LIGHT_BEIGE_COLOR, MEDIUM_BEIGE_COLOR } from '@app/utils/colors';
import ContentTestIcon from '@app/icons/content_test';
import IconStar from '@app/icons/selected_star';
import ContentBuddyPink from '@app/icons/content_buddy_pink';
import ContentBuddyPurple from '@app/icons/content_buddy_purple';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { handleRemindPartner } from '@app/utils/sendNotification';
import PremiumLock from '@app/icons/premium_lock';
import { contentListScreen, contentTypeBackground } from '@app/types/domain';
import { showName } from '@app/utils/strings';
import V3LayeredGreyImage from '@app/components/explore/V3LayeredGreyImage';
import { getContentImageFromId } from '@app/utils/content';
import { PostgrestError } from '@supabase/supabase-js';
import { ContentFeedback } from '@app/components/content/ContentFeedback';

type Props = NativeStackScreenProps<MainStackParamList, 'V3ExploreTestDetail'>;

interface TestResult {
  id: number;
  title: string;
  description: string;
  advice: string;
}

interface CombinationResult {
  id: number;
  description: string;
  advice: string;
  result_1_id: number;
  result_2_id: number;
}

interface TestData {
  id: number;
  slug: string;
  title: string;
  description: string;
  research: string;
}

interface ResultInstanceData {
  instance_test_id: number;
  result_id: number;
  user_id: string;
}

export default function V3ExploreTestDetail({ route, navigation }: Props) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const testId = route.params.id;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [finishedCount, setFinishedCount] = useState<number>(0);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [myResult, setMyResult] = useState<TestResult | null>(null);
  const [partnerResult, setPartnerResult] = useState<TestResult | null>(null);
  const [combinationResult, setCombinationResult] = useState<CombinationResult | null>(null);
  const [partnerName, setPartnerName] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [stateType, setStateType] = useState<
    'not_started' | 'both_finished' | 'me_finished_only' | 'partner_finished_only'
  >('not_started');
  const [tab, setTab] = useState<'me' | 'partner' | 'both'>('me');
  const [showSelected, setShowSelected] = useState<boolean>(false);
  const [instanceId, setInstanceId] = useState<number | null>(null);

  const isFirstMount = useRef(true);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setTab('me');
      const userId = authContext.userId;
      if (!userId) {
        setLoading(false);
        return;
      }

      localAnalytics().logEvent('V3TestDetailLoadingStarted', {
        userId,
        testId,
      });

      const [
        userProfileRes,
        testRes,
        jobResult,
        jobTestResult,
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
          .from('content_test')
          .select(
            `
          id,
          slug,
          title,
          description,
          research,
          language,
          couples_finished
        `,
          )
          .eq('id', testId)
          .single(),

        supabase.rpc('get_my_jobs'),

        supabase.from('job_content_test').select('job_slug').eq('content_test_id', testId),

        supabase.rpc('get_total_streak'),

        supabase.rpc('is_user_premium'),

        supabase
          .from('content_test_question')
          .select('id', { count: 'exact' })
          .eq('test_id', testId),

        supabase.from('content_test_question').select('id, title').eq('test_id', testId),

        supabase
          .from('content_test_couple_instance')
          .select(
            `
          id,
          finished_by,
          content_test_couple_instance_result (
            id,
            result_id,
            user_id,
            instance_test_id,
            content_test_result (
              id,
              title,
              description,
              advice,
              test_id,
              content_test_combination!content_test_combination_result_1_id_fkey (
                id,
                description,
                advice,
                result_1_id,
                result_2_id
              )
            )
          )
        `,
          )
          .eq('test_id', testId)
          .maybeSingle(),
      ]);

      // Handle errors
      if (userProfileRes.error) throw userProfileRes.error;
      if (testRes.error) throw testRes.error;
      if (jobResult.error) throw jobResult.error;
      if (jobTestResult.error) throw jobTestResult.error;
      if (streakResult.error) throw streakResult.error;
      if (premiumResult.error) throw premiumResult.error;
      if (questionCountQuery.error) throw questionCountQuery.error;
      if (questionListQuery.error) throw questionListQuery.error;
      if (instanceQuery.error) throw instanceQuery.error;

      const { data: userProfile } = userProfileRes;
      const { data: testData } = testRes;
      const { data: userJobs } = jobResult;
      const { data: jobTests } = jobTestResult;
      const { data: premiumStatus } = premiumResult;
      const { count: totalQuestions } = questionCountQuery;
      const { data: instanceData } = instanceQuery;
      setInstanceId(instanceData?.id || null);
      setName(showName(userProfile.first_name));
      setPartnerName(showName(userProfile.partner_first_name) || i18n.t('home_partner'));

      setTestData({
        id: testData.id,
        slug: testData.slug,
        title: testData.title,
        description: testData.description,
        research: testData.research,
      });

      const isRecommended =
        jobTests && jobTests.length > 0 && jobTests.some((job) => userJobs.includes(job.job_slug));
      setShowSelected(isRecommended);

      setFinishedCount(testData.couples_finished);
      setQuestionCount(totalQuestions || 10);

      let instanceId: null | number = null;
      let userHasFinished = false;
      let partnerHasFinished = false;
      let myResult: {
        id: number;
        title: string;
        description: string;
        advice: string;
        combo: {
          id: number;
          description: string;
          advice: string;
          result_1_id: number;
          result_2_id: number;
        }[];
      } | null = null;
      let partnerResult: {
        id: number;
        title: string;
        description: string;
        advice: string;
        combo: {
          id: number;
          description: string;
          advice: string;
          result_1_id: number;
          result_2_id: number;
        }[];
      } | null = null;
      let combo: {
        id: number;
        description: string;
        advice: string;
        result_1_id: number;
        result_2_id: number;
      } | null = null;

      if (instanceData) {
        const finishedBy = instanceData.finished_by || [];
        userHasFinished = finishedBy.includes(userId);
        partnerHasFinished = finishedBy.some((uid) => uid !== userId);
        instanceId = instanceData.id;

        const results = instanceData.content_test_couple_instance_result;
        for (let index = 0; index < results.length; index++) {
          const res = results[index];
          if (res?.user_id === userId) {
            myResult = res.content_test_result
              ? {
                  id: res.content_test_result.id,
                  title: res.content_test_result.title,
                  description: res.content_test_result.description,
                  advice: res.content_test_result.advice,
                  combo: res.content_test_result.content_test_combination,
                }
              : null;
          } else {
            partnerResult = res.content_test_result
              ? {
                  id: res.content_test_result.id,
                  title: res.content_test_result.title,
                  description: res.content_test_result.description,
                  advice: res.content_test_result.advice,
                  combo: res.content_test_result.content_test_combination,
                }
              : null;
          }
        }
      }

      if (myResult && partnerResult) {
        const low = Math.min(myResult.id, partnerResult.id);
        const high = Math.max(myResult.id, partnerResult.id);
        combo =
          myResult.combo
            .concat(partnerResult.combo)
            .find((comb) => comb.result_1_id === low && comb.result_2_id === high) || null;
      }

      setMyResult(myResult);
      setPartnerResult(partnerResult);
      setCombinationResult(combo);

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

      setIsPremium(premiumStatus || stateType !== 'not_started' || !!route.params.canActivate);
      setStateType(stateType);

      localAnalytics().logEvent('V3TestDetailLoaded', {
        userId,
        testId,
        stateType,
        myResult: !!myResult,
        partnerResult: !!partnerResult,
        combo: !!combo,
      });
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [authContext.userId, testId, stateType]);

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

  const handleStartTest = () => {
    localAnalytics().logEvent('V3ExploreTestDetailStartClicked', {
      userId: authContext.userId,
      testId,
      isPremium,
      id: route.params.id,
    });
    if (isPremium) {
      navigation.navigate('V3TestStart', {
        id: testId,
        refreshTimeStamp: new Date().toISOString(),
        fromHome: route.params.fromHome,
      });
    } else {
      localAnalytics().logEvent('V3ExploreTestDetailRedirectPremium', {
        userId: authContext.userId,
      });
      navigation.navigate('V3PremiumOffer', {
        refreshTimeStamp: new Date().toISOString(),
        isOnboarding: false,
      });
    }
  };

  const backgroundColor = contentTypeBackground['test'];

  const getButtonLabel = () => {
    if (showMainContent) {
      return isPremium
        ? i18n.t('explore_content_detail_test_start_test')
        : i18n.t('explore_content_detail_start_free_trial');
    }
    if (stateType === 'me_finished_only') {
      return i18n.t('question_answer_remind_partner', { partnerName });
    }
    return null;
  };

  const showMyResultCard = (result: TestResult | null, name: string) => {
    return (
      <>
        <View
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            padding: 20,
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ContentBuddyPurple width={32} height={32} />
          </View>
          <FontText h3 style={{ marginTop: 10, marginBottom: 10 }}>
            {result?.title}
          </FontText>
          <FontText normal style={{ marginBottom: 12 }}>
            {result?.description}
          </FontText>
        </View>
        <View
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            padding: 20,
            marginBottom: 8,
          }}
        >
          <FontText small style={{ opacity: 0.7, marginBottom: 10 }}>
            {i18n.t('explore_content_detail_test_suggestion_for_user', { name })}
          </FontText>
          <FontText normal>{result?.advice}</FontText>
        </View>
      </>
    );
  };

  const showPartnerResultCard = (result: TestResult | null, name: string) => {
    if (!result)
      return (
        <>
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 12,
              padding: 20,
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ContentBuddyPink width={32} height={32} />
            </View>
            <FontText h3 style={{ marginTop: 10, marginBottom: 10 }}>
              {i18n.t('explore_content_detail_test_waiting_for_answer', { partnerName })}
            </FontText>
            <FontText normal style={{ marginBottom: 12 }}>
              {i18n.t('explore_content_detail_test_waiting_for_answer_description', {
                partnerName,
              })}
            </FontText>
          </View>
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 12,
              padding: 20,
              marginBottom: 8,
            }}
          >
            <FontText small style={{ opacity: 0.7, marginBottom: 10 }}>
              {i18n.t('explore_content_detail_test_suggestion_for_user', { name: partnerName })}
            </FontText>
            <FontText normal>
              {i18n.t('explore_content_detail_test_suggestion_after_partner', { partnerName })}
            </FontText>
          </View>
        </>
      );

    return (
      <>
        <View
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            padding: 20,
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ContentBuddyPink width={32} height={32} />
          </View>
          <FontText h3 style={{ marginTop: 10, marginBottom: 10 }}>
            {result?.title}
          </FontText>
          <FontText normal style={{ marginBottom: 12 }}>
            {result?.description}
          </FontText>
        </View>
        <View
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            padding: 20,
            marginBottom: 8,
          }}
        >
          <FontText small style={{ opacity: 0.7, marginBottom: 10 }}>
            {i18n.t('explore_content_detail_test_suggestion_for_user', { name: partnerName })}
          </FontText>
          <FontText normal>{result?.advice}</FontText>
        </View>
      </>
    );
  };

  const showCombinationResultCard = (
    myResult: TestResult | null,
    partnerResult: TestResult | null,
    combo: CombinationResult | null,
  ) => {
    if (!combo)
      return (
        <>
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 12,
              padding: 20,
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ContentBuddyPurple width={32} height={32} />
              <ContentBuddyPink width={32} height={32} />
            </View>
            <FontText h3 style={{ marginTop: 10, marginBottom: 10 }}>
              {i18n.t('explore_content_detail_test_waiting_for_answer', { partnerName })}
            </FontText>
            <FontText normal style={{ marginBottom: 12 }}>
              {i18n.t('explore_content_detail_test_waiting_for_answer_description_both')}
            </FontText>
          </View>
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 12,
              padding: 20,
              marginBottom: 8,
            }}
          >
            <FontText small style={{ opacity: 0.7, marginBottom: 10 }}>
              {i18n.t('explore_content_detail_test_suggestion_for_both')}
            </FontText>
            <FontText normal>
              {i18n.t('explore_content_detail_test_suggestion_after_partner', { partnerName })}
            </FontText>
          </View>
        </>
      );
    return (
      <>
        <View
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            padding: 20,
            marginBottom: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <ContentBuddyPurple width={32} height={32} />
            <ContentBuddyPink width={32} height={32} />
          </View>
          <FontText h3 style={{ marginTop: 10, marginBottom: 10 }}>
            {myResult?.title} & {partnerResult?.title}
          </FontText>
          <FontText normal style={{ marginBottom: 12 }}>
            {combo?.description}
          </FontText>
        </View>
        <View
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 12,
            padding: 20,
            marginBottom: 8,
          }}
        >
          <FontText small style={{ opacity: 0.7, marginBottom: 10 }}>
            {i18n.t('explore_content_detail_test_suggestion_for_both', { name: partnerName })}
          </FontText>
          <FontText normal>{combo?.advice}</FontText>
        </View>
      </>
    );
  };

  const showMainContent = stateType === 'not_started' || stateType === 'partner_finished_only';
  const showTabs = stateType === 'me_finished_only' || stateType === 'both_finished';
  const hideTopImage = showTabs;

  const handleButtonPress = async () => {
    if (showMainContent) {
      handleStartTest();
    } else if (stateType === 'me_finished_only') {
      await handleRemindPartner(
        'TestDetail',
        partnerName,
        authContext.userId!,
        setLoading,
        {
          test_id: testId,
          type: 'remind_test',
        },
        navigation,
        'V3ExploreTestDetail',
        {
          id: testId,
          refreshTimeStamp: new Date().toISOString(),
          shouldGoBack: route.params.shouldGoBack,
          fromHome: route.params.fromHome,
        },
        true,
        true,
      );
    }
  };
  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor }} />
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}
      >
        <View style={{ flex: 1, backgroundColor }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 0 }}>
            <GoBackButton
              onPress={() => {
                localAnalytics().logEvent('V3TestDetailBackClicked', {
                  userId: authContext.userId,
                  testId,
                });
                if (route.params.fromHome) {
                  navigation.navigate('V3Home', {
                    refreshTimeStamp: new Date().toISOString(),
                  });
                } else if (navigation.canGoBack() && route.params.shouldGoBack) {
                  navigation.goBack();
                } else {
                  navigation.navigate(contentListScreen['test'], {
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
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
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
                    <ContentTestIcon width={12} height={12} fill="#FFF" stroke="#FFF" />
                    <FontText small style={{ color: theme.colors.white }}>
                      {i18n.t('explore_content_detail_test_label_test')}
                    </FontText>
                  </View>
                </View>
                <FontText
                  h2
                  style={{ color: theme.colors.white, textAlign: 'center', marginBottom: 24 }}
                >
                  {testData?.title}
                </FontText>

                {!hideTopImage && (
                  <>
                    <V3LayeredGreyImage image={getContentImageFromId(testId)} />
                    <FontText small style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                      {i18n.t('explore_content_detail_finished_count', {
                        count: finishedCount,
                      })}
                    </FontText>
                  </>
                )}

                {(stateType === 'both_finished' || stateType === 'me_finished_only') && (
                  <View style={{ width: '100%', marginBottom: 24 }}>
                    <View style={{ alignItems: 'center', marginBottom: 16 }}>
                      <FontText
                        small
                        style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}
                      >
                        {i18n.t('explore_content_detail_test_results')}
                      </FontText>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'stretch',
                        gap: 8,
                        width: '100%',
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: theme.colors.white,
                          borderRadius: 12,
                          paddingVertical: 20,
                          paddingHorizontal: 16,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 16,
                        }}
                      >
                        <ContentBuddyPurple width={32} height={32} />
                        <View style={{ width: '100%', alignItems: 'center', gap: 8 }}>
                          <FontText style={{ textAlign: 'center' }}>{myResult?.title}</FontText>
                          <FontText style={{ textAlign: 'center', opacity: 0.5 }}>{name}</FontText>
                        </View>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          backgroundColor:
                            stateType === 'both_finished' ? theme.colors.white : '#8954CD',
                          borderRadius: 12,
                          paddingVertical: 20,
                          paddingHorizontal: 16,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 16,
                        }}
                      >
                        <ContentBuddyPink width={32} height={32} />
                        <View style={{ width: '100%', alignItems: 'center', gap: 8 }}>
                          <FontText
                            style={{
                              textAlign: 'center',
                              color:
                                stateType === 'both_finished'
                                  ? theme.colors.black
                                  : theme.colors.white,
                            }}
                          >
                            {stateType === 'both_finished'
                              ? partnerResult?.title
                              : i18n.t('explore_content_detail_test_waiting_for_answer_header')}
                          </FontText>
                          <FontText
                            style={{
                              textAlign: 'center',
                              opacity: 0.5,
                              color:
                                stateType === 'both_finished'
                                  ? theme.colors.black
                                  : theme.colors.white,
                            }}
                          >
                            {partnerName}
                          </FontText>
                        </View>
                      </View>
                    </View>
                  </View>
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
                      {i18n.t('explore_content_detail_test_waiting_result_card', {
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
                {showMainContent && (
                  <>
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
                    <FontText normal style={{ color: theme.colors.black, marginBottom: 40 }}>
                      {testData?.description}
                    </FontText>
                  </>
                )}
                {instanceId && !showMainContent && (
                  <ContentFeedback
                    title={i18n.t('content_feedback_test')}
                    contentType="test"
                    instanceId={instanceId}
                  />
                )}

                {showTabs && (
                  <View
                    style={{
                      flexDirection: 'row',
                      backgroundColor: MEDIUM_BEIGE_COLOR,
                      borderRadius: 8,
                      padding: 5,
                      marginBottom: 16,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        backgroundColor: tab === 'me' ? theme.colors.white : 'transparent',
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => setTab('me')}
                    >
                      <FontText
                        small
                        style={{
                          color: tab === 'me' ? theme.colors.black : theme.colors.grey5,
                        }}
                      >
                        {name}
                      </FontText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        backgroundColor: tab === 'partner' ? theme.colors.white : 'transparent',
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => setTab('partner')}
                    >
                      <FontText
                        small
                        style={{
                          color: tab === 'partner' ? theme.colors.black : theme.colors.grey5,
                        }}
                      >
                        {partnerName}
                      </FontText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 8,
                        backgroundColor: tab === 'both' ? theme.colors.white : 'transparent',
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onPress={() => setTab('both')}
                    >
                      <FontText
                        small
                        style={{
                          color: tab === 'both' ? theme.colors.black : theme.colors.grey5,
                        }}
                      >
                        {i18n.t('explore_content_detail_test_for_two')}
                      </FontText>
                    </TouchableOpacity>
                  </View>
                )}

                {showTabs && tab === 'me' && <>{showMyResultCard(myResult, name)}</>}
                {showTabs && tab === 'partner' && showPartnerResultCard(partnerResult, partnerName)}
                {showTabs &&
                  tab === 'both' &&
                  showCombinationResultCard(myResult, partnerResult, combinationResult)}

                {showMainContent && (
                  <>
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
                              borderRadius: 100,
                              height: 24,
                              width: 24,
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: theme.colors.black,
                              marginRight: 10,
                            }}
                          >
                            <FontText small style={{ color: BACKGROUND_LIGHT_BEIGE_COLOR }}>
                              1
                            </FontText>
                          </View>
                          <FontText small style={{ color: theme.colors.black }}>
                            {i18n.t('explore_content_detail_test_step_one', {
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
                              borderRadius: 100,
                              height: 24,
                              width: 24,
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: theme.colors.black,
                              marginRight: 10,
                            }}
                          >
                            <FontText small style={{ color: BACKGROUND_LIGHT_BEIGE_COLOR }}>
                              2
                            </FontText>
                          </View>
                          <FontText small style={{ color: theme.colors.black, flex: 1 }}>
                            {i18n.t('explore_content_detail_test_step_two', {
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
                              borderRadius: 100,
                              height: 24,
                              width: 24,
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: theme.colors.black,
                              marginRight: 10,
                            }}
                          >
                            <FontText small style={{ color: BACKGROUND_LIGHT_BEIGE_COLOR }}>
                              3
                            </FontText>
                          </View>
                          <FontText small style={{ color: theme.colors.black, flex: 1 }}>
                            {i18n.t('explore_content_detail_test_step_three')}
                          </FontText>
                        </View>
                      </View>
                    </View>
                  </>
                )}

                <View style={{ marginBottom: 40 }}>
                  {showTabs && (
                    <FontText
                      normal
                      style={{ marginTop: 40, color: theme.colors.black, marginBottom: 40 }}
                    >
                      {testData?.description}
                    </FontText>
                  )}
                  <FontText h4 style={{ color: theme.colors.black, marginBottom: 12 }}>
                    {i18n.t('explore_content_detail_test_research')}
                  </FontText>
                  <View
                    style={{ backgroundColor: MEDIUM_BEIGE_COLOR, borderRadius: 16, padding: 16 }}
                  >
                    <FontText small style={{ color: theme.colors.black, flex: 1 }}>
                      {testData?.research}
                    </FontText>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
          {getButtonLabel() && !loading && (
            <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
              <PrimaryButton
                buttonStyle={{ width: '100%' }}
                onPress={() => void handleButtonPress()}
              >
                {!isPremium && stateType === 'not_started' && (
                  <PremiumLock
                    width={24}
                    height={24}
                    stroke={theme.colors.white}
                    style={{ marginBottom: 2, marginRight: 4 }}
                  />
                )}
                <FontText style={{ color: theme.colors.white }}>{getButtonLabel()}</FontText>
              </PrimaryButton>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}
