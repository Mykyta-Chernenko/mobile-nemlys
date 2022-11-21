import React from 'react';
import { ButtonProps } from '@rneui/themed';
import { SecondaryButton } from './SecondaryButton';
import { Image } from 'react-native';

export const GoBackButton = (props: ButtonProps) => {
  return (
    <SecondaryButton {...props}>
      <Image
        resizeMode="contain"
        style={{
          height: 20,
          width: 20,
        }}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        source={require('../../../assets/images/arrow_left.png')}
      />
    </SecondaryButton>
  );
};
