import React, { useContext, useEffect, useState } from 'react';
import { Icon } from '@rneui/themed';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { AUTH_STORAGE_KEY, supabase } from '@app/api/initSupabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logErrors } from '@app/utils/errors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { Image } from '@rneui/themed';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '@app/components/utils/FontText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feedback from './Feedback';
import { Divider } from '@rneui/base';
import { analyticsForgetUser, localAnalytics } from '@app/utils/analytics';

export const logout = async () => {
  void localAnalytics().logEvent('ViewWithMenuLogout', {
    screen: 'Settings',
    action: 'Clicked logout',
  });
  await supabase.auth.signOut();
  await analyticsForgetUser();
  // just to make sure in case something goes wrong
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
};
export default function ({ navigation }: NativeStackScreenProps<MainStackParamList, 'Settings'>) {
  const authContext = useContext(AuthContext);
  const [isBetaUser, setIsBetaUser] = useState(false);
  async function getIsBetaUser() {
    const res = await supabase.from('beta_users').select('id', { count: 'exact' });
    if (res.error) {
      logErrors(res.error);
      return;
    }
    if (res) setIsBetaUser((res?.count || 0) > 0);
  }
  useEffect(() => {
    void getIsBetaUser();
  }, []);
  const join = async () => {
    const { error: error } = await supabase.from('beta_users').insert({
      user_id: authContext.userId,
    });
    if (error) {
      logErrors(error);
      return;
    }
    Alert.alert(i18n.t('beta.joined_successfully'), undefined, [
      {
        text: i18n.t('awesome'),
        style: 'default',
      },
    ]);
    void localAnalytics().logEvent('SettingsJoinedBeta', {
      screen: 'Settings',
      action: 'Joined beta',
      userId: authContext.userId,
    });
    void getIsBetaUser();
    return;
  };
  const joinBeta = () => {
    void localAnalytics().logEvent('SettingsJoinBeta', {
      screen: 'Settings',
      action: 'Clicked on join beta',
      userId: authContext.userId,
    });
    Alert.alert(
      i18n.t('beta.title'),
      i18n.t('beta.content'),
      [
        {
          text: i18n.t('cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('join'),
          onPress: () => void join(),
          style: 'default',
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  const deleteAccount = async () => {
    void localAnalytics().logEvent('ViewWithMenuClickSendFeedback', {
      screen: 'Settings',
      action: 'Clicked delete account',
      userId: authContext.userId,
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
      i18n.t('settings.are_you_sure_you_want_to_delete_account'),
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
    <SafeAreaView style={{ flexGrow: 1, backgroundColor: 'white' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <View style={{ position: 'absolute', zIndex: 1, top: 10, left: 10 }}>
          <GoBackButton
            onPress={() => {
              void localAnalytics().logEvent('SettingsGoBack', {
                screen: 'Settings',
                action: 'Go back button clicked',
                userId: authContext.userId,
              });
              // navigation.navigate('SetHomeScreen', {
              //   refreshTimeStamp: new Date().toISOString(),
              // });
            }}
          ></GoBackButton>
        </View>

        <View
          style={{
            height: 200,
          }}
        >
          <Image
            resizeMode="contain"
            style={{
              height: '100%',
              width: '100%',
            }}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            // source={require('../../../assets/images/settings.png')}
          ></Image>
        </View>
        <Feedback></Feedback>
        <TouchableOpacity
          onPress={() => {
            void logout().then(logout);
          }}
          style={{
            marginTop: 30,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', marginLeft: 15 }}>
            <Icon name="logout"></Icon>
          </View>
          <FontText style={{ marginLeft: 22, fontSize: 18 }}>{i18n.t('settings.logout')}</FontText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            void deleteAccountAlert();
          }}
          style={{
            marginTop: 30,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', marginLeft: 12 }}>
            <Icon name="delete-outline"></Icon>
          </View>
          <FontText style={{ marginLeft: 24, fontSize: 18 }}>
            {i18n.t('settings.delete_account')}
          </FontText>
        </TouchableOpacity>
        {isBetaUser ? (
          <>
            <Divider style={{ marginTop: 10 }}></Divider>
            <TouchableOpacity
              onPress={() => {
                void localAnalytics().logEvent('ViewWithMenuConversationsNavigated', {
                  screen: 'Settings',
                  action: 'ConversationsNavigated',
                  userId: authContext.userId,
                });
                navigation.navigate('Conversations');
              }}
              style={{
                marginTop: 20,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', marginLeft: 15 }}>
                <Icon name="account-voice" type="material-community"></Icon>
              </View>
              <FontText style={{ marginLeft: 22, fontSize: 18 }}>
                {i18n.t('settings.conversations')}
              </FontText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Divider style={{ marginTop: 10 }}></Divider>
            <TouchableOpacity
              onPress={() => {
                void joinBeta();
              }}
              style={{
                marginTop: 20,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', marginLeft: 12 }}>
                <Icon name="rabbit" type="material-community"></Icon>
              </View>
              <FontText style={{ marginLeft: 24, fontSize: 18, fontWeight: '600' }}>
                {i18n.t('beta.become_beta_user')}
              </FontText>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
