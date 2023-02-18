import React, { useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Icon, Image, Text } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { ViewWithMenu } from '../common/ViewWithMenu';
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

const CARD_PER_SET = 10;
export const ViewSetHomeScreen = (props: Props) => {
  const [name, setName] = useState<string | null>(null);
  const navigation = useNavigation<MainNavigationProp>();
  const [refreshing, setRefeshing] = useState(false);
  const authContext = useContext(AuthContext);
  const { theme } = useTheme();
  const [setsCompleted, setSetsCompleted] = useState<number | null>(null);

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
    <ViewWithMenu>
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
            height: 200,
          }}
        >
          <View
            style={{
              height: 100,
              width: '100%',
              backgroundColor: 'rgba(81, 74, 191, 1)',
              position: 'absolute',
              marginTop: 115,
            }}
          ></View>
          <Image
            resizeMode="contain"
            style={{
              height: '100%',
              width: '100%',
              marginTop: -30,
              justifyContent: 'flex-end',
            }}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={require('../../../assets/images/home.png')}
          ></Image>
          {setsCompleted !== null && (
            <View
              style={{
                marginTop: 100,
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
                  width: 200,
                  borderRadius: 15,
                }}
              >
                <View
                  style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                >
                  <Text style={{ color: theme.colors.white, marginRight: 7, fontSize: 16 }}>
                    {name} {'& Partner'}
                  </Text>
                  <Icon name="settings" size={16} color={theme.colors.white}></Icon>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 7,
                  }}
                >
                  <LinearProgress
                    style={{
                      width: 100,
                      height: 7,
                    }}
                    value={setsCompleted / CARD_PER_SET}
                    variant="determinate"
                    color={theme.colors.white}
                    trackColor={theme.colors.black}
                    animation={false}
                  />
                  <Text
                    style={{
                      textAlign: 'center',
                      alignSelf: 'center',
                      justifyContent: 'center',
                      marginLeft: 10,
                      color: theme.colors.white,
                      fontSize: 16,
                    }}
                  >
                    {i18n.t('set.out_of_completed', {
                      completed: setsCompleted,
                      outOf: CARD_PER_SET,
                    })}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 9,
                    marginBottom: 5,
                    justifyContent: 'center',
                  }}
                >
                  <PrimaryButton
                    style={{ marginRight: 25 }}
                    size="sm"
                    buttonStyle={{
                      borderColor: theme.colors.white,
                      borderWidth: 1,
                      paddingHorizontal: 30,
                      paddingVertical: 5,
                      backgroundColor: 'rgba(108, 99, 255, 1)',
                    }}
                    titleStyle={{ fontSize: 14, color: theme.colors.white }}
                  >
                    {i18n.t('diary')}
                  </PrimaryButton>
                  <PrimaryButton
                    style={{ marginLeft: 25 }}
                    size="sm"
                    buttonStyle={{
                      borderColor: theme.colors.white,
                      borderWidth: 1,
                      paddingHorizontal: 30,
                      paddingVertical: 5,
                      backgroundColor: 'rgba(108, 99, 255, 1)',
                      opacity: 0.85,
                    }}
                    titleStyle={{ fontSize: 14, color: theme.colors.white }}
                  >
                    {i18n.t('history')}
                  </PrimaryButton>
                </View>
              </View>
            </View>
          )}
        </View>
        <LinearGradient
          colors={['rgba(81, 74, 191, 1)', 'rgb(223, 220, 238)']}
          style={{
            flexGrow: 1,
            zIndex: 1,
          }}
        >
          {props.children}
        </LinearGradient>
      </ScrollView>
    </ViewWithMenu>
  );
};
