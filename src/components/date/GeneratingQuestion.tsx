import React, { useContext, useEffect, useRef } from 'react';
import { useTheme } from '@rneui/themed';
import { Animated, View } from 'react-native';

import { FontText } from '../utils/FontText';
import { i18n } from '@app/localization/i18n';

import { AuthContext } from '@app/provider/AuthProvider';
import { supabase } from '@app/api/initSupabase';
import { logSupaErrors } from '@app/utils/errors';
import { MainStackParamList } from '@app/types/navigation';
import { generateQuestions } from '@app/utils/generateQuestions';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'GeneratingQuestion'>) {
  const { withPartner, topic, job, level, reflectionAnswer } = route.params;
  const authContext = useContext(AuthContext);
  const { theme } = useTheme();

  const rotateValue = useRef(new Animated.Value(0)).current;
  const imageTransform = [
    {
      rotate: rotateValue.interpolate({
        inputRange: [0, 50, 100],
        outputRange: ['-720deg', '0deg', '-720deg'],
      }) as unknown as string,
    },
  ];

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
  useEffect(() => {
    const func = async () => {
      const data = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', authContext.userId!)
        .single();
      if (data.error) {
        logSupaErrors(data.error);
        return;
      }

      // if don't want to generate questions and call api
      // props.onLoaded();
      // return;
      void generateQuestions(
        authContext.userId!,
        data.data.couple_id,
        job,
        topic,
        level,
        withPartner,
        reflectionAnswer,
        navigation,
      );
    };
    if (route.params.refreshTimeStamp) {
      void func();
    }
  }, [route.params.refreshTimeStamp]);

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 20,
      }}
    >
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
      <View style={{ marginTop: '10%' }}>
        <FontText style={{ textAlign: 'center' }} h1>
          {i18n.t('date_generating_questions_first')}
          <FontText h1 style={{ color: theme.colors.error }}>
            {i18n.t('date_generating_questions_second')}
          </FontText>
        </FontText>
      </View>
    </View>
  );
}
