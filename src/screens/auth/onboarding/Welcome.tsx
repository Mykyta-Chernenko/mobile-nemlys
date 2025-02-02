import React, { useEffect, useRef, useState } from 'react';
import { View, ImageBackground, ScrollView, Dimensions, Animated, Image } from 'react-native';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { localAnalytics } from '@app/utils/analytics';
import { useTheme, useThemeMode } from '@rneui/themed';
import { isSmallDevice } from '@app/utils/size';

const ONBOARDING_BACKGROUND_IMAGE = require('../../../../assets/images/onboarding_background.png');
const BUDDYS_IMAGE = require('../../../../assets/images/buddys.png');

type Slide = {
  id: number;
  title: string;
  subtitle?: string;
};

const getSlides = (i18n: { t: (key: string) => string }): Slide[] => [
  {
    id: 1,
    title: i18n.t('grow_your_relationship_daily'),
  },
  {
    id: 2,
    title: i18n.t('get_personalised_science_based_plan'),
  },
  {
    id: 3,
    title: i18n.t('explore_1000_ways_to_connect_with_partner'),
  },
];

const { width } = Dimensions.get('window');

export default function WelcomeScreen({
  navigation,
  route,
}: NativeStackScreenProps<AuthStackParamList, 'Welcome'>) {
  const { theme } = useTheme();
  const { setMode } = useThemeMode();
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const slides = getSlides(i18n);
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation, setMode]);

  useEffect(() => {
    void localAnalytics().logEvent('WelcomeVisited', {
      screen: 'Welcome',
      action: 'Visited Welcome screen',
      userId: 'ANON_USER',
    });
  }, []);

  const handleNext = () => {
    void localAnalytics().logEvent('WelcomeNextClicked', {
      screen: 'Welcome',
      action: 'Clicked on next on Welcome',
      userId: 'ANON_USER',
    });
    if (currentSlide < slides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({ x: nextSlide * width, animated: true });
    } else {
      navigation.navigate('Login');
    }
  };

  const renderProgressBar = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginVertical: 20,
        }}
      >
        {slides.map((_, index) => (
          <View
            key={index}
            style={{
              height: 8,
              width: currentSlide === index ? 24 : 8,
              borderRadius: 4,
              backgroundColor: currentSlide === index ? theme.colors.primary : '#C4C4C4',
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <ImageBackground
      style={{
        flexGrow: 1,
        width: '100%',
      }}
      source={ONBOARDING_BACKGROUND_IMAGE}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Image
          style={{
            marginTop: isSmallDevice() ? -120 : 0,
            marginBottom: isSmallDevice() ? -120 : 0,
            resizeMode: 'contain',
            width: '100%',
          }}
          source={BUDDYS_IMAGE}
        />
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={16}
          contentContainerStyle={{ flexGrow: 1 }}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentSlide(index);
          }}
        >
          {slides.map((slide) => (
            <View
              key={slide.id}
              style={{
                width: width,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
              }}
            >
              <FontText
                style={{
                  textAlign: 'center',
                  marginBottom: 20,
                }}
                h2
              >
                {slide.title}
              </FontText>
            </View>
          ))}
        </ScrollView>
        {renderProgressBar()}
        <PrimaryButton
          buttonStyle={{ marginHorizontal: 20, marginBottom: 30 }}
          title={i18n.t('next')}
          onPress={handleNext}
        />
      </ScrollView>
    </ImageBackground>
  );
}
