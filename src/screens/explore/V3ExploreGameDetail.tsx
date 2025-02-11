import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
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
import { BACKGROUND_LIGHT_BEIGE_COLOR, GAME_COLOR, MEDIUM_BEIGE_COLOR } from '@app/utils/colors';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { showName } from '@app/utils/strings';
import { handleRemindPartner } from '@app/utils/sendNotification';
import V3LayeredGreyImage from '@app/components/explore/V3LayeredGreyImage';
import ContentBuddyPurple from '@app/icons/content_buddy_purple';
import ContentBuddyPink from '@app/icons/content_buddy_pink';
import IconStar from '@app/icons/selected_star';
import PremiumLock from '@app/icons/premium_lock';
import { contentListScreen } from '@app/types/domain';
import GameIcon from '@app/icons/content_game';
import { getContentImageFromId } from '@app/utils/content';
import V3ContentDetailInfoBlock from '@app/components/explore/V3ContentDetailInfoBlock';
import WaitingTimerYellow from '@app/icons/waiting_timer_yellow';
import BlackSwoosh from '@app/icons/black_swoosh';
import GameIncorrect from '@app/icons/game_incorrect';
import GameCorrect from '@app/icons/game_correct';
import Game_crown from '@app/icons/game_crown';
import { PostgrestError } from '@supabase/supabase-js';
import { ContentFeedback } from '@app/components/content/ContentFeedback';

type Props = NativeStackScreenProps<MainStackParamList, 'V3ExploreGameDetail'>;

interface GameData {
  id: number;
  slug: string;
  language: string;
  title: string;
  description: string;
}

interface QuestionData {
  id: number;
  title: string;
}

interface AnswersAboutSelf {
  [questionId: number]: {
    optionId: number;
    text: string;
  };
}

interface AnswersAboutPartner {
  [questionId: number]: {
    optionId: number;
    text: string;
  };
}

export default function V3ExploreGameDetail({ route, navigation }: Props) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);

  const gameId = route.params.id;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [finishedCount, setFinishedCount] = useState(0);
  const [questionCount, setQuestionCount] = useState(5);
  const [questionList, setQuestionList] = useState<QuestionData[]>([]);
  const [showSelected, setShowSelected] = useState(false);
  const [myAnswersSelf, setMyAnswersSelf] = useState<AnswersAboutSelf>({});
  const [myAnswersPartner, setMyAnswersPartner] = useState<AnswersAboutPartner>({});
  const [partnerAnswersSelf, setPartnerAnswersSelf] = useState<AnswersAboutSelf>({});
  const [partnerAnswersPartner, setPartnerAnswersPartner] = useState<AnswersAboutPartner>({});
  const [stateType, setStateType] = useState<
    'not_started' | 'me_finished_only' | 'partner_finished_only' | 'both_finished'
  >('not_started');

  const isFirstMount = useRef(true);
  const [showErrorReload, setShowErrorReload] = useState(false);

  const [instanceId, setInstanceId] = useState<number | null>(null);
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = authContext.userId;
      if (!userId) {
        setLoading(false);
        return;
      }

      localAnalytics().logEvent('V3GameDetailLoadingStarted', {
        userId,
        gameId,
      });

      const [
        userProfileRes,
        gameRes,
        jobResult,
        jobGameResult,
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
          .from('content_game')
          .select('id, slug, language, title, description, couples_finished')
          .eq('id', gameId)
          .single(),
        supabase.rpc('get_my_jobs'),
        supabase.from('job_content_game').select('job_slug').eq('content_game_id', gameId),
        supabase.rpc('get_total_streak'),
        supabase.rpc('is_user_premium'),
        supabase
          .from('content_game_question')
          .select('id', { count: 'exact' })
          .eq('game_id', gameId),
        supabase.from('content_game_question').select('id, title').eq('game_id', gameId),
        supabase
          .from('content_game_couple_instance')
          .select(
            `
          id,
          finished_by,
          content_game_couple_instance_answer (
            question_id,
            option_id,
            user_id,
            about_partner,
            content_game_question_option!inner(title)
          )
        `,
          )
          .eq('game_id', gameId)
          .maybeSingle(),
      ]);

      if (userProfileRes.error) throw userProfileRes.error;
      if (gameRes.error) throw gameRes.error;
      if (jobResult.error) throw jobResult.error;
      if (jobGameResult.error) throw jobGameResult.error;
      if (streakResult.error) throw streakResult.error;
      if (premiumResult.error) throw premiumResult.error;
      if (questionCountQuery.error) throw questionCountQuery.error;
      if (questionListQuery.error) throw questionListQuery.error;

      const { data: userProfile } = userProfileRes;
      const { data: gameData } = gameRes;
      const { data: jobs } = jobResult;
      const { data: jobGames } = jobGameResult;
      const { data: premiumStatus } = premiumResult;
      const { count: totalQuestions } = questionCountQuery;
      const { data: questionList } = questionListQuery;
      const { data: instanceData } = instanceQuery;
      setInstanceId(instanceData?.id || null);
      setName(showName(userProfile.first_name));
      setPartnerName(showName(userProfile.partner_first_name) || i18n.t('home_partner'));

      // Set game data
      setGameData({
        id: gameData.id,
        slug: gameData.slug,
        language: gameData.language,
        title: gameData.title,
        description: gameData.description,
      });

      setQuestionCount(totalQuestions || 5);
      setQuestionList(questionList || []);
      setFinishedCount(gameData.couples_finished);

      // Determine if the game is recommended based on jobs
      let isRecommended = false;
      const userJobs = jobs || [];
      if (jobGames && jobGames.length > 0) {
        const gameSlugs = jobGames.map((row) => row.job_slug);
        isRecommended = gameSlugs.some((slug) => userJobs.includes(slug));
      }
      setShowSelected(isRecommended);

      let instanceId: null | number = null;
      let userHasFinished = false;
      let partnerHasFinished = false;
      const myAnswersSelfMap = {};
      const myAnswersPartnerMap = {};
      const partnerAnswersSelfMap = {};
      const partnerAnswersPartnerMap = {};

      if (instanceData) {
        const finishedBy = instanceData.finished_by || [];
        userHasFinished = finishedBy.includes(userId);
        partnerHasFinished = finishedBy.some((uid) => uid !== userId);
        instanceId = instanceData.id;

        const answers = instanceData.content_game_couple_instance_answer || [];
        answers.forEach((ans) => {
          if (ans.user_id === userId) {
            if (!ans.about_partner) {
              myAnswersSelfMap[ans.question_id] = {
                optionId: ans.option_id,
                text: ans.content_game_question_option.title,
              };
            } else {
              myAnswersPartnerMap[ans.question_id] = {
                optionId: ans.option_id,
                text: ans.content_game_question_option.title,
              };
            }
          } else {
            if (!ans.about_partner) {
              partnerAnswersSelfMap[ans.question_id] = {
                optionId: ans.option_id,
                text: ans.content_game_question_option.title,
              };
            } else {
              partnerAnswersPartnerMap[ans.question_id] = {
                optionId: ans.option_id,
                text: ans.content_game_question_option.title,
              };
            }
          }
        });

        setMyAnswersSelf(myAnswersSelfMap);
        setMyAnswersPartner(myAnswersPartnerMap);
        setPartnerAnswersSelf(partnerAnswersSelfMap);
        setPartnerAnswersPartner(partnerAnswersPartnerMap);
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

      localAnalytics().logEvent('V3GameDetailLoaded', {
        userId,
        gameId,
        stateType,
        myAnswersSelfMap,
        myAnswersPartnerMap,
        partnerAnswersSelfMap,
        partnerAnswersPartnerMap,
      });
    } catch (e) {
      logSupaErrors(e as PostgrestError);
      setShowErrorReload(true);
    } finally {
      setLoading(false);
    }
  }, [authContext.userId, gameId, stateType]);

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

  const handleStartGame = () => {
    localAnalytics().logEvent('V3GameDetailStartClicked', {
      userId: authContext.userId,
      gameId,
      isPremium,
    });
    if (isPremium) {
      navigation.navigate('V3GameStart', {
        id: gameId,
        refreshTimeStamp: new Date().toISOString(),
        fromHome: route.params.fromHome,
      });
    } else {
      localAnalytics().logEvent('V3GameDetailRedirectPremium', {
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
        ? i18n.t('explore_game_detail_start_game')
        : i18n.t('explore_game_detail_start_free_trial');
    }
    if (stateType === 'me_finished_only') {
      return i18n.t('question_answer_remind_partner', { partnerName });
    }
    return null;
  };

  const handleButtonPress = async () => {
    if (stateType === 'not_started' || stateType === 'partner_finished_only') {
      handleStartGame();
    } else if (stateType === 'me_finished_only') {
      await handleRemindPartner(
        'GameDetail',
        partnerName,
        authContext.userId!,
        setLoading,
        {
          game_id: gameId,
          type: 'remind_game',
        },
        navigation,
        'V3ExploreGameDetail',
        {
          id: gameId,
          refreshTimeStamp: new Date().toISOString(),
          shouldGoBack: route.params.shouldGoBack,
          fromHome: route.params.fromHome,
        },
        true,
        true,
      );
    }
  };

  const getCorrectGuessCount = (
    guesses: AnswersAboutPartner,
    partnerSelf: AnswersAboutSelf,
  ): string => {
    let correctCount = 0;
    Object.keys(guesses).forEach((qId) => {
      if (partnerSelf[qId] && guesses[qId].optionId === partnerSelf[qId].optionId) {
        correctCount += 1;
      }
    });
    return correctCount.toString();
  };

  const renderBothFinishedTopCard = () => {
    const myCorrect = parseInt(getCorrectGuessCount(myAnswersPartner, partnerAnswersSelf), 10);
    const partnerCorrect = parseInt(getCorrectGuessCount(partnerAnswersPartner, myAnswersSelf), 10);
    const isTie = myCorrect === partnerCorrect;
    const meIsWinner = myCorrect > partnerCorrect;
    const partnerIsWinner = partnerCorrect > myCorrect;
    const showMyCrown = meIsWinner || isTie;
    const showPartnerCrown = partnerIsWinner || isTie;
    return (
      <View style={{ alignItems: 'center' }}>
        <View style={{ marginBottom: 25 }}>
          <FontText small style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
            {i18n.t('explore_game_detail_result_title')}
          </FontText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          <View style={{ width: 164, alignItems: 'center' }}>
            {showMyCrown && <Game_crown />}
            <View
              style={{
                width: '100%',
                backgroundColor: showMyCrown ? theme.colors.white : '#5256C8',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 24,
                alignItems: 'center',
              }}
            >
              {showMyCrown && (
                <View
                  style={{
                    backgroundColor: theme.colors.warning,
                    borderRadius: 40,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    marginBottom: 12,
                  }}
                >
                  <FontText small>
                    {meIsWinner
                      ? i18n.t('game_detail_winner_label')
                      : i18n.t('game_detail_tie_label')}
                  </FontText>
                </View>
              )}
              <ContentBuddyPurple />
              <FontText h4 style={{ color: showMyCrown ? theme.colors.black : theme.colors.white }}>
                {myCorrect}/{questionCount}
              </FontText>
              <FontText
                small
                style={{
                  color: showMyCrown ? 'rgba(26,5,47,0.5)' : 'rgba(255,255,255,0.5)',
                  marginTop: 4,
                }}
              >
                {name}
              </FontText>
            </View>
          </View>

          <View style={{ width: 164, alignItems: 'center' }}>
            {showPartnerCrown && <Game_crown />}

            <View
              style={{
                width: '100%',
                backgroundColor: showPartnerCrown ? theme.colors.white : '#5256C8',
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 24,
                alignItems: 'center',
              }}
            >
              {showPartnerCrown && (
                <View
                  style={{
                    backgroundColor: theme.colors.warning,
                    borderRadius: 40,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    marginBottom: 12,
                  }}
                >
                  <FontText small>
                    {partnerIsWinner
                      ? i18n.t('game_detail_winner_label')
                      : i18n.t('game_detail_tie_label')}
                  </FontText>
                </View>
              )}
              <ContentBuddyPink />
              <FontText
                h4
                style={{ color: showPartnerCrown ? theme.colors.black : theme.colors.white }}
              >
                {partnerCorrect}/{questionCount}
              </FontText>
              <FontText
                small
                style={{
                  color: showPartnerCrown ? 'rgba(26,5,47,0.5)' : 'rgba(255,255,255,0.5)',
                  marginTop: 4,
                }}
              >
                {partnerName}
              </FontText>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderQuestionsAndAnswers = () => {
    return questionList.map((question) => {
      const mySelfAns = myAnswersSelf[question.id];
      const myPartnerGuess = myAnswersPartner[question.id];
      const partnerSelfAns = partnerAnswersSelf[question.id];
      const partnerGuessAboutMe = partnerAnswersPartner[question.id];
      const isMyGuessCorrect =
        myPartnerGuess && partnerSelfAns && myPartnerGuess.optionId === partnerSelfAns.optionId;
      const isPartnerGuessCorrect =
        partnerGuessAboutMe && mySelfAns && partnerGuessAboutMe.optionId === mySelfAns.optionId;
      return (
        <View
          key={question.id}
          style={{ backgroundColor: theme.colors.white, borderRadius: 16, marginBottom: 16 }}
        >
          <View style={{ padding: 20 }}>
            <View
              style={{
                backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                borderRadius: 40,
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <FontText small>{questionList.indexOf(question) + 1}</FontText>
            </View>
            <FontText style={{ marginBottom: 16 }}>{question.title}</FontText>
            <View style={{ gap: 12 }}>
              <View
                style={{
                  borderRadius: 12,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 }}>
                  <ContentBuddyPurple
                    width={32}
                    height={32}
                    style={{ marginBottom: 2, marginRight: 5 }}
                  />
                  <View style={{ flex: 1 }}>
                    <FontText style={{ marginBottom: 4, color: '#1A052F' }}>
                      {myPartnerGuess ? myPartnerGuess.text : '?'}
                    </FontText>
                    <FontText small style={{ color: theme.colors.grey3 }}>
                      {i18n.t('game_your_answer_about_partner', { partnerName })}
                    </FontText>
                  </View>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 40,
                      backgroundColor: isMyGuessCorrect ? '#B4E88C' : '#FFBADF',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isMyGuessCorrect ? <GameCorrect /> : <GameIncorrect />}
                  </View>
                </View>
                {!isMyGuessCorrect && partnerSelfAns && (
                  <View
                    style={{
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                      backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                      padding: 16,
                    }}
                  >
                    <FontText small style={{ color: '#1A052F' }}>
                      {i18n.t('game_the_right_answer')}
                      {partnerSelfAns.text}
                    </FontText>
                  </View>
                )}
              </View>
              <View
                style={{
                  borderRadius: 12,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16 }}>
                  <ContentBuddyPink height={32} width={32} />
                  <View style={{ flex: 1 }}>
                    <FontText style={{ marginBottom: 4, color: '#1A052F' }}>
                      {partnerGuessAboutMe ? partnerGuessAboutMe.text : '?'}
                    </FontText>
                    <FontText small style={{ color: theme.colors.grey3 }}>
                      {i18n.t('game_partners_answer_about_you', { partnerName })}
                    </FontText>
                  </View>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 40,
                      backgroundColor: isPartnerGuessCorrect ? '#B4E88C' : '#FFBADF',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isPartnerGuessCorrect ? <GameCorrect /> : <GameIncorrect />}
                  </View>
                </View>
                {!isPartnerGuessCorrect && mySelfAns && (
                  <View
                    style={{
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                      backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                      padding: 16,
                    }}
                  >
                    <FontText small style={{ color: '#1A052F' }}>
                      {i18n.t('game_the_right_answer')}
                      {mySelfAns.text}
                    </FontText>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      );
    });
  };

  useEffect(() => {
    setShowErrorReload(false);
  }, [loading]);

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: GAME_COLOR }} />
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: theme.colors.white }}
      >
        <View style={{ flex: 1, backgroundColor: GAME_COLOR }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <GoBackButton
              onPress={() => {
                localAnalytics().logEvent('V3GameDetailBackClicked', {
                  userId: authContext.userId,
                  gameId,
                });
                if (route.params.fromHome) {
                  navigation.navigate('V3Home', {
                    refreshTimeStamp: new Date().toISOString(),
                  });
                } else if (navigation.canGoBack() && route.params.shouldGoBack) {
                  navigation.goBack();
                } else {
                  navigation.navigate(contentListScreen['game'], {
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
            <>
              {showErrorReload && (
                <View
                  style={{
                    position: 'absolute',
                    top: 100,
                    left: 0,
                    right: 0,
                    alignItems: 'center',
                    zIndex: 999,
                  }}
                >
                  <TouchableOpacity onPress={() => void onRefresh()}>
                    <FontText h4 style={{ color: theme.colors.white }}>
                      {i18n.t('reload')}
                    </FontText>
                  </TouchableOpacity>
                </View>
              )}
              <ScrollView
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
                }
                contentContainerStyle={{ flexGrow: 1 }}
              >
                <View
                  style={{
                    alignItems: 'center',
                    marginBottom: stateType === 'both_finished' ? 0 : 24,
                    paddingHorizontal: 20,
                  }}
                >
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
                      <GameIcon width={12} height={12} fill="#FFF" stroke="#FFF" />
                      <FontText small style={{ color: theme.colors.white }}>
                        {i18n.t('explore_game_detail_label_game')}
                      </FontText>
                    </View>
                  </View>
                  <FontText
                    h2
                    style={{ color: theme.colors.white, textAlign: 'center', marginBottom: 24 }}
                  >
                    {gameData?.title}
                  </FontText>
                  {(stateType === 'not_started' ||
                    stateType === 'partner_finished_only' ||
                    stateType === 'me_finished_only') && (
                    <>
                      <V3LayeredGreyImage image={getContentImageFromId(gameId)} />
                      <FontText
                        small
                        style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}
                      >
                        {i18n.t('explore_content_detail_finished_count', {
                          count: finishedCount,
                        })}
                      </FontText>
                    </>
                  )}
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
                  {stateType === 'both_finished' && renderBothFinishedTopCard()}
                  {stateType === 'partner_finished_only' && (
                    <V3ContentDetailInfoBlock>
                      <ContentBuddyPink width={32} height={32} />
                      <FontText small style={{ flex: 1 }}>
                        {i18n.t('explore_content_detail_partner_finished', {
                          partnerName,
                        })}
                      </FontText>
                    </V3ContentDetailInfoBlock>
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
                    {stateType !== 'both_finished' && stateType !== 'me_finished_only' && (
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
                              {i18n.t('explore_game_detail_selected')}
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
                      {(stateType === 'me_finished_only' || stateType === 'both_finished') && (
                        <ContentFeedback
                          title={i18n.t('content_feedback_game')}
                          contentType="game"
                          instanceId={instanceId}
                        />
                      )}

                      {stateType === 'both_finished' && (
                        <View style={{ marginBottom: 40 }}>
                          <FontText
                            h4
                            style={{
                              color: theme.colors.black,
                              marginBottom: 20,
                            }}
                          >
                            {i18n.t('explore_game_detail_answer_title')}
                          </FontText>
                          {renderQuestionsAndAnswers()}
                        </View>
                      )}
                      <FontText h4 style={{ color: theme.colors.black, marginBottom: 12 }}>
                        {i18n.t('explore_game_detail_description')}
                      </FontText>
                      <View
                        style={{
                          backgroundColor: MEDIUM_BEIGE_COLOR,
                          borderRadius: 16,
                          padding: 16,
                        }}
                      >
                        <FontText small style={{ color: theme.colors.black }}>
                          {gameData?.description}
                        </FontText>
                      </View>
                    </View>
                    {(stateType === 'partner_finished_only' ||
                      stateType === 'not_started' ||
                      stateType === 'me_finished_only') && (
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
                            {stateType !== 'me_finished_only' ? (
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
                            ) : (
                              <BlackSwoosh style={{ marginRight: 10 }} />
                            )}
                            <FontText
                              small
                              style={{
                                color: theme.colors.black,
                                flex: 1,
                              }}
                            >
                              {i18n.t('explore_game_detail_step_one', {
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
                            {stateType !== 'me_finished_only' ? (
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
                            ) : (
                              <BlackSwoosh style={{ marginRight: 10 }} />
                            )}
                            <FontText
                              small
                              style={{
                                color: theme.colors.black,
                                flex: 1,
                              }}
                            >
                              {i18n.t('explore_game_detail_step_two', {
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
                            {stateType !== 'partner_finished_only' ? (
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
                            ) : (
                              <BlackSwoosh style={{ marginRight: 10 }} />
                            )}
                            <FontText small style={{ color: theme.colors.black, flex: 1 }}>
                              {i18n.t('explore_game_detail_step_three', {
                                partnerName: partnerName,
                              })}
                            </FontText>
                          </View>
                        </View>
                      </View>
                    )}
                  </>
                </View>
              </ScrollView>
            </>
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
