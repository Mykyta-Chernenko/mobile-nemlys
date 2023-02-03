import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheet, Button, Header, Icon, useTheme } from '@rneui/themed';
import { Alert, TouchableOpacity, View } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { AUTH_STORAGE_KEY, supabase } from '@app/api/initSupabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logErrors } from '@app/utils/errors';
import * as MailComposer from 'expo-mail-composer';
import { SUPPORT_EMAIL } from '@app/utils/constants';
import * as Analytics from 'expo-firebase-analytics';
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
    void Analytics.logEvent('ViewWithMenuClickSendFeedback', {
      screen: 'ViewWithMenu',
      action: 'Clicked on send your feedback button',
    });
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
    void Analytics.logEvent('ViewWithMenuLogout', {
      screen: 'ViewWithMenu',
      action: 'Clicked logout',
    });
    await supabase.auth.signOut();
    // just to make sure in case something goes wrong
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };
  const deleteAccount = async () => {
    void Analytics.logEvent('ViewWithMenuClickSendFeedback', {
      screen: 'ViewWithMenu',
      action: 'Clicked delete account',
    });
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
          <TouchableOpacity
            onPress={() => void sendEmailAlert()}
            style={{ paddingHorizontal: 10, flexDirection: 'row' }}
          >
            <Icon name="thumb-up-outline" type="material-community" color="black" size={20} />
            <View style={{ width: 5 }}></View>
            <Icon name="thumb-down-outline" type="material-community" color="black" size={20} />
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
        <Button
          buttonStyle={{ borderColor: theme.colors.black }}
          titleStyle={{ color: theme.colors.white }}
          color={theme.colors.black}
          onPress={() => setShowMenu(false)}
          style={{ margin: '1%', marginBottom: '5%' }}
        >
          {i18n.t('close')}
        </Button>
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
