import React, { useContext, useEffect, useRef, useState } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '@app/components/utils/Loading';
import { logErrors } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import { APIUserProfile, SupabaseAnswer } from '@app/types/api';
import { SafeAreaView, ScrollView, View } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { FontText } from '@app/components/utils/FontText';
import DateIssues from '@app/icons/date_issues';
import DateSex from '@app/icons/date_sex';
import DateKnow from '@app/icons/date_know';
import DateHard from '@app/icons/date_hard';
import DateMeaningful from '@app/icons/date_meaningful';
import DateFun from '@app/icons/date_fun';
import BuddiesCorner from '@app/icons/buddies_corner';
import { i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';
import { logout } from '../settings/Settings';
import { TouchableOpacity } from 'react-native';
import NewReflection from '@app/components/date/NewReflection';
import { getIsLowPersonalization } from '@app/api/reflection';
import { JobSlug } from '@app/types/domain';
import HomePremiumBanner, { HomePremiumBannerRef } from '@app/components/premium/HomePremiumBanner';
import { getNow } from '@app/utils/date';
import Menu from '@app/components/menu/Menu';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'Home'>) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [dateCount, setDateCount] = useState(0);
  const [showNewReflection, setShowNewReflection] = useState(false);
  const [showReflectionNotification, setShowReflectionNotification] = useState(false);
  const [premiumDataLoaded, setPremiumDataLoaded] = useState<boolean | undefined>(undefined);

  const premiumRef = useRef<HomePremiumBannerRef>(null);

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

  const jobs: { slug: JobSlug; title: string; icon: (props: any) => JSX.Element }[] = [
    { slug: 'issues', title: i18n.t('jobs.issues'), icon: DateIssues },
    { slug: 'sex', title: i18n.t('jobs.sex'), icon: DateSex },
    { slug: 'know', title: i18n.t('jobs.know'), icon: DateKnow },
    { slug: 'hard', title: i18n.t('jobs.hard'), icon: DateHard },
    { slug: 'meaningful', title: i18n.t('jobs.meaningful'), icon: DateMeaningful },
    { slug: 'fun', title: i18n.t('jobs.fun'), icon: DateFun },
  ];

  async function getIsOnboarded() {
    setPremiumDataLoaded(undefined);
    setLoading(true);
    setShowReflectionNotification(false);
    const data: SupabaseAnswer<APIUserProfile> = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', authContext.userId)
      .single();
    if (data.error) {
      logErrors(data.error);
      void logout();
      return;
    }
    if (!data.data.onboarding_finished) {
      navigation.navigate('YourName');
      return;
    } else {
      if (!data.data.showed_interview_request) {
        const { error: errorDateYesterday, count: dateYesterdayCount } = await supabase
          .from('date')
          .select('*', { count: 'exact' })
          .eq('active', false)
          .lt('created_at', getNow().startOf('day').toISOString())
          .limit(1);
        if (errorDateYesterday) {
          logErrors(errorDateYesterday);
          return;
        }
        const showInterview = (dateYesterdayCount || 0) > 0;
        if (showInterview) {
          navigation.navigate('InterviewRequest', { refreshTimeStamp: new Date().toISOString() });
        }
      }
      const activeDatesRes = await supabase
        .from('date')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      if (activeDatesRes.error) {
        logErrors(activeDatesRes.error);
        return;
      }
      if (activeDatesRes.data) {
        if (activeDatesRes.data.length > 1) {
          for (const date of activeDatesRes.data.slice(1)) {
            await supabase.from('date').update({ active: false }).eq('id', date.id);
          }
        }
        const lastDate = activeDatesRes.data[0];
        navigation.navigate('OnDate', {
          job: lastDate.job || 'hard',
          withPartner: lastDate.with_partner,
          refreshTimeStamp: new Date().toISOString(),
        });
      } else {
        void localAnalytics().logEvent('HomeLoaded', {
          screen: 'Home',
          action: 'Loaded',
          userId: authContext.userId,
        });

        const { error, count } = await supabase
          .from('date')
          .select('*', { count: 'exact' })
          .eq('active', false)
          .eq('stopped', false);
        if (error) {
          logErrors(error);
          return;
        }

        setShowReflectionNotification(await getIsLowPersonalization());
        const dateCount = count || 0;
        const levelNewReflection = await supabase
          .from('reflection_notification')
          .select('*', { count: 'exact' })
          .eq('level', dateCount + 1);

        setDateCount(dateCount);
        setFirstName(data.data.first_name);
        setPartnerName(data.data.partner_first_name);
        setLoading(false);

        setShowNewReflection(dateCount > 0 && !levelNewReflection.count);
      }
    }
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

  if (loading) return <Loading />;
  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.white,
      }}
    >
      {showNewReflection && (
        <NewReflection
          navigation={navigation}
          show={showNewReflection}
          level={dateCount + 1}
          onClose={() => setShowNewReflection(false)}
        ></NewReflection>
      )}
      <SafeAreaView style={{ flexGrow: 1 }}>
        <View style={{ flexGrow: 1, padding: padding }}>
          <View
            style={{
              backgroundColor: theme.colors.grey1,
              marginHorizontal: -padding,
              height: '10%',
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.white,
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                flexDirection: 'row',
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                <View
                  style={{
                    flexDirection: 'column',
                    paddingHorizontal: padding,
                    paddingBottom: '3%',
                  }}
                >
                  <FontText h3>
                    {firstName || i18n.t('home.you')}
                    {' & '}
                    {partnerName || i18n.t('home.partner')}
                  </FontText>
                  <FontText style={{ color: theme.colors.grey3, marginTop: '2%' }}>
                    {dateCount + 1} {i18n.t('level')}
                  </FontText>
                </View>
                <View
                  style={{
                    justifyContent: 'flex-end',
                  }}
                >
                  <BuddiesCorner />
                </View>
              </View>
            </View>
          </View>
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
                      {i18n.t('date.discuss')}
                    </FontText>
                    {jobs.map((j) => (
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
          {showReflectionNotification && (
            <View
              style={{
                height: 60,
                backgroundColor: theme.colors.grey1,
                marginHorizontal: -20,
                marginBottom: -20,
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  backgroundColor: theme.colors.warning,
                  alignContent: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <FontText style={{ textAlign: 'center' }}>
                  {i18n.t('home.reflect_explanation')}
                </FontText>
              </View>
            </View>
          )}
          <View
            style={{
              backgroundColor: showReflectionNotification
                ? theme.colors.warning
                : theme.colors.grey1,
              marginHorizontal: -padding,
              height: 70,
            }}
          >
            <Menu reflectionWarning={showReflectionNotification}></Menu>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
