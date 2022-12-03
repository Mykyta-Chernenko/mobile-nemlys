import { useTheme } from '@rneui/themed';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export const Loading = ({ light = false }: { light?: boolean }) => {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <ActivityIndicator
        size="large"
        style={{ alignSelf: 'center' }}
        color={light ? theme.colors.white : theme.colors.primary}
      />
    </View>
  );
};
