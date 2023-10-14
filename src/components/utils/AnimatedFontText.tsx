import React from 'react';
import { TextProps } from '@rneui/themed';
import { TextStyle, Dimensions, Animated } from 'react-native';
export const REGULAR_FONT_FAMILY = 'Epilogue-Regular';
export const BOLD_FONT_FAMILY = 'Epilogue-Bold';
export const SEMIBOLD_FONT_FAMILY = 'Epilogue-SemiBold';
export const AnimatedFontText = ({ style, h1, h2, h3, h4, ...props }: TextProps) => {
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  let screenType = 's';
  if (windowWidth * windowHeight > 550000) {
    screenType = 'xl';
  } else if (windowWidth * windowHeight > 350000) {
    screenType = 'l';
  } else if (windowWidth * windowHeight > 290000) {
    screenType = 'm';
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

  const fontBySize = {
    s: {
      h1: 30,
      h2: 24,
      h3: 18,
      h4: 14,
      normal: 13,
    },
    m: {
      h1: 34,
      h2: 28,
      h3: 22,
      h4: 18,
      normal: 15,
    },
    l: {
      h1: 40,
      h2: 32,
      h3: 24,
      h4: 20,
      normal: 16,
    },
    xl: {
      h1: 50,
      h2: 40,
      h3: 30,
      h4: 26,
      normal: 18,
    },
  };
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
  return (
    <Animated.Text
      style={[{ fontSize, fontWeight: '600', fontFamily }, style]}
      {...props}
    ></Animated.Text>
  );
};
