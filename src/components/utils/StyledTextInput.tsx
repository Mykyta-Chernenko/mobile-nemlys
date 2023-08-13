import { i18n } from '@app/localization/i18n';
import { useTheme } from '@rneui/themed';

import React, { Ref, useRef } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { REGULAR_FONT_FAMILY } from './FontText';

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
          borderColor: theme.colors.black,
          backgroundColor: theme.colors.white,
          borderWidth: 1,
          padding: 10,
          fontFamily: REGULAR_FONT_FAMILY,
        },
        style,
      ]}
      ref={ref}
      {...otherProps}
    />
  );
});

export default StyledTextInput;
