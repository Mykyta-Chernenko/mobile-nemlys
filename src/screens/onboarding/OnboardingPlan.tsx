import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Image, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme, useThemeMode } from '@rneui/themed';
import { supabase } from '@app/api/initSupabase';
import { MainStackParamList } from '@app/types/navigation';
import { AuthContext } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';
import { logErrorsWithMessage, logSupaErrors } from '@app/utils/errors';
import { BACKGROUND_LIGHT_BEIGE_COLOR, MEDIUM_BEIGE_COLOR } from '@app/utils/colors';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import ContentBuddyPurple from '@app/icons/content_buddy_purple';
import ContentBuddyPink from '@app/icons/content_buddy_pink';
import SwooshScience from '@app/icons/swoosh_science';
import SelectedContentIcon from '@app/icons/selected_content';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { i18n } from '@app/localization/i18n';
import HomeQuestionIcon from '@app/icons/home_question';
import HomeTestIcon from '@app/icons/home_test';
import HomeGameIcon from '@app/icons/home_game';
import HomeArticleIcon from '@app/icons/home_article';
import HomeExerciseIcon from '@app/icons/home_exercise';
import HomeCheckupIcon from '@app/icons/home_checkup';
import { getJobsDetails } from '@app/utils/jobs';
import { showName } from '@app/utils/strings';
import { useFocusEffect } from '@react-navigation/native';
import PlanEdit from '@app/icons/plan_edit';
const PLAN_IMAGE = require('../../../assets/images/buddies_plan.png');
const iconMap: {
  [key: string]: React.ReactNode;
} = {
  question: <HomeQuestionIcon width={16} height={16} />,
  test: <HomeTestIcon width={16} height={16} />,
  game: <HomeGameIcon width={16} height={16} />,
  article: <HomeArticleIcon width={16} height={16} />,
  exercise: <HomeExerciseIcon width={16} height={16} />,
  checkup: <HomeCheckupIcon width={16} height={16} />,
};

type ContentCount = {
  test_count: number;
  game_count: number;
  question_count: number;
  exercise_count: number;
  article_count: number;
  checkup_count: number;
};

function interweaveArrays<T>(arrA: T[], arrB: T[]) {
  const results: T[] = [];
  const maxLen = Math.max(arrA.length, arrB.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < arrA.length) {
      results.push(arrA[i]);
    }
    if (i < arrB.length) {
      results.push(arrB[i]);
    }
  }
  return results;
}

export default function OnboardingPlan({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'OnboardingPlan'>) {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [myJobs, setMyJobs] = useState<string[]>([]);
  const [partnerJobs, setPartnerJobs] = useState<string[]>([]);
  const [bothJobs, setBothJobs] = useState<string[]>([]);
  const [contentCountMe, setContentCountMe] = useState<ContentCount | null>(null);
  const [contentCountPartner, setContentCountPartner] = useState<ContentCount | null>(null);
  const [contentCountBoth, setContentCountBoth] = useState<ContentCount | null>(null);

  const [name, setName] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'me' | 'partner' | 'both'>('me');

  const { theme } = useTheme();
  const { setMode } = useThemeMode();

  const isFirstMount = useRef(true);
  const jobsDetails = getJobsDetails(i18n);

  useFocusEffect(
    useCallback(() => {
      setMode('dark');
      return () => setMode('light');
    }, []),
  );

  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void fetchInitialData();
    }
  }, [route?.params?.refreshTimeStamp]);

  useEffect(() => {
    void fetchInitialData();
    isFirstMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInitialData = async () => {
    void localAnalytics().logEvent('OnboardingPlanLoading', {
      screen: 'OnboardingPlan',
      action: 'Loading',
      userId: authContext.userId,
    });
    try {
      setLoading(true);
      const [myJobsResult, partnerJobsResult, profileResult] = await Promise.all([
        supabase.rpc('get_my_jobs'),
        supabase.rpc('get_partner_jobs'),
        supabase
          .from('user_profile')
          .select('first_name, partner_first_name')
          .eq('user_id', authContext.userId!)
          .single(),
      ]);

      if (myJobsResult.error) {
        logSupaErrors(myJobsResult.error);
        throw myJobsResult.error;
      }
      if (partnerJobsResult.error) {
        logSupaErrors(partnerJobsResult.error);
        throw partnerJobsResult.error;
      }
      if (profileResult.error) {
        logSupaErrors(profileResult.error);
        throw profileResult.error;
      }

      const myJobsData = myJobsResult.data || [];
      const partnerJobsData = partnerJobsResult.data || [];
      setMyJobs(myJobsData);
      setPartnerJobs(partnerJobsData);
      setName(showName(profileResult.data.first_name));
      setPartnerName(showName(profileResult.data?.partner_first_name) || i18n.t('home_partner'));

      const combinedJobs = interweaveArrays(myJobsData, partnerJobsData).filter(
        (v, i, self) => self.indexOf(v) === i,
      );
      setBothJobs(combinedJobs);

      // now get content counts
      const [contentCountMeRes, contentCountPartnerRes, contentCountBothRes] = await Promise.all([
        myJobsData.length > 0
          ? supabase.rpc('get_content_count', { jobs: myJobsData })
          : Promise.resolve({ data: null, error: null }),
        partnerJobsData.length > 0
          ? supabase.rpc('get_content_count', { jobs: partnerJobsData })
          : Promise.resolve({ data: null, error: null }),
        combinedJobs.length > 0
          ? supabase.rpc('get_content_count', { jobs: combinedJobs })
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (contentCountMeRes.error) {
        logSupaErrors(contentCountMeRes.error);
        throw contentCountMeRes.error;
      }
      if (contentCountPartnerRes.error) {
        logSupaErrors(contentCountPartnerRes.error);
        throw contentCountPartnerRes.error;
      }
      if (contentCountBothRes.error) {
        logSupaErrors(contentCountBothRes.error);
        throw contentCountBothRes.error;
      }

      // fill states
      setContentCountMe(contentCountMeRes.data);
      setContentCountPartner(contentCountPartnerRes.data);
      setContentCountBoth(contentCountBothRes.data);

      setLoading(false);
      void localAnalytics().logEvent('OnboardingPlanLoaded', {
        screen: 'OnboardingPlan',
        action: 'Loading',
        userId: authContext.userId,
        combinedJobs,
        myJobsData,
        partnerJobsData,
      });
    } catch (e) {
      logErrorsWithMessage(e, (e as Error)?.message);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleChangePlan = () => {
    void localAnalytics().logEvent('OnboardingPlanChangePlanClicked', {
      screen: 'OnboardingPlan',
      action: 'ChangePlan',
      userId: authContext.userId,
    });
    navigation.navigate('ChangePlan', {
      isOnboarding: route.params.isOnboarding,
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  const handleGetStarted = () => {
    void localAnalytics().logEvent('OnboardingPlanContinueClicked', {
      screen: 'OnboardingPlanContinue',
      action: 'ContinueClicked',
      userId: authContext.userId,
    });
    if (route.params.isOnboarding) {
      navigation.navigate('OnboardingStatistics', { job: myJobs[0]! });
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
      }
    }
  };

  const renderSegmentedControl = () => {
    // “Me” if I have a plan, “Partner” if partner has a plan or is waiting, “For Two” if both
    const meSelected = activeTab === 'me';
    const partnerSelected = activeTab === 'partner';
    const bothSelected = activeTab === 'both';
    return (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: MEDIUM_BEIGE_COLOR,
          borderRadius: 8,
          padding: 4,
          marginBottom: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('me')}
          style={{
            flex: 1,
            backgroundColor: meSelected ? theme.colors.white : 'transparent',
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
          }}
        >
          <FontText
            small
            style={{
              color: meSelected ? theme.colors.black : theme.colors.grey5,
            }}
          >
            {name}
          </FontText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('partner')}
          style={{
            flex: 1,
            backgroundColor: partnerSelected ? theme.colors.white : 'transparent',
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            marginHorizontal: 4,
          }}
        >
          <FontText
            small
            style={{
              color: partnerSelected ? theme.colors.black : theme.colors.grey5,
            }}
          >
            {partnerName}
          </FontText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('both')}
          style={{
            flex: 1,
            backgroundColor: bothSelected ? theme.colors.white : 'transparent',
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
          }}
        >
          <FontText
            small
            style={{
              color: bothSelected ? theme.colors.black : theme.colors.grey5,
            }}
          >
            {i18n.t('plan_for_two_tab')}
          </FontText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderJobsSection = (jobs: string[], forBoth = false) => {
    // each job from the array, show icon + description + line
    if (!jobs || jobs.length === 0) return null;
    return (
      <View
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'column', justifyContent: 'center', marginBottom: 24 }}>
          {forBoth ? (
            <View style={{ flexDirection: 'row' }}>
              <ContentBuddyPurple />
              <ContentBuddyPink style={{ marginLeft: 8 }} />
            </View>
          ) : jobs === myJobs ? (
            <ContentBuddyPurple />
          ) : (
            <ContentBuddyPink />
          )}
          <FontText style={{ marginTop: 16 }} h4>
            {forBoth
              ? i18n.t('plan_your_and_partners_focus', { partnerName })
              : jobs === myJobs
              ? i18n.t('plan_your_focus')
              : i18n.t('plan_partners_focus', { partnerName })}
          </FontText>
        </View>
        {jobs.map((jobSlug, idx) => {
          const jobInfo = jobsDetails[jobSlug]!;
          const IconComp = jobInfo.icon;
          return (
            <View key={jobSlug}>
              <View style={{ flexDirection: 'row', marginTop: idx === 0 ? 8 : 16 }}>
                {!!IconComp && <IconComp width={16} height={16} style={{ marginRight: 8 }} />}
                <FontText style={{ flexShrink: 1 }}>
                  {jobInfo.title} — {jobInfo.description}
                </FontText>
              </View>
              {idx < jobs.length - 1 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                    marginVertical: 16,
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderContentCountSection = (countData: ContentCount | null) => {
    if (!countData) return null;
    const { test_count, game_count, question_count, exercise_count, article_count, checkup_count } =
      countData;
    const total =
      test_count + game_count + question_count + exercise_count + article_count + checkup_count;
    return (
      <View
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <SelectedContentIcon />
        <FontText style={{ marginTop: 16 }} h4>
          {i18n.t('plan_number_of_activities', {
            total,
            who:
              activeTab === 'both'
                ? name + ' & ' + partnerName
                : activeTab === 'partner'
                ? partnerName
                : name,
          })}
        </FontText>
        <View style={{ marginTop: 16 }}>
          {[
            { Icon: iconMap['test'], label: i18n.t('plan_tests'), value: test_count },
            { Icon: iconMap['game'], label: i18n.t('plan_games'), value: game_count },
            { Icon: iconMap['question'], label: i18n.t('plan_questions'), value: question_count },
            { Icon: iconMap['exercise'], label: i18n.t('plan_practices'), value: exercise_count },
            { Icon: iconMap['article'], label: i18n.t('plan_articles'), value: article_count },
            { Icon: iconMap['checkup'], label: i18n.t('plan_checkups'), value: checkup_count },
          ].map((item, i) => {
            return (
              <View
                key={`${item.label}_${i}`}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  borderBottomWidth: i < 5 ? 1 : 0,
                  borderBottomColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                  paddingVertical: 12,
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  {item.Icon}
                  <FontText style={{ marginLeft: 8 }}>{item.label}</FontText>
                </View>
                <FontText>{item.value}</FontText>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderScientificSection = (jobs: string[]) => {
    if (jobs.length === 0) return null;
    return (
      <View
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <SwooshScience style={{ marginBottom: 16 }} />
        <FontText style={{ marginBottom: 8 }} h4>
          {i18n.t('plan_scientific_evidence')}
        </FontText>
        {jobs.map((jobSlug, idx) => {
          const jobInfo = jobsDetails[jobSlug]!;
          const IconComp = jobInfo.icon;
          if (!jobInfo) return null;
          return (
            <View key={jobSlug}>
              <View style={{ flexDirection: 'row', marginTop: idx === 0 ? 8 : 16 }}>
                {!!IconComp && <IconComp width={16} height={16} style={{ marginRight: 8 }} />}
                <FontText style={{ flexShrink: 1 }}>
                  {jobInfo.title} — {jobInfo.research}
                </FontText>
              </View>
              {idx < jobs.length - 1 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                    marginVertical: 16,
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderBottomChangePlan = () => {
    return (
      <View
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          gap: 16,
        }}
      >
        <PlanEdit />

        <FontText h4>{i18n.t('plan_can_i_change')}</FontText>
        <FontText style={{ marginBottom: 16 }}>{i18n.t('plan_you_can_change_later')}</FontText>
        <SecondaryButton
          onPress={() => handleChangePlan()}
          containerStyle={{ borderRadius: 40 }}
          buttonStyle={{ borderRadius: 40, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}
        >
          <FontText>{i18n.t('plan_change_now')}</FontText>
        </SecondaryButton>
      </View>
    );
  };

  const renderGetStartedButton = () => {
    return (
      <PrimaryButton
        containerStyle={{
          marginTop: 8,
          marginBottom: 8,
          position: 'absolute',
          bottom: 0,
          width: '100%',
          paddingHorizontal: 20,
        }}
        onPress={() => handleGetStarted()}
      >
        <FontText style={{ color: theme.colors.white }}>{i18n.t('continue')}</FontText>
      </PrimaryButton>
    );
  };

  const renderMeTab = () => {
    if (myJobs.length === 0) {
      // no plan for me
      return (
        <View style={{ alignItems: 'center', marginTop: 50 }}>
          <FontText>{i18n.t('plan_no_personal_plan')}</FontText>
        </View>
      );
    }
    return (
      <>
        {renderJobsSection(myJobs)}
        {renderContentCountSection(contentCountMe)}
        {renderScientificSection(myJobs)}
        {renderBottomChangePlan()}
      </>
    );
  };

  const renderEmptySuggestions = () => {
    return (
      <View
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
          <SelectedContentIcon />

          <FontText small style={{ marginTop: 16 }}>
            {i18n.t('plan_suggestions_after_partner', { partnerName })}
          </FontText>
        </View>
      </View>
    );
  };
  const renderPartnerTab = () => {
    if (partnerJobs.length === 0) {
      return (
        <View>
          <View
            style={{
              backgroundColor: theme.colors.white,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
              <ContentBuddyPink></ContentBuddyPink>
              <FontText style={{ marginTop: 16 }} h4>
                {i18n.t('plan_waiting_for_partner', { partnerName })}
              </FontText>
              <FontText small style={{ marginTop: 10 }}>
                {i18n.t('plan_partner_will_appear_here', { partnerName })}
              </FontText>
            </View>
          </View>
          {renderEmptySuggestions()}
        </View>
      );
    }
    return (
      <>
        {renderJobsSection(partnerJobs)}
        {renderContentCountSection(contentCountPartner)}
        {renderScientificSection(partnerJobs)}
      </>
    );
  };

  const renderBothTab = () => {
    // if either is empty => "you’ll see suggestions after partner answers"
    if (myJobs.length === 0 || partnerJobs.length === 0) {
      return renderEmptySuggestions();
    }
    return (
      <>
        {renderJobsSection(bothJobs, true)}
        {renderContentCountSection(contentCountBoth)}
        {renderScientificSection(bothJobs)}
      </>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <Loading light={true} />;
    }
    return (
      <View
        style={{
          flex: 1,
          paddingHorizontal: 20,
          marginTop: 16,
          backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 20,
          paddingBottom: 80,
        }}
      >
        {renderSegmentedControl()}

        {activeTab === 'me' && renderMeTab()}
        {activeTab === 'partner' && renderPartnerTab()}
        {activeTab === 'both' && renderBothTab()}
      </View>
    );
  };

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.black }} />
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}
      >
        <View style={{ flex: 1, backgroundColor: theme.colors.black }}>
          <View style={{ paddingHorizontal: 20, marginBottom: 5 }}>
            <GoBackButton
              theme="black"
              onPress={() => {
                if (route.params.isOnboarding) {
                  navigation.canGoBack() && navigation.goBack();
                  // skip Analyzing screen
                  navigation.canGoBack() && navigation.goBack();
                } else {
                  navigation.replace('Home', { refreshTimeStamp: new Date().toISOString() });
                }
              }}
            />
          </View>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
            }
          >
            {!loading && (
              <>
                <Image
                  source={PLAN_IMAGE}
                  style={{ width: '45%', resizeMode: 'contain', alignSelf: 'center' }}
                />
                <View>
                  <View style={{ alignItems: 'center', marginBottom: 24 }}>
                    <FontText h2 style={{ color: theme.colors.white, textAlign: 'center' }}>
                      {i18n.t('plan_personalized_plan_ready')}
                    </FontText>
                  </View>
                </View>
              </>
            )}
            {renderContent()}
          </ScrollView>
          {!loading && route.params.isOnboarding && renderGetStartedButton()}
        </View>
      </SafeAreaView>
    </>
  );
}
