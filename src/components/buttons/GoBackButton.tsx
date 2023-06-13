import React from 'react';
import { SecondaryButton } from './SecondaryButton';
import { Image } from 'react-native';
import { ButtonProps, useTheme } from '@rneui/themed';

export const GoBackButton = ({ theme = 'light', ...props }: ButtonProps & { theme?: string }) => {
  const { theme: styleTheme } = useTheme();
  let backgroundColor = 'white';
  switch (theme) {
    case 'light':
      backgroundColor = styleTheme.colors.grey0;
      break;
    case 'dark':
      backgroundColor = styleTheme.colors.grey1;
      break;
  }
  return (
    <SecondaryButton
      {...props}
      buttonStyle={{
        backgroundColor: backgroundColor,
        borderRadius: 40,
        width: 40,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image
        resizeMode="contain"
        style={{ height: 24, width: 24 }}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        source={require('../../../assets/images/arrow_left.png')}
      />
    </SecondaryButton>
  );
};
