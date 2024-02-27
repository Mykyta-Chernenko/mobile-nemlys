import React, { useContext, useState } from 'react';
import { TouchableOpacity, View, Image, SafeAreaView } from 'react-native';
import Modal from 'react-native-modal';
import { i18n } from '@app/localization/i18n';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '@app/components/utils/FontText';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import StyledTextInput from '@app/components/utils/StyledTextInput';
import { supabase } from '@app/api/initSupabase';
import { logErrorsWithMessageWithoutAlert } from '@app/utils/errors';
import { localAnalytics } from '@app/utils/analytics';
import { SettingsButton } from '../menu/SettingsButton';
import { useTheme } from '@rneui/themed';
import { ScrollView } from 'react-native-gesture-handler';

export default function ({ title, placeholder }: { title: string; placeholder: string }) {
  const authContext = useContext(AuthContext);
  const [visible, setVisible] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');
  const { theme } = useTheme();

  const openDialog = () => {
    void localAnalytics().logEvent('SettingsSendFeedbackOpened', {
      screen: 'Settings',
      action: 'SendFeedbackOpened',
      userId: authContext.userId,
    });
    setVisible(true);
  };
  const cancelDialog = () => {
    void localAnalytics().logEvent('SettingsSendFeedbacCancel', {
      screen: 'Settings',
      action: 'SendFeedbacCancel',
      userId: authContext.userId,
    });

    setVisible(false);
  };
  const sendFeedback = async () => {
    void localAnalytics().logEvent('SettingsSendFeedbacSubmit', {
      screen: 'Settings',
      action: 'SendFeedbacSubmit',
      userId: authContext.userId,
    });

    setVisible(false);

    alert(i18n.t('settings.feedback_thanks'));

    const res = await supabase.from('feedback').insert({
      user_id: authContext.userId!,
      text: feedback,
    });
    if (res.error) {
      logErrorsWithMessageWithoutAlert(res.error);
    }
    setFeedback('');
  };

  return (
    <>
      <SettingsButton title={title} action={() => openDialog()} data={null}></SettingsButton>
      <Modal
        avoidKeyboard
        isVisible={visible}
        style={{
          backgroundColor: theme.colors.white,
          flex: 1,
          display: 'flex',
        }}
      >
        <SafeAreaView style={{ flexGrow: 1 }}>
          <ScrollView
            contentContainerStyle={{
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <TouchableOpacity
              style={{
                borderRadius: 40,
                backgroundColor: theme.colors.grey1,
                alignItems: 'center',
                justifyContent: 'center',
                height: 72,
                width: 72,
              }}
              onPress={cancelDialog}
            >
              <Image
                resizeMode="contain"
                style={{ height: 24, width: 24 }}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                source={require('../../../assets/images/arrow_left_black.png')}
              />
            </TouchableOpacity>
            <View style={{ width: '100%' }}>
              <FontText h1>{title}</FontText>
              <StyledTextInput
                style={{ marginVertical: 20, maxHeight: '50%' }}
                onChangeText={setFeedback}
                placeholder={placeholder}
              ></StyledTextInput>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
              <PrimaryButton
                disabled={!feedback}
                onPress={() => void sendFeedback()}
                buttonStyle={{ width: '100%' }}
              >
                {i18n.t('submit')}
              </PrimaryButton>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}
