import React from 'react';
import { SecondaryButton } from './SecondaryButton';
import { ButtonProps, useTheme } from '@rneui/themed';
import { FontText, getFontSizeForScreen } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';

export const SkipButton = ({ ...props }: ButtonProps) => {
  const { theme: styleTheme } = useTheme();

  return (
    <SecondaryButton
      {...props}
      buttonStyle={{
        height: getFontSizeForScreen('h2') * 1.1,
        borderRadius: 40,
        backgroundColor: styleTheme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <FontText tiny>{i18n.t('skip')}</FontText>
    </SecondaryButton>
  );
};
