import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText, getFontSizeForScreen } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import { logSupaErrors } from '@app/utils/errors';
import { localAnalytics } from '@app/utils/analytics';
import { useTheme, useThemeMode } from '@rneui/themed';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { MainStackParamList } from '@app/types/navigation';
import { BACKGROUND_LIGHT_BEIGE_COLOR } from '@app/utils/colors';
import Option1 from '@app/icons/option_1';
import Option2 from '@app/icons/option_2';
import Option3 from '@app/icons/option_3';
import Option4 from '@app/icons/option_4';
import Option5 from '@app/icons/option_5';
import { PostgrestError } from '@supabase/supabase-js';

type Props = NativeStackScreenProps<MainStackParamList, 'V3Test'>;

interface Question {
  id: number;
  title: string;
}

interface Option {
  id: number;
  title: string;
  question_id: number;
}

interface TestData {
  title: string;
}

export default function V3Test({ route, navigation }: Props) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);

  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation]);

  const testId = route.params.id;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [testData, setTestData] = useState<TestData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question_id: number; option_id: number }[]>([]);
  const isFirstMount = useRef(true);

  const optionLabels = [Option1, Option2, Option3, Option4, Option5];

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = authContext.userId;
      if (!userId) {
        setLoading(false);
        return;
      }

      localAnalytics().logEvent('V3TestLoadingStarted', {
        screen: 'V3Test',
        action: 'LoadingStarted',
        userId,
        testId,
      });

      const [testRes, questionRes, optionRes] = await Promise.all([
        supabase.from('content_test').select('title').eq('id', testId).single(),
        supabase
          .from('content_test_question')
          .select('id,title')
          .eq('test_id', testId)
          .order('id', { ascending: true }),
        supabase
          .from('content_test_question_option')
          .select('id,title,question_id, content_test_question!inner(test_id)')
          .eq('content_test_question.test_id', testId)
          .order('id', { ascending: true }),
      ]);

      if (testRes.error) throw testRes.error;
      if (questionRes.error) throw questionRes.error;
      if (optionRes.error) throw optionRes.error;

      setTestData({ title: testRes.data.title });
      setQuestions(questionRes.data || []);
      setOptions(optionRes.data || []);

      localAnalytics().logEvent('V3TestLoaded', {
        screen: 'V3Test',
        action: 'Loaded',
        userId,
        testId,
        questionCount: (questionRes.data || []).length,
      });
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [authContext.userId, testId]);

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

  const handleGoBack = () => {
    if (currentQuestionIndex === 0) {
      localAnalytics().logEvent('V3TestBackToStart', {
        screen: 'V3Test',
        action: 'BackClickedToStart',
        userId: authContext.userId,
        testId,
      });
      navigation.navigate('V3TestStart', {
        id: testId,
        refreshTimeStamp: new Date().toISOString(),
      });
    } else {
      localAnalytics().logEvent('V3TestBackClicked', {
        screen: 'V3Test',
        action: 'BackClicked',
        userId: authContext.userId,
        testId,
        currentQuestionIndex,
      });
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAnswers((prev) =>
        prev.filter((a) => a.question_id !== questions[currentQuestionIndex].id),
      );
    }
  };

  const handleSelectOption = async (option_id: number) => {
    localAnalytics().logEvent('V3TestOptionSelected', {
      screen: 'V3Test',
      action: 'OptionSelected',
      userId: authContext.userId,
      testId,
      questionId: questions[currentQuestionIndex].id,
      optionId: option_id,
    });

    if (currentQuestionIndex === questions.length - 1) {
      setLoading(true);
      try {
        const answersParam = [
          ...answers.map((a) => ({
            question_id: a.question_id,
            option_id: a.option_id,
          })),
          { question_id: questions[currentQuestionIndex].id, option_id },
        ];

        const [testResponse, streakResponse, partnerResponse] = await Promise.all([
          supabase.rpc('get_test_result', {
            test_id: testId,
            answers: answersParam,
          }),
          supabase.rpc('record_streak_hit'),
          supabase.rpc('has_partner'),
        ]);

        if (testResponse.error) throw testResponse.error;
        if (streakResponse.error) throw streakResponse.error;
        if (partnerResponse.error) throw partnerResponse.error;

        const instanceId = testResponse.data;
        const showStreak = streakResponse.data;
        const hasPartner = partnerResponse.data;

        localAnalytics().logEvent('V3TestCompleted', {
          screen: 'V3Test',
          action: 'Completed',
          userId: authContext.userId,
          testId,
          instanceId,
          showStreak,
          hasPartner,
        });

        if (!hasPartner) {
          navigation.navigate('OnboardingInviteCode', {
            nextScreen: 'V3TestFinish',
            screenParams: {
              instanceId,
              showStreak,
              refreshTimeStamp: new Date().toISOString(),
            },
          });
        } else {
          navigation.navigate('V3TestFinish', {
            instanceId,
            showStreak,
            refreshTimeStamp: new Date().toISOString(),
          });
        }
      } catch (e) {
        logSupaErrors(e as PostgrestError);
      } finally {
        setLoading(false);
      }
    } else {
      setAnswers((prev) => [
        ...prev.filter((a) => a.question_id !== questions[currentQuestionIndex].id),
        { question_id: questions[currentQuestionIndex].id, option_id },
      ]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentOptions = options.filter((o) => o.question_id === currentQuestion?.id);

  const progressFullWidth = 100;
  const progress = questions.length > 0 ? (currentQuestionIndex + 1) / questions.length : 0;
  const progressBarWidth = Math.max(Math.min(progress * progressFullWidth, progressFullWidth), 0);

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}>
        {loading ? (
          <Loading />
        ) : (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 20,
                justifyContent: 'space-between',
              }}
            >
              <GoBackButton onPress={handleGoBack} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: progressFullWidth,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 8,
                    backgroundColor: theme.colors.grey2,
                    borderRadius: 8,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: 8,
                      width: progressBarWidth,
                      backgroundColor: theme.colors.primary,
                      borderRadius: 8,
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  />
                </View>
              </View>
              <View style={{ width: getFontSizeForScreen('h1') * 1.1 }} />
            </View>

            <ScrollView
              contentContainerStyle={{
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                marginTop: 20,
                flexGrow: 1,
                paddingBottom: 20,
              }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
              }
            >
              <View>
                {testData && (
                  <FontText small style={{ color: theme.colors.grey5, marginBottom: 8 }}>
                    {testData.title}
                  </FontText>
                )}
                {currentQuestion && (
                  <FontText h3 style={{ marginBottom: 20 }}>
                    {currentQuestion.title}
                  </FontText>
                )}
              </View>
              <View>
                {currentOptions.slice(0, 5).map((opt, index) => {
                  const Label = optionLabels[index % optionLabels.length];
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => {
                        void handleSelectOption(opt.id);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: theme.colors.white,
                        borderRadius: 20,
                        padding: 20,
                        marginBottom: 8,
                        gap: 12,
                      }}
                    >
                      <Label width={24} height={24} />
                      <FontText normal style={{ flex: 1 }}>
                        {opt.title}
                      </FontText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </>
  );
}
