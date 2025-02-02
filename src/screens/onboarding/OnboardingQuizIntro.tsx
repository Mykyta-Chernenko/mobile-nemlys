import React, { useContext, useEffect } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { useTheme, useThemeMode } from '@rneui/themed';
import { MainStackParamList } from '@app/types/navigation';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import { GoBackButton } from '@app/components/buttons/GoBackButton';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'OnboardingQuizIntro'>) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const { name, partnerName } = route.params;

  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('dark'));
    return unsubscribeFocus;
  }, [navigation]);

  const handleGoBack = () => {
    void localAnalytics().logEvent('OnboardingQuizIntroBackClicked', {
      screen: 'OnboardingQuizIntro',
      action: 'BackClicked',
      userId: authContext.userId,
    });
    navigation.goBack();
  };

  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.black,
      }}
    >
      <SafeAreaView
        style={{
          flexGrow: 1,
        }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 20,
          }}
        >
          <View style={{ gap: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <GoBackButton onPress={handleGoBack} theme={'black'} />
            </View>
            <View
              style={{
                alignSelf: 'center',
                backgroundColor: 'rgba(255, 255,255, 0.1)',
                padding: 8,
                borderRadius: 20,
              }}
            >
              <FontText small style={{ color: theme.colors.white, textAlign: 'center' }}>
                {i18n.t('onboarding_quiz_intro_start_questions', { count: 6 })}
              </FontText>
            </View>
            <View>
              <FontText h2 style={{ textAlign: 'center', color: theme.colors.white }}>
                {i18n.t('onboarding_quiz_intro_personalize_for_you_and_partner')}
                <FontText h2 style={{ textAlign: 'center', color: theme.colors.primary }}>
                  {name}
                </FontText>
                {' & '}
                <FontText h2 style={{ textAlign: 'center', color: theme.colors.error }}>
                  {partnerName}
                </FontText>
              </FontText>
            </View>
          </View>

          <View style={{ alignItems: 'center' }}>
            <Image
              style={{
                height: 250,
                width: '90%',
              }}
              resizeMode="contain"
              source={require('../../../assets/images/buddies_personalize.png')}
            ></Image>
          </View>
          <View style={{ gap: 40 }}>
            <View>
              <FontText small style={{ color: theme.colors.grey3, textAlign: 'center' }}>
                {i18n.t('onboarding_quiz_intro_disclaimer')}
              </FontText>
            </View>

            <SecondaryButton
              buttonStyle={{ backgroundColor: theme.colors.white }}
              onPress={() => {
                void localAnalytics().logEvent('OnboardingQuizIntroButtonPressed', {
                  screen: 'OnboardingQuizIntro',
                  action: 'ButtonPressed',
                  userId: authContext.userId,
                });
                navigation.navigate('OnboardingQuiz', {
                  isOnboarding: true,
                  refreshTimeStamp: new Date().toISOString(),
                });
              }}
              title={i18n.t('onboarding_quiz_intro_start')}
            ></SecondaryButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
