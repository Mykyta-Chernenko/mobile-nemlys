import React, { useContext, useState } from 'react';
import { Dialog, Icon } from '@rneui/themed';
import { TouchableOpacity, View } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '@app/components/utils/FontText';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import StyledTextInput from '@app/components/utils/StyledTextInput';
import { supabase } from '@app/api/initSupabase';
import { logErrorsWithMessageWithoutAlert } from '@app/utils/errors';
import { localAnalytics } from '@app/utils/analytics';

export default function () {
  const authContext = useContext(AuthContext);
  const [visible, setVisible] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');

  const openDialog = () => {
    void localAnalytics().logEvent('ViewWithMenuInitiateSendFeedback', {
      screen: 'Settings',
      action: 'Clicked on send your feedback button',
      userId: authContext.userId,
    });
    setVisible(true);
  };
  const cancelDialog = () => {
    void localAnalytics().logEvent('ViewWithMenuClickCancelFeedback', {
      screen: 'Settings',
      action: 'Clicked on cancel on feedback dialog',
      userId: authContext.userId,
    });

    setVisible(false);
  };
  const sendFeedback = async () => {
    void localAnalytics().logEvent('ViewWithMenuSendFeedback', {
      screen: 'Settings',
      action: 'Clicked on send on feedback dialog',
      userId: authContext.userId,
    });

    setVisible(false);

    alert(i18n.t('settings.feedback_thanks'));

    const res = await supabase.from('feedback').insert({
      user_id: authContext.userId,
      text: feedback,
    });
    if (res.error) {
      logErrorsWithMessageWithoutAlert(res.error);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => void openDialog()}
        style={{
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <Icon name="thumb-up-outline" type="material-community" color="black" size={20} />
          <View style={{ width: 5 }}></View>
          <Icon name="thumb-down-outline" type="material-community" color="black" size={20} />
        </View>
        <FontText style={{ marginLeft: 15, fontSize: 18 }}>{i18n.t('settings.feedback')}</FontText>
      </TouchableOpacity>
      <Dialog isVisible={visible} onBackdropPress={() => setVisible(false)}>
        <Dialog.Title title={i18n.t('settings.feedback')} />
        <FontText>{i18n.t('settings.send_your_feedback')}</FontText>
        <StyledTextInput
          autoFocus={true}
          style={{ marginTop: 10 }}
          onChangeText={setFeedback}
        ></StyledTextInput>
        <Dialog.Actions>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
            <SecondaryButton onPress={() => void cancelDialog()}>
              {i18n.t('cancel')}
            </SecondaryButton>

            <PrimaryButton disabled={!feedback} onPress={() => void sendFeedback()}>
              {i18n.t('submit')}
            </PrimaryButton>
          </View>
        </Dialog.Actions>
      </Dialog>
    </>
  );
}
