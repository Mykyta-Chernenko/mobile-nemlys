import React from 'react';
import { LinearProgress, useTheme } from '@rneui/themed';

export const Progress = ({ value }: { value: number }) => {
  const { theme } = useTheme();
  return (
    <LinearProgress
      style={{
        width: '50%',
        marginHorizontal: '10%',
        marginVertical: 20,
        alignSelf: 'center',
        borderRadius: 5,
      }}
      value={value}
      variant="determinate"
      color={theme.colors.primary}
      trackColor={theme.colors.greyOutline}
      animation={false}
    />
  );
};
