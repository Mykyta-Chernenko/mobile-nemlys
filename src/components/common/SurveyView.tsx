import React from 'react';
import { ImageBackground, ScrollView, View } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { Progress } from '@app/components/utils/Progress';
import { Loading } from '../utils/Loading';
import { FontText } from '../utils/FontText';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
export default function (props: {
  loading: boolean;
  title: string;
  progress: number;
  progressText: string;
  showButton: boolean;
  buttonText?: string;
  onPress: (() => void) | undefined;
  onBackPress: () => void;
  image?: string;
  children?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <ImageBackground
      style={{
        flexGrow: 1,
      }}
      source={require('../../../assets/images/gradient_light.png')}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          {props.loading ? (
            <Loading></Loading>
          ) : (
            <>
              <View style={{ flexGrow: 1, marginBottom: -insets.bottom }}>
                <View
                  style={{
                    flexDirection: 'row',
                    paddingHorizontal: 15,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <GoBackButton onPress={props.onBackPress}></GoBackButton>
                  <Progress value={props.progress}></Progress>
                  <FontText>{props.progressText}</FontText>
                </View>
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 40,
                    flexGrow: 1,
                    marginTop: 30,
                    padding: 20,
                  }}
                >
                  <FontText
                    style={{
                      textAlign: 'left',
                      marginVertical: 25,
                    }}
                    h4
                  >
                    {props.title}
                  </FontText>
                  {props.children}
                </View>
              </View>
              {props.showButton && (
                <View>
                  <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginTop: 5 }}>
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
      </SafeAreaView>
    </ImageBackground>
  );
}
