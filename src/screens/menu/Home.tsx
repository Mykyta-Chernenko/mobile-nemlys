import React, { useContext, useEffect, useRef, useState } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '@app/components/utils/Loading';
import { logErrors } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import { APIUserProfile, SupabaseAnswer } from '@app/types/api';
import { SafeAreaView, View } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { FontText } from '@app/components/utils/FontText';
import QuestionTriangelSelected from '@app/icons/question_triangle_selected';
import Story from '@app/icons/story';
import StoryWithWarning from '@app/icons/story_with_warning';
import BuddiesCorner from '@app/icons/buddies_corner';
import Profile from '@app/icons/profile';
import { i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import Card from '../../components/date/Card';
import { logout } from '../settings/Settings';
import { TouchableOpacity } from 'react-native';
import Interview from '@app/components/date/Interview';
import NewReflection from '@app/components/date/NewReflection';
import moment from 'moment';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'Home'>) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [dateCount, setDateCount] = useState(0);
  const [showInterview, setShowInterview] = useState(false);
  const [showNewReflection, setShowNewReflection] = useState(false);
  const [showReflectionNotification, setShowReflectionNotification] = useState(false);
  const padding = 20;
  const authContext = useContext(AuthContext);
  // to set the color of status bar
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation]);

  async function getIsOnboarded() {
    setLoading(true);
    setShowInterview(false);
    setShowReflectionNotification(false);
    const data: SupabaseAnswer<APIUserProfile> = await supabase
      .from('user_profile')
      .select(
        'id, partner_first_name, partner_first_name, user_id, couple_id, first_name, ios_expo_token, android_expo_token, onboarding_finished, showed_interview_request, created_at, updated_at',
      )
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
      const dateRes = await supabase.from('date').select('*').eq('active', true).maybeSingle();
      if (dateRes.error) {
        logErrors(dateRes.error);
        return;
      }
      if (dateRes.data) {
        navigation.navigate('OnDate', {
          lowPersonalization: false,
          withPartner: dateRes.data.with_partner,
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
          .eq('with_partner', true);
        if (error) {
          logErrors(error);
          return;
        }
        const { error: errorDateYesterday, count: dateYesterdayCount } = await supabase
          .from('date')
          .select('*', { count: 'exact' })
          .eq('active', false)
          .lt('created_at', moment().startOf('day').toISOString())
          .limit(1);
        if (errorDateYesterday) {
          logErrors(errorDateYesterday);
          return;
        }
        const lastDate: SupabaseAnswer<{ created_at: string } | null> = await supabase
          .from('date')
          .select('created_at')
          .eq('with_partner', true)
          .limit(1)
          .order('created_at', { ascending: false })
          .maybeSingle();

        const lastReflection: SupabaseAnswer<{ created_at: string } | null> = await supabase
          .from('reflection_question_answer')
          .select('created_at')
          .limit(1)
          .order('created_at', { ascending: false })
          .maybeSingle();

        if (
          lastDate.data &&
          lastReflection.data &&
          moment(lastDate.data.created_at).isAfter(moment(lastReflection.data.created_at))
        ) {
          setShowReflectionNotification(true);
        }
        if (error) {
          logErrors(error);
          return;
        }
        const dateCount = count || 0;
        const levelNewReflection = await supabase
          .from('reflection_notification')
          .select('*', { count: 'exact' })
          .eq('level', dateCount + 1);

        setDateCount(dateCount);
        setFirstName(data.data.first_name);
        setPartnerName(data.data.partner_first_name);
        setLoading(false);
        const showInterview = (dateYesterdayCount || 0) > 0 && !data.data.showed_interview_request;
        setShowInterview(showInterview);
        setShowNewReflection(dateCount > 0 && !showInterview && !levelNewReflection.count);
      }
    }
    setLoading(false);
  }
  const handleOnPress = () => {
    void localAnalytics().logEvent('HomeStartDateClicked', {
      screen: 'Home',
      action: 'StartDateClicked',
      userId: authContext.userId,
    });
    navigation.navigate('DateIsWithPartner', {
      lowPersonalization: showReflectionNotification,
    });
  };
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isFirstMount.current && route.params?.refreshTimeStamp) {
      void getIsOnboarded();
    }
  }, [route.params?.refreshTimeStamp]);
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
      {showInterview && (
        <Interview show={showInterview} onClose={() => setShowInterview(false)}></Interview>
      )}
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
              <Card animated>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    backgroundColor: theme.colors.grey1,
                    borderRadius: 40,
                  }}
                >
                  <FontText>{i18n.t('home.card_questions')}</FontText>
                </View>
                <View style={{ marginVertical: '7%' }}>
                  <FontText
                    h1
                    style={{
                      textAlign: 'center',
                    }}
                  >
                    {i18n.t('home.title_first')}
                    <FontText style={{ color: theme.colors.primary }} h1>
                      {i18n.t('home.title_second')}
                    </FontText>
                  </FontText>
                </View>
                <PrimaryButton
                  buttonStyle={{ paddingHorizontal: '10%' }}
                  onPress={() => void handleOnPress()}
                  title={i18n.t('home.start')}
                ></PrimaryButton>
              </Card>
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
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.white,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingTop: '5%',
              }}
            >
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <QuestionTriangelSelected height={32} width={32}></QuestionTriangelSelected>
                <FontText style={{ marginTop: 5 }}>{i18n.t('home.menu.discuss')}</FontText>
              </View>

              <TouchableOpacity
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                onPress={() => {
                  void localAnalytics().logEvent('MenuReflectClicked', {
                    screen: 'Menu',
                    action: 'ReflectClicked',
                    userId: authContext.userId,
                  });
                  navigation.navigate('ReflectionHome', {
                    refreshTimeStamp: new Date().toISOString(),
                  });
                }}
              >
                {showReflectionNotification ? (
                  <StoryWithWarning height={32} width={32}></StoryWithWarning>
                ) : (
                  <Story height={32} width={32}></Story>
                )}
                <FontText style={{ marginTop: 5, color: theme.colors.grey3 }}>
                  {i18n.t('home.menu.reflect')}
                </FontText>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                onPress={() => {
                  void localAnalytics().logEvent('MenuProfileClicked', {
                    screen: 'Menu',
                    action: 'ProfileClicked',
                    userId: authContext.userId,
                  });
                  navigation.navigate('Profile', {
                    refreshTimeStamp: new Date().toISOString(),
                  });
                }}
              >
                <Profile height={32} width={32}></Profile>
                <FontText style={{ marginTop: 5, color: theme.colors.grey3 }}>
                  {i18n.t('home.menu.profile')}
                </FontText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
