import React, { useContext, useCallback } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Image, ScrollView } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { useFocusEffect } from '@react-navigation/native';
import { MainStackParamList } from '@app/types/navigation';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '@app/components/utils/FontText';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { localAnalytics } from '@app/utils/analytics';
import { i18n } from '@app/localization/i18n';
import { CloseButton } from '@app/components/buttons/CloseButton';
import { logSupaErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { showName } from '@app/utils/strings';

const UPGRADE_IMAGE = require('../../../assets/images/v3_upgrade.png');

type V3UpgradeProps = NativeStackScreenProps<MainStackParamList, 'V3Upgrade'>;

export default function V3Upgrade({ navigation }: V3UpgradeProps) {
  const { theme } = useTheme();
  const { setMode } = useThemeMode();
  const authContext = useContext(AuthContext);

  useFocusEffect(
    useCallback(() => {
      setMode('dark');
      localAnalytics().logEvent('V3UpgradeOpened', {
        screen: 'V3Upgrade',
        action: 'Opened',
        userId: authContext.userId,
      });
      return () => setMode('light');
    }, []),
  );

  const handleClose = () => {
    localAnalytics().logEvent('V3UpgradeClosed', {
      screen: 'V3Upgrade',
      action: 'Closed',
      userId: authContext.userId,
    });
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
    }
  };

  const handleSwitchToNewVersion = async () => {
    localAnalytics().logEvent('V3UpgradeSwitchClicked', {
      screen: 'V3Upgrade',
      action: 'SwitchToNewVersion',
      userId: authContext.userId,
    });
    const profileResponse = await supabase
      .from('user_profile')
      .select('couple_id, first_name, partner_first_name')
      .eq('user_id', authContext.userId!)
      .single();

    if (profileResponse.error) {
      logSupaErrors(profileResponse.error);
      return;
    }

    const coupleResponse = await supabase
      .from('couple')
      .update({ switched_to_v3: true })
      .eq('id', profileResponse.data?.couple_id);

    if (coupleResponse.error) {
      logSupaErrors(coupleResponse.error);
      return;
    }

    navigation.navigate('OnboardingQuizIntro', {
      partnerName: showName(profileResponse.data.partner_first_name) || i18n.t('home_partner'),
      name: showName(profileResponse.data.first_name),
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.black, paddingHorizontal: 20 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <View />
        <CloseButton onPress={handleClose} theme="black" />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-around',
        }}
      >
        <View style={{ gap: 10 }}>
          <FontText small style={{ color: theme.colors.primary, textAlign: 'center' }}>
            {i18n.t('v3_upgrade_news')}
          </FontText>
          <FontText h2 style={{ color: theme.colors.white, textAlign: 'center', marginTop: 8 }}>
            {i18n.t('v3_upgrade_title')}
          </FontText>
          <FontText
            small
            style={{ color: theme.colors.grey5, textAlign: 'center', marginVertical: 12 }}
          >
            {i18n.t('v3_upgrade_text')}
          </FontText>
        </View>
        <View
          style={{
            justifyContent: 'flex-end',
          }}
        >
          <Image
            source={UPGRADE_IMAGE}
            style={{
              width: '100%',
              height: undefined,
              aspectRatio: 0.8,
              maxHeight: '80%',
              resizeMode: 'contain',
              alignSelf: 'center',
              marginBottom: -20,
              opacity: 0.98,
            }}
          />

          <SecondaryButton
            containerStyle={{ alignSelf: 'center', width: '100%' }}
            onPress={() => void handleSwitchToNewVersion()}
          >
            <FontText>{i18n.t('v3_upgrade_switch')}</FontText>
          </SecondaryButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
