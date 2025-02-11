import React from 'react';
import { useTheme } from '@rneui/themed';
import { View } from 'react-native';

export const Progress = ({ current, all }: { current: number; all: number }) => {
  const { theme: styleTheme } = useTheme();

  const unfilledColor = styleTheme.colors.grey2;

  const progressPercentage = all > 0 ? (current / all) * 100 : 0;

  return (
    <View
      style={{
        height: 8,
        width: 100,
        backgroundColor: unfilledColor,
        borderRadius: 5,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${progressPercentage}%`,
          backgroundColor: styleTheme.colors.primary,
        }}
      />
    </View>
  );
};
