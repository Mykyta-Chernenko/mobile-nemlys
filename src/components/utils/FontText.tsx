import React from 'react';
import { TextProps } from '@rneui/themed';
import { TextStyle, Text, Dimensions } from 'react-native';
export const REGULAR_FONT_FAMILY = 'Epilogue-Regular';
export const BOLD_FONT_FAMILY = 'Epilogue-Bold';
export const SEMIBOLD_FONT_FAMILY = 'Epilogue-SemiBold';
export const FontText = ({ style, h1, h2, h3, h4, ...props }: TextProps) => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const fontBySize = {
    small: {
      h1: 32,
      h2: 26,
      h3: 20,
      h4: 16,
      normal: 14,
    },
    medium: {
      h1: 34,
      h2: 28,
      h3: 22,
      h4: 18,
      normal: 15,
    },
    big: {
      h1: 40,
      h2: 32,
      h3: 24,
      h4: 20,
      normal: 16,
    },
  };
  let screenType = 'small';
  if (windowWidth * windowHeight > 350000) {
    screenType = 'big';
  } else if (windowWidth * windowHeight > 290000) {
    screenType = 'medium';
  }
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
  let fontSize = fontBySize[screenType].normal;
  if (h1) {
    fontSize = fontBySize[screenType].h1;
  }
  if (h2) {
    fontSize = fontBySize[screenType].h2;
  }
  if (h3) {
    fontSize = fontBySize[screenType].h3;
  }
  if (h4) {
    fontSize = fontBySize[screenType].h4;
  }
  return <Text style={[{ fontSize, fontWeight: '600', fontFamily }, style]} {...props}></Text>;
};
