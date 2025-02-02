import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { FontText } from '@app/components/utils/FontText';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';
import { logSupaErrors } from '@app/utils/errors';
import { Loading } from '@app/components/utils/Loading';
import { i18n } from '@app/localization/i18n';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { MainStackParamList } from '@app/types/navigation';
import ContentQuestionIcon from '@app/icons/content_question';
import IconStar from '@app/icons/selected_star';
import {
  BACKGROUND_LIGHT_BEIGE_COLOR,
  QUESTION_COLOR,
  MEDIUM_BEIGE_COLOR,
  MEDIUM_VIOLET_COLOR,
  BADGE_COLOR,
} from '@app/utils/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PostgrestError } from '@supabase/supabase-js';

const JOBS = [
  'getting_to_know_partner',
  'having_fun_and_entertainment',
  'having_and_discussing_sex',
  'understanding_mutual_compatibility',
  'improving_communication',
  'solving_relationship_problems',
  'having_meaningful_conversations',
  'discussing_difficult_topics',
  'planning_for_future',
  'building_trust',
  'overcoming_differences',
  'improving_relationship_satisfaction',
  'exploring_feelings',
  'having_new_experiences',
  'preparing_for_cohabitation',
  'preparing_for_intimacy',
  'discussing_religions',
  'improving_honesty_and_openness',
  'learning_relationship_skills',
  'discussing_finances',
  'enhancing_love_and_affection',
  'rekindling_passion',
  'introducing_healthy_habits',
  'preparing_for_children',
  'preparing_for_marriage',
];

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'V3ExploreQuestionList'>) {
  const { theme } = useTheme();
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation]);
  const authContext = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userJobs, setUserJobs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<'selected' | 'all'>('selected');
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});

  const isFirstMount = useRef(true);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);

      const [userJobsResult, questionCountsResult] = await Promise.all([
        supabase.rpc('get_my_jobs'),
        supabase.rpc('get_question_job_count'),
      ]);

      if (userJobsResult.error) throw userJobsResult.error;
      if (questionCountsResult.error) throw questionCountsResult.error;

      setUserJobs(userJobsResult.data || []);

      const counts = questionCountsResult.data.reduce((acc, { job, count }) => {
        acc[job] = count;
        return acc;
      }, {} as Record<string, number>);
      setQuestionCounts(counts);

      void localAnalytics().logEvent('QuestionListLoaded', {
        userId: authContext.userId,
        hasJobs: userJobsResult.data.length > 0,
      });
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [authContext.userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void fetchInitialData();
    }
  }, [route?.params?.refreshTimeStamp]);

  useEffect(() => {
    void fetchInitialData();
    isFirstMount.current = false;
  }, []);

  const goBack = () => {
    void localAnalytics().logEvent('QuestionListGoBack', {
      userId: authContext.userId,
    });
    if (navigation) {
      navigation.navigate('V3Explore', { refreshTimeStamp: new Date().toISOString() });
    }
  };

  const handleJobPress = (job: string) => {
    void localAnalytics().logEvent('QuestionListJobClicked', {
      userId: authContext.userId,
      job,
    });
    if (navigation) {
      navigation.navigate('V3ExploreQuestionListJob', {
        job,
        refreshTimeStamp: new Date().toISOString(),
      });
    }
  };

  const handleTabChange = (tab: 'selected' | 'all') => {
    setSelectedTab(tab);
    void localAnalytics().logEvent('QuestionListTabChanged', {
      userId: authContext.userId,
      tab,
    });
  };

  const filteredJobs =
    selectedTab === 'selected' ? JOBS.filter((job) => userJobs.includes(job)) : JOBS;

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: QUESTION_COLOR }} />
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}
      >
        <View
          style={{
            flexDirection: 'column',
            flex: 1,
            backgroundColor: QUESTION_COLOR,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 10,
            }}
          >
            <GoBackButton onPress={goBack} theme={'black'} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 40,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ContentQuestionIcon />
              </View>
              <FontText h2 style={{ color: theme.colors.white, marginTop: 15 }}>
                {i18n.t('question_list_header_title', { count: JOBS.length })}
              </FontText>
              <FontText
                small
                style={{
                  marginTop: 15,
                  marginBottom: 30,
                  color: 'rgba(255,255,255,0.7)',
                  textAlign: 'center',
                }}
              >
                {i18n.t('question_list_header_description')}
              </FontText>
            </View>
            <View style={{ width: 24 }} />
          </View>

          <View
            style={{
              backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
              flex: 1,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              paddingBottom: 0,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: MEDIUM_BEIGE_COLOR,
                borderRadius: 8,
                padding: 5,
              }}
            >
              <TouchableOpacity
                onPress={() => handleTabChange('selected')}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  backgroundColor: selectedTab === 'selected' ? theme.colors.white : 'transparent',
                  borderRadius: 8,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <IconStar
                  fill={selectedTab === 'selected' ? theme.colors.black : MEDIUM_VIOLET_COLOR}
                />
                <FontText
                  small
                  style={{
                    marginTop: 2,
                    color: selectedTab === 'selected' ? theme.colors.black : MEDIUM_VIOLET_COLOR,
                  }}
                >
                  {i18n.t('explore_content_list_selected')}
                </FontText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleTabChange('all')}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  backgroundColor: selectedTab === 'all' ? theme.colors.white : 'transparent',
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontText
                  small
                  style={{
                    color: selectedTab === 'all' ? theme.colors.black : MEDIUM_VIOLET_COLOR,
                  }}
                >
                  {i18n.t('explore_content_list_all')}
                </FontText>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ flexGrow: 1, marginTop: 10, paddingBottom: 40 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
              }
            >
              {filteredJobs.map((job) => (
                <TouchableOpacity key={job} onPress={() => void handleJobPress(job)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: theme.colors.white,
                      borderRadius: 16,
                      padding: 8,
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        paddingLeft: 12,
                        marginRight: 5,
                        display: 'flex',
                        justifyContent: 'center',
                        flexDirection: 'column',
                      }}
                    >
                      <FontText>{i18n.t(job)}</FontText>
                      <FontText small style={{ color: MEDIUM_VIOLET_COLOR, marginTop: 4 }}>
                        {i18n.t('question_list_question_count', {
                          count: questionCounts[job] || 0,
                        })}
                      </FontText>
                    </View>

                    <View
                      style={{
                        width: 76,
                        height: 102,
                        borderRadius: 8,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          gap: 4,
                        }}
                      >
                        {userJobs.includes(job) && (
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 40,
                              backgroundColor: BADGE_COLOR,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <IconStar width={14} height={14} fill={theme.colors.black} />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
