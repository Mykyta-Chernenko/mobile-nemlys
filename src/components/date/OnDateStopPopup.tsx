import { useTheme } from '@rneui/themed';
import React, { useContext } from 'react';
import { Modal, TouchableWithoutFeedback, View } from 'react-native';
import { CloseButton } from '../buttons/CloseButton';
import { FontText } from '../utils/FontText';
import { i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import { AuthContext } from '@app/provider/AuthProvider';
import { supabase } from '@app/api/initSupabase';
import { logSupaErrors } from '@app/utils/errors';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { getNow } from '@app/utils/date';
export default function ({
  dateId,
  onClose,
  onConfirm,
}: {
  dateId: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);

  const onPress = async () => {
    void localAnalytics().logEvent('OnDateStopPopupConfirm', {
      screen: 'OnDate',
      action: 'StopPopupConfirm',
      userId: authContext.userId,
    });
    const dateResult = await supabase
      .from('date')
      .update({ active: false, stopped: true, updated_at: getNow().toISOString() })
      .eq('id', dateId);
    if (dateResult.error) {
      logSupaErrors(dateResult.error);
      return;
    }
    onConfirm();
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
                height: '60%',
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
                  {i18n.t('date_stop_popup_title_1')}
                  <FontText h1 style={{ color: theme.colors.error }}>
                    {i18n.t('date_stop_popup_title_2')}
                  </FontText>
                  {i18n.t('date_stop_popup_title_3')}
                </FontText>
                <FontText style={{ color: theme.colors.grey5, marginTop: 20 }}>
                  {i18n.t('date_stop_popup_subtitle')}
                </FontText>
              </View>
              <View style={{ marginTop: 5 }}>
                <PrimaryButton
                  title={i18n.t('date_stop_popup_confirm')}
                  onPress={() => void onPress()}
                  style={{ marginBottom: 5 }}
                ></PrimaryButton>
                <SecondaryButton
                  buttonStyle={{ backgroundColor: theme.colors.grey1 }}
                  title={i18n.t('date_stop_popup_cancel')}
                  onPress={() => void onClosePressed()}
                  style={{ marginBottom: 5 }}
                ></SecondaryButton>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
