import React from 'react';
import { Button, ButtonProps, useTheme } from '@rneui/themed';
import { getFontSizeForScreen, SEMIBOLD_FONT_FAMILY } from '@app/components/utils/FontText';
export const SecondaryButton = ({ buttonStyle, ...props }: ButtonProps) => {
  const { theme } = useTheme();
  return (
    <Button
      buttonStyle={[
        {
          borderRadius: 40,
          height: 56,
          backgroundColor: theme.colors.white,
        },
        buttonStyle,
      ]}
      titleStyle={{
        fontFamily: SEMIBOLD_FONT_FAMILY,
        color: theme.colors.black,
        fontSize: getFontSizeForScreen('normal'),
      }}
      disabledTitleStyle={{ color: theme.colors.grey5 }}
      {...props}
    ></Button>
  );
};
