import React, { useContext, useEffect, useState } from 'react';
import { useTheme, useThemeMode } from '@rneui/themed';

import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ImageBackground, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { AuthContext } from '@app/provider/AuthProvider';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { localAnalytics } from '@app/utils/analytics';
import { Loading } from '@app/components/utils/Loading';
import * as Notifications from 'expo-notifications';
import { retrieveNotificationAccess } from '@app/utils/notification';
import { Image } from 'react-native';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { Progress } from '@app/components/utils/Progress';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'OnDateNotification'>) {
  const [loading, setLoading] = useState(false);
  const isOnboarding = route.params.isOnboarding;
  const screenName = isOnboarding ? 'OnboardingNotification' : 'OnDateNotification';
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
  const handleConfirm = async () => {
    void localAnalytics().logEvent(`${screenName}Continue`, {
      screen: screenName,
      action: 'Continue',
      userId: authContext.userId,
    });
    await retrieveNotificationAccess(
      authContext.userId,
      notificationStatus,
      screenName,
      setLoading,
    );
    if (isOnboarding) {
      navigation.navigate('Analyzing');
    } else {
      navigation.navigate('Home', {
        refreshTimeStamp: new Date().toISOString(),
      });
    }
  };
  const handleSkip = () => {
    void localAnalytics().logEvent(`${screenName}Skip`, {
      screen: screenName,
      action: 'Skip',
      userId: authContext.userId,
    });
    if (isOnboarding) {
      navigation.navigate('Analyzing');
    } else {
      navigation.navigate('Home', {
        refreshTimeStamp: new Date().toISOString(),
      });
    }
  };
  const handleBack = () => {
    void localAnalytics().logEvent(`${screenName}GoBack`, {
      screen: screenName,
      action: 'GoBack',
      userId: authContext.userId,
    });
    if (isOnboarding) {
      navigation.navigate('OnboardingInviteCode', { fromSettings: false });
    } else {
      navigation.navigate('Home', {
        refreshTimeStamp: new Date().toISOString(),
      });
    }
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
                flexDirection: 'row',
                paddingHorizontal: 15,
                alignItems: 'center',
                justifyContent: 'center',
                height: 40,
              }}
            >
              {isOnboarding ? (
                <GoBackButton
                  theme="light"
                  containerStyle={{ position: 'absolute', left: 0 }}
                  onPress={handleBack}
                ></GoBackButton>
              ) : (
                <></>
              )}

              {isOnboarding ? <Progress current={5} all={5}></Progress> : <></>}
              <View
                style={{
                  position: 'absolute',
                  right: 0,
                  borderRadius: 40,
                  backgroundColor: theme.colors.white,
                }}
              >
                <TouchableOpacity style={{ padding: 10 }} onPress={() => void handleSkip()}>
                  <FontText>{i18n.t('skip')}</FontText>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ marginTop: 20 }}>
              <FontText h1 style={{ textAlign: 'center' }}>
                <FontText h1 style={{ color: theme.colors.error }}>
                  {i18n.t('date_notification_title_1')}
                </FontText>
                {i18n.t('date_notification_title_2')}
                {i18n.t('date_notification_title_3')}
              </FontText>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <Image
                resizeMode="contain"
                style={{ width: '100%', aspectRatio: 1 }}
                source={require('../../../assets/images/notification_example.png')}
              ></Image>
            </View>

            <View style={{ marginBottom: 10 }}>
              <PrimaryButton
                buttonStyle={{ width: '100%' }}
                onPress={() => void handleConfirm()}
                title={i18n.t('date_notification_confirm')}
              ></PrimaryButton>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
