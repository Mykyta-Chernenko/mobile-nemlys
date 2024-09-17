import React from 'react';
import { TextProps } from '@rneui/themed';
import { TextStyle, Animated } from 'react-native';
import { getFontSizeForScreen } from '@app/components/utils/FontText';
export const REGULAR_FONT_FAMILY = 'Epilogue-Regular';
export const BOLD_FONT_FAMILY = 'Epilogue-Bold';
export const SEMIBOLD_FONT_FAMILY = 'Epilogue-SemiBold';
export const AnimatedFontText = ({
  style,
  h1,
  h2,
  h3,
  h4,
  small,
  ...props
}: TextProps & { small?: boolean }) => {
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
  else fontSize = getFontSizeForScreen('normal');
  return (
    <Animated.Text
      style={[{ fontSize, fontWeight: '600', fontFamily }, style]}
      {...props}
    ></Animated.Text>
  );
};
