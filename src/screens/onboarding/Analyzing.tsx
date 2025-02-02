import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Animated } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNow, sleep } from '@app/utils/date';
import { useFocusEffect } from '@react-navigation/native';
import { BACKGROUND_LIGHT_BEIGE_COLOR } from '@app/utils/colors';
import { supabase } from '@app/api/initSupabase';
import { logSupaErrors } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'Analyzing'>) {
  const { theme } = useTheme();
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation]);

  const [text, setText] = useState(1);
  const authContext = useContext(AuthContext);

  const rotateValue = useRef(new Animated.Value(0)).current;
  const imageTransform = [
    {
      rotate: rotateValue.interpolate({
        inputRange: [0, 50, 100],
        outputRange: ['-720deg', '0deg', '-720deg'],
      }) as unknown as string,
    },
  ];

  useFocusEffect(
    useCallback(() => {
      const setSteps = async () => {
        await sleep(1500);
        setText(2);
        await sleep(1500);
        setText(3);
        await sleep(1500);
      };
      const finishOnboarding = async () => {
        const profileResponse = await supabase
          .from('user_profile')
          .update({
            onboarding_finished: true,
            updated_at: getNow().toISOString(),
          })
          .eq('user_id', authContext.userId!);
        if (profileResponse.error) {
          logSupaErrors(profileResponse.error);
          return;
        }
      };

      const setOwnJobs = async () => {
        const response = await supabase.rpc('set_own_jobs', {
          jobs: route.params.jobs || ['getting_to_know_partner'],
        });
        if (response.error) {
          logSupaErrors(response.error);
          return;
        }
      };
      const loopLoader = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateValue, {
              toValue: 50,
              duration: 10 * 1000,
              useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
              toValue: 100,
              duration: 10 * 1000,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      };

      const analyze = async () => {
        void loopLoader();
        await Promise.all([finishOnboarding(), setOwnJobs(), setSteps()]).then(() =>
          navigation.navigate('OnboardingPlan', {
            isOnboarding: true,
            refreshTimeStamp: new Date().toISOString(),
          }),
        );
      };
      void analyze();
    }, []),
  );
  const textElement = i18n.t(`onboarding_analyzing_3_text_${text}`);

  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
      }}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <View style={{ padding: 20, flex: 1, justifyContent: 'space-around' }}>
          <View style={{ width: '100%' }}>
            <Animated.Image
              style={{
                width: '100%',
                height: 300,
                resizeMode: 'contain',
                transform: imageTransform,
              }}
              source={require('../../../assets/images/generating_questions.png')}
            ></Animated.Image>
          </View>
          <View style={{ minHeight: '20%' }}>
            <FontText h1 style={{ textAlign: 'center' }}>
              {textElement}
            </FontText>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
