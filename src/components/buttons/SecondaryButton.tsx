import React from 'react';
import { Button, ButtonProps, useTheme } from '@rneui/themed';
export const SecondaryButton = ({ buttonStyle, ...props }: ButtonProps) => {
  const { theme } = useTheme();
  return (
    <Button
      buttonStyle={[
        {
          borderRadius: 35,
          height: 72,
          backgroundColor: theme.colors.white,
        },
        buttonStyle,
      ]}
      titleStyle={{ color: theme.colors.black, fontWeight: '600', fontSize: 16 }}
      disabledTitleStyle={{ color: theme.colors.grey5 }}
      {...props}
    ></Button>
  );
};
