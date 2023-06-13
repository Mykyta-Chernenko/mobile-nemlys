import React from 'react';
import { TextProps, Text } from '@rneui/themed';
import { TextStyle } from 'react-native';
export const REGULAR_FONT_FAMILY = 'Epilogue_400Regular';
export const BOLD_FONT_FAMILY = 'Epilogue_700Bold';
export const SEMIBOLD_FONT_FAMILY = 'Epilogue_600SemiBold';
export const FontText = ({ style, ...props }: TextProps) => {
  const fontWeight = (style as TextStyle)?.fontWeight || '600';
  let fontFamily = REGULAR_FONT_FAMILY;
  switch (fontWeight) {
    case '700':
      fontFamily = BOLD_FONT_FAMILY;
      break;
    case '600':
      fontFamily = SEMIBOLD_FONT_FAMILY;
      break;
  }
  return <Text style={[{ fontWeight: '600', fontFamily: fontFamily }, style]} {...props}></Text>;
};
