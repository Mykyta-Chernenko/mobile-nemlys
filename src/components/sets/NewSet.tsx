import React, { useEffect, useState } from 'react';
import { useTheme } from '@rneui/themed';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '../utils/Loading';
import { View } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { SetWithType, SetQuestionAction, SetType } from '@app/types/domain';
import { ViewSetHomeScreen } from './ViewSetHomeScreen';
import { SupabaseEdgeAnswer } from '@app/types/api';
import { FontText } from '../utils/FontText';
import SetCarousel from './SetCarousel';
import { addActionAndQuestionsToSet } from '@app/api/data/set';

export default function () {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [setsQuestionAction, setSetsQuestionAction] = useState<SetQuestionAction[]>([]);
  const setsQuestionActionSorted = setsQuestionAction.sort((a, b) => {
    const typeToNumber: Record<SetType, number> = {
      normal: 0,
      ai: 1,
      unavailable: 2,
    };
    return typeToNumber[a.type] - typeToNumber[b.type];
  });
  useEffect(() => {
    async function getAISet(sets: SetQuestionAction[], retry: number) {
      const res: SupabaseEdgeAnswer<{ sets: SetWithType[] | null }> =
        await supabase.functions.invoke('get-ai-sets');
      if (res?.data?.sets) {
        const aiSetsQuestionAction: SetQuestionAction[] = await addActionAndQuestionsToSet(
          res.data.sets.map((s) => ({ setId: s.id, type: s.type, coupleSetId: null })),
        );
        setSetsQuestionAction([...sets, ...aiSetsQuestionAction]);
      } else if (retry < 3) {
        void getAISet(sets, retry + 1);
      }
    }

    async function getSets() {
      const res: SupabaseEdgeAnswer<{ sets: SetWithType[] | null }> =
        await supabase.functions.invoke('get-new-sets');
      if (res?.data?.sets) {
        const setsQuestionAction: SetQuestionAction[] = await addActionAndQuestionsToSet(
          res.data.sets.map((s) => ({ setId: s.id, type: s.type, coupleSetId: null })),
        );
        setSetsQuestionAction(setsQuestionAction);
        void getAISet(setsQuestionAction, 1);
      }

      setLoading(false);
    }

    void getSets();
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
            <SetCarousel setsQuestionAction={setsQuestionActionSorted} deckType="new"></SetCarousel>
          )}
        </View>
      )}
    </ViewSetHomeScreen>
  );
}
