import React, { useContext, useEffect, useRef } from 'react';
import { useTheme } from '@rneui/themed';
import { Animated, View } from 'react-native';

import { FontText } from '../utils/FontText';
import { i18n } from '@app/localization/i18n';

import { AuthContext } from '@app/provider/AuthProvider';
import { supabase } from '@app/api/initSupabase';
import { logErrors } from '@app/utils/errors';
import { APIUserProfile, SupabaseAnswer } from '@app/types/api';
import { JobSlug } from '@app/types/domain';

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
        .select(
          'id, partner_first_name, partner_first_name, user_id, couple_id, first_name, ios_expo_token, android_expo_token, onboarding_finished, showed_interview_request, created_at, updated_at',
        )
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
      const dateId = dateReponse.data.id;

      const request = supabase.functions.invoke('generate-question', {
        body: { date_id: dateId },
      });

      const loadTime = new Promise((resolve) => setTimeout(() => resolve(1), 3000));
      const [res, _] = await Promise.all([request, loadTime]);
      if (res.error) {
        logErrors(res.error);
        return;
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
