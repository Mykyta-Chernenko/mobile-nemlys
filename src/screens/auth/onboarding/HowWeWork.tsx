import React, { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckBox, Text, useTheme } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { GoBackButton } from '@app/components/buttons/GoBackButton';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'Placement'>) {
  const { theme } = useTheme();
  const [accepted, setAccepted] = useState(false);
  const disabled = !accepted;
  return (
    <ScrollView
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
          source={require('../../../../assets/images/how_we_work.png')}
        />
      </View>
      <View
        style={{
          backgroundColor: 'white',
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
          {i18n.t('how_we_work.title')}
        </Text>
        <View style={{ flexGrow: 1 }}>
          {['1', '2', '3', '4', '5', '6'].map((k) => (
            <Text
              style={{
                alignSelf: 'flex-start',
                color: theme.colors.grey2,
                lineHeight: 18,
                fontSize: 16,
                marginBottom: 7,
              }}
              key={k}
            >
              {i18n.t('how_we_work.content_' + k)}
            </Text>
          ))}
        </View>
        <CheckBox
          center
          size={26}
          title={i18n.t('how_we_work.accept_title')}
          checkedColor={theme.colors.primary}
          checked={accepted}
          onPress={() => setAccepted(!accepted)}
          containerStyle={{
            paddingHorizontal: 0,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginTop: 10 }}>
        <GoBackButton
          onPress={() => {
            navigation.navigate('Placement', route.params);
          }}
          containerStyle={{ flexGrow: 1 }}
        ></GoBackButton>
        <PrimaryButton
          title={i18n.t('finish')}
          onPress={() => {
            navigation.navigate('Register', route.params);
          }}
          disabled={disabled}
          containerStyle={{ flexGrow: 40, marginHorizontal: 10 }}
        />
      </View>
    </ScrollView>
  );
}
