import React, { useContext, useEffect, useRef, useState } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '@app/components/utils/Loading';
import { logSupaErrors } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import { RefreshControl, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { FontText, getFontSizeForScreen } from '@app/components/utils/FontText';
import DateIssues from '@app/icons/date_issues';
import DateSex from '@app/icons/date_sex';
import DateKnow from '@app/icons/date_know';
import DateHard from '@app/icons/date_hard';
import DateMeaningful from '@app/icons/date_meaningful';
import DateFun from '@app/icons/date_fun';
import { i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';
import {
  JobSlug,
  NOTIFICATION_IDENTIFIERS,
  NOTIFICATION_SUBTYPE,
  NOTIFICATION_TYPE,
} from '@app/types/domain';
import HomePremiumBanner, { HomePremiumBannerRef } from '@app/components/premium/HomePremiumBanner';
import { calculateEveningTimeAfterDays, getDateFromString, getNow } from '@app/utils/date';
import Menu from '@app/components/menu/Menu';
import { recreateNotificationList } from '@app/utils/notification';
import { shuffle } from '@app/utils/array';
import _ from 'lodash';
import { COUNTRY, TIMEZONE } from '@app/utils/constants';
import HomeHeader from '@app/screens/menu/HomeHeader';
import { useDatePolling } from '@app/api/getNewActiveDates';
import { useIsFocused } from '@react-navigation/native';
import Constants from 'expo-constants';
import { logout } from '@app/utils/auth';

export function getJobs(): { slug: JobSlug; title: string; icon: (props: any) => JSX.Element }[] {
  return [
    { slug: 'issues', title: i18n.t('jobs_issues'), icon: DateIssues },
    { slug: 'sex', title: i18n.t('jobs_sex'), icon: DateSex },
    { slug: 'know', title: i18n.t('jobs_know'), icon: DateKnow },
    { slug: 'hard', title: i18n.t('jobs_hard'), icon: DateHard },
    { slug: 'meaningful', title: i18n.t('jobs_meaningful'), icon: DateMeaningful },
    { slug: 'fun', title: i18n.t('jobs_fun'), icon: DateFun },
  ];
}

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'Home'>) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [premiumDataLoaded, setPremiumDataLoaded] = useState<boolean | undefined>(undefined);

  const premiumRef = useRef<HomePremiumBannerRef>(null);
  const [hasPartner, setHasPartner] = useState(false);
  const [coupleId, setCoupleId] = useState<number | null>(null);

  const handleStartDate = (job: JobSlug) => {
    premiumRef.current?.startDateClick(job);
  };

  const padding = 20;
  const authContext = useContext(AuthContext);
  // to set the color of status bar
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getIsOnboarded();
    setRefreshing(false);
  };
  async function scheduleFirstDateNotification() {
    const preDateIdentifier = NOTIFICATION_IDENTIFIERS.PRE_DATE + authContext.userId!;

    const notificationOrder = shuffle([
      NOTIFICATION_SUBTYPE.PRE_DATE_1,
      NOTIFICATION_SUBTYPE.PRE_DATE_2,
      NOTIFICATION_SUBTYPE.PRE_DATE_3,
    ]);
    const trigerSeconds = [10 * 60, 60 * 60, calculateEveningTimeAfterDays(1)];
    const notifications = (
      _.zip(notificationOrder, trigerSeconds) as [NOTIFICATION_SUBTYPE, number][]
    ).map(([subtype, seconds]) => ({
      screen: 'Home',
      title: i18n.t(`notification_pre_date_${subtype}_title`),
      body: i18n.t(`notification_pre_date_${subtype}_body`),
      trigger: {
        seconds,
        repeats: false,
      },
      subtype,
    }));
    await recreateNotificationList(
      authContext.userId!,
      preDateIdentifier,
      [
        ...notifications,
        {
          screen: 'Home',
          title: i18n.t(`notification_pre_date_${NOTIFICATION_SUBTYPE.PRE_DATE_1}_title`),
          body: i18n.t(`notification_pre_date_${NOTIFICATION_SUBTYPE.PRE_DATE_1}_body`),
          trigger: {
            seconds: calculateEveningTimeAfterDays(7),
            repeats: false,
          },
          subtype: NOTIFICATION_SUBTYPE.PRE_DATE_1,
        },
      ],
      NOTIFICATION_TYPE.PRE_DATE,
      [...notificationOrder, NOTIFICATION_SUBTYPE.PRE_DATE_1].join(':'),
    );
  }

  async function getIsOnboarded() {
    setPremiumDataLoaded(undefined);
    setLoading(true);
    const [userProfileData, activeDatesRes, hasPartnerRes] = await Promise.all([
      supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', authContext.userId!)
        .not('user_id', 'is', null)
        .single(),
      supabase
        .from('date')
        .select('*')
        .eq('active', true)
        .eq('created_by', authContext.userId!)
        .order('id', { ascending: false }),
      supabase.rpc('has_partner'),
    ]);

    if (userProfileData.error) {
      logSupaErrors(userProfileData.error);
      void logout();
      return;
    }
    if (!userProfileData.data.onboarding_finished) {
      navigation.navigate('YourName', { fromSettings: false });
      return;
    } else {
      const coupleId = userProfileData.data.couple_id;
      setCoupleId(coupleId);
      //  TODO not showing interview whne users come back second day now
      // if (!userProfileData.data.showed_interview_request) {
      //   const { error: errorDateYesterday, count: dateYesterdayCount } = await supabase
      //     .from('date')
      //     .select('*', { count: 'exact' })
      //     .eq('couple_id', coupleId)
      //     .eq('active', false)
      //     .lt('created_at', getNow().startOf('day').toISOString())
      //     .limit(1);
      //   if (errorDateYesterday) {
      //     logSupaErrors(errorDateYesterday);
      //     return;
      //   }
      //   const showInterview = (dateYesterdayCount || 0) > 0;
      //   if (showInterview) {
      //     navigation.navigate('InterviewText', { refreshTimeStamp: new Date().toISOString() });
      //   }
      // }
      if (activeDatesRes.error) {
        logSupaErrors(activeDatesRes.error);
        return;
      }
      if (activeDatesRes.data.length > 0) {
        for (const date of activeDatesRes.data.slice(1)) {
          if (date.created_by === authContext.userId) {
            await supabase.from('date').update({ active: false }).eq('id', date.id);
          }
        }
        const lastDate = activeDatesRes.data[0];
        const oneHourAgo = getNow().subtract(1, 'hour');

        if (
          (lastDate.created_by !== authContext.userId &&
            lastDate.with_partner &&
            getDateFromString(lastDate.created_at) > oneHourAgo) ||
          lastDate.created_by === authContext.userId
        ) {
          void localAnalytics().logEvent('HomeDateExistGoToDate', {
            screen: 'Home',
            action: 'QuestionGenerated',
            userId: authContext.userId,
            id: lastDate.id,
          });
          navigation.navigate('OnDate', {
            id: lastDate.id,
            refreshTimeStamp: new Date().toISOString(),
          });
          return;
        }
      }
      void localAnalytics().logEvent('HomeLoaded', {
        screen: 'Home',
        action: 'Loaded',
        userId: authContext.userId,
      });

      const [dateCountRes, _] = await Promise.all([
        supabase
          .from('date')
          .select('*', { count: 'exact' })
          .eq('couple_id', coupleId)
          .eq('active', false)
          .eq('stopped', false),
        supabase
          .from('user_technical_details')
          .update({
            user_timezone: TIMEZONE,
            user_country: COUNTRY,
            app_version: Constants.expoConfig?.version || null,
          })
          .eq('user_id', authContext.userId!),
      ]);

      if (dateCountRes.error) {
        logSupaErrors(dateCountRes.error);
        return;
      }

      const dateCount = dateCountRes.count || 0;

      setLoading(false);

      if (dateCount === 0) void scheduleFirstDateNotification();
    }
    if (hasPartnerRes.error) {
      logSupaErrors(hasPartnerRes.error);
      return;
    }
    setHasPartner(hasPartnerRes.data);

    setLoading(false);
  }
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void getIsOnboarded();
    }
  }, [route?.params?.refreshTimeStamp]);
  useEffect(() => {
    void getIsOnboarded();
    isFirstMount.current = false;
  }, []);

  const isFocused = useIsFocused() && !!coupleId;

  useDatePolling(hasPartner, undefined, navigation, authContext.userId!, coupleId || 0, isFocused);

  if (loading) return <Loading />;
  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.white,
      }}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <View style={{ flexGrow: 1, padding: padding }}>
          <HomeHeader />
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexGrow: 1,
                marginHorizontal: -padding,
                backgroundColor: theme.colors.grey1,
              }}
            >
              <ScrollView
                contentContainerStyle={{
                  flexGrow: 1,
                  padding,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                }}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
                }
              >
                <HomePremiumBanner
                  ref={premiumRef}
                  setDataLoaded={() => setPremiumDataLoaded(true)}
                />
                {!premiumDataLoaded ? (
                  <Loading />
                ) : (
                  <>
                    <FontText h3 style={{ marginBottom: 15, width: '100%' }}>
                      {i18n.t('home_date_discuss')}
                    </FontText>
                    {getJobs().map((j) => (
                      <TouchableOpacity
                        key={j.slug}
                        style={{
                          borderRadius: 16,
                          width: '49%',
                          backgroundColor: theme.colors.white,
                          padding: 24,
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          marginBottom: '2.5%',
                        }}
                        onPress={() => handleStartDate(j.slug)}
                      >
                        <j.icon style={{ marginBottom: 20 }}></j.icon>
                        <FontText>{j.title}</FontText>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </ScrollView>
            </View>
          </View>
          <View
            style={{
              backgroundColor: theme.colors.grey1,
              marginHorizontal: -padding,
              height: getFontSizeForScreen('h1') * 2,
            }}
          >
            <Menu></Menu>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
