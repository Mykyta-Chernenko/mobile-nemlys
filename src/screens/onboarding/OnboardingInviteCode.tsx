import React, { useContext, useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  View,
  TouchableOpacity,
  Share,
  RefreshControl,
} from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import Clipboard from '@react-native-clipboard/clipboard';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { FontText, getFontSizeForScreen } from '@app/components/utils/FontText';
import { Progress } from '@app/components/utils/Progress';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { KEYBOARD_BEHAVIOR, ONBOARDING_STEPS } from '@app/utils/constants';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShareIcon from '@app/icons/share';
import CopyIcon from '@app/icons/copy';
import Toast from 'react-native-toast-message';
import { Loading } from '@app/components/utils/Loading';
import { logErrorsWithMessage, logSupaErrors } from '@app/utils/errors';
import { showName } from '@app/utils/strings';

type OnboardingInviteCodeProps = NativeStackScreenProps<MainStackParamList, 'OnboardingInviteCode'>;

export default function OnboardingInviteCode({ route, navigation }: OnboardingInviteCodeProps) {
  const { theme } = useTheme();
  const [inviteCode, setInviteCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [codeShared, setCodeShared] = useState(false);
  const authContext = useContext(AuthContext);
  const { nextScreen, screenParams } = route.params || {};

  const { setMode } = useThemeMode();

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setMode('light');
      void onRefresh();
    });
    return unsubscribeFocus;
  }, [navigation, authContext.userId]);

  const fetchInviteCode = async () => {
    setLoading(true);
    try {
      const { data: userProfile, error: userError } = await supabase
        .from('user_profile')
        .select('couple_id, first_name, partner_first_name')
        .eq('user_id', authContext.userId!)
        .single();

      if (userError) {
        logSupaErrors(userError);
        return;
      }

      const { data: couple, error: coupleError } = await supabase
        .from('couple')
        .select('invite_code')
        .eq('id', userProfile.couple_id)
        .single();

      if (coupleError) {
        logSupaErrors(coupleError);
        return;
      }

      setInviteCode(couple.invite_code);
      setPartnerName(showName(userProfile.partner_first_name || i18n.t('home_partner')));
      setName(showName(userProfile.first_name));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setCodeShared(false);
    await fetchInviteCode();
    setRefreshing(false);
  };

  const getInviteMessage = () => {
    const iosLink = 'https://apps.apple.com/app/nemlys-couples-game-questions/id1662262055';
    const androidLink = 'https://play.google.com/store/apps/details?id=com.nemlys.app';
    return (
      i18n.t('onboarding_invite_share_message', {
        partnerName,
        inviteCode,
      }) + `\nApple: ${iosLink}\nAndroid: ${androidLink}`
    );
  };

  const handleCopyInviteCode = () => {
    const message = getInviteMessage();
    Clipboard.setString(message);
    Toast.show({
      type: 'success',
      text1: i18n.t('onboarding_invite_copy_success_message'),
      visibilityTime: 1000,
      onPress: () => Toast.hide(),
    });
    setCodeShared(true);
    void localAnalytics().logEvent('OnboardingInviteInviteCodeCopied', {
      screen: 'OnboardingInviteCode',
      action: 'CopyCode',
      userId: authContext.userId,
    });
  };

  const handleShareInviteCode = async () => {
    try {
      const message = getInviteMessage();
      const result = await Share.share({
        message: message,
      });
      if (result.action === Share.sharedAction) {
        setCodeShared(true);
        void localAnalytics().logEvent('OnboardingInviteInviteCodeShared', {
          screen: 'OnboardingInviteCode',
          action: 'ShareCode',
          userId: authContext.userId,
        });
      }
    } catch (e) {
      logErrorsWithMessage(e, (e?.message as string) || '');
    }
  };

  const handleEnterPairingCode = () => {
    void localAnalytics().logEvent('OnboardingInviteCodeEnterPairingClicked', {
      screen: 'OnboardingInviteCode',
      action: 'EnterPairingClicked',
      userId: authContext.userId,
    });
    navigation.navigate('OnboardingInviteCodeInput', { nextScreen, screenParams });
  };

  const handleContinue = () => {
    void localAnalytics().logEvent('OnboardingInviteCodeContinue', {
      screen: 'OnboardingInviteCode',
      action: 'Continue',
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
      navigation.navigate('OnboardingQuizIntro', { name, partnerName });
    }
  };

  if (loading) {
    return <Loading light />;
  }

  return (
    <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} style={{ flexGrow: 1 }}>
      <ImageBackground
        style={{ flexGrow: 1 }}
        source={require('../../../assets/images/onboarding_background.png')}
      >
        <SafeAreaView style={{ flexGrow: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, padding: 20 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
            }
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                height: 32,
              }}
            >
              <GoBackButton
                theme="light"
                containerStyle={{ position: 'absolute', left: 0 }}
                onPress={() => {
                  void localAnalytics().logEvent('OnboardingInviteCodeBackClicked', {
                    screen: 'OnboardingInviteCode',
                    action: 'BackClicked',
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
                    navigation.goBack();
                  }
                }}
              />

              {!nextScreen ? <Progress current={5} all={ONBOARDING_STEPS} /> : <View></View>}
              <View
                style={{
                  position: 'absolute',
                  right: 0,
                  borderRadius: 40,
                  backgroundColor: theme.colors.white,
                }}
              >
                <TouchableOpacity style={{ padding: 10 }} onPress={() => void handleContinue()}>
                  <FontText>{i18n.t('skip')}</FontText>
                </TouchableOpacity>
              </View>
            </View>
            <Image
              style={{
                marginTop: '10%',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                height: 100,
                width: '100%',
              }}
              resizeMode="contain"
              source={require('../../../assets/images/buddy_invite_code.png')}
            />
            <View
              style={{
                flexGrow: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <FontText h1 style={{ textAlign: 'center' }}>
                {i18n.t('onboarding_invite_title_1')}
                <FontText h1 style={{ color: theme.colors.error }}>
                  {partnerName}
                </FontText>
                {i18n.t('onboarding_invite_2_title_3')}
              </FontText>
              <FontText style={{ color: theme.colors.grey5, marginTop: 20, textAlign: 'center' }}>
                {i18n.t('onboarding_invite_2_description')}
              </FontText>
              <View
                style={{
                  marginTop: 20,
                  backgroundColor: theme.colors.white,
                  borderRadius: 16,
                  padding: 20,
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <FontText small style={{ color: '#A39BAC', marginBottom: 24 }}>
                  {i18n.t('onboarding_invite_share_code')}
                </FontText>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <FontText h1 style={{ fontWeight: '600' }}>
                      {inviteCode}
                    </FontText>
                    <TouchableOpacity
                      onPress={handleCopyInviteCode}
                      style={{ padding: 8, backgroundColor: '#F5E9EB', borderRadius: 40 }}
                    >
                      <CopyIcon
                        height={getFontSizeForScreen('h3') * 1.1}
                        width={getFontSizeForScreen('h3') * 1.1}
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={() => void handleShareInviteCode()}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: 'black',
                      borderRadius: 40,
                    }}
                  >
                    <ShareIcon
                      height={getFontSizeForScreen('h3') * 1.1}
                      width={getFontSizeForScreen('h3') * 1.1}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {!codeShared && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.grey4 }} />
                    <FontText style={{ marginHorizontal: 10, color: theme.colors.grey3 }}>
                      {i18n.t('or')}
                    </FontText>
                    <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.grey4 }} />
                  </View>
                  <View style={{ width: '100%' }}>
                    <PrimaryButton
                      title={i18n.t('onboarding_invite_enter_pairing')}
                      onPress={handleEnterPairingCode}
                      buttonStyle={{
                        backgroundColor: theme.colors.black,
                      }}
                    />
                  </View>
                </>
              )}

              {codeShared && (
                <View style={{ width: '100%' }}>
                  <PrimaryButton
                    title={i18n.t('continue')}
                    onPress={handleContinue}
                    buttonStyle={{
                      backgroundColor: theme.colors.black,
                      marginTop: 20,
                    }}
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
