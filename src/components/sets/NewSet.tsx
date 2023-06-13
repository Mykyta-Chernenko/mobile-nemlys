import React, { useContext, useState } from 'react';
import { useTheme } from '@rneui/themed';
import { Loading } from '../utils/Loading';
import { ViewSetHomeScreen } from './ViewSetHomeScreen';
import { logErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { InsertAPIDate } from '@app/types/api';
import { AuthContext } from '@app/provider/AuthProvider';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@app/types/navigation';
import ChooseDateTopics from './ChooseDateTopics';
import { PrimaryButton } from '../buttons/PrimaryButtons';

export default function () {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [startNewDate, setStartNewDate] = useState(false);

  const authContext = useContext(AuthContext);
  const navigation = useNavigation<MainNavigationProp>();
  const onHandleTopicsSelected = async (topics: string[], modes: string[]) => {
    const { data: profile, error: profileError } = await supabase
      .from('user_profile')
      .select(
        'id, first_name, user_id, couple_id, first_name, ios_expo_token, android_expo_token, onboarding_finished, created_at, updated_at',
      )
      .eq('user_id', authContext.userId)
      .single();
    if (profileError) {
      logErrors(profileError);
      return;
    }
    const date: InsertAPIDate = {
      active: true,
      couple_id: profile.couple_id,
      topics: topics.join(','),
      modes: modes.join(','),
    };
    const { error: dateError } = await supabase.from('date').insert(date);
    if (dateError) {
      logErrors(dateError);
      return;
    }
    setStartNewDate(false);
    navigation.navigate('SetHomeScreen', { refreshTimeStamp: new Date().toISOString() });
  };

  return (
    <ViewSetHomeScreen>
      {loading ? (
        <Loading light />
      ) : startNewDate ? (
        <ChooseDateTopics
          topics={[]}
          modes={[]}
          onNextPress={(topics: string[], modes: string[]) =>
            void onHandleTopicsSelected(topics, modes)
          }
        ></ChooseDateTopics>
      ) : (
        <>
          <PrimaryButton onPress={() => setStartNewDate(true)}>Start date</PrimaryButton>
        </>
      )}
    </ViewSetHomeScreen>
  );
}
