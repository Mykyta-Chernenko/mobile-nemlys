import { i18n } from '@app/localization/i18n';
import { useTheme } from '@rneui/themed';

import React, { Ref, useRef } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { getFontSizeForScreen, REGULAR_FONT_FAMILY } from './FontText';

const StyledTextInput = React.forwardRef((props: TextInputProps, ref?: Ref<any>) => {
  useRef();
  const { theme } = useTheme();
  const { style, ...otherProps } = props;
  return (
    <TextInput
      multiline={true}
      placeholder={i18n.t('input_here')}
      style={[
        {
          textAlignVertical: 'top',
          borderColor: '#DDDDDD',
          backgroundColor: theme.colors.white,
          borderWidth: 1,
          paddingHorizontal: (getFontSizeForScreen('normal') * 3) / 3,
          borderRadius: 12,
          fontFamily: REGULAR_FONT_FAMILY,
          flex: 1,
          minHeight: getFontSizeForScreen('normal') * 3,
          paddingTop: (getFontSizeForScreen('normal') * 3) / 3,
          paddingBottom: (getFontSizeForScreen('normal') * 3) / 3,
          fontSize: getFontSizeForScreen('normal'),
        },
        style,
      ]}
      ref={ref}
      {...otherProps}
    />
  );
});

export default StyledTextInput;
