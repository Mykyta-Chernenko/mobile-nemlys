import React, { useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { Icon, Image } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@app/types/navigation';
import { AuthContext } from '@app/provider/AuthProvider';
import { LinearProgress } from '@rneui/themed/dist/LinearProgress';
import { useTheme } from '@rneui/themed';
import { logErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import analytics from '@react-native-firebase/analytics';
interface Props {
  children: React.ReactNode;
}
import { useRoute } from '@react-navigation/native';
import { HistorySetScreenName } from '@app/utils/constants';
import { FontText } from '../utils/FontText';
import * as Notifications from 'expo-notifications';
const CARD_PER_SET = 10;
export const ViewSetHomeScreen = (props: Props) => {
  const [name, setName] = useState<string | null>(null);
  const navigation = useNavigation<MainNavigationProp>();
  const [refreshing, setRefeshing] = useState(false);
  const authContext = useContext(AuthContext);
  const { theme } = useTheme();
  const [setsCompleted, setSetsCompleted] = useState<number | null>(null);
  const route = useRoute();
  React.useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = response.notification.request.content.data.screen;
      if (screen) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        navigation.navigate(screen as any);
      }
    });
    return () => subscription.remove();
  }, []);

  const backgroundColor =
    route.name === HistorySetScreenName ? 'rgba(140, 132, 176, 1)' : 'rgba(100, 86, 171, 1)';
  useEffect(() => {
    const getQuestions = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('user_profile')
          .select(
            'id, first_name, user_id, couple_id, first_name, ios_expo_token, android_expo_token, onboarding_finished, created_at, updated_at',
          )
          .eq('user_id', authContext.userId)
          .single();
        if (profileError) {
          logErrors(profileError);
          return;
        }
        setName(profile.first_name as string);

        const { count: setsCompletedCount, error: setsCompletedError } = await supabase
          .from('couple_set')
          .select('set_id', { count: 'exact' })
          .order('order')
          .eq('couple_id', profile.couple_id)
          .eq('completed', true);
        if (setsCompletedError) {
          logErrors(setsCompletedError);
          return;
        }
        setSetsCompleted(setsCompletedCount);
      } catch (error) {
        logErrors(error);
      }
    };
    void getQuestions();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: 'white',
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefeshing(true);
            setTimeout(() => {
              void analytics().logEvent('SetHomeScreenRefreshed', {
                screen: 'SetHomeScreen',
                action: 'Home screen refresh pulled',
                userId: authContext.userId,
              });
              navigation.navigate('SetHomeScreen', {
                refreshTimeStamp: new Date().toISOString(),
              });
              setRefeshing(false);
            }, 500);
          }}
        />
      }
    >
      <View
        style={{
          height: 270,
        }}
      >
        <View
          style={{
            height: 120,
            width: '100%',
            backgroundColor: backgroundColor,
            position: 'absolute',
            marginTop: 190,
          }}
        ></View>
        <Image
          resizeMode="contain"
          style={{
            height: 200,
            width: '100%',
            marginTop: 20,
            justifyContent: 'flex-end',
          }}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          source={require('../../../assets/images/home.png')}
        ></Image>

        <View
          style={{
            marginTop: 170,
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignContent: 'center',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <View
            style={{
              paddingVertical: 5,
              width: 250,
              borderRadius: 15,
            }}
          >
            {name !== null && (
              <View
                style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
              >
                <FontText style={{ color: theme.colors.white, marginRight: 7, fontSize: 16 }}>
                  {/* TODO change when partner appears */}
                  {`${name} & Partner`}
                </FontText>
                <TouchableOpacity
                  onPress={() => {
                    void analytics().logEvent('NewSetSettingsNavigated', {
                      screen: 'NewSet',
                      action: 'SettingsNavigated',
                      userId: authContext.userId,
                    });
                    navigation.navigate('Settings');
                  }}
                >
                  <Icon name="settings" size={24} color={theme.colors.white}></Icon>
                </TouchableOpacity>
              </View>
            )}
            {setsCompleted !== null && setsCompleted > 0 && (
              <>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 7,
                  }}
                >
                  <LinearProgress
                    style={{
                      width: 140,
                      height: 7,
                    }}
                    value={setsCompleted / CARD_PER_SET}
                    variant="determinate"
                    color={theme.colors.white}
                    trackColor={theme.colors.black}
                    animation={false}
                  />
                  <FontText
                    style={{
                      textAlign: 'center',
                      alignSelf: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                      color: theme.colors.white,
                      fontSize: 16,
                    }}
                  >
                    {i18n.t('set.out_of_completed', {
                      completed: setsCompleted,
                      outOf: CARD_PER_SET,
                    })}
                  </FontText>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 9,
                    marginBottom: 5,
                    justifyContent: 'space-between',
                    width: 250,
                  }}
                >
                  <PrimaryButton
                    size="sm"
                    buttonStyle={{
                      borderColor: theme.colors.white,
                      borderWidth: 1,
                      paddingHorizontal: 30,
                      paddingVertical: 5,
                      backgroundColor: 'rgba(108, 99, 255, 1)',
                    }}
                    titleStyle={{ fontSize: 14, color: theme.colors.white }}
                    onPress={() => {
                      void analytics().logEvent('NewSetDiaryNavigated', {
                        screen: 'NewSet',
                        action: 'DiaryNavigated',
                        userId: authContext.userId,
                      });
                      navigation.navigate('Diary', { refreshTimeStamp: new Date().toISOString() });
                    }}
                  >
                    {i18n.t('diary.title')}
                  </PrimaryButton>
                  {route.name !== HistorySetScreenName && (
                    <PrimaryButton
                      size="sm"
                      buttonStyle={{
                        borderColor: theme.colors.white,
                        borderWidth: 1,
                        paddingHorizontal: 30,
                        paddingVertical: 5,
                        backgroundColor: 'rgba(108, 99, 255, 1)',
                      }}
                      titleStyle={{ fontSize: 14, color: theme.colors.white }}
                      onPress={() => {
                        void analytics().logEvent('NewSetHistorySetNavigated', {
                          screen: 'NewSet',
                          action: 'HistorySetNavigated',
                          userId: authContext.userId,
                        });
                        navigation.navigate(HistorySetScreenName);
                      }}
                    >
                      {i18n.t('history')}
                    </PrimaryButton>
                  )}
                  {route.name === HistorySetScreenName && (
                    <PrimaryButton
                      size="sm"
                      buttonStyle={{
                        borderColor: theme.colors.white,
                        borderWidth: 1,
                        paddingHorizontal: 30,
                        paddingVertical: 5,
                        backgroundColor: 'rgba(108, 99, 255, 1)',
                      }}
                      titleStyle={{ fontSize: 14, color: theme.colors.white }}
                      onPress={() => {
                        void analytics().logEvent('HistorySetNewSetNavigated', {
                          screen: 'HistorySet',
                          action: 'NewSetNavigated',
                          userId: authContext.userId,
                        });
                        navigation.navigate('SetHomeScreen', {
                          refreshTimeStamp: new Date().toISOString(),
                        });
                      }}
                    >
                      {i18n.t('cards')}
                    </PrimaryButton>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </View>
      <LinearGradient
        colors={[backgroundColor, 'rgb(223, 220, 238)']}
        style={{
          flexGrow: 1,
          zIndex: 1,
        }}
      >
        {props.children}
      </LinearGradient>
    </ScrollView>
  );
};
