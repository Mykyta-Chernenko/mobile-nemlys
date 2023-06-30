import React from 'react';
import { useTheme } from '@rneui/themed';
import { View } from 'react-native';

export const Progress = ({
  current,
  all,
  theme = 'light',
}: {
  current: number;
  all: number;
  theme?: 'light' | 'dark';
}) => {
  const { theme: styleTheme } = useTheme();
  let backgroundColor = styleTheme.colors.white;
  switch (theme) {
    case 'light':
      backgroundColor = styleTheme.colors.white;
      break;
    case 'dark':
      backgroundColor = styleTheme.colors.grey1;
      break;
  }
  return (
    <View style={{ display: 'flex', flexDirection: 'row' }}>
      {Array.from({ length: all }).map((_, index) => (
        <View
          key={index}
          style={{
            margin: 2,
            borderRadius: 10,
            height: 8,
            width: 8,
            backgroundColor: index === current - 1 ? styleTheme.colors.primary : backgroundColor,
          }}
        ></View>
      ))}
    </View>
  );
};
