import React, { useEffect, useState } from 'react';
import { useTheme, Text } from '@rneui/themed';
import { MainStackParamList } from '@app/types/navigation';
import { i18n } from '@app/localization/i18n';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { APIReflection, SupabaseAnswer } from '@app/types/api';
import { supabase } from '@app/api/initSupabase';
import SurveyView from '@app/components/common/SurveyView';
import { ContentBox } from '@app/components/utils/ContentBox';
import { View } from 'react-native';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'CompleteSetReflect'>) {
  const { theme } = useTheme();

  const [reflectionQuestion, setReflectionQuestion] = useState<APIReflection | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    const getSetReflection = async () => {
      setLoading(true);
      try {
        const res: SupabaseAnswer<{ reflection_id: number }[]> = await supabase
          .from('set_reflection')
          .select('reflection_id')
          .eq('set_id', route.params.setId);
        if (res.error) {
          alert(res.error.message || i18n.t('unexpected_error'));
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
          alert(res2.error.message || i18n.t('unexpected_error'));
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
      onPress={() =>
        navigation.navigate('CompleteSetQuestion', {
          ...route.params,
          questionIndex: undefined,
          questions: undefined,
          userAnswers: [],
        })
      }
      onBackPress={() => navigation.goBack()}
    >
      <View style={{ marginVertical: 10 }}>
        <ContentBox>
          <Text style={{ fontWeight: 'bold' }}>{i18n.t('set.importance.title')}</Text>
          <Text>{reflectionQuestion?.importance}</Text>
        </ContentBox>

        <ContentBox>
          <Text style={{ fontWeight: 'bold' }}>{i18n.t('set.tips.title')}</Text>
          <Text>{reflectionQuestion?.tips}</Text>
        </ContentBox>
      </View>
    </SurveyView>
  );
}
