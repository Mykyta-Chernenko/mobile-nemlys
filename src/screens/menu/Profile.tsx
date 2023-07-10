import React, { useContext, useEffect, useState } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '@app/components/utils/Loading';
import { logErrors } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import { Alert, SafeAreaView, View } from 'react-native';
import { useTheme } from '@rneui/themed';
import { FontText } from '@app/components/utils/FontText';
import QuestionTriangel from '@app/icons/question_triangle';
import Story from '@app/icons/story';
import ProfileSelected from '@app/icons/profile_selected';
import { i18n } from '@app/localization/i18n';
import { Image } from 'react-native';
import { localAnalytics } from '@app/utils/analytics';
import { logout } from '../settings/Settings';
import { TouchableOpacity } from 'react-native';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';

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
      .eq('active', false);
    if (error) {
      logErrors(error);
      return;
    }
    setDateCount(count || 0);
    setLoading(false);
  }

  useEffect(() => {
    void getData();
  }, [route.params?.refreshTimeStamp]);

  const deleteAccount = async () => {
    void localAnalytics().logEvent('ViewWithMenuClickDeleteAccount', {
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
                  <Image
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    source={require('../../../assets/images/buddy_corner.png')}
                    style={{
                      borderBottomRightRadius: 24,
                    }}
                  />
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
              height: '10%',
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.white,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingTop: '5%',
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                onPress={() => {
                  void localAnalytics().logEvent('MenuStoryClicked', {
                    screen: 'Menu',
                    action: 'HomeClicked',
                    userId: authContext.userId,
                  });
                  navigation.navigate('Home', {
                    refreshTimeStamp: new Date().toISOString(),
                  });
                }}
              >
                <QuestionTriangel height={32} width={32}></QuestionTriangel>
                <FontText style={{ marginTop: 5, color: theme.colors.grey3 }}>
                  {i18n.t('home.menu.discuss')}
                </FontText>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                onPress={() => {
                  void localAnalytics().logEvent('MenuStoryClicked', {
                    screen: 'Menu',
                    action: 'StoryClicked',
                    userId: authContext.userId,
                  });
                  navigation.navigate('Story', {
                    refreshTimeStamp: new Date().toISOString(),
                  });
                }}
              >
                <Story height={32} width={32}></Story>
                <FontText style={{ marginTop: 5, color: theme.colors.grey3 }}>
                  {i18n.t('home.menu.story')}
                </FontText>
              </TouchableOpacity>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <ProfileSelected height={32} width={32}></ProfileSelected>
                <FontText style={{ marginTop: 5 }}>{i18n.t('home.menu.profile')}</FontText>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
