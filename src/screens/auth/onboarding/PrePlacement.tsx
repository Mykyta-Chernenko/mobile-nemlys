import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text, useTheme } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { Progress } from '@app/components/utils/Progress';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'PrePlacement'>) {
  const { theme } = useTheme();
  const name = route.params.name;
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
          source={require('../../../../assets/images/pre_placement.png')}
        />
      </View>
      <View style={{ flexGrow: 1 }}>
        <Text
          style={{
            textAlign: 'center',
            marginBottom: 10,
            fontWeight: 'bold',
          }}
          h3
        >
          {i18n.t('pre_placement.title', { name })}
        </Text>
        <Text
          style={{
            alignSelf: 'flex-start',
            marginBottom: 10,
            color: theme.colors.grey3,
          }}
        >
          {i18n.t('pre_placement.pretext')}
        </Text>
      </View>
      <View>
        <Progress value={0.1}></Progress>
        <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
          <GoBackButton
            onPress={() => {
              navigation.navigate('Welcome');
            }}
            containerStyle={{ flexGrow: 1 }}
          ></GoBackButton>
          <PrimaryButton
            title={i18n.t('next')}
            onPress={() => {
              navigation.navigate('Placement', {
                name,
                questionIndex: undefined,
                questions: undefined,
                userAnswers: [],
              });
            }}
            containerStyle={{ flexGrow: 40, marginHorizontal: 10 }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
