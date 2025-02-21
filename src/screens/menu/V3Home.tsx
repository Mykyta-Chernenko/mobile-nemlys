import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText, getFontSizeForScreen } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { Loading } from '@app/components/utils/Loading';
import { localAnalytics } from '@app/utils/analytics';
import { logSupaErrors } from '@app/utils/errors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';

import CheckSuccessIcon from '@app/icons/check_success';
import DangerSignIcon from '@app/icons/danger_sign';
import HomeQuestionIcon from '@app/icons/home_question';
import HomeTestIcon from '@app/icons/home_test';
import HomeGameIcon from '@app/icons/home_game';
import HomeArticleIcon from '@app/icons/home_article';
import HomeExerciseIcon from '@app/icons/home_exercise';
import HomeCheckupIcon from '@app/icons/home_checkup';
import { useTheme } from '@rneui/themed';
import V3Menu from '@app/components/menu/V3Menu';
import { BACKGROUND_LIGHT_BEIGE_COLOR, BADGE_COLOR } from '@app/utils/colors';
import { getContentTitleSize, showName } from '@app/utils/strings';
import Streak from '@app/components/menu/Streak';
import { contentDetailScreen, ContentType, contentTypeBackground } from '@app/types/domain';
import { getContentImageFromId } from '@app/utils/content';
import BlackSwoosh from '@app/icons/black_swoosh';
import PremiumCrown from '@app/icons/premium_crown';
import { handleStreakTouch } from '@app/screens/content/V3ShowStreak';
import AnswerNoPartnerWarning from '@app/components/answers/AnswerNoPartnerWarning';
import { PostgrestError } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import { GRANTED_NOTIFICATION_STATUS } from '@app/utils/constants';
import SmallArrowRight from '@app/icons/small_arrow_right';
import { LoveNoteButton } from '@app/components/buttons/LoveNoteButton';
import {
  createDailyContentNotifications,
  createInactivityNotifications,
} from '@app/utils/notification';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { CloseButton } from '@app/components/buttons/CloseButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContentState, renderStateDefault } from '@app/components/explore/V3ContentList';

const HOME_QUESTION_CORNER_IMAGE = require('../../../assets/images/buddies_corner_transparent.png');

interface ContentBase {
  id: number;
  title: string;
  isLocked: boolean;
}

interface DailyPlanContent {
  id: number;
  free_content_type: string[];
  question: {
    id: number;
    title: string;
    isFinished: boolean;
    couplesFinished: number;
    state: ContentState;
  };
  test?: {
    id: number;
    title: string;
    isFinished: boolean;
    couplesFinished: number;
    state: ContentState;
  };
  game?: {
    id: number;
    title: string;
    isFinished: boolean;
    couplesFinished: number;
    state: ContentState;
  };
  exercise?: {
    id: number;
    title: string;
    isFinished: boolean;
    couplesFinished: number;
    state: ContentState;
  };
  checkup?: {
    id: number;
    title: string;
    isFinished: boolean;
    couplesFinished: number;
    state: ContentState;
  };
  article?: {
    id: number;
    title: string;
    isFinished: boolean;
    couplesFinished: number;
    state: ContentState;
  };
}

export const LabelIcon: React.FC<{
  label: string;
  color: string;
  icon?: React.ReactNode;
}> = ({ label, color, icon }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    <View>{icon}</View>
    <FontText small style={{ color }}>
      {label}
    </FontText>
  </View>
);

export const iconMap: {
  [key: string]: React.ReactNode;
} = {
  question: <HomeQuestionIcon width={16} height={16} />,
  test: <HomeTestIcon width={16} height={16} />,
  game: <HomeGameIcon width={16} height={16} />,
  article: <HomeArticleIcon width={16} height={16} />,
  exercise: <HomeExerciseIcon width={16} height={16} />,
  checkup: <HomeCheckupIcon width={16} height={16} />,
};

export const labelNameMap = (i18n: {
  t: (_: string) => string;
}): {
  [key: string]: string;
} => ({
  question: i18n.t('home_content_types_question'),
  test: i18n.t('home_content_types_test'),
  game: i18n.t('home_content_types_game'),
  article: i18n.t('home_content_types_article'),
  exercise: i18n.t('home_content_types_exercise'),
  checkup: i18n.t('home_content_types_checkup'),
});

interface ContentCardProps {
  type: ContentType;
  color: string;
  label: string;
  title: string;
  onPress: () => void;
  image: ImageSourcePropType;
  isLocked: boolean;
  isFinished: boolean;
  icon: React.ReactNode;
  isLast: boolean;
  state: ContentState;
  couplesFinished: number;
  name: string;
  partnerName: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  type,
  color,
  label,
  title,
  onPress,
  image,
  isLocked,
  isFinished,
  icon,
  isLast,
  state,
  couplesFinished,
  name,
  partnerName,
}) => {
  const { theme } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
      <View style={{ width: 24, alignItems: 'center', position: 'relative' }}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.colors.grey2,
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isFinished && <BlackSwoosh width={24} height={24} fill={theme.colors.black} />}
        </View>
        {!isLast && (
          <View
            style={{
              flex: 1,
              width: 2,
              backgroundColor: theme.colors.grey2,
            }}
          />
        )}
      </View>

      <TouchableOpacity
        onPress={onPress}
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: 16,
          paddingVertical: 8,
          paddingLeft: 20,
          paddingRight: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          flex: 1,
          marginLeft: 8,
        }}
      >
        <View style={{ flex: 1, flexDirection: 'column', gap: 8 }}>
          <LabelIcon label={label} color={color} icon={icon} />
          <FontText {...getContentTitleSize(title)}>{title}</FontText>
          {renderStateDefault(theme)(state, name, partnerName, couplesFinished)}
        </View>

        <View
          style={{
            width: 76,
            height: 102,
            borderRadius: 12,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Image
            source={image}
            style={{ width: '100%', height: '100%', borderRadius: 12 }}
            resizeMode="cover"
          />

          {isLocked && (
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 24,
                height: 24,
                backgroundColor: BADGE_COLOR,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <PremiumCrown width={16} height={16} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const HOME_DAILY_BANNER = 'HOME_DAILY_BANNER';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'V3Home'>) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [streak, setStreak] = useState(0);
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [dailyPlan, setDailyPlan] = useState<DailyPlanContent | null>(null);
  const [journeys, setJourneys] = useState<ContentBase[]>([]);
  const [totalJourneys, setTotalJourneys] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [hasPartner, setHasPartner] = useState(true);
  const [showNotificationBanner, setShowNotificationBanner] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const [hasHiddenBanner, setHasHiddenBanner] = useState(false);
  const fetchDailyPlan = async (): Promise<void> => {
    try {
      const createResult = await supabase.rpc('create_today_plan');
      if (createResult.error) throw createResult.error;

      const planData = createResult.data[0];
      const dailyPlanContent: DailyPlanContent = {
        id: planData.id,
        free_content_type: planData.free_content_type,
        question: {
          id: planData.question_id,
          title: planData.question_title,
          isFinished: planData.question_is_finished,
          couplesFinished: planData.question_couples_finished ?? 0,
          state: planData.question_state as ContentState,
        },
        test:
          planData.test_id && planData.test_title
            ? {
                id: planData.test_id,
                title: planData.test_title,
                isFinished: planData.test_is_finished,
                couplesFinished: planData.test_couples_finished ?? 0,
                state: planData.test_state as ContentState,
              }
            : undefined,
        game:
          planData.game_id && planData.game_title
            ? {
                id: planData.game_id,
                title: planData.game_title,
                isFinished: planData.game_is_finished,
                couplesFinished: planData.game_couples_finished ?? 0,
                state: planData.game_state as ContentState,
              }
            : undefined,
        exercise:
          planData.exercise_id && planData.exercise_title
            ? {
                id: planData.exercise_id,
                title: planData.exercise_title,
                isFinished: planData.exercise_is_finished,
                couplesFinished: planData.exercise_couples_finished ?? 0,
                state: planData.exercise_state as ContentState,
              }
            : undefined,
        checkup:
          planData.checkup_id && planData.checkup_title
            ? {
                id: planData.checkup_id,
                title: planData.checkup_title,
                isFinished: planData.checkup_is_finished,
                couplesFinished: planData.checkup_couples_finished ?? 0,
                state: planData.checkup_state as ContentState,
              }
            : undefined,
        article:
          planData.article_id && planData.article_title
            ? {
                id: planData.article_id,
                title: planData.article_title,
                isFinished: planData.article_is_finished,
                couplesFinished: planData.article_couples_finished ?? 0,
                state: planData.article_state as ContentState,
              }
            : undefined,
      };

      setDailyPlan(dailyPlanContent);
      const hidBanner = !!(await AsyncStorage.getItem(
        HOME_DAILY_BANNER + dailyPlanContent?.id?.toString() || '',
      ));
      setHasHiddenBanner(hidBanner);
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    }
  };

  const fetchInitialData = async () => {
    try {
      void localAnalytics().logEvent('V3HomeStartedLoading', {
        screen: 'V3Home',
        action: 'StartedLoading',
        userId: authContext.userId,
      });
      setLoading(true);
      // const userResult = await supabase
      //   .from('user_profile')
      //   .select('first_name, partner_first_name, couple_id, onboarding_finished')
      //   .eq('user_id', authContext.userId!)
      //   .single();
      // if (userResult.error) throw userResult.error;
      //
      // if (!userResult.data.onboarding_finished) {
      //   navigation.navigate('YourName', { fromSettings: false });
      //   return;
      // }

      const [
        userResult,
        streakResult,
        premiumResult,
        journeysCountResult,
        recommendedJourneysResult,
        hasPartnerResult,
        notificationStatus,
        _,
      ] = await Promise.all([
        supabase
          .from('user_profile')
          .select('first_name, partner_first_name, couple_id')
          .eq('user_id', authContext.userId!)
          .single(),
        supabase.rpc('get_total_streak'),
        supabase.rpc('is_user_premium'),
        supabase.rpc('get_journey_count'),
        supabase.rpc('get_recommended_journey'),
        supabase.rpc('has_partner'),
        Notifications.getPermissionsAsync(),
        fetchDailyPlan(),
      ]);

      if (userResult.error) throw userResult.error;
      if (streakResult.error) throw streakResult.error;
      if (premiumResult.error) throw premiumResult.error;
      if (journeysCountResult.error) throw journeysCountResult.error;
      if (recommendedJourneysResult.error) throw recommendedJourneysResult.error;
      if (hasPartnerResult.error) throw hasPartnerResult.error;

      setShowNotificationBanner(notificationStatus.status !== GRANTED_NOTIFICATION_STATUS);
      setStreak(streakResult.data);
      setName(showName(userResult.data.first_name));
      setPartnerName(showName(userResult.data.partner_first_name) || i18n.t('home_partner'));
      setIsPremium(!!premiumResult.data);
      setTotalJourneys(journeysCountResult.data);
      setJourneys(
        recommendedJourneysResult.data.map((journey) => ({
          ...journey,
          isLocked: !premiumResult.data,
        })),
      );
      setHasPartner(!!hasPartnerResult.data);

      void localAnalytics().logEvent('V3HomeLoaded', {
        screen: 'V3Home',
        action: 'Loaded',
        userId: authContext.userId,
        isPremium: premiumResult.data,
        hasContent: true,
      });
      void createDailyContentNotifications(
        authContext.userId!,
        showName(userResult.data.first_name),
        showName(userResult.data.partner_first_name),
      );
      void createInactivityNotifications(
        authContext.userId!,
        showName(userResult.data.first_name),
        showName(userResult.data.partner_first_name),
      );
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void fetchInitialData();
    }
  }, [route?.params?.refreshTimeStamp]);
  useEffect(() => {
    void fetchInitialData();
    isFirstMount.current = false;
  }, []);

  const handleContentPress = (type: ContentType, id: number, canActivate: boolean) => {
    void localAnalytics().logEvent(`V3HomeContentPressed`, {
      userId: authContext.userId,
      id,
      type,
    });
    navigation.navigate(contentDetailScreen[type], {
      id,
      refreshTimeStamp: new Date().toISOString(),
      fromHome: true,
      canActivate: canActivate,
    });
  };

  if (loading) {
    return <Loading />;
  }

  const baseContentTypes: ContentType[] = ['test', 'game', 'checkup', 'article', 'exercise'];
  // this makes sorting that free is first, then paid, but the general priority is kept
  const contentTypes: ContentType[] = dailyPlan?.free_content_type?.length
    ? [
        ...(dailyPlan.free_content_type.filter((type: string) =>
          baseContentTypes.includes(type as ContentType),
        ) as ContentType[]),
        ...baseContentTypes.filter((type) => !dailyPlan.free_content_type.includes(type)),
      ]
    : baseContentTypes;
  let lastContentType: ContentType = 'question';
  contentTypes.map((type) => {
    const content = dailyPlan?.[type];
    if (content) lastContentType = type;
  });

  const handleOpenNotifications = () => {
    void localAnalytics().logEvent(`V3HomeNotificationTurnOnClicked`, {
      screen: 'V3Home',
      userId: authContext.userId,
    });
    navigation.navigate('OnboardingNotification', {
      isOnboarding: false,
    });
  };
  const handleTrialBannerPress = () => {
    void localAnalytics().logEvent(`V3HomeStartPremiumClicked`, {
      screen: 'V3Home',
      userId: authContext.userId,
    });
    navigation.navigate('V3PremiumOffer', {
      refreshTimeStamp: new Date().toISOString(),
      isOnboarding: false,
    });
  };
  const handleGoToExplore = () => {
    void localAnalytics().logEvent(`V3HomeBannerGoToExplore`, {
      screen: 'V3Home',
      userId: authContext.userId,
    });
    navigation.navigate('V3Explore', {
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  const getIsPlanCompletelyFree = (dailyPlan: DailyPlanContent | null) => {
    if (!dailyPlan) return false;
    return contentTypes.every(
      (type) => !dailyPlan[type] || dailyPlan.free_content_type?.includes(type),
    );
  };

  const getHasFinishedDailyFreePlan = (dailyPlan: DailyPlanContent | null) => {
    if (!dailyPlan) return false;
    return dailyPlan.free_content_type?.every((type) => dailyPlan[type]?.isFinished);
  };
  const handleCloseDailyBanner = (dailyPlan: DailyPlanContent | null) => {
    if (!dailyPlan) return;
    void localAnalytics().logEvent('V3HomeCloseDailyBanner', {
      screen: 'V3Home',
      userId: authContext.userId,
      dailyPlanId: dailyPlan.id,
    });
    setHasHiddenBanner(true);
    void AsyncStorage.setItem(HOME_DAILY_BANNER + dailyPlan.id.toString() || '', 'true');
  };
  const getTopBanner = () => {
    if (!hasHiddenBanner && !isPremium && getHasFinishedDailyFreePlan(dailyPlan)) {
      return (
        <View style={{ marginBottom: 15 }}>
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              backgroundColor: theme.colors.white,
              padding: 20,
              borderRadius: 16,
              marginBottom: 10,
              width: '100%',
            }}
          >
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
              <CheckSuccessIcon />
              <CloseButton onPress={() => void handleCloseDailyBanner(dailyPlan)}></CloseButton>
            </View>
            <FontText h3 style={{ marginTop: 14 }}>
              {i18n.t('v3_home_finished_free_2_title')}
            </FontText>
            <FontText style={{ color: theme.colors.grey5, marginVertical: 12 }}>
              {i18n.t('v3_home_finished_free_2_description')}
            </FontText>
            <PrimaryButton
              buttonStyle={{
                marginTop: 30,
                height: 'auto',
                width: 'auto',
              }}
              onPress={() => void handleTrialBannerPress()}
            >
              {i18n.t('home_unlock_all_content')}
            </PrimaryButton>
          </View>
        </View>
      );
    } else if (
      !hasHiddenBanner &&
      isPremium &&
      dailyPlan &&
      [
        dailyPlan.question,
        dailyPlan.exercise,
        dailyPlan.game,
        dailyPlan.test,
        dailyPlan.checkup,
        dailyPlan.article,
      ].every((x) => !x || x.isFinished)
    ) {
      return (
        <View style={{ marginBottom: 15 }}>
          <View
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              backgroundColor: theme.colors.white,
              padding: 20,
              borderRadius: 16,
              marginBottom: 10,
              width: '100%',
            }}
          >
            <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
              <CheckSuccessIcon />
              <CloseButton onPress={() => void handleCloseDailyBanner(dailyPlan)}></CloseButton>
            </View>
            <FontText h3 style={{ marginTop: 14 }}>
              {i18n.t('v3_home_finished_premium_2_title')}
            </FontText>
            <FontText style={{ color: theme.colors.grey5, marginVertical: 12 }}>
              {i18n.t('v3_home_finished_premium_2_description')}
            </FontText>
            <PrimaryButton
              buttonStyle={{
                marginTop: 30,
                height: 'auto',
                width: 'auto',
              }}
              onPress={() => void handleGoToExplore()}
            >
              {i18n.t('home_go_to_explore')}
            </PrimaryButton>
          </View>
        </View>
      );
    } else if (!hasPartner) {
      return (
        <View style={{ marginBottom: 15 }}>
          <AnswerNoPartnerWarning prefix={'V3Home'} partnerName={partnerName} isV3={true} />
        </View>
      );
    } else if (showNotificationBanner) {
      return (
        <View style={{ marginBottom: 15 }}>
          <TouchableOpacity onPress={() => void handleOpenNotifications()}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: theme.colors.white,
                padding: 20,
                borderRadius: 16,
                marginBottom: 10,
                width: '100%',
              }}
            >
              <DangerSignIcon />
              <View style={{ flex: 1, marginHorizontal: 5 }}>
                <FontText small>{i18n.t('v3_home_turn_on_notification')}</FontText>
              </View>
              <SmallArrowRight />
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  };

  const LoveNote = (
    <View
      style={{
        position: 'absolute',
        bottom: insets.bottom + getFontSizeForScreen('h1') * 2.5 + 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      <LoveNoteButton />
    </View>
  );
  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }} />
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: theme.colors.white }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              justifyContent: 'space-between',
            }}
          >
            <FontText h4 style={{ color: theme.colors.black }}>
              {`${name} & ${partnerName}`}
            </FontText>
            <TouchableOpacity
              onPress={() => void handleStreakTouch('V3Home', authContext.userId!, navigation)}
            >
              <Streak streak={streak}></Streak>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 20,
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
            }
          >
            <View style={{ marginBottom: 70 }}>
              {getTopBanner()}
              <FontText h3 style={{ color: theme.colors.black, marginBottom: 20 }}>
                {isPremium || !getIsPlanCompletelyFree(dailyPlan)
                  ? i18n.t('home_daily_plan_title')
                  : i18n.t('home_daily_free_plan_title')}
              </FontText>
              <View style={{ gap: 12 }}>
                {dailyPlan?.question && (
                  <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
                    {/* Left "progress" column with vertical line + circle for the Question */}
                    <View style={{ width: 24, alignItems: 'center', position: 'relative' }}>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: theme.colors.grey2,
                          backgroundColor: 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {dailyPlan.question.isFinished && <BlackSwoosh width={24} height={24} />}
                      </View>
                      <View
                        style={{
                          flex: 1,
                          width: 2,
                          backgroundColor: theme.colors.grey2,
                        }}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={() => handleContentPress('question', dailyPlan.question.id, true)}
                      style={{
                        backgroundColor: theme.colors.black,
                        borderRadius: 16,
                        minHeight: 140,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        flex: 1,
                        marginLeft: 8,
                      }}
                    >
                      <View style={{ padding: 20 }}>
                        <View style={{ gap: 15 }}>
                          <LabelIcon
                            label={labelNameMap(i18n)['question']}
                            color={contentTypeBackground['question']}
                            icon={iconMap['question']}
                          />
                          <FontText
                            style={{ color: 'white' }}
                            {...getContentTitleSize(dailyPlan.question.title)}
                          >
                            {dailyPlan.question.title}
                          </FontText>
                        </View>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-end',
                        }}
                      >
                        <View style={{ flex: 1, paddingLeft: 20, paddingBottom: 20 }}>
                          {renderStateDefault(theme)(
                            dailyPlan.question.state,
                            name,
                            partnerName,
                            dailyPlan.question.couplesFinished,
                          )}
                        </View>
                        <Image
                          source={HOME_QUESTION_CORNER_IMAGE}
                          style={{ width: 101, height: 92 }}
                          resizeMode="contain"
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                )}

                {contentTypes.map((type: ContentType) => {
                  const content = dailyPlan?.[type];
                  if (!content) return null;
                  const contentId = content?.id;
                  const locked = !isPremium && !dailyPlan?.free_content_type?.includes(type);
                  const isFinished = content.isFinished;
                  return (
                    <ContentCard
                      key={type}
                      type={type}
                      color={contentTypeBackground[type]}
                      label={labelNameMap(i18n)[type]}
                      title={content.title || ''}
                      onPress={() => handleContentPress(type, contentId, !locked)}
                      image={getContentImageFromId(contentId)}
                      isLocked={locked}
                      isFinished={isFinished}
                      icon={iconMap[type]}
                      isLast={lastContentType === type}
                      state={content.state}
                      couplesFinished={content.couplesFinished}
                      name={name}
                      partnerName={partnerName}
                    />
                  );
                })}
              </View>
            </View>
            {/*Journey part*/}
            {/*<View style={{ marginBottom: 40 }}>*/}
            {/*  <View*/}
            {/*    style={{*/}
            {/*      flexDirection: 'row',*/}
            {/*      justifyContent: 'space-between',*/}
            {/*      alignItems: 'center',*/}
            {/*    }}*/}
            {/*  >*/}
            {/*    <FontText h4 style={{ color: theme.colors.black }}>*/}
            {/*      {i18n.t('home_journey_title')}*/}
            {/*    </FontText>*/}
            {/*    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>*/}
            {/*      <FontText small style={{ color: theme.colors.grey3, marginRight: 4 }}>*/}
            {/*        {i18n.t('home_total_journey', { count: totalJourneys })}*/}
            {/*      </FontText>*/}
            {/*    </TouchableOpacity>*/}
            {/*  </View>*/}

            {/*  <ScrollView*/}
            {/*    horizontal*/}
            {/*    showsHorizontalScrollIndicator={false}*/}
            {/*    contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingVertical: 8 }}*/}
            {/*  >*/}
            {/*    {journeys.map((journey) => (*/}
            {/*      <TouchableOpacity*/}
            {/*        key={journey.id}*/}
            {/*        onPress={() => handleContentPress('journey', journey.id)}*/}
            {/*        style={{*/}
            {/*          width: 185,*/}
            {/*          height: 245,*/}
            {/*          borderRadius: 20,*/}
            {/*          overflow: 'hidden',*/}
            {/*          position: 'relative',*/}
            {/*          justifyContent: 'flex-end',*/}
            {/*        }}*/}
            {/*      >*/}
            {/*        <Image*/}
            {/*          source={getContentImageFromId(journey.id)}*/}
            {/*          style={{*/}
            {/*            width: '100%',*/}
            {/*            height: '100%',*/}
            {/*          }}*/}
            {/*          resizeMode="cover"*/}
            {/*        />*/}
            {/*        {journey.isLocked && (*/}
            {/*          <View*/}
            {/*            style={{*/}
            {/*              position: 'absolute',*/}
            {/*              top: 8,*/}
            {/*              right: 8,*/}
            {/*              width: 24,*/}
            {/*              height: 24,*/}
            {/*              backgroundColor: BADGE_COLOR,*/}
            {/*              borderRadius: 30,*/}
            {/*              justifyContent: 'center',*/}
            {/*              alignItems: 'center',*/}
            {/*            }}*/}
            {/*          >*/}
            {/*            <PremiumCrown width={16} height={16} />*/}
            {/*          </View>*/}
            {/*        )}*/}
            {/*        <View*/}
            {/*          style={{*/}
            {/*            position: 'absolute',*/}
            {/*            left: 0,*/}
            {/*            right: 0,*/}
            {/*            bottom: 0,*/}
            {/*            justifyContent: 'flex-end',*/}
            {/*            padding: 20,*/}
            {/*          }}*/}
            {/*        >*/}
            {/*          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>*/}
            {/*            <FontText*/}
            {/*              style={{ color: theme.colors.black }}*/}
            {/*              {...getContentTitleSize(journey.title)}*/}
            {/*            >*/}
            {/*              {journey.title}*/}
            {/*            </FontText>*/}
            {/*          </View>*/}
            {/*        </View>*/}
            {/*      </TouchableOpacity>*/}
            {/*    ))}*/}
            {/*  </ScrollView>*/}
            {/*</View>*/}
          </ScrollView>
        </View>
        {LoveNote}
        <V3Menu></V3Menu>
      </SafeAreaView>
    </>
  );
}
