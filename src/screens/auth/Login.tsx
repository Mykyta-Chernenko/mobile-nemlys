import React, { useContext, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '@app/api/initSupabase';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import { i18n } from '@app/localization/i18n';
import { ANON_USER, AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '@app/components/utils/FontText';
import { logErrorsWithMessage } from '@app/utils/errors';
import { localAnalytics } from '@app/utils/analytics';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { handleUserAfterSignUp } from './Register';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import StyledInput from '@app/components/utils/StyledInput';
import { OAuth } from '@app/components/auth/OAuth';

WebBrowser.maybeCompleteAuthSession();
// new comment
export default function ({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  const [isContinueWithEmail, setIsContinueWithEmail] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const passwordRef = useRef(null) as any;
  const auth = useContext(AuthContext);
  async function login() {
    setLoading(true);
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });
    if (error) {
      const {
        data: { user },
        error: error2,
      } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
      });
      if (error2) {
        if (error2.message.includes('User already registered')) {
          alert(i18n.t('login_invalid_username'));
        } else if (error2.message.includes('Password should be at least 6 characters')) {
          alert(i18n.t('login_password_is_too_short'));
        } else if (error2.message.includes('Signup requires a valid password')) {
          alert(i18n.t('login_password_is_incorrect'));
        } else if (error2.message.includes('Unable to validate email address: invalid format')) {
          alert(i18n.t('login_email_is_incorrect'));
        } else {
          logErrorsWithMessage(error2, error2.message);
        }
      } else if (!user) {
        logErrorsWithMessage(new Error('No user after signUp call'), undefined);
        return;
      } else {
        await handleUserAfterSignUp('email')(user);
        auth.setIsSignedIn?.(true);
        auth.setUserId?.(user.id);
      }
    } else if (!error && !user) {
      alert(i18n.t('login_check_email_for_login_link'));
    } else {
      auth.setIsSignedIn?.(true);
      auth.setUserId?.(user!.id);
    }
    setLoading(false);
  }

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
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 15,
            }}
          >
            <GoBackButton
              theme="light"
              onPress={() => {
                void localAnalytics().logEvent('LoginGoBack', {
                  screen: 'Login',
                  action: 'Login pressed go back button',
                  userId: ANON_USER,
                });
                navigation.navigate('Welcome');
              }}
            ></GoBackButton>
            <View
              style={{
                marginTop: '30%',
                marginBottom: '10%',
                justifyContent: 'space-around',
                flex: 1,
              }}
            >
              <View
                style={{
                  marginBottom: '2%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image
                  resizeMode="contain"
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  source={require('../../../assets/images/white_icon.png')}
                />
                <FontText
                  style={{
                    textAlign: 'center',
                    marginTop: 10,
                  }}
                  h1
                >
                  {i18n.t('login_2_title')}
                </FontText>
              </View>

              {!isContinueWithEmail ? (
                <View
                  style={{
                    paddingHorizontal: 15,
                    marginBottom: 10,
                  }}
                >
                  <OAuth setLoading={setLoading} handleUser={handleUserAfterSignUp} />
                  <SecondaryButton
                    title={i18n.t('login_button_default')}
                    buttonStyle={{
                      marginTop: 10,
                    }}
                    disabled={loading}
                    onPress={() => {
                      void localAnalytics().logEvent('LoginInitiated', {
                        screen: 'Login',
                        action: 'Initiated',
                        userId: ANON_USER,
                        provider: 'email',
                      });
                      setIsContinueWithEmail(true);
                    }}
                  ></SecondaryButton>
                </View>
              ) : (
                <View>
                  <View>
                    <StyledInput
                      placeholder={i18n.t('email_placeholder')}
                      value={email}
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      keyboardType="email-address"
                      returnKeyType="next"
                      onChangeText={(text) => setEmail(text)}
                      onSubmitEditing={() => passwordRef.current?.focus()}
                    />
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <StyledInput
                      placeholder={i18n.t('password_placeholder')}
                      value={password}
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect={false}
                      secureTextEntry={true}
                      returnKeyType="send"
                      onChangeText={(text) => setPassword(text)}
                      ref={passwordRef}
                      onSubmitEditing={() => !loading && void login()}
                    />
                  </View>

                  <PrimaryButton
                    buttonStyle={{ marginTop: 20 }}
                    title={loading ? i18n.t('loading') : i18n.t('continue')}
                    onPress={() => {
                      void login();
                    }}
                    disabled={loading || !email || !password}
                  />
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 20,
                      justifyContent: 'center',
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        void localAnalytics().logEvent('LoginForgetPasswordClicked', {
                          screen: 'Login',
                          action: 'Forget password clicked',
                          userId: ANON_USER,
                        });
                      }}
                    >
                      <FontText style={{ fontWeight: 'bold' }}>
                        {i18n.t('login_forgot_password_link')}
                      </FontText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
