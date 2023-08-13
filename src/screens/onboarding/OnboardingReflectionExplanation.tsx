import React, { useContext, useEffect } from 'react';
import { View, Image } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import { AuthContext } from '@app/provider/AuthProvider';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { localAnalytics } from '@app/utils/analytics';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'OnboardingReflectionExplanation'>) {
  const { theme } = useTheme();

  // to set the color of status bar
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('dark'));
    return unsubscribeFocus;
  }, [navigation]);

  const authContext = useContext(AuthContext);

  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.black,
      }}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <View style={{ padding: 20, flex: 1 }}>
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 15,
              alignItems: 'center',
              justifyContent: 'center',
              height: 32,
            }}
          >
            <GoBackButton
              theme="black"
              containerStyle={{ position: 'absolute', left: 0 }}
              onPress={() => {
                void localAnalytics().logEvent('OnboardingReflectionExplanationGoBackClicked', {
                  screen: 'OnboardingReflectionExplanation',
                  action: 'Go back pressed',
                  userId: authContext.userId,
                });
                navigation.navigate('DiscussWay');
              }}
            ></GoBackButton>
          </View>
          <View style={{ flex: 1, justifyContent: 'space-between' }}>
            <View></View>
            <View>
              <Image
                style={{
                  width: '70%',
                  height: 200,
                  marginBottom: '10%',
                }}
                resizeMode="contain"
                source={require('../../../assets/images/relationship_story_explanation.png')}
              ></Image>
              <FontText h1 style={{ color: theme.colors.white }}>
                {i18n.t('onboarding.relationship_story_explanation_first')}
                <FontText h1 style={{ color: theme.colors.primary }}>
                  {i18n.t('onboarding.relationship_story_explanation_second')}
                </FontText>
                {i18n.t('onboarding.relationship_story_explanation_third')}
              </FontText>
              <FontText style={{ marginTop: 15, color: theme.colors.grey3 }}>
                {i18n.t('onboarding.relationship_story_explanation_description')}
              </FontText>
            </View>
            <SecondaryButton
              onPress={() => {
                void localAnalytics().logEvent('OnboardingReflectionExplanationNextClicked', {
                  screen: 'OnboardingReflectionExplanation',
                  action: 'next pressed',
                  userId: authContext.userId,
                });
                navigation.navigate('OnboardingReflection');
              }}
              title={i18n.t('continue')}
            ></SecondaryButton>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
