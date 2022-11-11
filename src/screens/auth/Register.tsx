import React, { useRef, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from '@app/initSupabase';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EMAIL_CONFIRMED_PATH } from './EmailConfirmed';
import { Button, Input, Text } from '@rneui/themed';

export default function ({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Register'>) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const passwordRef = useRef(null) as any;

  async function register() {
    setLoading(true);
    const returnUrl = Linking.createURL(EMAIL_CONFIRMED_PATH);
    const data = await supabase.auth.signUp({
      email: email,
      password: password,
      options: { emailRedirectTo: returnUrl },
    });
    setLoading(false);
    console.log(data);
    if (!data.error && data?.data.user?.confirmation_sent_at) {
      alert('Check your email for the email confirmation link!');
    } else {
      alert(data.error?.message ?? 'Some unexpected error happened, try again');
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
          }}
        >
          <Image
            resizeMode="contain"
            style={{
              height: 220,
              width: 220,
            }}
            source={require('../../../assets/images/register.png') as ImageSourcePropType}
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
              alignSelf: 'center',
              marginVertical: 10,
              fontWeight: 'bold',
            }}
            h4
          >
            Register
          </Text>
          <Text>Email</Text>
          <Input
            containerStyle={{ marginTop: 10, paddingHorizontal: 0 }}
            placeholder="Enter your email"
            value={email}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef?.current?.focus()}
            onChangeText={(text) => setEmail(text)}
          />

          <Text>Password</Text>
          <Input
            containerStyle={{ marginTop: 10, paddingHorizontal: 0 }}
            placeholder="Enter your password"
            value={password}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            secureTextEntry={true}
            returnKeyType="next"
            // ref={passwordRef}
            // onSubmitEditing={() => buttonRef?.current?.focus()}
            onChangeText={(text) => setPassword(text)}
          />
          <Button
            title={loading ? 'Loading' : 'Create an account'}
            onPress={() => {
              void register();
            }}
            disabled={loading}
          />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 15,
              justifyContent: 'center',
            }}
          >
            <Text>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Login');
              }}
            >
              <Text
                style={{
                  marginLeft: 5,
                  fontWeight: 'bold',
                }}
              >
                Login here
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
