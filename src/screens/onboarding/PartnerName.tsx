import React, { useContext, useEffect, useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { FontText } from '@app/components/utils/FontText';
import { Progress } from '@app/components/utils/Progress';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { logErrorsWithMessage } from '@app/utils/errors';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import { SafeAreaView } from 'react-native-safe-area-context';
import StyledInput from '@app/components/utils/StyledInput';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'PartnerName'>) {
  const { theme } = useTheme();
  const [name, setName] = useState<string>('');
  const authContext = useContext(AuthContext);

  // to set the color of status bar
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation]);

  const handlePress = async () => {
    const dateReponse = await supabase
      .from('user_profile')
      .update({ partner_first_name: name, updated_at: new Date() })
      .eq('user_id', authContext.userId);
    if (dateReponse.error) {
      logErrorsWithMessage(dateReponse.error, dateReponse.error.message);
      return;
    }
    void localAnalytics().logEvent('PartnerNameContinueClicked', {
      screen: 'PartnerName',
      action: 'ContinueClicked',
      userId: authContext.userId,
    });
    navigation.navigate('Job');
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
          <ScrollView
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{
              flexGrow: 1,
            }}
          >
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
                    void localAnalytics().logEvent('PartnerNameBackClicked', {
                      screen: 'PartnerName',
                      action: 'BackClicked',
                      userId: authContext.userId,
                    });
                    navigation.navigate('YourName');
                  }}
                ></GoBackButton>
                <Progress current={2} all={5}></Progress>
              </View>
              <View
                style={{
                  flexGrow: 1,
                  marginTop: '15%',
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
                  {i18n.t('onboarding.partner_name_first')}
                  <FontText style={{ color: theme.colors.error }} h1>
                    {i18n.t('onboarding.partner_name_second')}
                  </FontText>
                  {i18n.t('onboarding.partner_name_third')}
                </FontText>
                <View style={{ marginTop: '5%' }}>
                  <StyledInput
                    autoFocus={true}
                    value={name}
                    autoCapitalize="words"
                    autoComplete="name-given"
                    autoCorrect={false}
                    keyboardType="default"
                    returnKeyType="send"
                    onChangeText={(text) => setName(text)}
                    onSubmitEditing={() => void handlePress()}
                  />
                </View>
              </View>
            </View>
            <View style={{ padding: 20 }}>
              <PrimaryButton
                disabled={!name}
                title={i18n.t('continue')}
                onPress={() => void handlePress()}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
