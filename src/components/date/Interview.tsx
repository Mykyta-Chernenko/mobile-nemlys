import { useTheme } from '@rneui/themed';
import React, { useContext, useEffect, useState } from 'react';
import { Linking, Modal, TouchableWithoutFeedback, View } from 'react-native';
import { CloseButton } from '../buttons/CloseButton';
import { Image } from 'react-native';
import { FontText } from '../utils/FontText';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import { SupabaseAnswer } from '@app/types/api';
import { logErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import { isSmallDevice } from '@app/utils/size';

export default function ({ show, onClose }: { show: boolean; onClose: () => void }) {
  const { theme } = useTheme();
  const [link, setLink] = useState<string | undefined>(undefined);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const f = async () => {
      const res: SupabaseAnswer<{ interview_link: string }> = await supabase
        .from('app_settings')
        .select('interview_link')
        .single();
      if (res.error) {
        logErrors(res.error);
        return;
      }
      setLink(res.data.interview_link);
    };
    void f();
    void localAnalytics().logEvent('InterviewShowed', {
      screen: 'Interview',
      action: 'Showed',
      userId: authContext.userId,
    });
  });
  const savedShowed = async (agreed: boolean) => {
    const newResponse = await supabase
      .from('user_profile')
      .update({
        showed_interview_request: true,
        agreed_on_interview: agreed,
        updated_at: new Date(),
      })
      .eq('user_id', authContext.userId);

    if (newResponse.error) {
      logErrors(newResponse.error);
      return;
    }
  };
  const onPress = () => {
    void localAnalytics().logEvent('InterviewScheduleCallPressed', {
      screen: 'Interview',
      action: 'ScheduleCall',
      userId: authContext.userId,
    });
    void Linking.openURL(link!);
    void savedShowed(true);
    onClose();
  };
  const onClosePressed = () => {
    void localAnalytics().logEvent('InterviewScheduleClosePressed', {
      screen: 'Interview',
      action: 'ClosePressed',
      userId: authContext.userId,
    });
    void savedShowed(false);
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
          <View
            style={{
              height: isSmallDevice() ? '70%' : '55%',
              width: '100%',
              backgroundColor: theme.colors.white,
              borderRadius: 24,
              flexDirection: 'column',
              padding: 20,
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <CloseButton onPress={onClosePressed} theme="dark"></CloseButton>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {/* // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
              <Image
                style={{ height: 56, width: 56 }}
                source={require('../../../assets/images/mykyta.png')}
              ></Image>
              <Image
                style={{ height: 56, width: 56 }}
                source={require('../../../assets/images/mark.png')}
              ></Image>
              <Image
                style={{ height: 56, width: 56 }}
                source={require('../../../assets/images/lily.png')}
              ></Image>
            </View>
            <View>
              <FontText h1>
                {i18n.t('interview.title_first')}
                <FontText h1 style={{ color: theme.colors.primary }}>
                  {i18n.t('interview.title_second')}
                </FontText>
                {i18n.t('interview.title_third')}
              </FontText>
              <View style={{ marginTop: '5%' }}>
                <FontText style={{ color: theme.colors.grey3 }}>
                  {i18n.t('interview.description')}
                </FontText>
              </View>
            </View>
            <PrimaryButton
              title={i18n.t('interview.button')}
              disabled={!link}
              onPress={onPress}
            ></PrimaryButton>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
