import React from 'react';
import { View } from 'react-native';
import { FontText } from '@app/components/utils/FontText';
import StreakIcon from '@app/icons/streak';

export default function Streak({ streak }: { streak: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <View
        style={{
          backgroundColor: 'white',
          borderRadius: 40,
          paddingHorizontal: 12,
          paddingVertical: 4,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 4,
        }}
      >
        <StreakIcon width={24} height={24} />
        <FontText style={{ marginTop: 3 }}>{streak}</FontText>
      </View>
    </View>
  );
}
