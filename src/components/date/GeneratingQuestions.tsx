import React, { useContext, useEffect, useRef } from 'react';
import { useTheme } from '@rneui/themed';
import { Animated, View } from 'react-native';

import { FontText } from '../utils/FontText';
import { i18n } from '@app/localization/i18n';

import { AuthContext } from '@app/provider/AuthProvider';
import { supabase } from '@app/api/initSupabase';
import { logErrors, logErrorsWithMessageWithoutAlert } from '@app/utils/errors';
import { APIUserProfile, SupabaseAnswer } from '@app/types/api';
import { JobSlug } from '@app/types/domain';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@app/types/navigation';
import { sleep } from '@app/utils/date';

export default function (props: {
  withPartner: boolean;
  topic: string;
  job: JobSlug;
  level: number;
  reflectionAnswerId: number | undefined;
  onLoaded: () => void;
}) {
  const authContext = useContext(AuthContext);
  const { theme } = useTheme();
  const navigation = useNavigation<MainNavigationProp>();

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
      const data: SupabaseAnswer<APIUserProfile> = await supabase
        .from('user_profile')
        .select('*')
        .eq('user_id', authContext.userId)
        .single();
      if (data.error) {
        logErrors(data.error);
        return;
      }
      const dateReponse = await supabase
        .from('date')
        .insert({
          couple_id: data.data.couple_id,
          active: true,
          job: props.job,
          topic: props.topic,
          level: props.level,
          with_partner: props.withPartner,
          reflection_answer_id: props.reflectionAnswerId,
        })
        .select('id')
        .single();
      if (dateReponse.error) {
        logErrors(dateReponse.error);
        return;
      }
      // if doesn't want to generate questions and call api
      // props.onLoaded();
      // return;

      const dateId = dateReponse.data.id;
      for (let i = 0; i < 3; i++) {
        const request = supabase.functions.invoke('generate-question', {
          body: { date_id: dateId },
        });

        const [res, _] = await Promise.all([request, sleep(3000)]);
        if (!res.error) {
          break;
        }
        if (res.error && i === 2) {
          logErrorsWithMessageWithoutAlert(res.error);
          alert(i18n.t('date.generating_questions_error'));
          const dateReponse = await supabase
            .from('date')
            .update({
              updated_at: new Date(),
              active: false,
            })
            .eq('id', dateId);
          if (dateReponse.error) {
            logErrors(dateReponse.error);
          }
          navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
          return;
        }
      }

      props.onLoaded();
    };
    void func();
  }, []);

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
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
          {i18n.t('date.generating_questions_first')}
          <FontText h1 style={{ color: theme.colors.error }}>
            {i18n.t('date.generating_questions_second')}
          </FontText>
        </FontText>
      </View>
    </View>
  );
}
