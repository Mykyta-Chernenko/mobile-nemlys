import React, { useContext, useEffect } from 'react';
import { View, Image } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import { GoBackButton } from '@app/components/buttons/GoBackButton';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'DateIsWithPartner'>) {
  const { job } = route.params;
  const { theme } = useTheme();

  // to set the color of status bar
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('dark'));
    return unsubscribeFocus;
  }, [navigation]);
  const authContext = useContext(AuthContext);
  const handleNext = (withPartner) => {
    localAnalytics().logEvent('DateStartIsWithPartner', {
      screen: 'Date',
      action: 'StartIsWithPartner',
      withPartner,
      userId: authContext.userId,
    });
    navigation.navigate('ConfigureDate', {
      job,
      withPartner,
      refreshTimeStamp: new Date().toISOString(),
    });
  };
  const handleWithPartner = () => {
    handleNext(true);
  };

  const handleAlone = () => {
    handleNext(false);
  };
  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.black,
      }}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <View style={{ padding: 20, flex: 1, justifyContent: 'space-around' }}>
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 15,
              alignItems: 'center',
              justifyContent: 'center',
              height: 32,
            }}
          >
            <GoBackButton
              theme="black"
              containerStyle={{ position: 'absolute', left: 0 }}
              onPress={() => {
                void localAnalytics().logEvent('DateIsWithPartnerGoBack', {
                  screen: 'DateIsWithPartner',
                  action: 'Go back pressed',
                  userId: authContext.userId,
                });
                navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
              }}
            ></GoBackButton>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Image
              style={{
                height: 250,
                width: '90%',
              }}
              resizeMode="contain"
              source={require('../../../assets/images/buddies_with_partner.png')}
            ></Image>
          </View>
          <View style={{ height: '30%' }}>
            <FontText
              h1
              style={{
                textAlign: 'center',
                color: theme.colors.white,
                flex: 1,
                flexWrap: 'wrap',
              }}
            >
              {i18n.t('date.with_partner.title_1')}
              <FontText h1 style={{ color: theme.colors.primary }}>
                {i18n.t('date.with_partner.title_2')}
              </FontText>
              {i18n.t('date.with_partner.title_3')}
            </FontText>
          </View>
          <View>
            <PrimaryButton
              buttonStyle={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              onPress={handleAlone}
              title={i18n.t('date.with_partner.alone')}
            ></PrimaryButton>
            <SecondaryButton
              containerStyle={{ marginTop: 10 }}
              buttonStyle={{ backgroundColor: theme.colors.white }}
              onPress={handleWithPartner}
              title={i18n.t('date.with_partner.with_partner')}
            ></SecondaryButton>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
