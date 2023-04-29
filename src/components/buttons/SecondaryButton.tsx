import React from 'react';
import { Button, ButtonProps, useTheme } from '@rneui/themed';
export const SecondaryButton = (props: ButtonProps) => {
  const { theme } = useTheme();
  return (
    <Button
      type="outline"
      buttonStyle={{ borderWidth: 0 }}
      titleStyle={{ color: theme.colors.black }}
      disabledStyle={{ borderWidth: 0 }}
      disabledTitleStyle={{ color: theme.colors.grey5 }}
      {...props}
    ></Button>
  );
};
