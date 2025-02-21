import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { Loading } from '@app/components/utils/Loading';
import { localAnalytics } from '@app/utils/analytics';
import { logSupaErrors } from '@app/utils/errors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { useTheme } from '@rneui/themed';
import V3Menu from '@app/components/menu/V3Menu';
import Streak from '@app/components/menu/Streak';

import ContentQuestionIcon from '@app/icons/content_question';
import ContentExerciseIcon from '@app/icons/content_exercise';
import ContentCheckupIcon from '@app/icons/content_checkup';
import ContentTestIcon from '@app/icons/content_test';
import ContentArticleIcon from '@app/icons/content_article';
import ContentGameIcon from '@app/icons/content_game';

import {
  ARTICLE_COLOR,
  BACKGROUND_LIGHT_BEIGE_COLOR,
  CHECKUP_COLOR,
  EXERCISE_COLOR,
  GAME_COLOR,
  QUESTION_COLOR,
  TEST_COLOR,
} from '@app/utils/colors';
import { contentListScreen, ContentType } from '@app/types/domain';
import { handleStreakTouch } from '@app/screens/content/V3ShowStreak';
import { PostgrestError } from '@supabase/supabase-js';

const JOURNEY_IMAGE = require('../../../assets/images/explore_journey_corner_image.png');
const TEST_IMAGE = require('../../../assets/images/explore_test_corner_image.png');
const CHECKUP_IMAGE = require('../../../assets/images/explore_checkup_corner_image.png');

type Props = NativeStackScreenProps<MainStackParamList, 'V3Explore'>;

interface ContentCount {
  journey_count: number;
  question_count: number;
  test_count: number;
  game_count: number;
  exercise_count: number;
  article_count: number;
  checkup_count: number;
}

export default function V3Explore({ route, navigation }: Props) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [streak, setStreak] = useState(0);
  const [totalJourney, setTotalJourney] = useState(0);
  const [totalQuestion, setTotalQuestion] = useState(0);
  const [totalTest, setTotalTest] = useState(0);
  const [totalGame, setTotalGame] = useState(0);
  const [totalExercise, setTotalExercise] = useState(0);
  const [totalArticle, setTotalArticle] = useState(0);
  const [totalCheckup, setTotalCheckup] = useState(0);

  const isFirstMount = useRef(true);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const [userResult, streakResult, premiumResult, contentCountResult] = await Promise.all([
        supabase
          .from('user_profile')
          .select('first_name, partner_first_name, couple_id')
          .eq('user_id', authContext.userId!)
          .single(),
        supabase.rpc('get_total_streak'),
        supabase.rpc('is_user_premium'),
        supabase.rpc('get_content_count', { jobs: [] }),
      ]);

      if (userResult.error) throw userResult.error;
      if (streakResult.error) throw streakResult.error;
      if (premiumResult.error) throw premiumResult.error;
      if (contentCountResult.error) throw contentCountResult.error;

      const data = contentCountResult.data as ContentCount;

      setStreak(streakResult.data);
      setTotalJourney(data.journey_count);
      setTotalQuestion(data.question_count);
      setTotalTest(data.test_count);
      setTotalGame(data.game_count);
      setTotalExercise(data.exercise_count);
      setTotalArticle(data.article_count);
      setTotalCheckup(data.checkup_count);

      void localAnalytics().logEvent('V3ExploreLoaded', {
        userId: authContext.userId,
        isPremium: premiumResult.data,
        hasContent: true,
      });
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
  const handleListPress = (type: ContentType) => {
    void localAnalytics().logEvent(`V3ExploreContentClicked`, {
      userId: authContext.userId,
      type,
    });
    navigation.navigate(contentListScreen[type], { refreshTimeStamp: new Date().toISOString() });
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

  if (loading) {
    return <Loading />;
  }

  const Card = ({
    type,
    color,
    icon,
    title,
    subtitle,
    count,
    image,
  }: {
    type: ContentType;
    color: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    count: number;
    image?: ImageSourcePropType;
  }) => (
    <TouchableOpacity
      onPress={() => void handleListPress(type)}
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          backgroundColor: color,
          borderRadius: 16,
          padding: 20,
          marginBottom: 8,
          minHeight: 175,
        }}
      >
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'column', gap: 8 }}>
            {icon}
            <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
              <FontText style={{ color: theme.colors.white }} h4>
                {title}
              </FontText>
            </View>
            <FontText
              style={{ color: 'rgba(255,255,255,0.6)', maxWidth: image ? '80%' : '100%' }}
              small
            >
              {subtitle}
            </FontText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 40,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}
            >
              <FontText style={{ color: theme.colors.white }} small>
                {count}
              </FontText>
            </View>
          </View>
        </View>

        {image && (
          <Image
            source={image}
            style={{
              position: 'absolute',
              width: 78,
              height: 111,
              right: 0,
              bottom: 0,
              resizeMode: 'cover',
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }} />
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: theme.colors.white }}
      >
        <View style={{ flex: 1, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}>
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 12,
              backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <FontText h4 style={{ color: theme.colors.black }}>
              {i18n.t('explore_title')}
            </FontText>
            <TouchableOpacity
              onPress={() => handleStreakTouch('V3Explore', authContext.userId!, navigation)}
            >
              <Streak streak={streak} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
            }
          >
            {/*<Card*/}
            {/*  type={'journey'}*/}
            {/*  color={JOURNEY_COLOR}*/}
            {/*  icon={*/}
            {/*    <ContentJourneyIcon*/}
            {/*      width={24}*/}
            {/*      height={24}*/}
            {/*      fill={theme.colors.white}*/}
            {/*      stroke={theme.colors.white}*/}
            {/*    />*/}
            {/*  }*/}
            {/*  title={i18n.t('explore_journey_title')}*/}
            {/*  subtitle={i18n.t('explore_journey_subtitle')}*/}
            {/*  count={totalJourney}*/}
            {/*  image={JOURNEY_IMAGE}*/}
            {/*/>*/}

            <Card
              type={'test'}
              color={TEST_COLOR}
              icon={
                <ContentTestIcon
                  width={24}
                  height={24}
                  fill={theme.colors.white}
                  stroke={theme.colors.white}
                />
              }
              title={i18n.t('explore_test_title')}
              subtitle={i18n.t('explore_test_subtitle')}
              count={totalTest}
              image={TEST_IMAGE}
            />

            <View
              style={{
                flexDirection: 'row',
                columnGap: 8,
                justifyContent: 'space-between',
              }}
            >
              <Card
                type={'game'}
                color={GAME_COLOR}
                icon={
                  <ContentGameIcon
                    width={24}
                    height={24}
                    fill={theme.colors.white}
                    stroke={theme.colors.white}
                  />
                }
                title={i18n.t('explore_game_title')}
                subtitle={i18n.t('explore_game_subtitle')}
                count={totalGame}
              />
              <Card
                type={'exercise'}
                color={EXERCISE_COLOR}
                icon={
                  <ContentExerciseIcon
                    width={24}
                    height={24}
                    fill={theme.colors.white}
                    stroke={theme.colors.white}
                  />
                }
                title={i18n.t('explore_practice_title')}
                subtitle={i18n.t('explore_practice_subtitle')}
                count={totalExercise}
              />
            </View>

            <View style={{ flexDirection: 'row', columnGap: 8, flex: 1 }}>
              <Card
                type={'question'}
                color={QUESTION_COLOR}
                icon={
                  <ContentQuestionIcon
                    width={24}
                    height={24}
                    fill={theme.colors.white}
                    stroke={theme.colors.white}
                  />
                }
                title={i18n.t('explore_question_title')}
                subtitle={i18n.t('explore_question_subtitle')}
                count={totalQuestion}
              />
              <Card
                type={'article'}
                color={ARTICLE_COLOR}
                icon={
                  <ContentArticleIcon
                    width={24}
                    height={24}
                    fill={theme.colors.white}
                    stroke={theme.colors.white}
                  />
                }
                title={i18n.t('explore_article_title')}
                subtitle={i18n.t('explore_article_subtitle')}
                count={totalArticle}
              />
            </View>

            <Card
              type={'checkup'}
              color={CHECKUP_COLOR}
              icon={
                <ContentCheckupIcon
                  width={24}
                  height={24}
                  fill={theme.colors.white}
                  stroke={theme.colors.white}
                />
              }
              title={i18n.t('explore_checkup_title')}
              subtitle={i18n.t('explore_checkup_subtitle')}
              count={totalCheckup}
              image={CHECKUP_IMAGE}
            />

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
        <V3Menu />
      </SafeAreaView>
    </>
  );
}
