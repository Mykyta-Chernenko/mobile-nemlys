import React, { useContext, useEffect, useState } from 'react';
import { ImageBackground, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useTheme } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { FontText } from '@app/components/utils/FontText';
import { Progress } from '@app/components/utils/Progress';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { KEYBOARD_BEHAVIOR, ONBOARDING_STEPS } from '@app/utils/constants';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { logSupaErrors } from '@app/utils/errors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { localAnalytics } from '@app/utils/analytics';
import { SafeAreaView } from 'react-native-safe-area-context';
import StyledInput from '@app/components/utils/StyledInput';
import { getNow } from '@app/utils/date';
import { logout } from '@app/utils/auth';
import { showName } from '@app/utils/strings';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'YourName'>) {
  const fromSettings = route.params?.fromSettings;
  const { theme } = useTheme();

  const [name, setName] = useState<string>('');
  const authContext = useContext(AuthContext);
  useEffect(() => {
    void (async () => {
      const user = await supabase.auth.getUser();
      const name: string = user['data']?.['user']?.['user_metadata']?.['name']?.split(' ')?.[0];
      if (name) {
        setName(name);
      } else {
        const { data, error } = await supabase
          .from('user_profile')
          .select('first_name')
          .eq('user_id', authContext.userId!)
          .single();
        if (error) {
          logSupaErrors(error);
          return;
        }
        localAnalytics().logEvent('YourNameLoaded', {
          screen: 'YourName',
          action: 'Loaded',
          userId: authContext.userId,
        });
        setName(showName(data.first_name));
      }
    })();
  }, []);

  const handlePress = async () => {
    const dateReponse = await supabase
      .from('user_profile')
      .update({ first_name: name, updated_at: getNow().toISOString() })
      .eq('user_id', authContext.userId!);
    if (dateReponse.error) {
      logSupaErrors(dateReponse.error);
      return;
    }
    void localAnalytics().logEvent('YourNameContinueClicked', {
      screen: 'YourName',
      action: 'ContinueClicked',
      userId: authContext.userId,
    });
    if (fromSettings) {
      navigation.navigate('Profile', { refreshTimeStamp: new Date().toISOString() });
    } else {
      navigation.navigate('PartnerName', { fromSettings: false });
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
                    if (fromSettings) {
                      navigation.navigate('Profile', {
                        refreshTimeStamp: new Date().toISOString(),
                      });
                    } else {
                      void logout();
                    }
                  }}
                ></GoBackButton>
                {!fromSettings && <Progress current={1} all={ONBOARDING_STEPS}></Progress>}
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
                  {i18n.t('onboarding_your_name_first')}
                  <FontText style={{ color: theme.colors.primary }} h1>
                    {i18n.t('onboarding_your_name_second')}
                  </FontText>
                  {i18n.t('onboarding_your_name_third')}
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
                    maxLength={15}
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
