import React from 'react';
import { TouchableOpacity } from 'react-native';
import LoveNoteIcon from '@app/icons/love_note';
import { useTheme } from '@rneui/themed';
import { localAnalytics } from '@app/utils/analytics';
import { MainNavigationProp } from '@app/types/navigation';
import { useNavigation } from '@react-navigation/native';
export const LoveNoteButton = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<MainNavigationProp>();

  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.black,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onPress={() => {
        localAnalytics().logEvent('LoveNoteButtonPressed', {
          screen: 'LoveNoteButton',
          action: 'Pressed',
        });
        navigation.navigate('LoveNote', { refreshTimeStamp: new Date().toISOString() });
      }}
    >
      <LoveNoteIcon />
    </TouchableOpacity>
  );
};
