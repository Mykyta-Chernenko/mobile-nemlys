import React from 'react';
import { ButtonProps } from '@rneui/themed';
import { SecondaryButton } from './SecondaryButton';
import { Image } from 'react-native';

export const GoBackButton = (props: ButtonProps) => {
  return (
    <SecondaryButton
      {...props}
      style={[props.style, { backgroundColor: 'white', borderRadius: 50, padding: 5 }]}
    >
      <Image
        resizeMode="contain"
        style={{
          height: 15,
          width: 15,
        }}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        source={require('../../../assets/images/arrow_left.png')}
      />
    </SecondaryButton>
  );
};
