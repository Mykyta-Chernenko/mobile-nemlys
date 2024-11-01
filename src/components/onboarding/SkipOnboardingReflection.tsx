import React, { useContext } from 'react';
import { ImageBackground, View } from 'react-native';
import { useTheme } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import { AuthContext } from '@app/provider/AuthProvider';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import { logSupaErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { Image } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNow } from '@app/utils/date';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'SkipOnboardingReflection'>) {
  const { theme } = useTheme();

  const authContext = useContext(AuthContext);
  const handleGoBack = () => {
    void localAnalytics().logEvent('SkipOnboardingReflectionGoBackClicked', {
      screen: 'SkipOnboardingReflection',
      action: 'Go back pressed',
      userId: authContext.userId,
    });
    navigation.navigate('OnboardingReflection');
  };
  const handleSkip = async () => {
    void localAnalytics().logEvent('SkipOnboardingReflectionConfirmSkipClicked', {
      screen: 'SkipOnboardingReflection',
      action: 'confirm skip pressed',
      userId: authContext.userId,
    });
    const dateReponse = await supabase
      .from('user_profile')
      .update({ onboarding_finished: true, updated_at: getNow().toISOString() })
      .eq('user_id', authContext.userId!);
    if (dateReponse.error) {
      logSupaErrors(dateReponse.error);
      return;
    }
    navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
  };
  return (
    <ImageBackground
      style={{
        flexGrow: 1,
      }}
      source={require('../../../assets/images/onboarding_background.png')}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <View style={{ flexGrow: 1, padding: 20 }}>
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
              theme="light"
              containerStyle={{ position: 'absolute', left: 0 }}
              onPress={handleGoBack}
            ></GoBackButton>
          </View>
          <View
            style={{
              flexGrow: 1,
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Image
              style={{
                marginTop: '10%',
                alignItems: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
                height: 250,
                width: '100%',
              }}
              resizeMode="contain"
              source={require('../../../assets/images/sad_buddies.png')}
            ></Image>

            <View>
              <FontText h2 style={{ color: theme.colors.black }}>
                {i18n.t('onboarding_relationship_story_skip_first')}
                <FontText h2 style={{ color: theme.colors.error }}>
                  {i18n.t('onboarding_relationship_story_skip_second')}
                </FontText>
                {i18n.t('onboarding_relationship_story_skip_third')}
              </FontText>
            </View>
            <View>
              <PrimaryButton
                onPress={handleGoBack}
                title={i18n.t('onboarding_relationship_story_skip_back')}
              ></PrimaryButton>
              <SecondaryButton
                buttonStyle={{ marginTop: 10 }}
                onPress={() => void handleSkip()}
                title={i18n.t('onboarding_relationship_story_skip_confirm')}
              ></SecondaryButton>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
