import React, { useContext, useEffect, useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { getFullLanguageByLocale, i18n, LANGUAGES } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { FontText } from '@app/components/utils/FontText';
import { Progress } from '@app/components/utils/Progress';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logSupaErrors } from '@app/utils/errors';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import Bulb from '@app/icons/bulb';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'CoupleLanguage'>) {
  const fromSettings = route.params?.fromSettings;
  const { theme } = useTheme();
  const [language, setLanguage] = useState<string>(route.params.language);
  const choices = LANGUAGES.map((l) => ({
    language: l,
    title: getFullLanguageByLocale(l),
  }));

  const authContext = useContext(AuthContext);

  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation]);

  const handlePress = async () => {
    void localAnalytics().logEvent('CoupleLanguageContinueClicked', {
      screen: 'CoupleLanguage',
      action: 'ContinueClicked',
      language: language,
      userId: authContext.userId,
    });
    const data = await supabase
      .from('user_profile')
      .select('couple_id')
      .eq('user_id', authContext.userId!)
      .single();
    if (data.error) {
      logSupaErrors(data.error);
      return;
    }
    const languageData = await supabase
      .from('couple')
      .update({
        language,
      })
      .eq('id', data.data.couple_id)
      .single();
    if (languageData.error) {
      logSupaErrors(languageData.error);
      return;
    }
    if (fromSettings) {
      navigation.navigate('Profile', { refreshTimeStamp: new Date().toISOString() });
    } else {
      navigation.navigate('OnboardingInviteCode', { fromSettings: false });
    }
  };
  return (
    <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} style={{ flexGrow: 1 }}>
      <ImageBackground
        style={{
          flexGrow: 1,
        }}
        source={require('../../../assets/images/onboarding_background.png')}
      >
        <SafeAreaView style={{ flexGrow: 1 }}>
          <View style={{ flexGrow: 1, padding: 20 }}>
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
                theme="light"
                containerStyle={{ position: 'absolute', left: 0 }}
                onPress={() => {
                  void localAnalytics().logEvent('LanguageBackClicked', {
                    screen: 'Language',
                    action: 'BackClicked',
                    userId: authContext.userId,
                  });
                  if (fromSettings) {
                    navigation.navigate('Profile', { refreshTimeStamp: new Date().toISOString() });
                  } else {
                    navigation.navigate('PartnerName', { fromSettings: false });
                  }
                }}
              ></GoBackButton>
              {!fromSettings && <Progress current={3} all={5}></Progress>}
            </View>
            <View
              style={{
                flexGrow: 1,
              }}
            >
              <FontText
                style={{
                  textAlign: 'left',
                }}
                h1
              ></FontText>
              <FontText
                style={{
                  textAlign: 'left',
                }}
                h1
              >
                {i18n.t('couple_language_title')}
              </FontText>
              <ScrollView style={{ marginTop: '5%', flex: 1 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    backgroundColor: theme.colors.grey2,
                    padding: 20,
                    borderRadius: 16,
                    marginBottom: 10,
                  }}
                >
                  <Bulb />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <FontText>{i18n.t('couple_language_hint')}</FontText>
                  </View>
                </View>
                {choices.map((c, i) => (
                  <TouchableOpacity
                    key={i}
                    style={{
                      marginTop: 10,
                      borderRadius: 20,
                      backgroundColor: theme.colors.white,
                      borderColor:
                        c.language === language ? theme.colors.black : theme.colors.white,
                      borderWidth: 1,
                      padding: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onPress={() => void setLanguage(c.language)}
                  >
                    <FontText style={{ marginLeft: 10 }}>{c.title}</FontText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={{ marginTop: '4%' }}>
              <PrimaryButton
                disabled={!language}
                title={i18n.t('continue')}
                onPress={() => void handlePress()}
              />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
