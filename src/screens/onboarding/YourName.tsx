import React, { useContext, useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { Input, useTheme } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { FontText } from '@app/components/utils/FontText';
import { Progress } from '@app/components/utils/Progress';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { logErrorsWithMessage } from '@app/utils/errors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { logout } from '../settings/Settings';
import { localAnalytics } from '@app/utils/analytics';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'YourName'>) {
  const { theme } = useTheme();

  const [name, setName] = useState<string>('');
  const authContext = useContext(AuthContext);

  const handlePress = async () => {
    const dateReponse = await supabase
      .from('user_profile')
      .update({ first_name: name, updated_at: new Date() })
      .eq('user_id', authContext.userId);
    if (dateReponse.error) {
      logErrorsWithMessage(dateReponse.error, dateReponse.error.message);
      return;
    }
    void localAnalytics().logEvent('YourNameContinueClicked', {
      screen: 'YourName',
      action: 'ContinueClicked',
      userId: authContext.userId,
    });
    navigation.navigate('PartnerName');
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
                    void localAnalytics().logEvent('YourNameBackClicked', {
                      screen: 'YourName',
                      action: 'BackClicked',
                      userId: authContext.userId,
                    });
                    void logout();
                  }}
                ></GoBackButton>
                <Progress current={1} all={6}></Progress>
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
                  {i18n.t('onboarding.your_name_first')}
                  <FontText style={{ color: theme.colors.primary }} h1>
                    {i18n.t('onboarding.your_name_second')}
                  </FontText>
                  {i18n.t('onboarding.your_name_third')}
                </FontText>
                <View style={{ marginTop: '5%' }}>
                  <Input
                    autoFocus={true}
                    value={name}
                    autoCapitalize="none"
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
