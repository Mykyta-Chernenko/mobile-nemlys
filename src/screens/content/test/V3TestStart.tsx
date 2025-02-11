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

type Props = NativeStackScreenProps<MainStackParamList, 'V3TestStart'>;

export default function V3TestStart({ route, navigation }: Props) {
  const authContext = useContext(AuthContext);
  const testId = route.params.id;
  const [loading, setLoading] = useState(true);
  const [questionCount, setQuestionCount] = useState<number>(10);

  const isFirstMount = useRef(true);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const userId = authContext.userId;
      if (!userId) {
        setLoading(false);
        return;
      }

      localAnalytics().logEvent('TestStartLoadingStarted', {
        screen: 'TestStart',
        action: 'LoadingStarted',
        userId: userId,
        testId: testId,
      });

      const questionCountRes = await supabase
        .from('content_test_question')
        .select('id', { count: 'exact' })
        .eq('test_id', testId);

      if (questionCountRes.error) throw questionCountRes.error;

      setQuestionCount(questionCountRes.count || 10);

      localAnalytics().logEvent('TestStartLoaded', {
        screen: 'TestStart',
        action: 'Loaded',
        userId,
        testId,
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
    localAnalytics().logEvent('V3TestStartBackClicked', {
      userId: authContext.userId,
      testId: testId,
    });
    navigation.navigate('V3ExploreTestDetail', {
      id: testId,
      refreshTimeStamp: new Date().toISOString(),
      fromHome: route.params.fromHome,
    });
  };

  const handleContinue = () => {
    localAnalytics().logEvent('V3TestStartContinueClicked', {
      userId: authContext.userId,
      testId: testId,
    });
    navigation.navigate('V3Test', {
      id: testId,
      refreshTimeStamp: new Date().toISOString(),
      fromHome: route.params.fromHome,
    });
  };

  const PURPLE_BUDDY = require('../../../../assets/images/big_purple_buddy.png');

  return (
    <ContentStart
      title={i18n.t('explore_content_detail_test_start_title', { count: questionCount })}
      highlight={i18n.t('explore_content_detail_test_start_title_highlight')}
      instructions={[
        {
          icon: <BlueIdea />,
          text: i18n.t('explore_content_detail_test_start_instruction_one'),
        },
        {
          icon: <RoadSign />,
          text: i18n.t('explore_content_detail_test_start_instruction_two'),
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
