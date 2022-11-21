import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, ScrollView, TouchableOpacity, View } from 'react-native';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Input, Text } from '@rneui/themed';
import * as WebBrowser from 'expo-web-browser';
import { i18n } from '@app/localization/i18n';
WebBrowser.maybeCompleteAuthSession();
export default function ({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Placement'>) {
  const [name, setName] = useState<string>('');
  const disabled = !!name;
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
            source={require('../../../../assets/images/welcome.png')}
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
            value={name}
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="next"
            onChangeText={(text) => setName(text)}
          />

          <Button
            title={i18n.t('welcome.button.default')}
            onPress={() => {
              navigation.navigate('PrePlacement');
            }}
            disabled={disabled}
          />
          {/* <Text>{i18n.t('welcome.pre_join_text')}</Text>
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
            <Text>{i18n.t('welcome.login.pretext')}</Text>
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
                {i18n.t('welcome.login.link')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
