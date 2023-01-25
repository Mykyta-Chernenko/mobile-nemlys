import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { FontText } from '@app/components/utils/FontText';
import { logEvent } from 'expo-firebase-analytics';
import { ANON_USER } from '@app/provider/AuthProvider';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'Placement'>) {
  const { theme } = useTheme();
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
          source={require('../../../../assets/images/how_we_work.png')}
        />
      </View>
      <View
        style={{
          backgroundColor: 'white',
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
          {i18n.t('how_we_work.title')}
        </FontText>
        <View style={{ flexGrow: 1 }}>
          {['1', '2', '3', '4', '5', '6'].map((k) => (
            <FontText
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
            </FontText>
          ))}
        </View>
      </View>
      <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginTop: 10 }}>
        <GoBackButton
          onPress={() => {
            void logEvent('HowWeWorkBackClicked', {
              screen: 'HowWeWork',
              action: 'Back is clicked',
              userId: ANON_USER,
              questionIndex: route.params.questionIndex,
            });
            navigation.navigate('Placement', route.params);
          }}
          containerStyle={{ flexGrow: 1 }}
        ></GoBackButton>
        <PrimaryButton
          title={i18n.t('finish')}
          onPress={() => {
            void logEvent('HowWeWorkFinishClicked', {
              screen: 'HowWeWork',
              action: 'Finish is clicked',
              userId: ANON_USER,
              questionIndex: route.params.questionIndex,
            });
            navigation.navigate('Register', route.params);
          }}
          containerStyle={{ flexGrow: 40, marginHorizontal: 10 }}
        />
      </View>
    </ScrollView>
  );
}
