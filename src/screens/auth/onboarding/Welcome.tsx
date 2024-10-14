import React, { useEffect } from 'react';
import { Image, ImageBackground, View } from 'react-native';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { ANON_USER } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';
import { useTheme } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isSmallDevice } from '@app/utils/size';
import { ScrollView } from 'react-native';

export default function ({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Welcome'>) {
  const { theme } = useTheme();
  useEffect(() => {
    void localAnalytics().logEvent('WelcomeVisited', {
      screen: 'Welcome',
      action: 'Visited Welcome screen',
      userId: ANON_USER,
    });
  }, []);
  return (
    <ImageBackground
      style={{
        flexGrow: 1,
        width: '100%',
      }}
      source={require('../../../../assets/images/onboarding_background.png')}
    >
      <ScrollView contentContainerStyle={{ flex: 1, marginTop: isSmallDevice() ? -120 : 0 }}>
        <Image
          style={{
            resizeMode: 'contain',
            width: '100%',
          }}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          source={require('../../../../assets/images/buddys.png')}
        />
        <SafeAreaView
          style={{
            flex: 1,
            width: '100%',
            justifyContent: 'flex-start',
          }}
        >
          <View
            style={{
              flex: 1,
              paddingHorizontal: 15,
              marginTop: '-25%',
              justifyContent: 'space-around',
            }}
          >
            <View>
              <FontText
                style={{
                  textAlign: 'center',
                }}
                h1
              >
                {i18n.t('welcome_title_first')}
                <FontText h1 style={{ color: theme.colors.primary }}>
                  {i18n.t('welcome_title_second')}
                </FontText>
              </FontText>
            </View>

            <PrimaryButton
              buttonStyle={{ marginTop: '5%', marginBottom: '2%' }}
              title={i18n.t('welcome_button_default')}
              onPress={() => {
                void localAnalytics().logEvent('WelcomeNextClicked', {
                  screen: 'Welcome',
                  action: 'Clicked on next on Welcome',
                  userId: ANON_USER,
                });
                navigation.navigate('Login');
              }}
            />
          </View>
        </SafeAreaView>
      </ScrollView>
    </ImageBackground>
  );
}
