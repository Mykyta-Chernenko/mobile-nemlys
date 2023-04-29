import React from 'react';
import { Button, ButtonProps, useTheme } from '@rneui/themed';
export const PrimaryButton = (props: ButtonProps) => {
  const { theme } = useTheme();
  return (
    <Button
      {...props}
      buttonStyle={{
        borderRadius: 20,
        height: 48,
        backgroundColor: theme.colors.black,
      }}
      titleStyle={{
        fontWeight: '700',
        fontSize: 18,
      }}
      disabledStyle={{ backgroundColor: theme.colors.grey1 }}
      disabledTitleStyle={{ color: theme.colors.white }}
    ></Button>
  );
};
