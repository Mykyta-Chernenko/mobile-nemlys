import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, ScrollView, TouchableOpacity, View } from 'react-native';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Input, useTheme } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import { FontText } from '@app/components/utils/FontText';
import { ANON_USER } from '@app/provider/AuthProvider';
import { logEvent } from 'expo-firebase-analytics';

export default function ({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Welcome'>) {
  const { theme } = useTheme();
  const [name, setName] = useState<string>('');
  const disabled = name.length === 0;
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
            source={require('../../../../assets/images/welcome.png')}
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
            {i18n.t('welcome.title')}
          </FontText>
          <FontText
            style={{
              alignSelf: 'flex-start',
              marginBottom: 10,
              color: theme.colors.grey3,
            }}
          >
            {i18n.t('welcome.pretext')}
          </FontText>
          <Input
            containerStyle={{ marginTop: 10, paddingHorizontal: 0 }}
            inputStyle={{ padding: 5 }}
            placeholder={i18n.t('name_placeholder')}
            value={name}
            autoCapitalize="none"
            autoComplete="name"
            autoCorrect={false}
            keyboardType="default"
            returnKeyType="done"
            onChangeText={(text) => setName(text)}
          />

          <PrimaryButton
            title={i18n.t('welcome.button.default')}
            onPress={() => {
              void logEvent('WelcomeOnboardingTestClicked', {
                screen: 'Welcome',
                action: 'Onboarding test link clicked',
                userId: ANON_USER,
              });
              navigation.navigate('PrePlacement', {
                name,
              });
            }}
            disabled={disabled}
          />
          {/* <FontText>{i18n.t('welcome.pre_join_text')}</FontText>
          <Button
            title={i18n.t('welcome.join_button.default')}
            onPress={() => {
              navigation.navigate('JoinPartner');
            }}
            disabled={disabled}
          /> */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 15,
              justifyContent: 'center',
            }}
          >
            <FontText>{i18n.t('welcome.login.pretext')}</FontText>
            <TouchableOpacity
              onPress={() => {
                void logEvent('WelcomeLoginClicked', {
                  screen: 'Welcome',
                  action: 'Login link clicked',
                  userId: ANON_USER,
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
                {i18n.t('welcome.login.link')}
              </FontText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
