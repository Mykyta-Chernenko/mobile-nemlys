import React from 'react';
import { SecondaryButton } from './SecondaryButton';
import { Image } from 'react-native';
import { ButtonProps, useTheme } from '@rneui/themed';

export const GoBackButton = ({
  theme = 'light',
  ...props
}: ButtonProps & { theme?: 'light' | 'dark' | 'black' }) => {
  const { theme: styleTheme } = useTheme();
  let backgroundColor = styleTheme.colors.white;
  switch (theme) {
    case 'light':
      backgroundColor = styleTheme.colors.white;
      break;
    case 'dark':
      backgroundColor = styleTheme.colors.grey1;
      break;
    case 'black':
      backgroundColor = 'rgba(255, 255, 255, 0.1)';
      break;
  }
  const whiteSource = require('../../../assets/images/arrow_left_white.png');
  const blackSource = require('../../../assets/images/arrow_left_black.png');
  const source = theme === 'black' ? whiteSource : blackSource;

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        source={source}
      />
    </SecondaryButton>
  );
};
