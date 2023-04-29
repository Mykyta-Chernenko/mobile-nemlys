import React from 'react';
import { TextProps, Text } from '@rneui/themed';
export const REGULAR_FONT_FAMILY = 'NunitoSans_400Regular';
export const BOLD_FONT_FAMILY = 'NunitoSans_700Bold';
export const SEMIBOLD_FONT_FAMILY = 'NunitoSans_600SemiBold';
export const FontText = (props: TextProps) => {
  return <Text style={[props.style]} {...props}></Text>;
};
