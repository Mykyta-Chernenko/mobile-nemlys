import React, { useContext, useEffect, useState } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { i18n } from '@app/localization/i18n';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { APIReflection, SupabaseAnswer } from '@app/types/api';
import { supabase } from '@app/api/initSupabase';
import SurveyView from '@app/components/common/SurveyView';
import { ContentBox } from '@app/components/utils/ContentBox';
import { View } from 'react-native';
import { FontText } from '@app/components/utils/FontText';
import { logErrors } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import { logEvent } from 'expo-firebase-analytics';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'CompleteSetReflect'>) {
  const [reflectionQuestion, setReflectionQuestion] = useState<APIReflection | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const getSetReflection = async () => {
      setLoading(true);
      try {
        const res: SupabaseAnswer<{ reflection_id: number }[]> = await supabase
          .from('set_reflection')
          .select('reflection_id')
          .eq('set_id', route.params.setId);
        if (res.error) {
          logErrors(res.error);
          return;
        }
        const res2: SupabaseAnswer<APIReflection[]> = await supabase
          .from('reflection')
          .select('id, slug, title, image, details, tips, importance, created_at, updated_at')
          .in(
            'id',
            (res.data ?? []).map((x) => x.reflection_id),
          );
        if (res2.error) {
          logErrors(res2.error);
          return;
        }
        setReflectionQuestion(res2.data?.[0]);
      } finally {
        setLoading(false);
      }
    };
    void getSetReflection();
  }, [route.params.setId]);
  return (
    <SurveyView
      loading={loading}
      title={reflectionQuestion?.details || ''}
      progress={0.1}
      showButton={true}
      onPress={() => {
        void logEvent('CompleteSetReflectGoNext', {
          screen: 'CompleteSetReflect',
          action: 'Go next button clicked',
          setId: route.params.setId,
          userId: authContext.userId,
        });
        navigation.navigate('CompleteSetQuestion', {
          ...route.params,
          questionIndex: undefined,
          questions: undefined,
          userAnswers: [],
        });
      }}
      onBackPress={() => {
        void logEvent('CompleteSetReflectGoBack', {
          screen: 'CompleteSetReflect',
          action: 'Go back button clicked',
          setId: route.params.setId,
          userId: authContext.userId,
        });
        navigation.goBack();
      }}
    >
      <View style={{ marginVertical: 10 }}>
        <ContentBox>
          <FontText style={{ fontWeight: 'bold' }}>{i18n.t('set.importance.title')}</FontText>
          <FontText>{reflectionQuestion?.importance}</FontText>
        </ContentBox>

        <ContentBox>
          <FontText style={{ fontWeight: 'bold' }}>{i18n.t('set.tips.title')}</FontText>
          <FontText>{reflectionQuestion?.tips}</FontText>
        </ContentBox>
      </View>
    </SurveyView>
  );
}
