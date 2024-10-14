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
import { getNow, sleep } from '@app/utils/date';
import { supabase } from '@app/api/initSupabase';
import { logSupaErrors } from '@app/utils/errors';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'Analyzing'>) {
  const { theme } = useTheme();

  // to set the color of status bar
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('dark'));
    return unsubscribeFocus;
  }, [navigation]);
  const [showButton, setShowButton] = useState(false);

  const authContext = useContext(AuthContext);

  const [text, setText] = useState(2);
  useEffect(() => {
    const analyze = async () => {
      // skip 1 step, no more reflection
      // await sleep(1000);
      // setText(2);
      void finishOnboarding();
      await sleep(1000);
      setText(3);
      await sleep(1000);
      setText(4);
      setShowButton(true);
    };
    const unsubscribeFocus = navigation.addListener('focus', () => void analyze());
    return unsubscribeFocus;
  }, []);
  let textElement = <></>;
  switch (text) {
    case 1:
      textElement = <>{i18n.t('onboarding_analyzing_2_text_1')}</>;
      break;
    case 2:
      textElement = <>{i18n.t('onboarding_analyzing_2_text_2')}</>;
      break;
    case 3:
      textElement = <>{i18n.t('onboarding_analyzing_2_text_3')}</>;
      break;
    case 4:
      textElement = (
        <>
          <FontText h1 style={{ color: theme.colors.primary }}>
            {i18n.t('onboarding_analyzing_2_text_4_first')}
          </FontText>
          {i18n.t('onboarding_analyzing_2_text_4_second')}
        </>
      );
      break;
  }
  const finishOnboarding = async () => {
    const profileResponse = await supabase
      .from('user_profile')
      .update({
        onboarding_finished: true,
        updated_at: getNow().toISOString(),
      })
      .eq('user_id', authContext.userId!);
    if (profileResponse.error) {
      logSupaErrors(profileResponse.error);
      return;
    }
  };
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
              navigation.navigate('PremiumOffer', {
                refreshTimeStamp: new Date().toISOString(),
                isOnboarding: true,
              });
            }}
            title={i18n.t('continue')}
          ></SecondaryButton>
        </View>
      </SafeAreaView>
    </View>
  );
}
