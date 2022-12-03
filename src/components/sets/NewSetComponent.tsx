import React, { useEffect, useState } from 'react';
import { useTheme, Text } from '@rneui/themed';
import { supabase } from '@app/api/initSupabase';
import { APIAction, APIQuestion } from '@app/types/api';
import { Loading } from '../utils/Loading';
import { View } from 'react-native';
import { i18n } from '@app/localization/i18n';

export default function () {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [actions, setActions] = useState([]);

  useEffect(() => {
    async function getCurrentLevel() {
      const { data }: { data: { nextSetId: number | null } } = await supabase.functions.invoke(
        'get-new-set',
      );
      if (data.nextSetId) {
        const [{ data: questionIds }, { data: actionsIds }] = await Promise.all([
          supabase.from('set_question').select('question_id').eq('set_id', data.nextSetId),
          supabase.from('set_action').select('action_id').eq('set_id', data.nextSetId),
        ]);
        const [{ data: questions }, { data: actions }]: [
          { data: APIQuestion[] },
          { data: APIAction[] },
        ] = await Promise.all([
          supabase
            .from('question')
            .select('*')
            .in(
              'id',
              questionIds.map((x) => x.question_id),
            ),
          supabase
            .from('action')
            .select('*')
            .in(
              'id',
              actionsIds.map((x) => x.action_id),
            ),
        ]);
        setQuestions(questions);
        setActions(actions);
      }
      setLoading(false);
    }
    void getCurrentLevel();
  }, [setLoading]);
  return loading ? (
    <Loading light />
  ) : (
    <View
      style={{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Text>{i18n.t('set.questions.title')}</Text>
      <View>
        {questions.map((q) => (
          <View key={q.id}>
            <Text>{q.title}</Text>
          </View>
        ))}
      </View>
      <Text>{i18n.t('set.actions.title')}</Text>
      <View>
        {actions.map((q) => (
          <View key={q.id}>
            <Text>{q.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
