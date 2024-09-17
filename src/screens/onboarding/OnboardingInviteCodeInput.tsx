import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  ScrollView,
  ImageBackground,
  RefreshControl,
} from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { MainStackParamList } from '@app/types/navigation';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { Progress } from '@app/components/utils/Progress';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { localAnalytics } from '@app/utils/analytics';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import StyledInput from '@app/components/utils/StyledInput';
import { CloseButton } from '@app/components/buttons/CloseButton';
import { Loading } from '@app/components/utils/Loading';
import { logErrorsWithMessage, logSupaErrors } from '@app/utils/errors';

type OnboardingInviteCodeInputProps = NativeStackScreenProps<
  MainStackParamList,
  'OnboardingInviteCodeInput'
>;

export default function OnboardingInviteCodeInput({
  route,
  navigation,
}: OnboardingInviteCodeInputProps) {
  const { theme } = useTheme();
  const [inviteCode, setInviteCode] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showContinue, setShowContinue] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const authContext = useContext(AuthContext);
  const fromSettings = route.params?.fromSettings;

  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      setMode('light');
      void onRefresh();
    });
    return unsubscribeFocus;
  }, [navigation, authContext.userId]);

  useEffect(() => {
    void localAnalytics().logEvent('OnboardingInviteCodeInputScreenViewed', {
      screen: 'OnboardingInviteCodeInput',
      userId: authContext.userId,
    });
    void fetchPartnerName();
  }, []);

  const fetchPartnerName = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profile')
        .select('partner_first_name')
        .eq('user_id', authContext.userId!)
        .single();

      if (error) {
        logSupaErrors(error);
        return;
      }

      setPartnerName(data.partner_first_name || 'Partner');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPartnerName();
    setShowContinue(false);
    setError('');
    setButtonLoading(false);
    setRefreshing(false);
  };

  const handleGoBack = () => {
    void localAnalytics().logEvent('OnboardingInviteCodeInputBackClicked', {
      screen: 'OnboardingInviteCodeInput',
      action: 'BackClicked',
      userId: authContext.userId,
    });
    if (fromSettings) {
      navigation.navigate('Profile', {
        refreshTimeStamp: new Date().toISOString(),
      });
    } else {
      navigation.navigate('OnboardingInviteCode', { fromSettings });
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setButtonLoading(true);
    try {
      const { data, error } = await supabase.rpc('join_couple', { invite_code: inviteCode });

      if (error) {
        logSupaErrors(error);
        return;
      }
      const handleSuccess = async () => {
        const res = await supabase.functions.invoke('send-partner-notification', {
          body: { type: 'partner_joined' },
        });
        if (res.error) {
          logErrorsWithMessage(res.error, 'notify partner function returned error');
          return;
        }
        setShowContinue(true);
        void localAnalytics().logEvent('OnboardingInviteCodeInputSuccess', {
          screen: 'OnboardingInviteCodeInput',
          action: 'Success',
          userId: authContext.userId,
        });
      };
      switch (data) {
        case 'WRONG_CODE':
          setError(i18n.t('onboarding_invite_input_invite_code_wrong'));
          break;
        case 'COUPLE_IS_FULL':
          setError(i18n.t('onboarding_invite_input_invite_code_full'));
          break;
        case 'SUCCESS':
          void handleSuccess();
          break;
        default:
          setError(i18n.t('onboarding_invite_input_invite_code_error'));
      }
    } catch (err) {
      void localAnalytics().logEvent('OnboardingInviteCodeInputJoinCoupleError', {
        screen: 'OnboardingInviteCodeInput',
        action: 'JoinCoupleError',
        userId: authContext.userId,
        error: err,
      });
      setError(i18n.t('unexpected_error'));
    } finally {
      setButtonLoading(false);
    }
  };

  const onClosePressed = () => {
    void localAnalytics().logEvent('OnboardingInviteCodeInputClosePressed', {
      screen: 'OnboardingInviteCodeInput',
      action: 'ClosePressed',
      userId: authContext.userId,
    });
    navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
  };
  const handleContinue = () => {
    void localAnalytics().logEvent('OnboardingInviteCodeInputContinue', {
      screen: 'OnboardingInviteCodeInput',
      action: 'Continue',
      userId: authContext.userId,
    });
    if (fromSettings) {
      navigation.navigate('Profile', {
        refreshTimeStamp: new Date().toISOString(),
      });
    } else {
      navigation.navigate('OnDateNotification', { withPartner: true, isOnboarding: true });
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
            keyboardShouldPersistTaps="always"
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
                onPress={handleGoBack}
              />
              {fromSettings ? <View /> : <Progress current={4} all={5} />}
              {fromSettings ? <CloseButton onPress={onClosePressed} theme="black" /> : <View />}
            </View>
            <View style={{ marginTop: 20 }}>
              <FontText h1 style={{ textAlign: 'center', marginBottom: 20 }}>
                {i18n.t('onboarding_invite_input_title_1')}
                <FontText h1 style={{ color: theme.colors.error }}>
                  {partnerName}
                </FontText>
                {i18n.t('onboarding_invite_input_title_3')}
              </FontText>
              <StyledInput
                value={inviteCode}
                onChangeText={setInviteCode}
                placeholder={i18n.t('onboarding_invite_input_invite_code_placeholder')}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={5}
              />
              {error && (
                <FontText style={{ color: theme.colors.error, textAlign: 'center', marginTop: 10 }}>
                  {error}
                </FontText>
              )}
              {showContinue && (
                <FontText style={{ textAlign: 'center', marginTop: 10 }}>
                  {i18n.t('onboarding_invite_input_join_success_message', { partnerName })}
                </FontText>
              )}
              {showContinue ? (
                <PrimaryButton
                  title={i18n.t('continue')}
                  onPress={() => void handleContinue()}
                  disabled={inviteCode.length !== 5}
                  buttonStyle={{ marginTop: 20 }}
                />
              ) : (
                <PrimaryButton
                  title={buttonLoading ? i18n.t('loading') : i18n.t('onboarding_invite_input_join')}
                  onPress={() => void handleSubmit()}
                  disabled={buttonLoading || inviteCode.length !== 5}
                  buttonStyle={{ marginTop: 20 }}
                />
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
