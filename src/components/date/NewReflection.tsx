import { useTheme } from '@rneui/themed';
import React, { useContext, useEffect, useState } from 'react';
import { Modal, Platform, TouchableWithoutFeedback, View } from 'react-native';
import { CloseButton } from '../buttons/CloseButton';
import { FontText } from '../utils/FontText';
import { i18n } from '@app/localization/i18n';
import { logErrors, logErrorsWithMessage } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import { SupabaseAnswer } from '@app/types/api';
import { SecondaryButton } from '../buttons/SecondaryButton';
import ReflectionCard from '../reflection/ReflectionCard';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import * as Notifications from 'expo-notifications';
import { isDevice } from 'expo-device';
import { DENIED_NOTIFICATION_STATUS, GRANTED_NOTIFICATION_STATUS } from '@app/utils/constants';
import { Loading } from '../utils/Loading';
export default function ({
  level,
  show,
  onClose,
  navigation,
}: {
  level: number;
  show: boolean;
  onClose: () => void;
  navigation: NativeStackNavigationProp<MainStackParamList, 'Home', undefined>;
}) {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const [reflection, setReflection] = useState<string>('');
  const [reflectionId, setReflectionId] = useState<number>(0);
  const authContext = useContext(AuthContext);
  useEffect(() => {
    const f = async () => {
      void localAnalytics().logEvent('NewReflectionShown', {
        screen: 'NewReflection',
        action: 'Showed',
        userId: authContext.userId,
      });
      const data: SupabaseAnswer<{ id: number; reflection: string }> = await supabase
        .from('reflection_question')
        .select('id,reflection')
        .lte('level', level)
        .order('level', { ascending: false })
        .limit(1)
        .single();

      if (data.error) {
        logErrors(data.error);
        return;
      }
      setReflection(data.data.reflection);
      setReflectionId(data.data.id);
    };
    show && void f();
  }, [show, authContext.userId]);
  const savedShowed = async () => {
    const newResponse = await supabase.from('reflection_notification').insert({
      level: level,
      user_id: authContext.userId,
    });

    if (newResponse.error) {
      logErrors(newResponse.error);
      return;
    }
  };
  const [notificationStatus, setNotificationStatus] = useState<string | undefined>(undefined);
  useEffect(() => {
    const getCurrentToken = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setNotificationStatus(status);
    };
    void getCurrentToken();
  }, []);

  const registerForPushNotificationsAsync = async () => {
    const profileResponse: SupabaseAnswer<{
      id: number;
      ios_expo_token: string | null;
      android_expo_token: string | null;
    }> = await supabase
      .from('user_profile')
      .select('id, ios_expo_token, android_expo_token')
      .eq('user_id', authContext.userId)
      .single();
    if (profileResponse.error) {
      logErrorsWithMessage(profileResponse.error, profileResponse.error.message);
      return;
    }
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (isDevice) {
        let finalStatus = notificationStatus;
        if (notificationStatus !== GRANTED_NOTIFICATION_STATUS) {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus === GRANTED_NOTIFICATION_STATUS || finalStatus != notificationStatus) {
          void localAnalytics().logEvent('NewReflectionNotificationAccessProvided', {
            screen: 'NewReflection',
            action: 'User gave reminder notification access',
            userId: authContext.userId,
          });
        } else if (finalStatus === DENIED_NOTIFICATION_STATUS) {
          void localAnalytics().logEvent('NewReflectionNotificationAccessDeclined', {
            screen: 'NewReflection',
            action: 'User declined reminder notification access',
            userId: authContext.userId,
          });
        }

        if (finalStatus === GRANTED_NOTIFICATION_STATUS) {
          setLoading(true);

          const token = (await Notifications.getExpoPushTokenAsync()).data;
          let tokenField: string | null = null;
          if (Platform.OS === 'ios') {
            tokenField = 'ios_expo_token';
          } else if (Platform.OS === 'android') {
            tokenField = 'android_expo_token';
          }
          if (token && tokenField && token != profileResponse.data?.[tokenField]) {
            const res = await supabase
              .from('user_profile')
              .update({ [tokenField]: token, updated_at: new Date() })
              .eq('id', profileResponse.data?.id);
            if (res.error) {
              logErrors(res.error);
            }
          }
        }
      } else {
        alert('Must use physical device for Push Notifications');
      }
    } finally {
      setLoading(false);
    }
  };
  const onPress = async () => {
    void localAnalytics().logEvent('NewReflectionRemindLaterPressed', {
      screen: 'NewRelfection',
      action: 'RemindLater',
      userId: authContext.userId,
      reflection: reflection,
      level: level,
    });
    await registerForPushNotificationsAsync();
    void savedShowed();
    onClose();
  };
  const onClosePressed = () => {
    void localAnalytics().logEvent('NewReflectionClosePressed', {
      screen: 'Interview',
      action: 'ClosePressed',
      userId: authContext.userId,
    });
    void savedShowed();
    onClose();
  };
  return (
    <Modal animationType="none" transparent={true} visible={show}>
      <TouchableWithoutFeedback onPress={onClosePressed} style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableWithoutFeedback style={{ flex: 1 }}>
            <View
              style={{
                height: '90%',
                width: '100%',
                backgroundColor: theme.colors.white,
                borderRadius: 24,
                flexDirection: 'column',
                padding: 20,
                justifyContent: 'space-between',
              }}
            >
              {loading ? (
                <Loading></Loading>
              ) : (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <CloseButton onPress={onClosePressed} theme="dark"></CloseButton>
                  </View>
                  <View style={{ marginTop: 5 }}>
                    <FontText h1 style={{ textAlign: 'center' }}>
                      {i18n.t('new_reflection.title')}
                    </FontText>
                    <View style={{ marginTop: '2%' }}>
                      <FontText style={{ color: theme.colors.grey3, textAlign: 'center' }}>
                        {i18n.t('new_reflection.description')}
                      </FontText>
                    </View>
                  </View>
                  <View style={{ height: 400, maxHeight: '70%' }}>
                    <ReflectionCard>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 20,
                        }}
                      >
                        <View
                          style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            flex: 1,
                          }}
                        >
                          <FontText h3 style={{ color: theme.colors.white }}>
                            {reflection}
                          </FontText>
                        </View>
                        <PrimaryButton
                          title={i18n.t('reflection.start')}
                          buttonStyle={{
                            backgroundColor: theme.colors.warning,
                            paddingHorizontal: 60,
                          }}
                          onPress={() => {
                            void localAnalytics().logEvent('NewReflectionWriteNew', {
                              screen: 'NewReflection',
                              action: 'Start button clicked',
                              userId: authContext.userId,
                              reflectionId: reflectionId,
                            });
                            void savedShowed();

                            navigation.navigate('WriteReflection', {
                              reflectionId,
                              question: reflection,
                              answer: undefined,
                            });
                            onClose();
                          }}
                          titleStyle={{ color: theme.colors.black }}
                        ></PrimaryButton>
                      </View>
                    </ReflectionCard>
                  </View>

                  <SecondaryButton
                    buttonStyle={{ backgroundColor: theme.colors.grey1 }}
                    title={i18n.t('new_reflection.button')}
                    onPress={() => void onPress()}
                    style={{ marginBottom: 5 }}
                  ></SecondaryButton>
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
