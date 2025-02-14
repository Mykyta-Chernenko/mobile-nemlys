import React from 'react';
import { Button, ButtonProps, useTheme } from '@rneui/themed';
import { getFontSizeForScreen, SEMIBOLD_FONT_FAMILY } from '@app/components/utils/FontText';
export const PrimaryButton = ({ buttonStyle, ...props }: ButtonProps) => {
  const { theme } = useTheme();
  return (
    <Button
      {...props}
      buttonStyle={[
        {
          borderRadius: 40,
          height: 56,
          backgroundColor: theme.colors.black,
        },
        buttonStyle,
      ]}
      titleStyle={[
        {
          fontFamily: SEMIBOLD_FONT_FAMILY,
          fontSize: getFontSizeForScreen('normal'),
          color: theme.colors.white,
        },
        props.titleStyle,
      ]}
      disabledStyle={{ backgroundColor: theme.colors.grey2 }}
      disabledTitleStyle={{ color: theme.colors.grey3 }}
    ></Button>
  );
};
