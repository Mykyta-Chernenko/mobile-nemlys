import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { Image, useTheme } from '@rneui/themed';
import { logErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@app/types/navigation';
import { SecondaryButton } from '../buttons/SecondaryButton';

export default function () {
  const { theme } = useTheme();
  const [dateCount, setDateCount] = useState(0);

  const navigation = useNavigation<MainNavigationProp>();

  useEffect(() => {
    const f = async () => {
      const { error, count } = await supabase
        .from('date')
        .select('*', { count: 'exact' })
        .eq('active', false);
      if (error) {
        logErrors(error);
        return;
      }
      setDateCount(count || 0);
    };
    void f();
  }, []);
  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.black,
      }}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <ScrollView
          contentContainerStyle={{
            marginTop: '10%',
            flexGrow: 1,
            paddingHorizontal: 15,
            justifyContent: 'space-around',
            width: '100%',
          }}
        >
          <View style={{ width: '100%', height: '50%' }}>
            <Image
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: 300,
              }}
              resizeMode="contain"
              source={require('../../../assets/images/new_level.png')}
            >
              <FontText h1 style={{ color: theme.colors.white }}>
                {i18n.t('level')} {dateCount + 1}
              </FontText>
              <FontText style={{ color: theme.colors.white }}>
                {i18n.t('date.new_level.reached')}
              </FontText>
            </Image>
          </View>
          <View style={{ alignItems: 'center' }}>
            <FontText h1 style={{ color: theme.colors.white }}>
              {i18n.t('date.new_level.title_first')}
            </FontText>
            <FontText h1 style={{ color: theme.colors.primary }}>
              {i18n.t('date.new_level.title_second')}
            </FontText>
          </View>
          <SecondaryButton
            buttonStyle={{ width: '100%' }}
            onPress={() => {
              navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
            }}
            title={i18n.t('date.new_level.home')}
          ></SecondaryButton>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
