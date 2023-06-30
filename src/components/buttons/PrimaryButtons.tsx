import React from 'react';
import { Button, ButtonProps, useTheme } from '@rneui/themed';
export const PrimaryButton = ({ buttonStyle, ...props }: ButtonProps) => {
  const { theme } = useTheme();
  return (
    <Button
      {...props}
      buttonStyle={[
        {
          borderRadius: 35,
          height: 72,
          backgroundColor: theme.colors.black,
        },
        buttonStyle,
      ]}
      titleStyle={[
        {
          fontWeight: '600',
          fontSize: 16,
          color: theme.colors.white,
        },
        props.titleStyle,
      ]}
      disabledStyle={{ backgroundColor: theme.colors.grey2 }}
      disabledTitleStyle={{ color: theme.colors.grey3 }}
    ></Button>
  );
};
