import React, { useContext, useEffect, useState } from 'react';
import { useTheme, useThemeMode } from '@rneui/themed';

import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ImageBackground, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { AuthContext } from '@app/provider/AuthProvider';
import { i18n } from '@app/localization/i18n';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { supabase } from '@app/api/initSupabase';
import { logErrors } from '@app/utils/errors';
import { localAnalytics } from '@app/utils/analytics';
import { Loading } from '@app/components/utils/Loading';
import * as Notifications from 'expo-notifications';
import { retrieveNotificationAccess } from '@app/utils/notification';
import { Image } from 'react-native';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'OnDateNotification'>) {
  const [loading, setLoading] = useState(false);
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation, setMode]);

  const [notificationStatus, setNotificationStatus] = useState<string | undefined>(undefined);
  useEffect(() => {
    const getCurrentToken = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationStatus(status);
    };
    void getCurrentToken();
  }, []);

  const authContext = useContext(AuthContext);
  const { theme } = useTheme();
  const saveShowedNotificaiton = async () => {
    const updateProfile = await supabase
      .from('user_technical_details')
      .update({ showed_challenge_notification: true, updated_at: new Date() })
      .eq('user_id', authContext.userId);
    if (updateProfile.error) {
      logErrors(updateProfile.error);
      return;
    }
  };
  const handleConfirm = async () => {
    void saveShowedNotificaiton();
    void localAnalytics().logEvent('OnDateNotificationShown', {
      screen: 'OnDateNotification',
      action: 'Shown',
      userId: authContext.userId,
      confirm: true,
    });
    await retrieveNotificationAccess(
      authContext.userId,
      notificationStatus,
      'OnDateNotification',
      setLoading,
    );
    navigation.navigate('Home', {
      refreshTimeStamp: new Date().toISOString(),
    });
  };
  const handleDecline = () => {
    void saveShowedNotificaiton();
    void localAnalytics().logEvent('OnDateNotificationShown', {
      screen: 'OnDateNotification',
      action: 'Shown',
      userId: authContext.userId,
      confirm: false,
    });
    navigation.navigate('Home', {
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  return loading ? (
    <Loading></Loading>
  ) : (
    <ImageBackground
      style={{
        flexGrow: 1,
      }}
      source={require('../../../assets/images/onboarding_background.png')}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 15,
          }}
        >
          <View style={{ flexGrow: 1, justifyContent: 'space-between' }}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.white,
                  padding: 10,
                  borderRadius: 40,
                }}
              >
                <FontText>{i18n.t('date.notification.challenge')}</FontText>
              </View>
            </View>
            <View style={{ marginTop: 20 }}>
              <FontText h1 style={{ textAlign: 'center' }}>
                <FontText h1 style={{ color: theme.colors.error }}>
                  {i18n.t('date.notification.title_1')}
                </FontText>
                {i18n.t('date.notification.title_2')}
                {i18n.t('date.notification.title_3')}
              </FontText>
              <FontText style={{ textAlign: 'center', marginTop: 20 }}>
                {i18n.t('date.notification.subtitle')}
              </FontText>
            </View>

            <View style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: 'row' }}>
                <Image
                  resizeMode="contain"
                  style={{ width: '100%', aspectRatio: 1.5 }}
                  source={require('../../../assets/images/notification_example.png')}
                ></Image>
              </View>
              <PrimaryButton
                buttonStyle={{ width: '100%' }}
                onPress={() => void handleConfirm()}
                title={i18n.t('date.notification.confirm')}
              ></PrimaryButton>
              <SecondaryButton
                containerStyle={{ marginTop: 10 }}
                buttonStyle={{ width: '100%' }}
                onPress={handleDecline}
                title={i18n.t('date.notification.decline')}
              ></SecondaryButton>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
