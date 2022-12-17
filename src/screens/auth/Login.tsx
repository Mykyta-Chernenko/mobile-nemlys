import React, { useContext, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, ScrollView, TouchableOpacity, View } from 'react-native';
import { supabase } from '@app/api/initSupabase';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Text, useTheme } from '@rneui/themed';
import { GoogleOAuth } from '@app/components/auth/GoogleOAuth';
import * as WebBrowser from 'expo-web-browser';
import { i18n } from '@app/localization/i18n';
import { SupabaseUser } from '@app/types/api';
import { AuthContext } from '@app/provider/AuthProvider';
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
    <KeyboardAvoidingView behavior="padding" style={{ flexGrow: 1 }}>
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
            height: 250,
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
          <Text
            style={{
              textAlign: 'center',
              marginBottom: 10,
              fontWeight: 'bold',
            }}
            h3
          >
            {i18n.t('login.title')}
          </Text>
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
          <Text
            style={{
              marginTop: 20,
              color: theme.colors.grey3,
              textAlign: 'center',
            }}
          >
            {i18n.t('or')}
          </Text>
          <GoogleOAuth handleUser={checkUserExists} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 15,
              justifyContent: 'center',
            }}
          >
            <Text>{i18n.t('login.register.pretext')}</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Welcome');
              }}
            >
              <Text
                style={{
                  marginLeft: 5,
                  fontWeight: 'bold',
                }}
              >
                {i18n.t('login.register.link')}
              </Text>
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
              <Text style={{ fontWeight: 'bold' }}> {i18n.t('login.forgot_password.link')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
