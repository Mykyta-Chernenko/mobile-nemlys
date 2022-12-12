import React, { useEffect, useState } from 'react';
import { useTheme, Text } from '@rneui/themed';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '../utils/Loading';
import { View } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { Question, Action } from '@app/types/domain';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import { useNavigation } from '@react-navigation/native';
import { ProfileScreenNavigationProp } from '@app/types/navigation';
import { ViewSetHomeScreen } from './ViewSetHomeScreen';
import { getQuestionsAndActionsForSet } from '@app/api/data/set';
import SetList from './SetList';
import { SupabaseAnswer } from '@app/types/api';

export default function () {
  const { theme } = useTheme();
  const navigation = useNavigation<ProfileScreenNavigationProp>();

  const [loading, setLoading] = useState(true);
  const [setId, setSetId] = useState<number | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    async function getCurrentLevel() {
      const { data }: SupabaseAnswer<{ nextSetId: number | null }> =
        await supabase.functions.invoke('get-new-set');
      if (data?.nextSetId) {
        setSetId(data.nextSetId);
        const questionsActions = await getQuestionsAndActionsForSet(data.nextSetId);
        if (questionsActions) {
          setQuestions(questionsActions.questions);
          setActions(questionsActions.actions);
        }
      }
      setLoading(false);
    }
    void getCurrentLevel();
  }, [setLoading]);
  return (
    <ViewSetHomeScreen>
      {loading ? (
        <Loading light />
      ) : (
        <View
          style={{
            flexGrow: 1,
            width: '100%',
            padding: 15,
          }}
        >
          <Text style={{ color: theme.colors.white, marginBottom: '3%' }}>
            {i18n.t('set.new.title')}
          </Text>
          <SetList actions={actions} questions={questions} chosenSet={false}></SetList>
          {setId !== undefined && (
            <View style={{ marginTop: '4%', width: '100%' }}>
              <PrimaryButton
                onPress={() =>
                  navigation.navigate('SetReminder', {
                    setId,
                    actionsIds: actions.map((a) => a.id),
                    questionIds: questions.map((q) => q.id),
                  })
                }
              >
                {i18n.t('set.accept')}
              </PrimaryButton>
            </View>
          )}
        </View>
      )}
    </ViewSetHomeScreen>
  );
}
