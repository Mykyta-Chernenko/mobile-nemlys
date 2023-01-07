import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheet, Button, Header, Icon, useTheme } from '@rneui/themed';
import { Alert, TouchableOpacity } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { AUTH_STORAGE_KEY, supabase } from '@app/api/initSupabase';
import { SecondaryButton } from '../buttons/SecondaryButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logErrors } from '@app/utils/errors';
import * as MailComposer from 'expo-mail-composer';
import { SUPPORT_EMAIL } from '@app/utils/constants';

interface Props {
  children: React.ReactNode;
}

export const ViewWithMenu = (props: Props) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const { theme } = useTheme();

  const sendEmail = async () => {
    if (await MailComposer.isAvailableAsync()) {
      await MailComposer.composeAsync({
        subject: i18n.t('support_email_subject'),
        recipients: [SUPPORT_EMAIL],
      });
    } else {
      alert(i18n.t('cannot_send_email', { email: SUPPORT_EMAIL }));
    }
  };
  const sendEmailAlert = () => {
    Alert.alert(
      i18n.t('send_your_feedback'),
      undefined,
      [
        {
          text: i18n.t('cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('send_email'),
          onPress: () => void sendEmail(),
          style: 'default',
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // just to make sure in case something goes wrong
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };
  const deleteAccount = async () => {
    const res = await supabase.rpc('delete_user');
    if (res.error) {
      logErrors(res.error);
      return;
    }
    await logout();
    await logout();
  };
  const deleteAccountAlert = () => {
    Alert.alert(
      i18n.t('are_you_sure_you_want_to_delete_account'),
      undefined,
      [
        {
          text: i18n.t('cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('confirm'),
          onPress: () => void deleteAccount(),
          style: 'destructive',
        },
      ],
      {
        cancelable: true,
      },
    );
  };
  return (
    <SafeAreaProvider style={{ flexGrow: 1 }}>
      <Header
        backgroundColor="white"
        leftComponent={
          <TouchableOpacity onPress={() => setShowMenu(true)} style={{ paddingHorizontal: 10 }}>
            <Icon name="menu" color="black" size={30} />
          </TouchableOpacity>
        }
        rightComponent={
          <TouchableOpacity onPress={() => void sendEmailAlert()} style={{ paddingHorizontal: 10 }}>
            <Icon name="mail-outline" color="black" size={30} />
          </TouchableOpacity>
        }
      />
      <BottomSheet
        modalProps={{}}
        isVisible={showMenu}
        onBackdropPress={() => setShowMenu(false)}
        containerStyle={{ padding: '5%' }}
        backdropStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
      >
        <SecondaryButton
          type="outline"
          color={theme.colors.black}
          onPress={() => setShowMenu(false)}
          style={{ margin: '1%', marginBottom: '5%' }}
        >
          {i18n.t('close')}
        </SecondaryButton>
        <Button
          color="warning"
          onPress={() => {
            void logout().then(logout);
          }}
          style={{ margin: '1%' }}
        >
          {i18n.t('logout')}
        </Button>
        <Button color="error" onPress={() => void deleteAccountAlert()} style={{ margin: '1%' }}>
          {i18n.t('delete_account')}
        </Button>
      </BottomSheet>
      {props.children}
    </SafeAreaProvider>
  );
};
