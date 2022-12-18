import React, { useEffect, useState } from 'react';
import { useTheme } from '@rneui/themed';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '../utils/Loading';
import { View } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { Question, Action } from '@app/types/domain';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@app/types/navigation';
import { ViewSetHomeScreen } from './ViewSetHomeScreen';
import { getQuestionsAndActionsForSet } from '@app/api/data/set';
import SetList from './SetList';
import { SupabaseEdgeAnswer } from '@app/types/api';
import { FontText } from '../utils/FontText';

export default function () {
  const { theme } = useTheme();
  const navigation = useNavigation<MainNavigationProp>();

  const [loading, setLoading] = useState(true);
  const [noNewSet, setNoNewSet] = useState(false);
  const [setId, setSetId] = useState<number | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [actions, setActions] = useState<Action[]>([]);

  useEffect(() => {
    async function getCurrentLevel() {
      const res: SupabaseEdgeAnswer<{ nextSetId: number | null }> = await supabase.functions.invoke(
        'get-new-set',
      );
      if (res?.data?.nextSetId) {
        setSetId(res.data.nextSetId);
        const questionsActions = await getQuestionsAndActionsForSet(res.data.nextSetId);
        if (questionsActions) {
          setQuestions(questionsActions.questions);
          setActions(questionsActions.actions);
        }
      } else {
        setNoNewSet(true);
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
          {noNewSet ? (
            <FontText h4 style={{ color: theme.colors.white, marginTop: '10%' }}>
              {i18n.t('set.new.no_new_set')}
            </FontText>
          ) : (
            <>
              <FontText style={{ color: theme.colors.white, marginBottom: '3%' }}>
                {i18n.t('set.new.title')}
              </FontText>
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
            </>
          )}
        </View>
      )}
    </ViewSetHomeScreen>
  );
}
