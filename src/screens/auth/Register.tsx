import React, { useContext, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, TouchableOpacity, View } from 'react-native';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, useTheme } from '@rneui/themed';
import { OAuth } from '@app/components/auth/OAuth';
import { i18n } from '@app/localization/i18n';
import { supabase } from '@app/api/initSupabase';
import { SupabaseUser } from '@app/types/api';

import { ANON_USER, AuthContext } from '@app/provider/AuthProvider';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import { FontText } from '@app/components/utils/FontText';
import { logErrorsWithMessage, logErrorsWithMessageWithoutAlert } from '@app/utils/errors';
import { localAnalytics } from '@app/utils/analytics';
import StyledInput from '@app/components/utils/StyledInput';
import * as Localization from 'expo-localization';
import { getNow, sleep } from '@app/utils/date';
import { Mutex } from 'async-mutex';
export function handleUserAfterSignUp(provider: string): (user: SupabaseUser) => Promise<void> {
  const handleUserAfterMutex = new Mutex();
  return async (user: SupabaseUser) => {
    const release = await handleUserAfterMutex.acquire();
    try {
      void localAnalytics().logEvent('LoginFinished', {
        screen: 'Login',
        action: 'Finished',
        userId: user.id,
        provider,
      });

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { error, count } = await supabase
          .from('user_profile')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);
        if (error) {
          throw error;
        }
        const { error: error2, count: count2 } = await supabase
          .from('user_technical_details')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id);
        if (error2) {
          throw error2;
        }
        if (count && count2) {
          console.log(`User ${user.email || 'with this email'} already exists, just signing in`);
          void localAnalytics().logEvent('LoginAlreadyExists', {
            screen: 'Login',
            action: 'AlreadyExists',
            userId: user.id,
            provider,
          });
          const { error: localeError } = await supabase
            .from('user_technical_details')
            .update({ user_locale: Localization.locale, updated_at: getNow().toISOString() })
            .eq('user_id', user.id);
          if (localeError) {
            throw localeError;
          }
          return;
        } else {
          void localAnalytics().logEvent('LoginProfileDoesNotExistYet', {
            screen: 'Login',
            action: 'ProfileDoesNotExistYet',
            userId: user.id,
            provider,
          });
          await sleep(100);
        }
      }
    } finally {
      release();
    }
  };
}
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'Register'>) {
  const { theme } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordAgain, setPasswordAgain] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [continueWithEmail, setContinueWithEmail] = useState<boolean>(false);
  const disabled = loading || !email || !password || password !== passwordAgain;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const passwordRef = useRef(null) as any;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const passwordAgainRef = useRef(null) as any;
  const auth = useContext(AuthContext);
  const passwordsAreNotTheSame = password && passwordAgain && password != passwordAgain;
  useEffect(() => {
    void localAnalytics().logEvent('RegisterScreenOpened', {
      screen: 'Register',
      action: 'opened',
      userId: ANON_USER,
    });
  }, []);
  async function register() {
    void localAnalytics().logEvent('RegisterTypeEmailSubmitClicked', {
      screen: 'Register',
      action: 'Type email submit button clicked',
      userId: ANON_USER,
    });
    setLoading(true);
    try {
      const data = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      setLoading(false);
      if (data.error) {
        logErrorsWithMessage(data.error, data.error.message);
        return;
      } else if (!data.data.user) {
        logErrorsWithMessageWithoutAlert(new Error('No user after signUp call'));
        return;
      } else {
        await handleUserAfterSignUp('email')(data.data.user);
        auth.setIsSignedIn?.(true);
        auth.setUserId?.(data.data.user.id);
      }
    } catch (e: unknown) {
      await supabase.auth.signOut();
      throw e;
    }
  }

  return (
    <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} style={{ flexGrow: 1 }}>
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: 'white',
          paddingVertical: 25,
          paddingHorizontal: 15,
        }}
      >
        <View style={{ flexGrow: 1 }}>
          <FontText
            style={{
              textAlign: 'center',
              fontWeight: 'bold',
            }}
            h3
          >
            {i18n.t('register_title')}
          </FontText>
          {continueWithEmail ? (
            <View>
              <StyledInput
                containerStyle={{ marginTop: 10, paddingHorizontal: 0 }}
                placeholder={i18n.t('email_placeholder')}
                value={email}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef?.current?.focus()}
                onChangeText={(text) => setEmail(text)}
              />
              {passwordsAreNotTheSame && (
                <FontText style={{ color: theme.colors.grey3 }}>
                  {i18n.t('register_passwords_are_not_the_same')}
                </FontText>
              )}
              <StyledInput
                containerStyle={{ paddingHorizontal: 0 }}
                placeholder={i18n.t('password_placeholder')}
                value={password}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry={true}
                returnKeyType="next"
                ref={passwordRef}
                onSubmitEditing={() => passwordAgainRef?.current?.focus()}
                onChangeText={(text) => setPassword(text)}
              />
              <StyledInput
                containerStyle={{ paddingHorizontal: 0 }}
                placeholder={i18n.t('password_again_placeholder')}
                value={passwordAgain}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect={false}
                secureTextEntry={true}
                returnKeyType="done"
                ref={passwordAgainRef}
                onChangeText={(text) => setPasswordAgain(text)}
              />
              <Button
                title={loading ? i18n.t('loading') : i18n.t('register_register_button_default')}
                onPress={() => {
                  void register();
                }}
                disabled={disabled}
              />
            </View>
          ) : (
            <Button
              buttonStyle={{ marginTop: '3%' }}
              title={loading ? i18n.t('loading') : i18n.t('register_continue_with_email_default')}
              onPress={() => {
                setContinueWithEmail(true);
              }}
            />
          )}
          <FontText
            style={{
              marginTop: 20,
              color: theme.colors.grey3,
              textAlign: 'center',
            }}
          >
            {i18n.t('or')}
          </FontText>
          <OAuth handleUser={handleUserAfterSignUp} setLoading={setLoading} />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 15,
              justifyContent: 'center',
            }}
          >
            <FontText>{i18n.t('register_login_pretext')}</FontText>
            <TouchableOpacity
              onPress={() => {
                void localAnalytics().logEvent('RegisterGoToLogin', {
                  screen: 'Register',
                  action: 'Navigate to login',
                  userId: auth.userId,
                });
                navigation.navigate('Login');
              }}
            >
              <FontText
                style={{
                  marginLeft: 5,
                  fontWeight: 'bold',
                }}
              >
                {i18n.t('register_login_link')}
              </FontText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
