import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@rneui/themed';

export default function ({ children, gap = 8 }: { children: React.ReactNode; gap?: number }) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        marginTop: 25,
        flexDirection: 'row',
        alignItems: 'center',
        gap: gap,
        padding: 12,
        backgroundColor: theme.colors.white,
        borderRadius: 12,
        marginBottom: 8,
      }}
    >
      {children}
    </View>
  );
}
