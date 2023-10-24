import React, { useContext, useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import { AuthContext } from '@app/provider/AuthProvider';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { localAnalytics } from '@app/utils/analytics';
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
  const [showButton, setShowButton] = useState(false);

  const authContext = useContext(AuthContext);

  async function delay(duration: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, duration);
    });
  }
  const [text, setText] = useState(1);
  useEffect(() => {
    const analyze = async () => {
      await delay(1000);
      setText(2);
      await delay(1000);
      setText(3);
      await delay(1000);
      setText(4);
      setShowButton(true);
    };
    const unsubscribeFocus = navigation.addListener('focus', () => void analyze());
    return unsubscribeFocus;
  }, []);
  let textElement = <></>;
  switch (text) {
    case 1:
      textElement = <>{i18n.t('onboarding.analyzing.text_1')}</>;
      break;
    case 2:
      textElement = <>{i18n.t('onboarding.analyzing.text_2')}</>;

      break;
    case 3:
      textElement = <>{i18n.t('onboarding.analyzing.text_3')}</>;
      break;
    case 4:
      textElement = (
        <>
          <FontText h1 style={{ color: theme.colors.primary }}>
            {i18n.t('onboarding.analyzing.text_4_first')}
          </FontText>
          {i18n.t('onboarding.analyzing.text_4_second')}
        </>
      );
      break;
  }
  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.black,
      }}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <View style={{ padding: 20, flex: 1, justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Image
              style={{
                height: 250,
                width: '90%',
              }}
              resizeMode="contain"
              source={require('../../../assets/images/buddies_analyzing.png')}
            ></Image>
          </View>
          <View style={{ minHeight: '20%' }}>
            <FontText h1 style={{ textAlign: 'center', color: theme.colors.white }}>
              {textElement}
            </FontText>
          </View>

          <SecondaryButton
            buttonStyle={{ backgroundColor: showButton ? theme.colors.white : theme.colors.black }}
            onPress={() => {
              void localAnalytics().logEvent('OnboardingAnalyzingContinueClicked', {
                screen: 'OnboardingAnalyzing',
                action: 'continue pressed',
                userId: authContext.userId,
              });
              navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
            }}
            title={i18n.t('continue')}
          ></SecondaryButton>
        </View>
      </SafeAreaView>
    </View>
  );
}
