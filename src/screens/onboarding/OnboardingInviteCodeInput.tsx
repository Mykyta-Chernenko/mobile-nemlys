import React, { useState, useContext, useEffect, useCallback } from 'react';
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
import { KEYBOARD_BEHAVIOR, ONBOARDING_STEPS, UNEXPECTED_ERROR } from '@app/utils/constants';
import StyledInput from '@app/components/utils/StyledInput';
import { CloseButton } from '@app/components/buttons/CloseButton';
import { Loading } from '@app/components/utils/Loading';
import { logErrorsWithMessageWithoutAlert, logSupaErrors, retryAsync } from '@app/utils/errors';
import { showName } from '@app/utils/strings';
import { useFocusEffect } from '@react-navigation/native';
import OnboardingInviteCodeSuccess from '@app/components/onboarding/OnboardingInviteCodeSuccess';

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
  const [name, setName] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const authContext = useContext(AuthContext);
  const { nextScreen, screenParams } = route.params || {};
  const [showSuccess, setShowSuccess] = useState(false);
  const { setMode } = useThemeMode();

  useFocusEffect(
    useCallback(() => {
      setMode('light');
    }, []),
  );

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
        .select('first_name, partner_first_name')
        .eq('user_id', authContext.userId!)
        .single();

      if (error) {
        logSupaErrors(error);
        return;
      }

      setPartnerName(showName(data.partner_first_name) || i18n.t('home_partner'));
      setName(showName(data.first_name));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPartnerName();
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
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('OnboardingInviteCode', {
        nextScreen: nextScreen,
        screenParams: screenParams,
      });
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
        const res = await retryAsync('OnboardingInviteCodeInput', async () => {
          return await supabase.functions.invoke('send-partner-notification', {
            body: { type: 'partner_joined' },
          });
        });
        if (res.error) {
          logErrorsWithMessageWithoutAlert(res.error, i18n.t('reminding_partner_error'));
        }
        void localAnalytics().logEvent('OnboardingInviteCodeInputSuccess', {
          screen: 'OnboardingInviteCodeInput',
          action: 'Success',
          userId: authContext.userId,
        });
        setShowSuccess(true);
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
      setError(UNEXPECTED_ERROR);
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

  const handleNext = () => {
    void localAnalytics().logEvent('OnboardingInviteCodeSuccessButtonPressed', {
      screen: 'OnboardingInviteCodeSuccess',
      action: 'ButtonPressed',
      userId: authContext.userId,
    });

    if (nextScreen) {
      navigation.navigate(
        // @ts-expect-error cannot type screen name here
        nextScreen,
        screenParams || { refreshTimeStamp: new Date().toISOString() },
      );
    } else {
      navigation.navigate('OnboardingQuizIntro', {
        name,
        partnerName,
      });
    }
  };

  if (showSuccess) {
    return (
      <OnboardingInviteCodeSuccess
        handleNext={handleNext}
        handleGoBack={() => setShowSuccess(false)}
        name={name}
        partnerName={partnerName}
      />
    );
  }

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
              {nextScreen ? <View /> : <Progress current={5} all={ONBOARDING_STEPS} />}
              {nextScreen ? <CloseButton onPress={onClosePressed} theme="black" /> : <View />}
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

              <PrimaryButton
                title={buttonLoading ? i18n.t('loading') : i18n.t('onboarding_invite_input_join')}
                onPress={() => void handleSubmit()}
                disabled={buttonLoading || inviteCode.length !== 5}
                buttonStyle={{ marginTop: 20 }}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
