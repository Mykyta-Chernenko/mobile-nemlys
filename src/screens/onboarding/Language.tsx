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
import { setAppLanguage } from '@app/theme/LanguageWrapper';
import { logSupaErrors } from '@app/utils/errors';
import StyledInput from '@app/components/utils/StyledInput';
import * as Localization from 'expo-localization';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'Language'>) {
  const fromSettings = route.params?.fromSettings;
  const { theme } = useTheme();
  const [language, setLanguage] = useState<string>(i18n.locale);
  const [requestedLanguage, setRequestedLanguage] = useState<string | undefined>(undefined);
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
    const languageData = await supabase
      .from('user_technical_details')
      .update({ language, requested_language: requestedLanguage, user_locale: Localization.locale })
      .eq('user_id', authContext.userId!)
      .single();
    if (languageData.error) {
      logSupaErrors(languageData.error);
      return;
    }
    await setAppLanguage(language);
    void localAnalytics().logEvent('LanguageContinueClicked', {
      screen: 'Language',
      action: 'ContinueClicked',
      language: language,
      requestedLanguage: requestedLanguage,
      userId: authContext.userId,
    });
    if (fromSettings) {
      navigation.navigate('Profile', { refreshTimeStamp: new Date().toISOString() });
    } else {
      navigation.navigate('DiscussWay');
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
                {i18n.t('onboarding.language.title')}
              </FontText>
              <ScrollView style={{ marginTop: '5%', flex: 1 }}>
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
                <View style={{ marginTop: 40 }}>
                  <FontText h4>{i18n.t('onboarding.language.new_language')}</FontText>
                  <StyledInput
                    containerStyle={{ marginTop: 10 }}
                    placeholder={i18n.t('onboarding.language.write_language')}
                    value={requestedLanguage}
                    autoCorrect={true}
                    onChangeText={(text) => setRequestedLanguage(text)}
                  ></StyledInput>
                </View>
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
