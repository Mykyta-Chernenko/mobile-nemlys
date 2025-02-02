import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import { logSupaErrors } from '@app/utils/errors';
import { localAnalytics } from '@app/utils/analytics';
import { useTheme, Slider } from '@rneui/themed';

import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { MainStackParamList } from '@app/types/navigation';
import { BACKGROUND_LIGHT_BEIGE_COLOR, MEDIUM_BEIGE_COLOR } from '@app/utils/colors';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { i18n } from '@app/localization/i18n';
import Game1 from 'src/icons/game_1';
import Game2 from 'src/icons/game_2';
import Game3 from 'src/icons/game_3';
import Game4 from 'src/icons/game_4';
import Game5 from 'src/icons/game_5';
import { PostgrestError } from '@supabase/supabase-js';

type Props = NativeStackScreenProps<MainStackParamList, 'V3Checkup'>;

interface CheckupData {
  id: number;
  title: string;
}

interface QuestionData {
  id: number;
  content: string;
}

// suppress defaultProps Slider warning
const error = console.error;
console.error = (...args: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  if (/defaultProps/.test(args[0])) return;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  error(...args);
};

export default function V3Checkup({ route, navigation }: Props) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const checkupId = route.params.id;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkupData, setCheckupData] = useState<CheckupData | null>(null);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question_id: number; answer: number }[]>([]);
  const [sliderValue, setSliderValue] = useState(3);
  const isFirstMount = useRef(true);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = authContext.userId;
      if (!userId) {
        setLoading(false);
        return;
      }
      localAnalytics().logEvent('V3CheckupLoadingStarted', {
        screen: 'V3Checkup',
        action: 'LoadingStarted',
        userId,
        checkupId,
      });
      const [checkupRes, questionRes] = await Promise.all([
        supabase.from('content_checkup').select('id, title').eq('id', checkupId).single(),
        supabase
          .from('content_checkup_question')
          .select('id, content')
          .eq('checkup_id', checkupId)
          .order('id', { ascending: true }),
      ]);
      if (checkupRes.error) throw checkupRes.error;
      if (questionRes.error) throw questionRes.error;
      setCheckupData({
        id: checkupRes.data.id,
        title: checkupRes.data.title,
      });
      setQuestions(questionRes.data || []);
      localAnalytics().logEvent('V3CheckupLoaded', {
        screen: 'V3Checkup',
        action: 'Loaded',
        userId,
        checkupId,
        questionCount: (questionRes.data || []).length,
      });
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [authContext.userId, checkupId]);

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

  const currentQuestion = questions[currentQuestionIndex];

  const labelText = (value: number) => {
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

  const handleGoBack = () => {
    if (currentQuestionIndex === 0) {
      localAnalytics().logEvent('V3CheckupBackToStart', {
        screen: 'V3Checkup',
        action: 'BackClickedToStart',
        userId: authContext.userId,
        checkupId,
      });
      navigation.navigate('V3CheckupStart', {
        id: checkupId,
        refreshTimeStamp: new Date().toISOString(),
      });
    } else {
      localAnalytics().logEvent('V3CheckupBackClicked', {
        screen: 'V3Checkup',
        action: 'BackClicked',
        userId: authContext.userId,
        checkupId,
        currentQuestionIndex,
      });
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAnswers((prev) =>
        prev.filter((a) => a.question_id !== questions[currentQuestionIndex].id),
      );
      const prevQuestion = questions[currentQuestionIndex - 1];
      const foundAnswer = answers.find((a) => a.question_id === prevQuestion.id);
      setSliderValue(foundAnswer?.answer || 3);
    }
  };

  const handleNext = async () => {
    if (!currentQuestion) return;
    const userId = authContext.userId;
    if (!userId) return;
    if (currentQuestionIndex === questions.length - 1) {
      setLoading(true);
      try {
        const answersParam = [
          ...answers.map((a) => ({
            question_id: a.question_id,
            answer: a.answer,
          })),
          { question_id: currentQuestion.id, answer: sliderValue },
        ];
        const [instanceResponse, streakResponse, partnerResponse] = await Promise.all([
          supabase.rpc('get_checkup_result', {
            checkup_id: checkupId,
            answers: answersParam,
          }),
          supabase.rpc('record_streak_hit'),
          supabase.rpc('has_partner'),
        ]);

        if (instanceResponse.error) throw instanceResponse.error;
        if (streakResponse.error) throw streakResponse.error;
        if (partnerResponse.error) throw partnerResponse.error;

        const instanceId = instanceResponse.data;
        const showStreak = streakResponse.data;
        const hasPartner = partnerResponse.data;
        localAnalytics().logEvent('V3CheckupCompleted', {
          screen: 'V3Checkup',
          action: 'Completed',
          userId,
          checkupId,
          instanceId,
          showStreak,
          hasPartner,
        });
        if (!hasPartner) {
          navigation.navigate('OnboardingInviteCode', {
            nextScreen: 'V3CheckupFinish',
            screenParams: {
              instanceId,
              showStreak,
              refreshTimeStamp: new Date().toISOString(),
            },
          });
        } else {
          navigation.navigate('V3CheckupFinish', {
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
        ...prev.filter((a) => a.question_id !== currentQuestion.id),
        { question_id: currentQuestion.id, answer: sliderValue },
      ]);
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      const nextQuestion = questions[currentQuestionIndex + 1];
      const foundAnswer = answers.find((a) => a.question_id === nextQuestion?.id);
      setSliderValue(foundAnswer?.answer || 3);
    }
  };

  const progressFullWidth = 100;
  const progress = questions.length > 0 ? (currentQuestionIndex + 1) / questions.length : 0;
  const progressBarWidth = Math.max(Math.min(progress * progressFullWidth, progressFullWidth), 0);

  const getSlideByLevel = (level: number) => {
    const colorsByValue: Record<number, string> = {
      1: '#FF76C0',
      2: '#FDC180',
      3: '#BD8AFF',
      4: '#8FBFFA',
      5: '#A1E78B',
    };
    const marginByLevel = {
      1: 72,
      2: 36,
      3: 0,
      4: -36,
      5: -72,
    };

    const Icon = getGameIcon(level);
    const dotSize = 25;

    return (
      <View
        style={{
          marginTop: '5%',
          marginLeft: marginByLevel[level],
          height: 109,
          width: 109,
          borderRadius: 109,
          backgroundColor: colorsByValue[level],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            height: 159,
            width: 109,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            left: 0,
            bottom: 110,
          }}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: 'white',
              height: 140,
              borderRadius: 40,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon width={40} height={40} />
            <FontText style={{ marginTop: 10 }}>{labelText(sliderValue)}</FontText>
          </View>
          <View
            style={{
              height: 0,
              width: 0,
              borderLeftWidth: 17.5,
              borderLeftColor: 'transparent',
              borderRightWidth: 17.5,
              borderRightColor: 'transparent',
              borderTopWidth: 17.5,
              borderTopColor: theme.colors.white,
            }}
          ></View>
        </View>
        <View
          style={{
            height: dotSize,
            width: dotSize,
            backgroundColor: theme.colors.black,
            borderRadius: 109,
          }}
        ></View>
      </View>
    );
  };

  const currentSlides = getSlideByLevel(sliderValue);

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
              <View style={{ width: 30 }} />
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
              <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <View>
                  {checkupData && (
                    <FontText
                      small
                      style={{ color: theme.colors.grey5, marginBottom: 8, textAlign: 'center' }}
                    >
                      {checkupData.title}
                    </FontText>
                  )}
                  {currentQuestion && (
                    <FontText h3 style={{ marginBottom: 20, textAlign: 'center' }}>
                      {currentQuestion.content}
                    </FontText>
                  )}
                </View>
                <View
                  style={{
                    marginHorizontal: -20,
                    marginTop: 150,
                    marginBottom: 50,
                    paddingHorizontal: 20,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      flexWrap: 'wrap',
                    }}
                  >
                    <Slider
                      style={{
                        width: '100%',
                        height: 109,
                      }}
                      value={sliderValue}
                      onValueChange={setSliderValue}
                      maximumValue={5}
                      minimumValue={1}
                      step={1}
                      allowTouchTrack
                      orientation="horizontal"
                      maximumTrackTintColor={MEDIUM_BEIGE_COLOR}
                      minimumTrackTintColor={MEDIUM_BEIGE_COLOR}
                      trackStyle={{
                        height: 72,
                        backgroundColor: 'F2ECEE',
                        borderRadius: 40,
                      }}
                      thumbStyle={{
                        justifyContent: 'center',
                        height: 0,
                        alignItems: 'center',
                      }}
                      thumbProps={{
                        children: currentSlides,
                      }}
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      width: '100%',
                      marginTop: 8,
                    }}
                  >
                    <FontText small>{i18n.t('slider_strongly_disagree')}</FontText>
                    <FontText small>{i18n.t('slider_strongly_agree')}</FontText>
                  </View>
                </View>
              </View>
              <PrimaryButton buttonStyle={{ marginTop: 0 }} onPress={() => void handleNext()}>
                <FontText style={{ color: theme.colors.white }}>
                  {currentQuestionIndex === questions.length - 1
                    ? i18n.t('finish')
                    : i18n.t('next')}
                </FontText>
              </PrimaryButton>
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </>
  );
}
