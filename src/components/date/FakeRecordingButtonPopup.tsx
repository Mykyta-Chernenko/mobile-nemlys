import { useTheme } from '@rneui/themed';
import React, { useContext } from 'react';
import { Modal, TouchableWithoutFeedback, View } from 'react-native';
import { CloseButton } from '../buttons/CloseButton';
import { FontText } from '../utils/FontText';
import { i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import { AuthContext } from '@app/provider/AuthProvider';
export default function ({ onClose }: { onClose: () => void }) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);

  const onPress = () => {
    void localAnalytics().logEvent('OnDateRecordPopupWaiting', {
      screen: 'OnDate',
      action: 'RecordPopupWaiting',
      userId: authContext.userId,
    });
    onClose();
  };
  const onClosePressed = () => {
    void localAnalytics().logEvent('OnDateRecordPopupClose', {
      screen: 'OnDate',
      action: 'RecordPopupClose',
      userId: authContext.userId,
    });
    onClose();
  };
  return (
    <Modal animationType="none" transparent={true}>
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
                height: '50%',
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
              <View style={{ marginTop: 5 }}>
                <FontText h1>
                  <FontText h1 style={{ color: theme.colors.error }}>
                    {i18n.t('date.recording_popup.title_1')}
                  </FontText>
                  {i18n.t('date.recording_popup.title_2')}
                </FontText>
              </View>

              <PrimaryButton
                title={i18n.t('date.recording_popup.button')}
                onPress={() => void onPress()}
                style={{ marginBottom: 5 }}
              ></PrimaryButton>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
