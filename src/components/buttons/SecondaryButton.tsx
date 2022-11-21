import React from 'react';
import { Button, ButtonProps, useTheme } from '@rneui/themed';
export const SecondaryButton = (props: ButtonProps) => {
  const { theme } = useTheme();
  return (
    <Button
      {...props}
      type="outline"
      buttonStyle={{ borderColor: theme.colors.black }}
      titleStyle={{ color: theme.colors.black }}
      disabledStyle={{ backgroundColor: theme.colors.grey5 }}
      disabledTitleStyle={{ color: theme.colors.grey5 }}
    ></Button>
  );
};
