import React from 'react';
import { TextProps, Text } from '@rneui/themed';
import { TextStyle } from 'react-native';
export const FontText = (props: TextProps) => {
  let fontFamily = 'NunitoSans_400Regular';
  if ((props.style as TextStyle)?.fontWeight === 'bold') {
    fontFamily = 'NunitoSans_700Bold';
  }
  return <Text style={[{ fontFamily }, props.style]} {...props}></Text>;
};
