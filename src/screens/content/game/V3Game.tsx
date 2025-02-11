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
import { useTheme } from '@rneui/themed';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { MainStackParamList } from '@app/types/navigation';
import { BACKGROUND_LIGHT_BEIGE_COLOR, TEST_COLOR } from '@app/utils/colors';
import { i18n } from '@app/localization/i18n';
import BlueIdea from '@app/icons/blue_idea';
import RoadSign from '@app/icons/road_sign';
import { ContentStart } from '@app/components/content/ContentStart';
import { showName } from '@app/utils/strings';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import Option1 from '@app/icons/option_1';
import Option2 from '@app/icons/option_2';
import Option3 from '@app/icons/option_3';
import Option4 from '@app/icons/option_4';
import Option5 from '@app/icons/option_5';
import { PostgrestError } from '@supabase/supabase-js';

type Props = NativeStackScreenProps<MainStackParamList, 'V3Game'>;

interface GameData {
  title: string;
  description: string;
}

interface Question {
  id: number;
  title: string;
}

interface Option {
  id: number;
  title: string;
  game_question_id: number;
}

interface Answer {
  question_id: number;
  option_id: number;
  about_partner: boolean;
}

const PINK_BUDDY = require('../../../../assets/images/big_pink_buddy.png');

export default function V3Game({ route, navigation }: Props) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);

  const gameId = route.params.id;
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [partnerName, setPartnerName] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // track the current question index
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // separate arrays for answers about self and partner
  const [myAnswers, setMyAnswers] = useState<Answer[]>([]);
  const [partnerAnswers, setPartnerAnswers] = useState<Answer[]>([]);

  // we handle which phase we’re in with a simple boolean
  const [aboutPartner, setAboutPartner] = useState(false);

  // an intermediate screen shown after finishing self-answers
  const [intermediateScreen, setIntermediateScreen] = useState(false);

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
      localAnalytics().logEvent('V3GameLoadingStarted', {
        screen: 'V3Game',
        action: 'LoadingStarted',
        userId,
        gameId,
      });

      const [profileRes, gameRes, questionRes, optionRes] = await Promise.all([
        supabase
          .from('user_profile')
          .select('partner_first_name')
          .eq('user_id', authContext.userId!)
          .single(),
        supabase.from('content_game').select('title, description').eq('id', gameId).single(),
        supabase
          .from('content_game_question')
          .select('id, title')
          .eq('game_id', gameId)
          .order('id', { ascending: true }),
        supabase
          .from('content_game_question_option')
          .select('id, title, game_question_id, content_game_question!inner(game_id)')
          .eq('content_game_question.game_id', gameId)
          .order('id', { ascending: true }),
      ]);

      if (gameRes.error) throw gameRes.error;
      if (questionRes.error) throw questionRes.error;
      if (optionRes.error) throw optionRes.error;
      if (profileRes.error) throw profileRes.error;

      setGameData(gameRes.data);
      setQuestions(questionRes.data || []);
      setOptions(optionRes.data || []);
      setPartnerName(showName(profileRes.data?.partner_first_name) || i18n.t('home_partner'));

      localAnalytics().logEvent('V3GameLoaded', {
        screen: 'V3Game',
        action: 'Loaded',
        userId,
        gameId,
        questionCount: (questionRes.data || []).length,
      });
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [authContext.userId, gameId]);

  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void fetchInitialData();
    }
  }, [route?.params?.refreshTimeStamp]);

  useEffect(() => {
    void fetchInitialData();
    isFirstMount.current = false;
  }, [fetchInitialData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  // builds one combined array from myAnswers + partnerAnswers
  const buildAllAnswers = () => {
    // ensure about_partner is set correctly
    const combined = [
      ...myAnswers.map((a) => ({ ...a, about_partner: false })),
      ...partnerAnswers.map((a) => ({ ...a, about_partner: true })),
    ];
    return combined;
  };

  // navigate back logic: if at the first question in the current phase,
  // we might back out to the intermediate screen or previous phase
  const handleGoBack = () => {
    localAnalytics().logEvent('V3GameBack', {
      screen: 'V3Game',
      action: 'BackClickedToStart',
      userId: authContext.userId,
      currentQuestionIndex,
      intermediateScreen,
      aboutPartner,
    });

    // if we haven't started answering at all => navigate to game start
    if (!aboutPartner && currentQuestionIndex === 0 && !intermediateScreen) {
      navigation.navigate('V3GameStart', {
        id: gameId,
        refreshTimeStamp: new Date().toISOString(),
        fromHome: route.params.fromHome,
      });
      return;
    }

    // if we are at the first question of the partner phase => revert to intermediate
    if (aboutPartner && currentQuestionIndex === 0) {
      setAboutPartner(false);
      setIntermediateScreen(true);
      return;
    }

    // if we're currently on the intermediate screen => revert to the last question of the self-phase
    if (intermediateScreen) {
      setIntermediateScreen(false);
      setAboutPartner(false);
      setCurrentQuestionIndex(questions.length - 1);
      return;
    }

    // otherwise, simply go back one question
    // remove the last answer from the correct array
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      if (aboutPartner) {
        setPartnerAnswers((prev) =>
          prev.filter((a) => a.question_id !== questions[currentQuestionIndex].id),
        );
      } else {
        setMyAnswers((prev) =>
          prev.filter((a) => a.question_id !== questions[currentQuestionIndex].id),
        );
      }
      setCurrentQuestionIndex(newIndex);
    }
  };

  // picks an option for the current question
  const handleAnswer = (optionId: number) => {
    const userId = authContext.userId;
    localAnalytics().logEvent('V3GameOptionSelected', {
      screen: 'V3Game',
      action: 'OptionSelected',
      userId,
      gameId,
      currentQuestionIndex,
      optionId,
      aboutPartner,
    });

    if (!questions[currentQuestionIndex]) return;
    const questionId = questions[currentQuestionIndex].id;

    // set the answer for the correct array
    if (aboutPartner) {
      setPartnerAnswers((prev) => {
        const updatedAnswers = [
          ...prev.filter((answer) => answer.question_id !== questionId),
          { question_id: questionId, option_id: optionId, about_partner: true },
        ];
        if (currentQuestionIndex === questions.length - 1) {
          const finalAnswers = [...myAnswers, ...updatedAnswers];
          void submitAllAnswers(finalAnswers);
        }
        return updatedAnswers;
      });
    } else {
      setMyAnswers((prev) => {
        const updatedAnswers = [
          ...prev.filter((answer) => answer.question_id !== questionId),
          { question_id: questionId, option_id: optionId, about_partner: false },
        ];
        if (currentQuestionIndex === questions.length - 1) {
          setIntermediateScreen(true);
        }
        return updatedAnswers;
      });
    }

    // if this is the last question of the self-phase => show intermediate
    if (!aboutPartner && currentQuestionIndex === questions.length - 1) {
      setIntermediateScreen(true);
      return;
    }

    // otherwise, go to the next question
    setCurrentQuestionIndex((idx) => idx + 1);
  };

  // once the user taps "continue" on the intermediate screen => partner phase
  const handleIntermediateContinue = () => {
    setIntermediateScreen(false);
    setAboutPartner(true);
    setCurrentQuestionIndex(0);
  };

  // performs the final submission (both self and partner answers)
  const submitAllAnswers = async (allAnswers: Answer[]) => {
    setLoading(true);
    const userId = authContext.userId;
    try {
      localAnalytics().logEvent('V3GameSubmittingAnswers', {
        screen: 'V3Game',
        action: 'SubmittingAnswers',
        userId,
        gameId,
      });

      // must be 2 * questions.length
      if (allAnswers.length !== questions.length * 2) {
        console.warn('Not all answers have been collected:', allAnswers);
      }

      const [gameResponse, streakResponse, partnerResponse] = await Promise.all([
        supabase.rpc('get_game_result', {
          game_id: gameId,
          answers: allAnswers,
        }),
        supabase.rpc('record_streak_hit'),
        supabase.rpc('has_partner'),
      ]);

      if (gameResponse.error) throw gameResponse.error;
      if (streakResponse.error) throw streakResponse.error;
      if (partnerResponse.error) throw partnerResponse.error;

      const instanceId = gameResponse.data;
      const showStreak = streakResponse.data;
      const hasPartner = partnerResponse.data;

      localAnalytics().logEvent('V3GameCompleted', {
        screen: 'V3Game',
        action: 'Completed',
        userId,
        gameId,
        instanceId,
        hasPartner,
      });

      if (!hasPartner) {
        navigation.navigate('OnboardingInviteCode', {
          nextScreen: 'V3GameFinish',
          screenParams: {
            instanceId,
            showStreak,
            refreshTimeStamp: new Date().toISOString(),
            fromHome: route.params.fromHome,
          },
        });
      } else {
        navigation.navigate('V3GameFinish', {
          instanceId,
          showStreak,
          refreshTimeStamp: new Date().toISOString(),
          fromHome: route.params.fromHome,
        });
      }
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}>
        <Loading />
      </SafeAreaView>
    );
  }

  // intermediate screen
  if (intermediateScreen) {
    return (
      <ContentStart
        title={i18n.t('explore_content_detail_game_intermediate_title')}
        highlight={partnerName}
        highlightColor={theme.colors.error}
        instructions={[
          {
            icon: <BlueIdea />,
            text: i18n.t('explore_content_detail_game_start_instruction_one'),
          },
          {
            icon: <RoadSign />,
            text: i18n.t('explore_content_detail_game_start_instruction_two'),
          },
        ]}
        onContinue={handleIntermediateContinue}
        onGoBack={handleGoBack}
        imageSource={PINK_BUDDY}
        buttonLabel={i18n.t('continue')}
        loading={loading}
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const currentOptions = options.filter((o) => o.game_question_id === currentQuestion?.id);

  // progress bar
  const progressFullWidth = 100;
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? (currentQuestionIndex + 1) / totalQuestions : 0;
  const progressBarWidth = Math.max(Math.min(progress * progressFullWidth, progressFullWidth), 0);

  const renderErrorButton = () => {
    return (
      <PrimaryButton
        onPress={() => {
          void fetchInitialData();
        }}
        title={i18n.t('reload')}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
      >
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
                  backgroundColor: TEST_COLOR,
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

        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: 'space-between',
          }}
        >
          <View>
            {gameData && (
              <FontText small style={{ color: theme.colors.grey5, marginBottom: 8 }}>
                {gameData.title}
              </FontText>
            )}
            {currentQuestion && (
              <FontText h3 style={{ marginBottom: 20 }}>
                {currentQuestion.title}
              </FontText>
            )}
            {aboutPartner ? (
              <FontText style={{ color: theme.colors.error, marginBottom: 20 }}>
                {i18n.t('v3_game_subtitle_partner', { partnerName })}
              </FontText>
            ) : (
              <FontText style={{ color: theme.colors.primary, marginBottom: 20 }}>
                {i18n.t('v3_game_subtitle_myself')}
              </FontText>
            )}
          </View>

          {currentOptions.length === 0 && renderErrorButton()}
          <View>
            {currentOptions.slice(0, 5).map((opt, index) => {
              const Label = optionLabels[index % optionLabels.length];
              return (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => {
                    void handleAnswer(opt.id);
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
