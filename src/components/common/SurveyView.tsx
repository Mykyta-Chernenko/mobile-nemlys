import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { Text } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { Progress } from '@app/components/utils/Progress';
import { Loading } from '../utils/Loading';
export default function (props: {
  loading: boolean;
  title: string;
  progress: number;
  showButton: boolean;
  buttonText?: string;
  onPress: (() => void) | undefined;
  onBackPress: () => void;
  children?: React.ReactNode;
}) {
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
          marginBottom: 10,
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
          source={require('../../../assets/images/pre_placement.png')}
        />
      </View>
      {props.loading ? (
        <Loading></Loading>
      ) : (
        <>
          <View style={{ flexGrow: 1 }}>
            <View style={{ flexDirection: 'row' }}>
              <GoBackButton onPress={props.onBackPress}></GoBackButton>
              <Progress value={props.progress}></Progress>
            </View>
            <Text
              style={{
                textAlign: 'center',
                marginBottom: 10,
                fontWeight: 'bold',
              }}
              h4
            >
              {props.title}
            </Text>
            {props.children}
          </View>
          {props.showButton && (
            <View>
              <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
                <PrimaryButton
                  title={props.buttonText ?? i18n.t('next')}
                  onPress={props.onPress}
                  containerStyle={{ flexGrow: 40, marginHorizontal: 10 }}
                />
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
