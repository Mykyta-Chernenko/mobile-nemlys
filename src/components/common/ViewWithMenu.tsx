import React, { useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheet, Button, Header, Icon, useTheme } from '@rneui/themed';
import { TouchableOpacity } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { AUTH_STORAGE_KEY, supabase } from '@app/api/initSupabase';
import { SecondaryButton } from '../buttons/SecondaryButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Props {
  children: React.ReactNode;
}

export const ViewWithMenu = (props: Props) => {
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const { theme } = useTheme();

  const logout = async () => {
    await supabase.auth.signOut();
    // just to make sure in case something goes wrong
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };
  return (
    <SafeAreaProvider style={{ flexGrow: 1 }}>
      <Header
        backgroundColor="white"
        leftComponent={
          <TouchableOpacity onPress={() => setShowMenu(true)} style={{ paddingHorizontal: 10 }}>
            <Icon name="menu" color="black" size={30} />
          </TouchableOpacity>
        }
      />
      <BottomSheet
        modalProps={{}}
        isVisible={showMenu}
        onBackdropPress={() => setShowMenu(false)}
        containerStyle={{ padding: '5%' }}
        backdropStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
      >
        <Button color="error" onPress={() => void logout()} style={{ margin: '1%' }}>
          {i18n.t('logout')}
        </Button>
        <SecondaryButton
          type="outline"
          color={theme.colors.black}
          onPress={() => setShowMenu(false)}
          style={{ margin: '1%' }}
        >
          {i18n.t('close')}
        </SecondaryButton>
      </BottomSheet>
      {props.children}
    </SafeAreaProvider>
  );
};
