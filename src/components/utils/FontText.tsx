import React from 'react';
import { TextProps } from '@rneui/themed';
import { TextStyle, Text, Dimensions, PixelRatio } from 'react-native';

export const REGULAR_FONT_FAMILY = 'Epilogue-Regular';
export const BOLD_FONT_FAMILY = 'Epilogue-Bold';
export const SEMIBOLD_FONT_FAMILY = 'Epilogue-SemiBold';

type FontSize = 'normal' | 'tiny' | 'small' | 'h1' | 'h2' | 'h3' | 'h4';
type ScreenType = 's' | 'm' | 'l' | 'xl' | 'xxl';

const fontBySize = {
  s: { h1: 30, h2: 24, h3: 18, h4: 14, normal: 13, small: 11, tiny: 9 },
  m: { h1: 34, h2: 28, h3: 22, h4: 18, normal: 15, small: 13, tiny: 11 },
  l: { h1: 40, h2: 32, h3: 24, h4: 20, normal: 16, small: 14, tiny: 12 },
  xl: { h1: 50, h2: 40, h3: 30, h4: 26, normal: 18, small: 15, tiny: 13 },
  xxl: { h1: 72, h2: 58, h3: 44, h4: 34, normal: 24, small: 16, tiny: 14 },
};

const getScreenType = (): ScreenType => {
  const windowDimensions = Dimensions.get('window');
  const physicalWidth = PixelRatio.getPixelSizeForLayoutSize(windowDimensions.width);
  const physicalHeight = PixelRatio.getPixelSizeForLayoutSize(windowDimensions.height);
  const physicalScreenArea = physicalWidth * physicalHeight;

  if (physicalScreenArea > 4800000) return 'xxl';
  if (physicalScreenArea > 3400000) return 'xl';
  if (physicalScreenArea > 2400000) return 'l';
  if (physicalScreenArea > 1400000) return 'm';
  return 's';
};

export const getFontSizeForScreen = (size: FontSize): number => {
  const screenType = getScreenType();
  return fontBySize[screenType][size];
};

export const FontText = ({
  style,
  h1,
  h2,
  h3,
  h4,
  small,
  tiny,
  normal,
  ...props
}: TextProps & { small?: boolean; normal?: boolean; tiny?: boolean }) => {
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

  let fontSize: number;
  if (h1) fontSize = getFontSizeForScreen('h1');
  else if (h2) fontSize = getFontSizeForScreen('h2');
  else if (h3) fontSize = getFontSizeForScreen('h3');
  else if (h4) fontSize = getFontSizeForScreen('h4');
  else if (small) fontSize = getFontSizeForScreen('small');
  else if (tiny) fontSize = getFontSizeForScreen('tiny');
  else if (normal) fontSize = getFontSizeForScreen('normal');
  else fontSize = getFontSizeForScreen('normal');

  return <Text style={[{ fontSize, fontWeight: '600', fontFamily }, style]} {...props} />;
};
