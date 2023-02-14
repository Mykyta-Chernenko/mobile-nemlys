import React, { useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Image, Text } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { ViewWithMenu } from '../common/ViewWithMenu';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@app/types/navigation';
import { AuthContext } from '@app/provider/AuthProvider';
import { logEvent } from 'expo-firebase-analytics';
import { LinearProgress } from '@rneui/themed/dist/LinearProgress';
import { useTheme } from '@rneui/themed';
import { logErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { i18n } from '@app/localization/i18n';
import { Native } from 'sentry-expo';

interface Props {
  children: React.ReactNode;
}

const CARD_PER_SET = 10;
export const ViewSetHomeScreen = (props: Props) => {
  const navigation = useNavigation<MainNavigationProp>();
  const [refreshing, setRefeshing] = useState(false);
  const authContext = useContext(AuthContext);
  const { theme } = useTheme();
  const [setsCompleted, setSetsCompleted] = useState<number | null>(null);

  useEffect(() => {
    const getQuestions = async () => {
      Native.captureMessage('set home screen hit 2');
      try {
        const { data: user, error: userError } = await supabase.auth.getUser();
        if (userError) {
          logErrors(userError);
          return;
        }
        const { data: profile, error: profileError } = await supabase
          .from('user_profile')
          .select(
            'id, user_id, couple_id, first_name, ios_expo_token, android_expo_token, onboarding_finished, created_at, updated_at',
          )
          .eq('user_id', user.user.id)
          .single();
        if (profileError) {
          logErrors(profileError);
          return;
        }
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
                void logEvent('SetHomeScreenRefreshed', {
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
              marginTop: 135,
            }}
          ></View>
          <Image
            resizeMode="contain"
            style={{
              height: '100%',
              width: '100%',
              justifyContent: 'flex-end',
            }}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={require('../../../assets/images/home.png')}
          ></Image>
          {setsCompleted !== null && (
            <View
              style={{
                marginTop: 150,
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
                  backgroundColor: theme.colors.black,
                  paddingVertical: 5,
                  width: 180,
                  borderRadius: 15,
                }}
              >
                <Text style={{ textAlign: 'center', color: theme.colors.white, marginBottom: 7 }}>
                  {i18n.t('set.out_of_completed', {
                    completed: setsCompleted,
                    outOf: CARD_PER_SET,
                  })}
                </Text>
                <LinearProgress
                  style={{
                    width: 100,
                    height: 7,
                    marginHorizontal: '10%',
                    alignSelf: 'center',
                  }}
                  value={setsCompleted / CARD_PER_SET}
                  variant="determinate"
                  color={theme.colors.white}
                  trackColor={theme.colors.grey4}
                  animation={false}
                />
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
