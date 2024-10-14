import { useTheme } from '@rneui/themed';
import React from 'react';
import { Modal, TouchableWithoutFeedback, View } from 'react-native';
import { CloseButton } from '../buttons/CloseButton';
import { FontText } from '../utils/FontText';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '../buttons/PrimaryButtons';
export default function ({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  const { theme } = useTheme();

  return (
    <Modal animationType="none" transparent={true}>
      <TouchableWithoutFeedback onPress={onClose} style={{ flex: 1 }}>
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
                <CloseButton onPress={onClose} theme="dark"></CloseButton>
              </View>
              <View style={{ marginTop: 5 }}>
                <FontText h1>
                  {i18n.t('recording_permission_title_1')}

                  <FontText h1 style={{ color: theme.colors.error }}>
                    {i18n.t('recording_permission_title_2')}
                  </FontText>
                </FontText>
              </View>

              <PrimaryButton
                title={i18n.t('recording_permission_button')}
                onPress={() => void onConfirm()}
                style={{ marginBottom: 5 }}
              ></PrimaryButton>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
