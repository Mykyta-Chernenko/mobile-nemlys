import React from 'react';
import { TextProps, Text } from '@rneui/themed';
import { TextStyle } from 'react-native';
export const REGULAR_FONT_FAMILY = 'NunitoSans_400Regular';
export const BOLD_FONT_FAMILY = 'NunitoSans_700Bold';
export const SEMIBOLD_FONT_FAMILY = 'NunitoSans_600SemiBold';
export const FontText = (props: TextProps) => {
  let fontFamily = REGULAR_FONT_FAMILY;
  if ((props.style as TextStyle)?.fontWeight === 'bold') {
    fontFamily = BOLD_FONT_FAMILY;
  } else if ((props.style as TextStyle)?.fontWeight === '600') {
    fontFamily = SEMIBOLD_FONT_FAMILY;
  }
  return <Text style={[{ fontFamily }, props.style]} {...props}></Text>;
};
