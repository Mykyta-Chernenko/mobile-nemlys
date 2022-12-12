import React, { useEffect, useState } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import NewSet from '@app/components/sets/NewSet';
import { Loading } from '@app/components/utils/Loading';
import ChosenSet from '@app/components/sets/ChosenSet';
import { ViewSetHomeScreen } from '@app/components/sets/ViewSetHomeScreen';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'SetHomeScreen'>) {
  const [loading, setLoading] = useState(true);
  const [isSetChosen, setIsSetChosen] = useState(false);
  async function getCurrentLevel() {
    setLoading(true);
    const currentLevel = await supabase
      .from('couple_set')
      .select()
      .eq('completed', false)
      .maybeSingle();
    if (currentLevel.error) {
      alert(currentLevel.error);
    } else if (currentLevel.data) {
      setIsSetChosen(true);
    } else {
      setIsSetChosen(false);
    }
    setLoading(false);
  }
  useEffect(() => {
    const focusHandler = navigation.addListener('focus', () => {
      if (route.params?.refresh) {
        void getCurrentLevel();
      }
    });
    return focusHandler;
  }, [route.params, navigation]);

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
