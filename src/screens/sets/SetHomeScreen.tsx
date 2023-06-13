import React, { useEffect, useState } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import NewSet from '@app/components/sets/NewSet';
import { Loading } from '@app/components/utils/Loading';
import ChosenSet from '@app/components/sets/ChosenSet';
import { ViewSetHomeScreen } from '@app/components/sets/ViewSetHomeScreen';
import { logErrors } from '@app/utils/errors';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'SetHomeScreen'>) {
  const [loading, setLoading] = useState(true);
  const [isSetChosen, setIsSetChosen] = useState(false);
  async function getCurrentLevel() {
    setLoading(true);
    const currentLevel = await supabase.from('date').select().eq('active', true).maybeSingle();
    if (currentLevel.error) {
      logErrors(currentLevel.error);
    } else if (currentLevel.data) {
      setIsSetChosen(true);
    } else {
      setIsSetChosen(false);
    }
    setLoading(false);
  }
  useEffect(() => {
    if (route.params?.refreshTimeStamp) {
      void getCurrentLevel();
    }
  }, [route.params?.refreshTimeStamp]);

  useEffect(() => {
    void getCurrentLevel();
  }, [setIsSetChosen, setLoading]);
  let mainComponent = (
    <ViewSetHomeScreen>
      <Loading />
    </ViewSetHomeScreen>
  );
  if (!loading) {
    if (isSetChosen) {
      mainComponent = <ChosenSet />;
    } else {
      mainComponent = <NewSet />;
    }
  }

  return mainComponent;
}
