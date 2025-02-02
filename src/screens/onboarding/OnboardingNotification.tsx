import React, { useCallback, useContext, useState } from 'react';
import {
  RefreshControl,
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
  ImageBackground,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme, useThemeMode } from '@rneui/themed';
import * as Notifications from 'expo-notifications';
import { MainStackParamList } from '@app/types/navigation';
import { FontText } from '@app/components/utils/FontText';
import { AuthContext } from '@app/provider/AuthProvider';
import { i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';
import { Loading } from '@app/components/utils/Loading';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { recreateNotificationList, retrieveNotificationAccess } from '@app/utils/notification';
import { useFocusEffect } from '@react-navigation/native';
import { logErrorsWithMessage } from '@app/utils/errors';
import NotificationSetting from 'react-native-open-notification';
import {
  V3_NOTIFICATION_IDENTIFIERS,
  V3_NOTIFICATION_SUBTYPE,
  V3_NOTIFICATION_TYPE,
} from '@app/types/domain';
import {
  SchedulableNotificationTriggerInput,
  SchedulableTriggerInputTypes,
} from 'expo-notifications';

const ONBOARDING_BACKGROUND = require('../../../assets/images/onboarding_background.png');
const NOTIFICATION_EXAMPLE = require('../../../assets/images/notification_example.png');

export default function OnboardingNotification({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'OnboardingNotification'>) {
  const isOnboarding = route.params.isOnboarding;
  const screenName = 'OnboardingNotification';
  const authContext = useContext(AuthContext);

  const { setMode } = useThemeMode();
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setMode('dark');
      void fetchInitialData();
      return () => setMode('light');
    }, []),
  );

  async function schedulePreContentNotification() {
    const preDateIdentifier = V3_NOTIFICATION_IDENTIFIERS.PRE_CONTENT;
    const notifications = [
      {
        screen: 'V3Home',
        title: i18n.t(`notification_pre_content_1_title`),
        body: i18n.t(`notification_pre_content_1_body`),
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 60 * 60 * 2,
          repeats: false,
        } as SchedulableNotificationTriggerInput,
        subtype: V3_NOTIFICATION_SUBTYPE.PRE_CONTENT_1,
      },
      {
        screen: 'V3Home',
        title: i18n.t(`notification_pre_content_2_title`),
        body: i18n.t(`notification_pre_content_2_body`),
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 60 * 60 * 12,
          repeats: false,
        } as SchedulableNotificationTriggerInput,
        subtype: V3_NOTIFICATION_SUBTYPE.PRE_CONTENT_2,
      },
    ];
    await recreateNotificationList(
      authContext.userId!,
      preDateIdentifier,
      notifications,
      V3_NOTIFICATION_TYPE.PRE_CONTENT,
      [V3_NOTIFICATION_SUBTYPE.PRE_CONTENT_1, V3_NOTIFICATION_SUBTYPE.PRE_CONTENT_2].join(':'),
    );
  }

  const fetchInitialData = () => {
    try {
      setLoading(true);
      setError('');
      void localAnalytics().logEvent(`${screenName}DataLoading`, {
        screen: screenName,
        action: 'DataLoading',
        userId: authContext.userId,
        isOnboarding,
      });
      void localAnalytics().logEvent(`${screenName}DataLoaded`, {
        screen: screenName,
        action: 'DataLoaded',
        userId: authContext.userId,
        isOnboarding,
      });
    } catch (e) {
      setError((e as Error)?.message || '');
      logErrorsWithMessage(e, (e as Error)?.message || '');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    void fetchInitialData();
    setRefreshing(false);
  };

  const handleBack = () => {
    void localAnalytics().logEvent(`${screenName}GoBack`, {
      screen: screenName,
      action: 'GoBack',
      userId: authContext.userId,
      isOnboarding,
    });
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('V3PremiumOffer', {
        refreshTimeStamp: new Date().toISOString(),
        isOnboarding: true,
      });
    }
  };

  const handleSkip = () => {
    void localAnalytics().logEvent(`${screenName}Skip`, {
      screen: screenName,
      action: 'Skip',
      userId: authContext.userId,
      isOnboarding,
    });
    navigation.navigate('Home', {
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  const handleOpenSettings = () => {
    try {
      NotificationSetting.open();
    } catch (e) {
      logErrorsWithMessage(e, (e as Error)?.message || '');
    }
  };

  const handleConfirm = async () => {
    void localAnalytics().logEvent(`${screenName}Confirm`, {
      screen: screenName,
      action: 'Confirm',
      userId: authContext.userId,
      isOnboarding,
    });
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'denied') {
        Alert.alert(i18n.t('notification_denied_title'), i18n.t('notification_denied_message'), [
          {
            text: i18n.t('open_settings'),
            onPress: () => void handleOpenSettings(),
          },
          {
            text: i18n.t('cancel'),
            onPress: () => {},
          },
        ]);
        return;
      }
      await retrieveNotificationAccess(authContext.userId, status, screenName, setLoading);
      if (isOnboarding) {
        void schedulePreContentNotification();
      }
      navigation.navigate('Home', {
        refreshTimeStamp: new Date().toISOString(),
      });
    } catch (e) {
      logErrorsWithMessage(e, (e as Error)?.message || '');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ImageBackground source={ONBOARDING_BACKGROUND} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 15 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
          }
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
                  onPress={() => void handleBack()}
                />
              ) : null}
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
                source={NOTIFICATION_EXAMPLE}
              />
            </View>
            {error.length > 0 ? (
              <View style={{ alignItems: 'center', marginVertical: 10 }}>
                <FontText style={{ marginBottom: 10 }}>{error}</FontText>
                <PrimaryButton
                  buttonStyle={{ width: '100%' }}
                  onPress={() => void fetchInitialData()}
                  title={i18n.t('reload')}
                />
              </View>
            ) : (
              <View style={{ marginBottom: 10 }}>
                <PrimaryButton
                  buttonStyle={{ width: '100%' }}
                  onPress={() => void handleConfirm()}
                  title={i18n.t('date_notification_confirm')}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}
