import React, { useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, ScrollView, TouchableOpacity, View } from 'react-native';
import { supabase } from '@app/api/initSupabase';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Text } from '@rneui/themed';
import { GoogleOAuth } from '@app/components/auth/GoogleOAuth';
import * as WebBrowser from 'expo-web-browser';
import { i18n } from '@app/localization/i18n';
WebBrowser.maybeCompleteAuthSession();
export default function ({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const passwordRef = useRef(null) as any;

  async function login() {
    setLoading(true);
    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (!error && !user) {
      setLoading(false);
      alert(i18n.t('login.check_email_for_login_link'));
    }
    if (error) {
      setLoading(false);
      alert(error.message);
    }
  }
  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          <Image
            resizeMode="contain"
            style={{
              height: 220,
              width: 220,
            }}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={require('../../../assets/images/login.png')}
          />
        </View>
        <View
          style={{
            flex: 3,
            paddingHorizontal: 20,
            paddingBottom: 20,
            backgroundColor: 'white',
          }}
        >
          <Text
            style={{
              alignSelf: 'flex-start',
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
          <GoogleOAuth />
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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 30,
              justifyContent: 'center',
            }}
          ></View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
