import React, { useCallback, useContext } from 'react';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { useTheme, useThemeMode } from '@rneui/themed';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { useFocusEffect } from '@react-navigation/native';

type OnboardingInviteCodeSuccessProps = {
  handleGoBack: () => void;
  handleNext: () => void;
  name: string;
  partnerName: string;
};

const OnboardingInviteCodeSuccess: React.FC<OnboardingInviteCodeSuccessProps> = ({
  handleGoBack,
  handleNext,
  name,
  partnerName,
}) => {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const { setMode } = useThemeMode();

  useFocusEffect(
    useCallback(() => {
      setMode('dark');
      return () => setMode('light');
    }, []),
  );

  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.black,
      }}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <View style={{ padding: 20, flex: 1, justifyContent: 'space-between' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <GoBackButton onPress={handleGoBack} theme="black" />
          </View>

          <View style={{ alignItems: 'center' }}>
            <Image
              style={{
                height: 250,
                width: '90%',
              }}
              resizeMode="contain"
              source={require('../../../assets/images/buddies_connected.png')}
            />
          </View>

          <View>
            <FontText h1 style={{ textAlign: 'center', color: theme.colors.white }}>
              <FontText h1 style={{ color: theme.colors.primary }}>
                {name}
              </FontText>
              {' & '}
              <FontText h1 style={{ color: theme.colors.error }}>
                {partnerName}
              </FontText>{' '}
              {i18n.t('onboarding_invite_code_you_and_partner_are_connected')}
            </FontText>
          </View>

          <SecondaryButton
            buttonStyle={{ backgroundColor: theme.colors.white }}
            onPress={() => {
              void localAnalytics().logEvent('OnboardingInviteCodeSuccessButtonPressed', {
                screen: 'OnboardingInviteCodeSuccess',
                action: 'ButtonPressed',
                userId: authContext.userId,
              });
              handleNext();
            }}
            title={i18n.t('continue')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

export default OnboardingInviteCodeSuccess;
