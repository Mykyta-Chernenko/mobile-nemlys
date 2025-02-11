import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Image, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthContext } from '@app/provider/AuthProvider';
import { MainStackParamList } from '@app/types/navigation';
import { useTheme } from '@rneui/themed';
import { localAnalytics } from '@app/utils/analytics';
import { supabase } from '@app/api/initSupabase';
import { logSupaErrors } from '@app/utils/errors';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import moment from 'moment';

import StreakHit from '@app/icons/streak_hit_small';
import StreakFreeze from '@app/icons/streak_freeze_small';
import StreakMiss from '@app/icons/streak_miss_small';
import StreakEmpty from '@app/icons/streak_empty_small';

import { i18n } from '@app/localization/i18n';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { PostgrestError } from '@supabase/supabase-js';
import { recreateNotificationList, removeOldNotification } from '@app/utils/notification';
import {
  V3_NOTIFICATION_IDENTIFIERS,
  V3_NOTIFICATION_SUBTYPE,
  V3_NOTIFICATION_TYPE,
} from '@app/types/domain';
import {
  SchedulableNotificationTriggerInput,
  SchedulableTriggerInputTypes,
} from 'expo-notifications';
import { calculateHourTimeAfterDays } from '@app/utils/date';

type Props = NativeStackScreenProps<MainStackParamList, 'V3ShowStreak'>;

interface StreakDay {
  hit_date: string;
  state: 'hit' | 'freeze' | 'miss' | null;
}

export const handleStreakTouch = (
  prefix: string,
  userId: string,
  navigation: NativeStackNavigationProp<MainStackParamList, any, undefined>,
) => {
  void localAnalytics().logEvent(`${prefix}StreakPressed`, {
    userId,
  });
  navigation.navigate('V3ShowStreak', {
    refreshTimeStamp: new Date().toISOString(),
    nextScreen: 'V3Home',
    screenParams: { refreshTimeStamp: new Date().toISOString() },
  });
};
export default function V3ShowStreak({ route, navigation }: Props) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const { nextScreen, screenParams } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<StreakDay[]>([]);
  const isFirstMount = useRef(true);

  async function createAfterStreakNotification(streakDay: number) {
    const preDateIdentifier = V3_NOTIFICATION_IDENTIFIERS.STREAK;
    const notifications = [
      {
        screen: 'V3Home',
        title: i18n.t('notification_streak_1_title_2'),
        body: i18n.t('notification_streak_1_body_2', { streakDay }),
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: calculateHourTimeAfterDays(1, 22),
          repeats: false,
        } as SchedulableNotificationTriggerInput,
        subtype: V3_NOTIFICATION_SUBTYPE.STREAK_1,
      },
      {
        screen: 'V3Home',
        title: i18n.t('notification_streak_2_title_2'),
        body: i18n.t('notification_streak_2_body_2'),
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: calculateHourTimeAfterDays(2, 22),
          repeats: false,
        } as SchedulableNotificationTriggerInput,
        subtype: V3_NOTIFICATION_SUBTYPE.STREAK_2,
      },
      {
        screen: 'V3Home',
        title: i18n.t('notification_streak_3_title_2'),
        body: i18n.t('notification_streak_3_body_2'),
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: calculateHourTimeAfterDays(3, 22),
          repeats: false,
        } as SchedulableNotificationTriggerInput,
        subtype: V3_NOTIFICATION_SUBTYPE.STREAK_3,
      },
    ];
    await recreateNotificationList(
      authContext.userId!,
      preDateIdentifier,
      notifications,
      V3_NOTIFICATION_TYPE.STREAK,
      [
        V3_NOTIFICATION_SUBTYPE.STREAK_1,
        V3_NOTIFICATION_SUBTYPE.STREAK_2,
        V3_NOTIFICATION_SUBTYPE.STREAK_3,
      ].join(':'),
    );
  }

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = authContext.userId;
      if (!userId) {
        setLoading(false);
        return;
      }

      localAnalytics().logEvent('ShowStreakLoadingStarted', {
        screen: 'ShowStreak',
        action: 'LoadingStarted',
        userId,
      });

      const [streakRes, lastWeekRes] = await Promise.all([
        supabase.rpc('get_total_streak'),
        supabase.rpc('get_last_week_streak'),
      ]);

      if (streakRes.error) throw streakRes.error;
      if (lastWeekRes.error) throw lastWeekRes.error;
      setCurrentStreak(streakRes.data || 0);
      setStreakDays(lastWeekRes.data || []);

      localAnalytics().logEvent('ShowStreakLoaded', {
        screen: 'ShowStreak',
        action: 'Loaded',
        userId,
        currentStreak: streakRes.data,
        lastWeek: JSON.stringify(lastWeekRes.data),
      });

      // user has finished one piece of content, we can remove the pre content notification we created during the onboarding
      void removeOldNotification(V3_NOTIFICATION_IDENTIFIERS.PRE_CONTENT);
      void createAfterStreakNotification(streakRes.data);
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [authContext.userId]);

  useEffect(() => {
    if (!isFirstMount.current && route.params?.refreshTimeStamp) {
      void fetchInitialData();
    }
  }, [route.params?.refreshTimeStamp]);

  useEffect(() => {
    void fetchInitialData();
    isFirstMount.current = false;
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleContinue = () => {
    localAnalytics().logEvent('ShowStreakContinueClicked', {
      screen: 'ShowStreak',
      action: 'ContinueClicked',
      userId: authContext.userId,
      nextScreen,
      screenParams,
    });

    if (nextScreen) {
      navigation.navigate(
        // @ts-expect-error cannot type screen name here
        nextScreen,
        screenParams || { refreshTimeStamp: new Date().toISOString() },
      );
    } else {
      navigation.navigate('V3Home', { refreshTimeStamp: new Date().toISOString() });
    }
  };

  const STREAK_FIRE_IMG = require('../../../assets/images/streak_fire.png');

  const renderIcon = (state: 'hit' | 'freeze' | 'miss' | null) => {
    if (state === 'hit') return <StreakHit width={24} height={24} />;
    if (state === 'freeze') return <StreakFreeze width={24} height={24} />;
    if (state === 'miss') return <StreakMiss width={24} height={24} />;
    return <StreakEmpty width={24} height={24} />;
  };
  const renderDayColor = (state: 'hit' | 'freeze' | 'miss' | null) => {
    if (state === 'hit') return theme.colors.primary;
    if (state === 'freeze') return '#3E89F9';
    if (state === 'miss') return theme.colors.warning;
    return 'rgba(255, 255, 255, 0.15)';
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.black }}>
        {loading ? (
          <Loading />
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
            }
          >
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                paddingHorizontal: 20,
                marginTop: 40,
                justifyContent: 'space-between',
              }}
            >
              <View></View>
              <View style={{ alignItems: 'center' }}>
                <View style={{ width: 200, height: 260, marginBottom: 10, alignItems: 'center' }}>
                  <Image
                    source={STREAK_FIRE_IMG}
                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 125,
                      left: 0,
                      right: 0,
                      alignItems: 'center',
                    }}
                  >
                    <FontText style={{ fontSize: 80 }}>{currentStreak}</FontText>
                  </View>
                </View>

                <FontText h3 style={{ color: theme.colors.white, marginBottom: 30 }}>
                  {i18n.t('show_streak_day_streak')}
                </FontText>
              </View>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    gap: 15,
                  }}
                >
                  {streakDays.map((day, idx) => {
                    const dayLetter = moment(day.hit_date)
                      .format('dd')
                      .substring(0, 1)
                      .toUpperCase();
                    return (
                      <View key={idx} style={{ alignItems: 'center' }}>
                        {renderIcon(day.state)}
                        <FontText small style={{ marginTop: 5, color: renderDayColor(day.state) }}>
                          {dayLetter}
                        </FontText>
                      </View>
                    );
                  })}
                </View>

                <FontText
                  small
                  style={{ color: theme.colors.grey3, textAlign: 'center', marginTop: 20 }}
                >
                  {i18n.t('show_streak_subtitle')}
                </FontText>
              </View>
              <SecondaryButton
                containerStyle={{ width: '100%' }}
                onPress={handleContinue}
                title={i18n.t('continue')}
              ></SecondaryButton>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </>
  );
}
