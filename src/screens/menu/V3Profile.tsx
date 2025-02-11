import React, { useContext, useEffect, useRef, useState } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '@app/components/utils/Loading';
import { logErrorsWithMessage, logSupaErrors } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import { Alert, ScrollView, Share, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@rneui/themed';
import { FontText } from '@app/components/utils/FontText';
import ProfileBuddyCorner from '@app/icons/profile_buddy_corner';
import StarRating from '@app/icons/star_rating';
import TopRightArrow from '@app/icons/top_right_arrow';
import { getFullLanguageByLocale, i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';
import HeartPurpleIcon from '@app/icons/heart_purple';
import SmallArrowRight from '@app/icons/small_arrow_right';

import * as StoreReview from 'expo-store-review';
import Feedback from '../settings/Feedback';
import { SettingsButton } from './SettingsButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { getNow } from '@app/utils/date';
import AnswerNoPartnerWarning from '@app/components/answers/AnswerNoPartnerWarning';
import { logout } from '@app/utils/auth';
import { showName } from '@app/utils/strings';
import V3Menu from '@app/components/menu/V3Menu';
import { UNEXPECTED_ERROR } from '@app/utils/constants';
import Toast from 'react-native-toast-message';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'Home'>) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [coupleLanguage, setCoupleLanguage] = useState('');
  const [hasPartner, setHasPartner] = useState(true);
  const [v2User, setV2User] = useState(false);
  const languageTitle = getFullLanguageByLocale(i18n.locale);
  const padding = 20;
  const authContext = useContext(AuthContext);

  async function getData() {
    setLoading(true);
    void localAnalytics().logEvent('V3ProfileDataLoading', {
      screen: 'V3Profile',
      action: 'DataLoading',
      userId: authContext.userId,
    });
    try {
      const [profileResponse, hasPartnerData] = await Promise.all([
        supabase
          .from('user_profile')
          .select(
            'id, first_name, partner_first_name, couple_id, couple(switched_to_v3, v2_user, language)',
          )
          .eq('user_id', authContext.userId!)
          .single(),
        supabase.rpc('has_partner'),
      ]);

      if (profileResponse.error) throw profileResponse.error;
      if (!profileResponse.data) throw new Error('No profile found');
      if (hasPartnerData.error) throw hasPartnerData.error;

      setName(showName(profileResponse.data.first_name));
      setPartnerName(showName(profileResponse.data.partner_first_name) || i18n.t('home_partner'));
      setCoupleLanguage(profileResponse.data.couple!.language);
      setHasPartner(hasPartnerData.data);
      setV2User(profileResponse.data.couple!.v2_user);

      void localAnalytics().logEvent('V3ProfileDataLoaded', {
        screen: 'V3Profile',
        action: 'DataLoaded',
        userId: authContext.userId,
      });
    } catch (e) {
      logErrorsWithMessage(e, (e?.message as string) || '');
      setLoading(false);
      return;
    }
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
    void localAnalytics().logEvent('V3ProfileDeleteAccount', {
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
      i18n.t('profile_are_you_sure_you_want_to_delete_account'),
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

  const leaveCouple = async () => {
    try {
      localAnalytics().logEvent('V3ProfileLeaveCouple', {
        screen: 'Settings',
        action: 'Clicked leave couple',
        userId: authContext.userId,
      });

      const { error } = await supabase.rpc('leave_couple');

      if (error) {
        console.error('Error leaving couple:', error);
        Alert.alert(
          i18n.t(UNEXPECTED_ERROR),
          i18n.t('leave_couple_error_message'),
          [{ text: i18n.t('ok') }],
          { cancelable: true },
        );
        return;
      }

      Toast.show({
        type: 'success',
        text1: i18n.t('leave_couple_success_message'),
        visibilityTime: 3000,
        onPress: () => Toast.hide(),
      });

      void navigation.navigate('PartnerName', { fromSettings: true });
    } catch (err) {
      logErrorsWithMessage(err, (err?.message as string) || '');
    }
  };
  const leaveCoupleAlert = () => {
    Alert.alert(
      i18n.t('leave_couple_confirmation_title'),
      i18n.t('leave_couple_confirmation_message'),
      [
        {
          text: i18n.t('cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('confirm'),
          onPress: () => {
            void leaveCouple();
          },
          style: 'destructive',
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  const handleGoBackToV2 = async () => {
    setLoading(true);

    try {
      void localAnalytics().logEvent('V3ProfileGoBackToV2Clicked', {
        screen: 'V3Profile',
        action: 'GoBackToV2Clicked',
      });

      const profileResponse = await supabase
        .from('user_profile')
        .select('couple_id')
        .eq('user_id', authContext.userId!)
        .single();

      if (profileResponse.error) {
        logSupaErrors(profileResponse.error);
        return;
      }

      const coupleResponse = await supabase
        .from('couple')
        .update({ switched_to_v3: false })
        .eq('id', profileResponse.data?.couple_id);

      if (coupleResponse.error) {
        logSupaErrors(coupleResponse.error);
        return;
      }
      void navigation.navigate('V2Home', { refreshTimeStamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  const handleYourName = () => {
    void localAnalytics().logEvent('V3ProfileYourNameClicked', {
      screen: 'V3Profile',
      action: 'YourNameClicked',
    });
    void navigation.navigate('YourName', { fromSettings: true });
  };
  const handlePartnerName = () => {
    void localAnalytics().logEvent('V3ProfilePartnerNameClicked', {
      screen: 'V3Profile',
      action: 'PartnerNameClicked',
    });
    void navigation.navigate('PartnerName', { fromSettings: true });
  };

  const handleInviteCode = () => {
    void localAnalytics().logEvent('V3ProfileInviteCodeClicked', {
      screen: 'V3Profile',
      action: 'InviteCodeClicked',
    });
    void navigation.navigate('OnboardingInviteCode', {
      nextScreen: 'V3Profile',
      screenParams: {
        refreshTimeStamp: new Date().toISOString(),
      },
    });
  };

  const handleInviteCodeInput = () => {
    void localAnalytics().logEvent('V3ProfileInviteCodeInputClicked', {
      screen: 'V3Profile',
      action: 'InviteCodeInputClicked',
    });
    void navigation.navigate('OnboardingInviteCodeInput', {
      nextScreen: 'V3Profile',
      screenParams: {
        refreshTimeStamp: new Date().toISOString(),
      },
    });
  };

  const handleShowOnboardingPlan = () => {
    void localAnalytics().logEvent('V3ProfileShowOnboardingPlanClicked', {
      screen: 'V3Profile',
      action: 'ShowOnboardingPlanClicked',
    });
    void navigation.navigate('OnboardingPlan', {
      isOnboarding: false,
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  const handleChangePlan = () => {
    void localAnalytics().logEvent('V3ProfileChangePlanClicked', {
      screen: 'V3Profile',
      action: 'ChangePlanClicked',
    });
    void navigation.navigate('ChangePlan', {
      isOnboarding: false,
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  const handleLanguage = () => {
    void localAnalytics().logEvent('V3ProfileLanguageClicked', {
      screen: 'V3Profile',
      action: 'LanguageClicked',
    });
    void navigation.navigate('Language', { fromSettings: true });
  };
  const handleCoupleLanguage = () => {
    void localAnalytics().logEvent('V3ProfileCoupleLanguageClicked', {
      screen: 'V3Profile',
      action: 'CoupleLanguageClicked',
    });
    void navigation.navigate('CoupleLanguage', { fromSettings: true, language: coupleLanguage });
  };
  const handleNotification = () => {
    void localAnalytics().logEvent('V3ProfileNotificationClicked', {
      screen: 'V3Profile',
      action: 'NotificationClicked',
    });
    navigation.navigate('OnboardingNotification', { isOnboarding: false });
  };
  const manageSubscription = () => {
    void localAnalytics().logEvent('V3ProfileSubscriptionClicked', {
      screen: 'V3Profile',
      action: 'SubscriptionClicked',
    });
    void navigation.navigate('V3PremiumOffer', {
      refreshTimeStamp: new Date().toISOString(),
      isOnboarding: false,
    });
  };
  const manageReview = async () => {
    void localAnalytics().logEvent('V3ProfileRatingClicked', {
      screen: 'V3Profile',
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
    void localAnalytics().logEvent('V3ProfileShareClicked', {
      screen: 'V3Profile',
      action: 'ShareClicked',
    });
    const getInviteMessage = () => {
      const iosLink = 'https://apps.apple.com/app/nemlys-couples-game-questions/id1662262055';
      const androidLink = 'https://play.google.com/store/apps/details?id=com.nemlys.app';
      return i18n.t('settings_share_message') + `\nApple: ${iosLink}\nAndroid: ${androidLink}`;
    };
    await Share.share({
      message: getInviteMessage(),
    });
  };
  const manageCall = () => {
    void localAnalytics().logEvent('V3ProfileCallClicked', {
      screen: 'V3Profile',
      action: 'CallClicked',
    });
    navigation.navigate('InterviewRequest', {
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.white }}>
        <View style={{ flexGrow: 1, paddingHorizontal: padding }}>
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
                  <FontText h3>{i18n.t('profile_title')}</FontText>
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
                {v2User && (
                  <TouchableOpacity onPress={() => void handleGoBackToV2()}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: theme.colors.black,
                        padding: 20,
                        borderRadius: 16,
                        marginBottom: 10,
                        width: '100%',
                        gap: 8,
                      }}
                    >
                      <HeartPurpleIcon />
                      <View style={{ flex: 1 }}>
                        <FontText small style={{ color: theme.colors.white }}>
                          {i18n.t('v3_profile_go_back_to_v2')}
                        </FontText>
                      </View>
                      <SmallArrowRight />
                    </View>
                  </TouchableOpacity>
                )}
                {!hasPartner && (
                  <AnswerNoPartnerWarning
                    prefix={'V3Profile'}
                    partnerName={partnerName}
                    isV3={true}
                  />
                )}

                <View style={{ marginTop: 10 }}>
                  <FontText h3>{i18n.t('v3_profile_my_couple')}</FontText>
                  <SettingsButton
                    data={name}
                    title={i18n.t('profile_your_name')}
                    action={() => void handleYourName()}
                  ></SettingsButton>
                  <SettingsButton
                    data={partnerName}
                    title={i18n.t('profile_partner_name')}
                    action={() => void handlePartnerName()}
                  ></SettingsButton>
                  {!hasPartner && (
                    <SettingsButton
                      data={null}
                      title={i18n.t('settings_invite_invite_partner', { partnerName })}
                      action={() => void handleInviteCode()}
                    ></SettingsButton>
                  )}
                  {!hasPartner && (
                    <SettingsButton
                      data={null}
                      title={i18n.t('settings_invite_join_partner', { partnerName })}
                      action={() => void handleInviteCodeInput()}
                    ></SettingsButton>
                  )}
                  <SettingsButton
                    data={null}
                    title={i18n.t('v3_settings_show_onboarding_plan')}
                    action={() => void handleShowOnboardingPlan()}
                  ></SettingsButton>
                  <SettingsButton
                    data={null}
                    title={i18n.t('v3_settings_change_plan')}
                    action={() => void handleChangePlan()}
                  ></SettingsButton>
                  {hasPartner && (
                    <SettingsButton
                      data={null}
                      title={i18n.t('settings_unpair_from_partner', { partnerName })}
                      action={() => void leaveCoupleAlert()}
                    ></SettingsButton>
                  )}
                </View>
                <View style={{ marginTop: 40 }}>
                  <FontText h3>{i18n.t('profile_settings')}</FontText>
                  <SettingsButton
                    data={null}
                    title={i18n.t('profile_subscription')}
                    action={() => void manageSubscription()}
                  ></SettingsButton>
                  <SettingsButton
                    data={null}
                    title={i18n.t('profile_notification')}
                    action={() => void handleNotification()}
                  ></SettingsButton>
                  <SettingsButton
                    data={languageTitle}
                    title={i18n.t('profile_language')}
                    action={() => void handleLanguage()}
                  ></SettingsButton>
                  <SettingsButton
                    data={getFullLanguageByLocale(coupleLanguage)}
                    title={i18n.t('settings_couple_language')}
                    action={() => void handleCoupleLanguage()}
                  ></SettingsButton>
                </View>
                <View style={{ marginTop: 40 }}>
                  <FontText h3>{i18n.t('profile_about')}</FontText>
                  <Feedback
                    title={i18n.t('profile_contact')}
                    placeholder={i18n.t('profile_contact_placeholder')}
                  ></Feedback>
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
                          flexShrink: 1,
                        }}
                      >
                        {i18n.t('profile_rate')}
                      </FontText>
                    </View>
                    <TopRightArrow></TopRightArrow>
                  </TouchableOpacity>

                  <SettingsButton
                    data={null}
                    title={i18n.t('profile_share')}
                    action={() => void manageShare()}
                  ></SettingsButton>
                  <Feedback
                    title={i18n.t('profile_feature_request')}
                    placeholder={i18n.t('profile_feature_request_placeholder')}
                  ></Feedback>
                  <SettingsButton
                    data={' '}
                    title={i18n.t('profile_call')}
                    action={() => void manageCall()}
                  ></SettingsButton>
                  <PrimaryButton
                    buttonStyle={{ marginTop: 40 }}
                    onPress={() => {
                      void localAnalytics().logEvent('V3ProfileLogout', {
                        screen: 'V3Profile',
                        action: 'Clicked logout',
                      });
                      void logout().then(logout);
                    }}
                  >
                    {i18n.t('profile_logout')}
                  </PrimaryButton>
                  <TouchableOpacity
                    style={{ marginTop: 10 }}
                    onPress={() => {
                      void deleteAccountAlert();
                    }}
                  >
                    <FontText style={{ width: '100%', textAlign: 'center', marginVertical: 20 }}>
                      {i18n.t('profile_delete_account')}
                    </FontText>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
        <V3Menu></V3Menu>
      </SafeAreaView>
    </>
  );
}
