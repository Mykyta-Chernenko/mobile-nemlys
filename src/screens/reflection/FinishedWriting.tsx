import React, { useEffect } from 'react';
import { View, Image } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'FinishedWriting'>) {
  const { theme } = useTheme();

  // to set the color of status bar
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('dark'));
    return unsubscribeFocus;
  }, [navigation]);

  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.black,
      }}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <View style={{ padding: 20, flex: 1, justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Image
              style={{
                height: 250,
                width: '90%',
              }}
              resizeMode="contain"
              source={require('../../../assets/images/buddies_analyzing.png')}
            ></Image>
          </View>
          <View style={{ height: '20%' }}>
            <FontText h1 style={{ textAlign: 'center', color: theme.colors.white }}>
              <FontText h1 style={{ color: theme.colors.primary }}>
                {i18n.t('reflection_finished_writing_title_1')}
              </FontText>
              {i18n.t('reflection_finished_writing_title_2')}
            </FontText>
          </View>

          <SecondaryButton
            buttonStyle={{ backgroundColor: theme.colors.white }}
            onPress={() => {
              navigation.navigate('ReflectionHome', { refreshTimeStamp: new Date().toISOString() });
            }}
            title={i18n.t('reflection_finished_writing_button')}
          ></SecondaryButton>
        </View>
      </SafeAreaView>
    </View>
  );
}
