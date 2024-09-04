import React, { useContext, useEffect, useRef, useState } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AUTH_STORAGE_KEY, supabase } from '@app/api/initSupabase';
import { Loading } from '@app/components/utils/Loading';
import { logSupaErrors } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@rneui/themed';
import { FontText } from '@app/components/utils/FontText';
import ProfileBuddyCorner from '@app/icons/profile_buddy_corner';
import StarRating from '@app/icons/star_rating';
import TopRightArrow from '@app/icons/top_right_arrow';
import { getFullLanguageByLocale, i18n } from '@app/localization/i18n';
import { analyticsForgetUser, localAnalytics } from '@app/utils/analytics';

import Menu from '@app/components/menu/Menu';
import { APIUserProfile, SupabaseAnswer } from '@app/types/api';
import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feedback from '../settings/Feedback';
import { SettingsButton } from './SettingsButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { getNow } from '@app/utils/date';

export const logout = async () => {
  await supabase.auth.signOut();
  await analyticsForgetUser();
  // just to make sure in case something goes wrong
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
};

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'Home'>) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const languageTitle = getFullLanguageByLocale(i18n.locale);
  const padding = 20;
  const authContext = useContext(AuthContext);

  async function getData() {
    setLoading(true);
    const data: SupabaseAnswer<APIUserProfile | null> = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', authContext.userId!)
      .single();
    if (data.error) {
      logSupaErrors(data.error);
      return;
    }
    setName(data?.data?.first_name || '');
    setPartnerName(data?.data?.partner_first_name || '');
    setLoading(false);
  }

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isFirstMount.current && route.params?.refreshTimeStamp) {
      void getData();
    }
  }, [route.params?.refreshTimeStamp]);
  useEffect(() => {
    void getData();
    isFirstMount.current = false;
  }, []);

  const deleteAccount = async () => {
    void localAnalytics().logEvent('ProfileDeleteAccount', {
      screen: 'Settings',
      action: 'Clicked delete account',
      userId: authContext.userId,
    });
    const res = await supabase.rpc('delete_user');
    if (res.error) {
      logSupaErrors(res.error);
      return;
    }
    await logout();
    await logout();
  };
  const deleteAccountAlert = () => {
    Alert.alert(
      i18n.t('profile.are_you_sure_you_want_to_delete_account'),
      undefined,
      [
        {
          text: i18n.t('cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('confirm'),
          onPress: () => void deleteAccount(),
          style: 'destructive',
        },
      ],
      {
        cancelable: true,
      },
    );
  };
  if (loading) return <Loading />;
  const handleYourName = () => {
    void localAnalytics().logEvent('ProfileYourNameClicked', {
      screen: 'Profile',
      action: 'YourNameClicked',
    });
    void navigation.navigate('YourName', { fromSettings: true });
  };
  const handlePartnerName = () => {
    void localAnalytics().logEvent('ProfilePartnerNameClicked', {
      screen: 'Profile',
      action: 'PartnerNameClicked',
    });
    void navigation.navigate('PartnerName', { fromSettings: true });
  };
  const handleLanguage = () => {
    void localAnalytics().logEvent('ProfileLanguageClicked', {
      screen: 'Profile',
      action: 'LanguageClicked',
    });
    void navigation.navigate('Language', { fromSettings: true });
  };
  const manageSubscription = () => {
    void localAnalytics().logEvent('ProfileSubscriptionClicked', {
      screen: 'Profile',
      action: 'SubscriptionClicked',
    });
    void navigation.navigate('PremiumOffer', {
      refreshTimeStamp: new Date().toISOString(),
      isOnboarding: false,
    });
  };
  const manageReview = async () => {
    void localAnalytics().logEvent('ProfileRatingClicked', {
      screen: 'Profile',
      action: 'RatingClicked',
    });
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
      const updateProfile = await supabase
        .from('user_profile')
        .update({ showed_rating: true, updated_at: getNow().toISOString() })
        .eq('user_id', authContext.userId!);
      if (updateProfile.error) {
        logSupaErrors(updateProfile.error);
        return;
      }
    }
  };
  const manageShare = async () => {
    void localAnalytics().logEvent('ProfileShareClicked', {
      screen: 'Profile',
      action: 'ShareClicked',
    });
    const iosLink = 'https://apps.apple.com/app/nemlys-couples-game-questions/id1662262055';
    const androidLink = 'https://play.google.com/store/apps/details?id=com.nemlys.app';
    await Share.share({
      title: 'Nemlys: relationship questions',
      message: `Nemlys: couples questions\nApple: ${iosLink}\nAndroid: ${androidLink}\n\nHave fun, deep conversations and personalized questions!\n\n\n`,
      url: Platform.OS === 'android' ? androidLink : iosLink,
    });
  };
  const manageCall = () => {
    void localAnalytics().logEvent('ProfileCallClicked', {
      screen: 'Profile',
      action: 'CallClicked',
    });
    navigation.navigate('InterviewRequest', {
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.white,
      }}
    >
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
                  <FontText h3>{i18n.t('profile.title')}</FontText>
                  <FontText style={{ color: theme.colors.grey3, marginTop: '2%' }}></FontText>
                </View>
                <View
                  style={{
                    justifyContent: 'flex-end',
                  }}
                >
                  <ProfileBuddyCorner />
                </View>
              </View>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <ScrollView
              style={{
                flexGrow: 1,
                backgroundColor: theme.colors.grey1,
                marginHorizontal: -padding,
              }}
            >
              <View
                style={{
                  flexGrow: 1,
                  backgroundColor: theme.colors.grey1,
                  justifyContent: 'center',
                  padding,
                }}
              >
                <View style={{ marginTop: 10 }}>
                  <FontText h3>{i18n.t('profile.my_account')}</FontText>
                  <SettingsButton
                    data={name}
                    title={i18n.t('profile.your_name')}
                    action={() => void handleYourName()}
                  ></SettingsButton>
                  <SettingsButton
                    data={partnerName}
                    title={i18n.t('profile.partner_name')}
                    action={() => void handlePartnerName()}
                  ></SettingsButton>
                </View>
                <View style={{ marginTop: 40 }}>
                  <FontText h3>{i18n.t('profile.settings')}</FontText>
                  <SettingsButton
                    data={languageTitle}
                    title={i18n.t('profile.language')}
                    action={() => void handleLanguage()}
                  ></SettingsButton>
                  <SettingsButton
                    data={null}
                    title={i18n.t('profile.subscription')}
                    action={() => void manageSubscription()}
                  ></SettingsButton>
                </View>
                <View style={{ marginTop: 40 }}>
                  <FontText h3>{i18n.t('profile.about')}</FontText>
                  <TouchableOpacity
                    onPress={() => void manageReview()}
                    style={{
                      marginTop: 15,
                      width: '100%',
                      height: 72,
                      paddingHorizontal: 20,
                      paddingVertical: 24,
                      backgroundColor: theme.colors.warning,
                      borderRadius: 20,
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      display: 'flex',
                      flexDirection: 'row',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <StarRating></StarRating>
                      <FontText
                        style={{
                          marginLeft: 10,
                          fontSize: 16,
                          fontWeight: '600',
                          flexShrink: 1,
                        }}
                      >
                        {i18n.t('profile.rate')}
                      </FontText>
                    </View>
                    <TopRightArrow></TopRightArrow>
                  </TouchableOpacity>

                  <SettingsButton
                    data={null}
                    title={i18n.t('profile.share')}
                    action={() => void manageShare()}
                  ></SettingsButton>
                  <Feedback
                    title={i18n.t('profile.feature_request')}
                    placeholder={i18n.t('profile.feature_request_placeholder')}
                  ></Feedback>
                  <SettingsButton
                    data={' '}
                    title={i18n.t('profile.call')}
                    action={() => void manageCall()}
                  ></SettingsButton>
                  <Feedback
                    title={i18n.t('profile.contact')}
                    placeholder={i18n.t('profile.contact_placeholder')}
                  ></Feedback>
                  <PrimaryButton
                    buttonStyle={{ marginTop: 40 }}
                    onPress={() => {
                      void localAnalytics().logEvent('ProfileLogout', {
                        screen: 'Profile',
                        action: 'Clicked logout',
                      });
                      void logout().then(logout);
                    }}
                  >
                    {i18n.t('profile.logout')}
                  </PrimaryButton>
                  <TouchableOpacity
                    style={{ marginTop: 10 }}
                    onPress={() => {
                      void deleteAccountAlert();
                    }}
                  >
                    <FontText style={{ width: '100%', textAlign: 'center', marginVertical: 20 }}>
                      {i18n.t('profile.delete_account')}
                    </FontText>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
          <View
            style={{
              backgroundColor: theme.colors.grey1,
              marginHorizontal: -padding,
              height: 70,
            }}
          >
            <Menu></Menu>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
