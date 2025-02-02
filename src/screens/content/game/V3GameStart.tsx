import React, { useContext, useEffect, useRef, useState } from 'react';

import { i18n } from '@app/localization/i18n';
import { ContentStart } from '@app/components/content/ContentStart';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { AuthContext } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';
import { supabase } from '@app/api/initSupabase';
import { logSupaErrors } from '@app/utils/errors';
import BlueIdea from '@app/icons/blue_idea';
import RoadSign from '@app/icons/road_sign';
import { PostgrestError } from '@supabase/supabase-js';

type Props = NativeStackScreenProps<MainStackParamList, 'V3GameStart'>;

export default function V3GameStart({ route, navigation }: Props) {
  const authContext = useContext(AuthContext);
  const gameId = route.params.id;
  const [loading, setLoading] = useState(true);
  const [questionCount, setQuestionCount] = useState<number>(5);

  const isFirstMount = useRef(true);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const userId = authContext.userId;
      if (!userId) {
        setLoading(false);
        return;
      }

      localAnalytics().logEvent('GameStartLoadingStarted', {
        screen: 'GameStart',
        action: 'LoadingStarted',
        userId: userId,
        gameId: gameId,
      });

      const questionCountRes = await supabase
        .from('content_game_question')
        .select('id', { count: 'exact' })
        .eq('game_id', gameId);

      if (questionCountRes.error) throw questionCountRes.error;

      setQuestionCount(questionCountRes.count || 10);

      localAnalytics().logEvent('GameStartLoaded', {
        screen: 'GameStart',
        action: 'Loaded',
        userId,
        gameId,
      });
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void fetchInitialData();
    }
  }, [route.params?.refreshTimeStamp]);

  useEffect(() => {
    void fetchInitialData();
    isFirstMount.current = false;
  }, []);

  const handleGoBack = () => {
    localAnalytics().logEvent('V3GameStartBackClicked', {
      userId: authContext.userId,
      gameId: gameId,
    });
    navigation.navigate('V3ExploreGameDetail', {
      id: gameId,
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  const handleContinue = () => {
    localAnalytics().logEvent('V3GameStartContinueClicked', {
      userId: authContext.userId,
      gameId: gameId,
    });
    navigation.navigate('V3Game', {
      id: gameId,
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  const PURPLE_BUDDY = require('../../../../assets/images/big_purple_buddy.png');

  return (
    <ContentStart
      title={i18n.t('explore_content_detail_game_start_title', { count: questionCount })}
      highlight={i18n.t('explore_content_detail_game_start_title_highlight')}
      instructions={[
        {
          icon: <BlueIdea />,
          text: i18n.t('explore_content_detail_game_start_instruction_one'),
        },
        {
          icon: <RoadSign />,
          text: i18n.t('explore_content_detail_game_start_instruction_two'),
        },
      ]}
      onContinue={handleContinue}
      onGoBack={handleGoBack}
      imageSource={PURPLE_BUDDY}
      buttonLabel={i18n.t('continue')}
      loading={loading}
    />
  );
}
