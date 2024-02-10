import React, { useContext, useEffect } from 'react';
import { View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { useTheme, useThemeMode } from '@rneui/themed';
import { MainStackParamList } from '@app/types/navigation';
import { SecondaryButton } from '../../components/buttons/SecondaryButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import * as Notifications from 'expo-notifications';
import { sleep } from '@app/utils/date';
import { retrieveNotificationAccess } from '@app/utils/notification';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'PremiumSuccess'>) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);

  const state = route.params.state;
  const isPremium = state === 'premium_started';

  // to set the color of status bar
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('dark'));
    return unsubscribeFocus;
  }, [navigation]);

  useEffect(() => {
    const getCurrentToken = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      await sleep(2000);
      await retrieveNotificationAccess(authContext.userId, status, 'PremiumSuccess', () => {});
    };
    void getCurrentToken();
  }, []);

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
              source={require('../../../assets/images/premium_success.png')}
            ></Image>
          </View>
          <View>
            <FontText h1 style={{ textAlign: 'center', color: theme.colors.white }}>
              {isPremium
                ? i18n.t('premium.success.premium.title_1')
                : i18n.t('premium.success.trial.title_1')}
              <FontText h1 style={{ color: theme.colors.primary }}>
                {isPremium
                  ? i18n.t('premium.success.premium.title_2')
                  : i18n.t('premium.success.trial.title_2')}
              </FontText>
            </FontText>
          </View>

          <SecondaryButton
            buttonStyle={{ backgroundColor: theme.colors.white }}
            onPress={() => {
              void localAnalytics().logEvent('PremiumSuccessButtonPressed', {
                screen: 'PremiumSuccess',
                action: 'ButtonPressed',
                userId: authContext.userId,
              });
              navigation.navigate('Home', {
                refreshTimeStamp: new Date().toISOString(),
              });
            }}
            title={
              isPremium
                ? i18n.t('premium.success.premium.button')
                : i18n.t('premium.success.trial.button')
            }
          ></SecondaryButton>
        </View>
      </SafeAreaView>
    </View>
  );
}
