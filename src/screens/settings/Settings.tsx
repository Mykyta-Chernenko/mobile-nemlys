import React, { useContext } from 'react';
import { Icon } from '@rneui/themed';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { AUTH_STORAGE_KEY, supabase } from '@app/api/initSupabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logErrors } from '@app/utils/errors';
import analytics from '@react-native-firebase/analytics';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { Image } from '@rneui/themed';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '@app/components/utils/FontText';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feedback from './Feedback';

export default function ({ navigation }: NativeStackScreenProps<MainStackParamList, 'Settings'>) {
  const authContext = useContext(AuthContext);

  const logout = async () => {
    void analytics().logEvent('ViewWithMenuLogout', {
      screen: 'Settings',
      action: 'Clicked logout',
      userId: authContext.userId,
    });
    await supabase.auth.signOut();
    // just to make sure in case something goes wrong
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };
  const deleteAccount = async () => {
    void analytics().logEvent('ViewWithMenuClickSendFeedback', {
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
              void analytics().logEvent('SettingsGoBack', {
                screen: 'Settings',
                action: 'Go back button clicked',
                userId: authContext.userId,
              });
              navigation.navigate('SetHomeScreen', {
                refreshTimeStamp: new Date().toISOString(),
              });
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
            source={require('../../../assets/images/settings.png')}
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
      </ScrollView>
    </SafeAreaView>
  );
}
