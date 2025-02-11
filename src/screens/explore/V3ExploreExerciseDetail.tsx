import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@rneui/themed';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { MainStackParamList } from '@app/types/navigation';
import {
  BACKGROUND_LIGHT_BEIGE_COLOR,
  MEDIUM_BEIGE_COLOR,
  EXERCISE_COLOR,
} from '@app/utils/colors';
import { logSupaErrors } from '@app/utils/errors';
import { localAnalytics } from '@app/utils/analytics';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { i18n } from '@app/localization/i18n';
import { showName } from '@app/utils/strings';
import V3LayeredGreyImage from '@app/components/explore/V3LayeredGreyImage';
import IconStar from '@app/icons/selected_star';
import PremiumLock from '@app/icons/premium_lock';
import { contentListScreen } from '@app/types/domain';
import { getContentImageFromId } from '@app/utils/content';
import ContentBuddyPurple from '@app/icons/content_buddy_purple';
import ContentBuddyPink from '@app/icons/content_buddy_pink';
import { PostgrestError } from '@supabase/supabase-js';
import { ContentFeedback } from '@app/components/content/ContentFeedback';

type Props = NativeStackScreenProps<MainStackParamList, 'V3ExploreExerciseDetail'>;

interface ExerciseData {
  id: number;
  slug: string;
  language: string;
  title: string;
  description: string;
}

interface ExerciseStepData {
  id: number;
  language: string;
  exercise_id: number;
  title: string;
  content: string;
}

export default function V3ExploreExerciseDetail({ route, navigation }: Props) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const exerciseId = route.params.id;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [exerciseData, setExerciseData] = useState<ExerciseData | null>(null);
  const [exerciseSteps, setExerciseSteps] = useState<ExerciseStepData[]>([]);
  const [finishedCount, setFinishedCount] = useState<number>(0);
  const [hasFinished, setHasFinished] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [showSelected, setShowSelected] = useState<boolean>(false);
  const [instanceId, setInstanceId] = useState<number | null>(null);

  const isFirstMount = useRef(true);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = authContext.userId;
      if (!userId) {
        setLoading(false);
        return;
      }

      localAnalytics().logEvent('V3ExerciseDetailLoadingStarted', {
        userId,
        exerciseId,
      });

      const [
        userRes,
        exerciseRes,
        jobsRes,
        jobExerciseResult,
        streakResult,
        premiumResult,
        instanceQuery,
        stepsQuery,
      ] = await Promise.all([
        supabase
          .from('user_profile')
          .select('user_id,first_name,partner_first_name,couple_id')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('content_exercise')
          .select('id,slug,language,title,description,couples_finished')
          .eq('id', exerciseId)
          .single(),
        supabase.rpc('get_my_jobs'),
        supabase
          .from('job_content_exercise')
          .select('job_slug')
          .eq('content_exercise_id', exerciseId),
        supabase.rpc('get_total_streak'),
        supabase.rpc('is_user_premium'),
        supabase
          .from('content_exercise_couple_instance')
          .select('id, finished_by')
          .eq('exercise_id', exerciseId)
          .maybeSingle(),
        supabase
          .from('content_exercise_step')
          .select('id,language,exercise_id,title,content')
          .eq('exercise_id', exerciseId)
          .order('id', { ascending: true }),
      ]);
      if (jobExerciseResult.error) throw jobExerciseResult.error;
      if (streakResult.error) throw streakResult.error;
      if (premiumResult.error) throw premiumResult.error;
      if (instanceQuery.error) throw instanceQuery.error;
      if (stepsQuery.error) throw stepsQuery.error;
      if (userRes.error) throw userRes.error;
      if (exerciseRes.error) throw exerciseRes.error;
      if (jobsRes.error) throw jobsRes.error;

      setName(showName(userRes.data.first_name));
      setPartnerName(showName(userRes.data.partner_first_name) || i18n.t('home_partner'));

      setExerciseData(exerciseRes.data);
      let isSelected = false;
      const userJobs = jobsRes.data || [];
      if (jobExerciseResult.data && jobExerciseResult.data.length > 0) {
        const exerciseSlugs = jobExerciseResult.data.map((row) => row.job_slug);
        isSelected = exerciseSlugs.some((slug: string) => userJobs.includes(slug));
      }
      setShowSelected(isSelected);
      const hasFinished = !!instanceQuery.data?.finished_by?.length;
      setHasFinished(hasFinished);
      setIsPremium(premiumResult.data || hasFinished || !!route.params.canActivate);

      setFinishedCount(exerciseRes.data.couples_finished);
      setExerciseSteps(stepsQuery.data || []);
      setInstanceId(instanceQuery.data?.id || null);
      localAnalytics().logEvent('V3ExerciseDetailLoaded', {
        userId,
        exerciseId,
      });
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [authContext.userId, exerciseId]);

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

  const DoneIndicator = () => (
    <View
      style={{
        marginTop: 25,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        padding: 12,
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        marginBottom: 8,
      }}
    >
      <ContentBuddyPurple width={32} height={32} />
      <ContentBuddyPink width={32} height={32} style={{ marginRight: 4 }} />
      <FontText small>
        {i18n.t('explore_content_detail_both_finished', {
          partnerName,
          name,
        })}
      </FontText>
    </View>
  );

  const handleStartPremium = () => {
    localAnalytics().logEvent('V3ExerciseDetailRedirectPremium', {
      userId: authContext.userId,
      exerciseId,
    });
    navigation.navigate('V3PremiumOffer', {
      refreshTimeStamp: new Date().toISOString(),
      isOnboarding: false,
    });
  };

  const handlePressFinish = async () => {
    try {
      localAnalytics().logEvent('V3ExerciseDetailMarkAsFinishedClicked', {
        userId: authContext.userId,
        exerciseId,
      });
      setLoading(true);
      const [streakRes, finishRes] = await Promise.all([
        supabase.rpc('record_streak_hit'),
        supabase.rpc('finish_exercise', {
          exercise_id: exerciseId,
        }),
      ]);
      if (streakRes.error) throw streakRes.error;
      if (finishRes.error) throw finishRes.error;
      if (streakRes.data === true) {
        navigation.navigate('V3ShowStreak', {
          refreshTimeStamp: new Date().toISOString(),
          nextScreen: 'V3ExploreExerciseDetail',
          screenParams: {
            id: exerciseId,
            refreshTimeStamp: new Date().toISOString(),
          },
        });
      } else {
        await fetchInitialData();
      }
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  };

  const getButtonLabel = () => {
    if (!isPremium) {
      return i18n.t('exercise_detail_unlock');
    }
    if (!hasFinished) {
      return i18n.t('detail_mark_as_finished');
    }
    return null;
  };

  const totalLength = exerciseSteps.reduce((acc, step) => acc + step.content.length, 0);
  const timeToComplete = Math.round((totalLength || 2000) / 200);

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: EXERCISE_COLOR }} />
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: theme.colors.white }}
      >
        <View style={{ flex: 1, backgroundColor: EXERCISE_COLOR }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <GoBackButton
              onPress={() => {
                localAnalytics().logEvent('V3ExerciseDetailBackClicked', {
                  userId: authContext.userId,
                  exerciseId,
                });
                if (route.params.fromHome) {
                  navigation.navigate('V3Home', {
                    refreshTimeStamp: new Date().toISOString(),
                  });
                } else if (navigation.canGoBack() && route.params.shouldGoBack) {
                  navigation.goBack();
                } else {
                  navigation.navigate(contentListScreen['exercise'], {
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
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
              }
            >
              <View style={{ alignItems: 'center', marginBottom: 24, paddingHorizontal: 20 }}>
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 40,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    marginBottom: 24,
                  }}
                >
                  <FontText small style={{ color: theme.colors.white }}>
                    {i18n.t('exercise_detail_label')}
                  </FontText>
                </View>
                <FontText
                  h2
                  style={{ color: theme.colors.white, textAlign: 'center', marginBottom: 8 }}
                >
                  {exerciseData?.title}
                </FontText>
                <>
                  <V3LayeredGreyImage image={getContentImageFromId(exerciseId)} />
                  <FontText small style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                    {i18n.t('explore_content_detail_finished_count', {
                      count: finishedCount,
                    })}
                  </FontText>
                </>
                {!loading && hasFinished && <DoneIndicator />}
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
                {!hasFinished && (
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
                  </View>
                )}
                {hasFinished && (
                  <ContentFeedback
                    title={i18n.t('content_feedback_exercise')}
                    contentType="exercise"
                    instanceId={instanceId}
                  />
                )}
                <FontText normal style={{ marginBottom: 20 }}>
                  {exerciseData?.description}
                </FontText>
                {isPremium &&
                  exerciseSteps.map((step, index) => (
                    <View key={step.id} style={{ marginBottom: 30 }}>
                      <FontText h3 style={{ marginBottom: 8 }}>
                        {index + 1}
                        {'. '}
                        {step.title}
                      </FontText>
                      <FontText normal>{step.content.replaceAll('<br>', '\n')}</FontText>
                    </View>
                  ))}
              </View>
            </ScrollView>
          )}
          {!!getButtonLabel() && !loading && (
            <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
              <PrimaryButton
                buttonStyle={{ width: '100%' }}
                onPress={() => {
                  if (!isPremium) {
                    handleStartPremium();
                  } else if (!hasFinished) {
                    void handlePressFinish();
                  }
                }}
              >
                {!isPremium && (
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
