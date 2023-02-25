import { i18n } from '@app/localization/i18n';
import { useTheme } from '@react-navigation/native';
import React, { Ref, useRef } from 'react';
import { Platform, TextInput, TextInputProps } from 'react-native';

const StyledTextInput = React.forwardRef((props: TextInputProps, ref?: Ref<any>) => {
  useRef();
  const theme = useTheme();
  const { style, ...otherProps } = props;
  return (
    <TextInput
      multiline={Platform.OS === 'ios'} // true is needed on IPhone so that the placeholder is at the top, but it breaks the return button for Adnroid
      placeholder={i18n.t('input_here')}
      style={[
        {
          height: 200,
          textAlignVertical: 'top',
          borderColor: theme.colors.primary,
          backgroundColor: 'white',
          borderWidth: 1,
          padding: 10,
        },
        style,
      ]}
      ref={ref}
      returnKeyType="done"
      returnKeyLabel="done"
      {...otherProps}
    />
  );
});

export default StyledTextInput;
