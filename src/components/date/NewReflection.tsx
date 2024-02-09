import { useTheme } from '@rneui/themed';
import React, { useContext, useEffect, useState } from 'react';
import { Modal, TouchableWithoutFeedback, View } from 'react-native';
import { CloseButton } from '../buttons/CloseButton';
import { FontText } from '../utils/FontText';
import { i18n } from '@app/localization/i18n';
import { logErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import { APIUserProfile, SupabaseAnswer } from '@app/types/api';
import { SecondaryButton } from '../buttons/SecondaryButton';
import ReflectionCard from '../reflection/ReflectionCard';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { Loading } from '../utils/Loading';
import { NOTIFICATION_IDENTIFIERS } from '@app/types/domain';
import { recreateNotification, retrieveNotificationAccess } from '@app/utils/notification';
import * as Notifications from 'expo-notifications';

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

  const onPress = async () => {
    setLoading(true);

    void localAnalytics().logEvent('NewReflectionRemindLaterPressed', {
      screen: 'NewRelfection',
      action: 'RemindLater',
      userId: authContext.userId,
      reflection: reflection,
      level: level,
    });

    const data: SupabaseAnswer<APIUserProfile> = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_id', authContext.userId)
      .single();
    if (data.error) {
      logErrors(data.error);
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    await retrieveNotificationAccess(authContext.userId, status, 'NewReflection', () => {});
    const reflectionItendifier =
      NOTIFICATION_IDENTIFIERS.REFLECTION_AFTER_DATE + authContext.userId!;
    await recreateNotification(
      authContext.userId!,
      reflectionItendifier,
      'ReflectionHome',
      i18n.t('notification.reflection.title', { partnerName: data.data.partner_first_name }),
      i18n.t('notification.reflection.body'),
      {
        seconds: 60 * 60 * 24, // in a day
        repeats: false,
      },
    );

    void savedShowed();
    onClose();
    setLoading(false);
  };
  const onClosePressed = () => {
    setLoading(true);
    void localAnalytics().logEvent('NewReflectionClosePressed', {
      screen: 'Interview',
      action: 'ClosePressed',
      userId: authContext.userId,
    });
    void savedShowed();
    onClose();
    setLoading(false);
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
                      {i18n.t('new_reflection.title_1')}
                      <FontText h1 style={{ color: theme.colors.primary }}>
                        {i18n.t('new_reflection.title_2')}
                      </FontText>
                      {i18n.t('new_reflection.title_3')}
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
                    style={{ marginBottom: 10 }}
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
