import React, { useContext, useEffect, useRef, useState } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '@app/components/utils/Loading';
import { logErrors } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import { Alert, SafeAreaView, View } from 'react-native';
import { useTheme } from '@rneui/themed';
import { FontText } from '@app/components/utils/FontText';
import ProfileBuddyCorner from '@app/icons/profile_buddy_corner';
import { i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';
import { logout } from '../settings/Settings';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import Menu from '@app/components/menu/Menu';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'Home'>) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [dateCount, setDateCount] = useState(0);
  const padding = 20;
  const authContext = useContext(AuthContext);

  async function getData() {
    setLoading(true);
    const { error, count } = await supabase
      .from('date')
      .select('*', { count: 'exact' })
      .eq('active', false)
      .eq('stopped', false);
    if (error) {
      logErrors(error);
      return;
    }
    setDateCount(count || 0);
    setLoading(false);
  }

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isFirstMount.current && route.params?.refreshTimeStamp) {
      void getData();
    }
  }, [route.params?.refreshTimeStamp]);
  useEffect(() => {
    void getData();
    isFirstMount.current = false;
  }, []);

  const deleteAccount = async () => {
    void localAnalytics().logEvent('ProfileDeleteAccount', {
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
  if (loading) return <Loading />;
  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.white,
      }}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <View style={{ flexGrow: 1, padding: padding }}>
          <View
            style={{
              backgroundColor: theme.colors.grey1,
              marginHorizontal: -padding,
              height: '10%',
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.white,
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                flexDirection: 'row',
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                <View
                  style={{
                    flexDirection: 'column',
                    paddingHorizontal: padding,
                    paddingBottom: '3%',
                  }}
                >
                  <FontText h3 onPress={() => void logout()}>
                    {i18n.t('profile.title')}
                  </FontText>
                  <FontText style={{ color: theme.colors.grey3, marginTop: '2%' }}>
                    {i18n.t('level')} {dateCount + 1}
                  </FontText>
                </View>
                <View
                  style={{
                    justifyContent: 'flex-end',
                  }}
                >
                  <ProfileBuddyCorner />
                </View>
              </View>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexGrow: 1,
                marginHorizontal: -padding,
                backgroundColor: theme.colors.grey1,
                justifyContent: 'center',
                padding,
              }}
            >
              <SecondaryButton
                buttonStyle={{ marginTop: 10 }}
                onPress={() => {
                  void localAnalytics().logEvent('ProfileLanguage', {
                    screen: 'Profile',
                    action: 'Clicked language',
                  });
                  navigation.navigate('Language', { goSettings: true });
                }}
              >
                {i18n.t('settings.language')}
              </SecondaryButton>
              <SecondaryButton
                buttonStyle={{ marginTop: 10 }}
                onPress={() => {
                  void localAnalytics().logEvent('ProfileLogout', {
                    screen: 'Profile',
                    action: 'Clicked logout',
                  });
                  void logout().then(logout);
                }}
              >
                {i18n.t('settings.logout')}
              </SecondaryButton>
              <SecondaryButton
                buttonStyle={{ marginTop: 10 }}
                onPress={() => {
                  void deleteAccountAlert();
                }}
              >
                {i18n.t('settings.delete_account')}
              </SecondaryButton>
            </View>
          </View>
          <View
            style={{
              backgroundColor: theme.colors.grey1,
              marginHorizontal: -padding,
              height: 70,
            }}
          >
            <Menu></Menu>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
