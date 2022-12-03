import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { supabase } from '@app/api/initSupabase';

export default function () {
  const [loading, setLoading] = useState(true);
  const [isSetChosen, setIsSetChosen] = useState(false);

  useEffect(() => {
    async function getCurrentLevel() {
      const currentLevel = await supabase
        .from('couple_set')
        .select()
        .eq('completed', false)
        .maybeSingle();
      if (currentLevel.error) {
        alert(currentLevel.error);
      }
      setLoading(false);
    }
    void getCurrentLevel();
  }, [setIsSetChosen, setLoading]);
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text>current set</Text>
    </View>
  );
}
