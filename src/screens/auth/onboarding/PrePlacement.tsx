import React, { useEffect, useRef } from 'react';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@rneui/themed';
import { ANON_USER } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';
import { View, Image, ImageBackground, Animated, Easing } from 'react-native';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'PrePlacement'>) {
  const { theme } = useTheme();
  const name = route.params.name;
  const progressValue = 0.1;
  const handlePressBack = () => {
    void localAnalytics().logEvent('PrePlacementGoBackClicked', {
      screen: 'PrePlacement',
      action: 'go back is clicked',
      userId: ANON_USER,
    });
    navigation.navigate('Welcome');
  };
  const handlePressNext = () => {
    void localAnalytics().logEvent('PrePlacementNextClicked', {
      screen: 'PrePlacement',
      action: 'Next is clicked',
      userId: ANON_USER,
    });
    navigation.navigate('Placement', {
      name,
      questionIndex: undefined,
      questions: undefined,
      userAnswers: [],
    });
  };
  const contentBlockHeight = useRef(new Animated.Value(0)).current;
  const firstTextOpacity = useRef(new Animated.Value(1)).current;
  const firstTextPosition = useRef(new Animated.Value(0)).current;
  const secondTextPosition = useRef(new Animated.Value(0)).current;
  const ButtonOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const blockTimeout = 400;
    const blockEffect = 300;

    const firstTextAppearEffect = 700;

    const firstTextDisappearTimeout = 800;
    const firstTextDisappear = 300;

    const secondTextAppearTimeout = 100;
    const secondTextAppearEffect = 700;

    const buttonAppearTimeout = 2000;
    const buttonAppearEffect = 700;
    const firstAnimation = () =>
      setTimeout(
        () =>
          Animated.timing(contentBlockHeight, {
            toValue: 1,
            duration: blockEffect,
            useNativeDriver: false,
          }).start(secondAnimation),
        blockTimeout,
      );
    const secondAnimation = () => {
      Animated.timing(firstTextPosition, {
        toValue: 1,
        duration: firstTextAppearEffect,
        useNativeDriver: false,
        easing: Easing.elastic(0.85),
      }).start(thirdAnimation);
    };
    const thirdAnimation = () => {
      setTimeout(() => {
        Animated.timing(firstTextOpacity, {
          toValue: 0,
          duration: firstTextDisappear,
          useNativeDriver: false,
        }).start(forthAnimation);
      }, firstTextDisappearTimeout);
    };
    const forthAnimation = () => {
      setTimeout(() => {
        Animated.timing(secondTextPosition, {
          toValue: 1,
          duration: secondTextAppearEffect,
          easing: Easing.elastic(0.85),
          useNativeDriver: false,
        }).start(fifthAnimation);
      }, secondTextAppearTimeout);
    };
    const fifthAnimation = () => {
      setTimeout(() => {
        Animated.timing(ButtonOpacity, {
          toValue: 1,
          duration: buttonAppearEffect,
          useNativeDriver: true,
        }).start();
      }, buttonAppearTimeout);
    };
    firstAnimation();
  });
  const insets = useSafeAreaInsets();
  return (
    <ImageBackground
      style={{
        flexGrow: 1,
      }}
      source={require('../../../../assets/splash.png')}
    >
      <SafeAreaView style={{ flexGrow: 1, width: '100%', justifyContent: 'space-between' }}>
        <View style={{ height: '50%' }}>
          <View>
            <View style={{ position: 'absolute', left: 15 }}>
              <GoBackButton onPress={handlePressBack}></GoBackButton>
            </View>
          </View>
          <View
            style={{
              marginBottom: 20,
              marginTop: '10%',
              height: '70%',
            }}
          >
            <Image
              resizeMode="contain"
              style={{
                height: '100%',
                width: '100%',
              }}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              source={require('../../../../assets/images/buddies.png')}
            />
          </View>
        </View>
        <Animated.View
          style={{
            marginBottom: -insets.bottom,
            height: contentBlockHeight.interpolate({
              inputRange: [0, 1],
              outputRange: ['5%', '50%'],
            }),
            backgroundColor: 'white',
            borderRadius: 40,
            paddingHorizontal: 15,
            justifyContent: 'space-between',
          }}
        >
          <Animated.View
            style={{
              margin: 15,
              position: 'absolute',
              marginTop: firstTextPosition.interpolate({
                inputRange: [0, 1],
                outputRange: ['150%', '15%'],
              }),
              opacity: firstTextOpacity,
            }}
          >
            <FontText h3>{i18n.t('pre_placement.first_text_hey', { name })}</FontText>
            <FontText h3 style={{ fontWeight: '600', marginTop: 5 }}>
              {i18n.t('pre_placement.first_text_start', { name })}
            </FontText>
          </Animated.View>
          <Animated.View
            style={{
              marginTop: secondTextPosition.interpolate({
                inputRange: [0, 1],
                outputRange: ['150%', '15%'],
              }),
            }}
          >
            <FontText h3>{i18n.t('pre_placement.second_text')}</FontText>
          </Animated.View>
          <Animated.View
            style={{
              opacity: ButtonOpacity,
              marginBottom: '20%',
            }}
          >
            <PrimaryButton
              title={i18n.t('pre_placement.ready')}
              onPress={handlePressNext}
            ></PrimaryButton>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
}
