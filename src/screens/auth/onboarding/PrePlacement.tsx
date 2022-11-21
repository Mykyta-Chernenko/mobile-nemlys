import React from 'react';
import { Image, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearProgress, Text, useTheme } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'PrePlacement'>) {
  const { theme } = useTheme();
  const name = route.params.name;
  return (
    <KeyboardAvoidingView behavior="height" enabled style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: 'white',
        }}
      >
        <View
          style={{
            flex: 3,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '5%',
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
            {i18n.t('pre_placement.title', { name })}
          </Text>
          <Text
            style={{
              alignSelf: 'flex-start',
              marginBottom: 10,
            }}
          >
            {i18n.t('pre_placement.pretext')}
          </Text>
        </View>
        <View style={{ padding: 10, backgroundColor: theme.colors.background }}>
          <LinearProgress
            style={{
              width: '50%',
              marginHorizontal: '10%',
              marginVertical: 20,
              alignSelf: 'center',
              borderRadius: 5,
            }}
            value={0.2}
            variant="determinate"
            color={theme.colors.primary}
            trackColor={theme.colors.greyOutline}
            animation={false}
          />
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
                navigation.navigate('Placement');
              }}
              containerStyle={{ flexGrow: 40, marginHorizontal: 10 }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
