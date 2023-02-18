import React, { useContext, useEffect, useState } from 'react';
import { useTheme } from '@rneui/themed';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '../utils/Loading';
import { View } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { SetQuestionAction, SetType } from '@app/types/domain';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@app/types/navigation';
import { ViewSetHomeScreen } from './ViewSetHomeScreen';
import { getQuestionsAndActionsForSet } from '@app/api/data/set';
import { SupabaseEdgeAnswer } from '@app/types/api';
import { FontText } from '../utils/FontText';
import { AuthContext } from '@app/provider/AuthProvider';
import SetCarousel from './SetCarousel';
import { logErrorsWithMessageWithoutAlert } from '@app/utils/errors';

export default function () {
  const { theme } = useTheme();
  const navigation = useNavigation<MainNavigationProp>();

  const [loading, setLoading] = useState(true);
  const [setsQuestionAction, setSetsQuestionAction] = useState<SetQuestionAction[]>([]);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    async function getCurrentLevel() {
      const res: SupabaseEdgeAnswer<{ sets: { id: number; type: SetType }[] | null }> =
        await supabase.functions.invoke('get-new-sets');
      if (res?.data?.sets) {
        const setsQuestionAction: SetQuestionAction[] = [];
        for (const setId of res.data.sets) {
          const questionsActions = await getQuestionsAndActionsForSet(setId.id);
          if (questionsActions?.actions && questionsActions.questions) {
            setsQuestionAction.push({
              setId: setId.id,
              type: setId.type,
              action: questionsActions?.actions[0],
              question: questionsActions?.questions[0],
            });
          } else {
            logErrorsWithMessageWithoutAlert(
              Error(`set had no action or question ${JSON.stringify({ setId, questionsActions })}`),
            );
          }
          setSetsQuestionAction(setsQuestionAction);
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
          }}
        >
          {setsQuestionAction.length === 0 ? (
            <FontText h4 style={{ color: theme.colors.white, marginTop: '10%', padding: 15 }}>
              {i18n.t('set.new.no_new_set')}
            </FontText>
          ) : (
            <>
              <SetCarousel setsQuestionAction={setsQuestionAction}></SetCarousel>
            </>
          )}
        </View>
      )}
    </ViewSetHomeScreen>
  );
}
