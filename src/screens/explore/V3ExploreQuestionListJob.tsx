import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useThemeMode } from '@rneui/themed';
import { AuthContext } from '@app/provider/AuthProvider';
import { supabase } from '@app/api/initSupabase';
import { localAnalytics } from '@app/utils/analytics';
import { logSupaErrors } from '@app/utils/errors';
import { i18n } from '@app/localization/i18n';
import { BACKGROUND_LIGHT_BEIGE_COLOR, BADGE_COLOR, QUESTION_COLOR } from '@app/utils/colors';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import PremiumCrown from '@app/icons/premium_crown';
import ContentQuestionIcon from '@app/icons/content_question';
import { PostgrestError } from '@supabase/supabase-js';
import { showName } from '@app/utils/strings';

type QuestionState = 'me_answered' | 'partner_answered' | 'me_partner_answered';

interface QuestionItem {
  id: number;
  title: string;
  couples_finished: number;
  state: 'partner_answered' | 'me_answered' | 'me_partner_answered' | null;
  page: number;
  has_next: boolean;
}

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'V3ExploreQuestionListJob'>) {
  const { theme } = useTheme();
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation]);

  const { job } = route.params;
  const authContext = useContext(AuthContext);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [name, setName] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(false);

  const isFirstMount = useRef(true);

  const fetchInitialData = useCallback(async () => {
    try {
      void localAnalytics().logEvent('V3ExploreQuestionListJobStartedLoading', {
        screen: 'V3ExploreQuestionListJob',
        action: 'StartedLoading',
        userId: authContext.userId,
      });
      setError(null);
      setLoading(true);
      setLoadingMore(false);
      setPage(1);

      const [profileResult, premiumResult, questionsResult] = await Promise.all([
        supabase
          .from('user_profile')
          .select('first_name, partner_first_name')
          .eq('user_id', authContext.userId!)
          .single(),
        supabase.rpc('is_user_premium'),
        supabase.rpc('get_job_question', {
          job,
          recommended: false,
          p_limit: 20,
          p_page: 1,
        }),
      ]);

      if (profileResult.error) throw profileResult.error;
      if (premiumResult.error) throw premiumResult.error;
      if (questionsResult.error) throw questionsResult.error;

      const { first_name: meName, partner_first_name: theirName } = profileResult.data;
      setName(showName(meName) || i18n.t('profile_me'));
      setPartnerName(showName(theirName) || i18n.t('profile_partner'));
      setIsPremium(!!premiumResult.data);

      const data: QuestionItem[] = questionsResult.data || [];
      setQuestions(data);
      if (data.length > 0) {
        setPage(data[0].page);
        setHasNext(data[data.length - 1].has_next);
      } else {
        setHasNext(false);
      }

      void localAnalytics().logEvent('V3ExploreQuestionListJobLoaded', {
        userId: authContext.userId,
        totalQuestions: data.length,
        isPremium: premiumResult.data,
        job,
      });
    } catch (e) {
      setError((e as Error)?.message || '');
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [authContext.userId, job]);

  const loadMoreData = async () => {
    setLoadingMore(true);
    try {
      if (!hasNext) return;
      const nextPage = page + 1;
      const { data, error } = await supabase.rpc('get_job_question', {
        job,
        recommended: false,
        p_limit: 20,
        p_page: nextPage,
      });
      if (error) throw error;

      const newData: QuestionItem[] = data || [];

      setQuestions((prev) => [...prev, ...newData]);
      setPage(nextPage);
      if (newData.length > 0) {
        setHasNext(newData[newData.length - 1].has_next);
      } else {
        setHasNext(false);
      }
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoadingMore(false);
    }
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  function truncateLongQuestion(fullText: string): string {
    if (fullText?.length <= 80) return fullText;
    return `${fullText.substring(0, 80)}...`;
  }

  function partialTruncateQuestion(fullText: string, lengthToReplace: number): string {
    if (fullText?.length <= lengthToReplace) return fullText;
    const visiblePart = fullText.substring(0, fullText?.length - lengthToReplace);
    return `${visiblePart}...`;
  }

  function getDisplayQuestionText(question: string, state: QuestionState): string {
    if (question?.length > 80) return truncateLongQuestion(question);
    if (isPremium || !!state) return question;
    if (question?.length < 15) return question;
    if (question?.length < 30) return partialTruncateQuestion(question, 5);
    return partialTruncateQuestion(question, 15);
  }

  function renderState(q: QuestionItem) {
    if (q.state === 'me_partner_answered') {
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
          <FontText h1 style={{ color: theme.colors.primary }}>
            •
          </FontText>
          <FontText h1 style={{ color: theme.colors.error, marginLeft: -2 }}>
            •
          </FontText>
          <FontText small style={{ color: theme.colors.grey3, marginLeft: 4, marginTop: 10 }}>
            {i18n.t('question_list_me_partner_answered', {
              firstName: name,
              partnerName: partnerName,
            })}
          </FontText>
        </View>
      );
    } else if (q.state === 'me_answered') {
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
          <FontText h1 style={{ color: theme.colors.primary }}>
            •
          </FontText>
          <FontText small style={{ color: theme.colors.grey3, marginLeft: 4, marginTop: 10 }}>
            {i18n.t('question_list_me_answered', { firstName: name })}
          </FontText>
        </View>
      );
    } else if (q.state === 'partner_answered') {
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
          <FontText h1 style={{ color: theme.colors.error }}>
            •
          </FontText>
          <FontText small style={{ color: theme.colors.grey3, marginLeft: 4, marginTop: 10 }}>
            {i18n.t('question_list_partner_answered', {
              partnerName: partnerName,
            })}
          </FontText>
        </View>
      );
    }
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 }}>
        <FontText small style={{ color: theme.colors.grey3 }}>
          {i18n.t('question_list_couples_answered', {
            count: q.couples_finished,
          })}
        </FontText>
      </View>
    );
  }

  function handlePressQuestion(q: QuestionItem) {
    if (!isPremium && !q.state) {
      void localAnalytics().logEvent('QuestionPressedLocked', {
        screen: 'QuestionList',
        userId: authContext.userId,
        questionId: q.id,
      });
      navigation.navigate('V3PremiumOffer', {
        refreshTimeStamp: new Date().toISOString(),
        isOnboarding: false,
      });
      return;
    }
    void localAnalytics().logEvent('QuestionPressed', {
      screen: 'QuestionList',
      userId: authContext.userId,
      questionId: q.id,
    });
    navigation.navigate('V3ExploreQuestionDetail', {
      id: q.id,
      shouldGoBack: true,
      refreshTimeStamp: new Date().toISOString(),
    });
  }

  function goBack() {
    void localAnalytics().logEvent('QuestionListGoBack', {
      screen: 'QuestionList',
      userId: authContext.userId,
    });
    navigation.goBack();
  }

  if (loading && !refreshing && !error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}>
        <Loading />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <>
        <SafeAreaView edges={['top']} style={{ backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }} />
        <SafeAreaView
          edges={['left', 'right', 'bottom']}
          style={{
            flex: 1,
            backgroundColor: theme.colors.white,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <FontText style={{ marginBottom: 20 }} h3>
            {i18n.t('v3_answer_home_error_loading')}
          </FontText>
          <PrimaryButton
            title={i18n.t('reload')}
            onPress={() => {
              void localAnalytics().logEvent('QuestionReload', {
                screen: 'QuestionList',
                userId: authContext.userId,
              });
              void fetchInitialData();
            }}
          />
        </SafeAreaView>
      </>
    );
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
              <FontText
                h2
                style={{
                  color: theme.colors.white,
                  marginTop: 15,
                  marginBottom: 50,
                  textAlign: 'center',
                }}
              >
                {i18n.t(job)}
              </FontText>
            </View>
            <View style={{ width: 24 }} />
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 16,
            }}
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
              }
            >
              {questions.map((q) => {
                const displayText = getDisplayQuestionText(q.title, q.state as QuestionState);
                const showPremiumCrown = !isPremium && !q.state;
                return (
                  <TouchableOpacity
                    key={q.id}
                    onPress={() => handlePressQuestion(q)}
                    style={{
                      flexDirection: 'row',
                      backgroundColor: theme.colors.white,
                      borderRadius: 16,
                      padding: 12,
                      marginBottom: 12,
                      alignItems: 'center',
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <FontText>{displayText}</FontText>
                      {renderState(q)}
                    </View>
                    <View
                      style={{
                        width: 76,
                        height: 102,
                        borderRadius: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                      }}
                    >
                      {showPremiumCrown && (
                        <View
                          style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            width: 24,
                            height: 24,
                            borderRadius: 24,
                            backgroundColor: BADGE_COLOR,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <PremiumCrown width={14} height={14} fill={theme.colors.black} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
              {hasNext && (
                <View style={{ paddingVertical: 20 }}>
                  <PrimaryButton loading={loadingMore} onPress={() => void loadMoreData()}>
                    {i18n.t('load_more')}
                  </PrimaryButton>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
