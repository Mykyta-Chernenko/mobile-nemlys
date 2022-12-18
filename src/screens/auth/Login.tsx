import React, { useContext, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, ScrollView, TouchableOpacity, View } from 'react-native';
import { supabase } from '@app/api/initSupabase';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, useTheme } from '@rneui/themed';
import { GoogleOAuth } from '@app/components/auth/GoogleOAuth';
import * as WebBrowser from 'expo-web-browser';
import { i18n } from '@app/localization/i18n';
import { SupabaseUser } from '@app/types/api';
import { AuthContext } from '@app/provider/AuthProvider';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import { FontText } from '@app/components/utils/FontText';
WebBrowser.maybeCompleteAuthSession();
export default function ({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  const { theme } = useTheme();
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
      email: email,
      password: password,
    });
    setLoading(false);
    if (error) {
      alert(error.message);
    } else if (!error && !user) {
      alert(i18n.t('login.check_email_for_login_link'));
    } else {
      auth.setIsSignedIn?.(true);
    }
  }
  // eslint-disable-next-line @typescript-eslint/require-await
  async function checkUserExists(user: SupabaseUser, exists: boolean): Promise<void> {
    if (!exists) {
      throw Error(`User with email ${user?.email ?? ''} does not exist in the system`);
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
        <View
          style={{
            marginBottom: 20,
            height: 200,
          }}
        >
          <Image
            resizeMode="contain"
            style={{
              height: '100%',
              width: '100%',
            }}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={require('../../../assets/images/login.png')}
          />
        </View>
        <View
          style={{
            paddingHorizontal: 15,
            marginBottom: 10,
          }}
        >
          <FontText
            style={{
              textAlign: 'center',
              marginBottom: 10,
              fontWeight: 'bold',
            }}
            h3
          >
            {i18n.t('login.title')}
          </FontText>
          <Input
            containerStyle={{ marginTop: 10, paddingHorizontal: 0 }}
            inputStyle={{ padding: 5 }}
            placeholder={i18n.t('email_placeholder')}
            value={email}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
            onChangeText={(text) => setEmail(text)}
            onSubmitEditing={() => passwordRef.current?.focus()}
            // onPressOut={Keyboard.dismiss}
          />

          <Input
            containerStyle={{ paddingHorizontal: 0 }}
            inputStyle={{ padding: 5 }}
            placeholder={i18n.t('password_placeholder')}
            value={password}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            secureTextEntry={true}
            returnKeyType="send"
            onChangeText={(text) => setPassword(text)}
            ref={passwordRef}
            onSubmitEditing={() => void login()}
          />
          <Button
            title={loading ? i18n.t('loading') : i18n.t('login.button.default')}
            onPress={() => {
              void login();
            }}
            disabled={loading}
          />
          <FontText
            style={{
              marginTop: 20,
              color: theme.colors.grey3,
              textAlign: 'center',
            }}
          >
            {i18n.t('or')}
          </FontText>
          <GoogleOAuth handleUser={checkUserExists} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 15,
              justifyContent: 'center',
            }}
          >
            <FontText>{i18n.t('login.register.pretext')}</FontText>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Welcome');
              }}
            >
              <FontText
                style={{
                  marginLeft: 5,
                  fontWeight: 'bold',
                }}
              >
                {i18n.t('login.register.link')}
              </FontText>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 10,
              justifyContent: 'center',
            }}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('ForgetPassword');
              }}
            >
              <FontText style={{ fontWeight: 'bold' }}>
                {' '}
                {i18n.t('login.forgot_password.link')}
              </FontText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
