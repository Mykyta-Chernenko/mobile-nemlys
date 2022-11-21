import React from 'react';
import { Button, ButtonProps, useTheme } from '@rneui/themed';
export const PrimaryButton = (props: ButtonProps) => {
  const { theme } = useTheme();
  return (
    <Button
      {...props}
      disabledStyle={{ backgroundColor: theme.colors.secondary }}
      disabledTitleStyle={{ color: theme.colors.white }}
    ></Button>
  );
};
