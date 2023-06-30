import React, { useEffect, useState } from 'react';
import { useTheme } from '@rneui/themed';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '../utils/Loading';
import { View } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { SetQuestionAction } from '@app/types/domain';
import { ViewSetHomeScreen } from './ViewSetHomeScreen';
import { FontText } from '../utils/FontText';
import { logErrors } from '@app/utils/errors';
import { addActionAndQuestionsToSet } from '@app/api/data/set';

export default function () {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [setsQuestionAction, setSetsQuestionAction] = useState<SetQuestionAction[]>([]);

  useEffect(() => {
    async function getCompletedCards() {
      const res = await supabase
        .from('couple_set')
        .select('id, set_id, set(ai_generated)')
        .eq('completed', true)
        .order('created_at', { ascending: false });
      if (res.error) {
        logErrors(res.error);
        return;
      }
      if (res.data) {
        const setsQuestionAction: SetQuestionAction[] = await addActionAndQuestionsToSet(
          res.data.map((x) => ({
            coupleSetId: x.id,
            setId: x.set_id,
            type: (Array.isArray(x.set) ? x.set[0] : x.set)?.ai_generated ? 'ai' : 'normal',
          })),
        );
        setSetsQuestionAction(setsQuestionAction);
      }
      setLoading(false);
    }
    void getCompletedCards();
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
              {i18n.t('set.history.no_sets_completed')}
            </FontText>
          ) : (
            <></>
            // <SetCarousel setsQuestionAction={setsQuestionAction} deckType="history"></SetCarousel>
          )}
        </View>
      )}
    </ViewSetHomeScreen>
  );
}
