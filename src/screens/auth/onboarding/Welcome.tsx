import React, { useRef, useState, useCallback, ReactNode, useEffect } from 'react';
import { View, ScrollView, Animated, Dimensions, Image, NativeSyntheticEvent } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useThemeMode } from '@rneui/themed';
import { AuthStackParamList } from '@app/types/navigation';
import { localAnalytics } from '@app/utils/analytics';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import {
  BACKGROUND_LIGHT_BEIGE_COLOR,
  QUESTION_COLOR,
  GAME_COLOR,
  ARTICLE_COLOR,
  CHECKUP_COLOR,
  TEST_COLOR,
  EXERCISE_COLOR,
} from '@app/utils/colors';
import ContentQuestionIcon from '@app/icons/content_question';
import ContentExerciseIcon from '@app/icons/content_exercise';
import ContentCheckupIcon from '@app/icons/content_checkup';
import ContentTestIcon from '@app/icons/content_test';
import ContentArticleIcon from '@app/icons/content_article';
import ContentGameIcon from '@app/icons/content_game';
import { NativeScrollEvent } from 'react-native';
import { isBigDevice, isSmallDevice } from '@app/utils/size';
import BlackSwoosh from '@app/icons/black_swoosh';
import { getContentImageFromId } from '@app/utils/content';
import { contentTypeBackground } from '@app/types/domain';
import { iconMap, LabelIcon, labelNameMap } from '@app/screens/menu/V3Home';
import { getContentTitleSize } from '@app/utils/strings';

const HOME_QUESTION_CORNER_IMAGE = require('../../../../assets/images/buddies_corner_transparent.png');
const WELCOME_ARROW_IMAGE_ROTATED = require('../../../../assets/images/welcome_arrow_rotated.png');
const WELCOME_ARROW_IMAGE = require('../../../../assets/images/welcome_arrow.png');
const REVIEW_LEFT = require('../../../../assets/images/review_left.png');
const REVIEW_RIGHT = require('../../../../assets/images/review_right.png');
const REVIEW_STARS = require('../../../../assets/images/review_stars.png');

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

function StarsBlock({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        width: '100%',
      }}
    >
      <Image source={REVIEW_LEFT} style={{ height: 104, width: 46, resizeMode: 'contain' }} />
      <View style={{ alignItems: 'center', marginHorizontal: 10 }}>{children}</View>
      <Image source={REVIEW_RIGHT} style={{ height: 104, width: 46, resizeMode: 'contain' }} />
    </View>
  );
}

export default function V3WelcomeSlider({ navigation }: Props) {
  const { theme } = useTheme();
  const { setMode } = useThemeMode();
  const { width } = Dimensions.get('window');
  const scrollRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      setMode('light');
      return () => setMode('light');
    }, []),
  );

  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollX.setValue(e.nativeEvent.contentOffset.x);
  }


  useEffect(() => {
    void localAnalytics().logEvent('WelcomeVisited', {
      screen: 'V3WelcomeSlider',
    });
  }, []);

  function goNext(index: number) {
    void localAnalytics().logEvent('V3WelcomeSliderNextClicked', {
      screen: 'V3WelcomeSlider',
      index,
    });
    if (index < 3) {
      setCurrentSlide(index);
      scrollRef.current?.scrollTo({ x: index * width, animated: false });
    } else {
      navigation.navigate('Login');
    }
  }

  const indicatorDots = Array.from({ length: 3 }, (_, i) => {
    const bg = i === currentSlide ? theme.colors.primary : theme.colors.grey3;
    return (
      <View
        key={i}
        style={{
          width: i === currentSlide ? 24 : 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: bg,
          marginHorizontal: 4,
        }}
      />
    );
  });

  const Card = ({
    color,
    icon,
    title,
    count,
    rotate,
    translateY,
  }: {
    color: string;
    icon: React.ReactNode;
    title: string;
    count: number;
    rotate?: string;
    translateY?: number;
  }) => (
    <View
      style={{
        flex: 1,
        backgroundColor: color,
        borderRadius: 16,
        minHeight: isBigDevice() ? 142 : 120,
        padding: 20,
        margin: 8,
        justifyContent: 'space-between',
        transform: [{ rotate: rotate ?? '0 deg' }, { translateY: translateY ?? 0 }],
      }}
    >
      <View style={{ flexDirection: 'column', gap: 8 }}>
        {icon}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontText style={{ color: theme.colors.white, fontSize: 16 }}>{title}</FontText>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: 40,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <FontText style={{ color: theme.colors.white, fontSize: 14 }}>{count}</FontText>
        </View>
      </View>
    </View>
  );

  const slides = [
    {
      key: 'slide1',
      render: () => (
        <View
          style={{
            flex: 1,

            paddingTop: 40,
            paddingHorizontal: 20,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View
              style={{
                width: width * 0.7,
                height: 145,
                marginLeft: 50,
                transform: [{ rotate: '-1.92deg' }],
                backgroundColor: '#1A052F',
                borderRadius: 16,
                marginBottom: 10,
                overflow: 'visible',
              }}
            >
              <BlackSwoosh
                width={26}
                height={26}
                style={{
                  position: 'absolute',
                  left: -40,
                  top: 15,
                }}
              />

              <Image
                source={WELCOME_ARROW_IMAGE}
                style={{
                  position: 'absolute',
                  left: -80,
                  top: 50,
                }}
                resizeMode="contain"
              />
              <View style={{ padding: 20 }}>
                <View style={{ gap: 10 }}>
                  <LabelIcon
                    label={labelNameMap(i18n)['question']}
                    color={contentTypeBackground['question']}
                    icon={iconMap['question']}
                  />
                  <FontText
                    style={{ color: theme.colors.white }}
                    {...getContentTitleSize(i18n.t('welcome_onboarding_slide1_question'))}
                  >
                    {i18n.t('welcome_onboarding_slide1_question')}
                  </FontText>
                </View>
              </View>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                }}
              >
                <Image
                  source={HOME_QUESTION_CORNER_IMAGE}
                  style={{ width: 101, height: 92 }}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View
              style={{
                width: width * 0.7,
                transform: [{ rotate: '1.19deg' }],
                backgroundColor: '#FFF',
                borderRadius: 16,
                padding: 6.5,
                marginBottom: 10,
                flexDirection: 'row',
                marginLeft: 80,
              }}
            >
              <View style={{ flex: 1, justifyContent: 'center', marginLeft: 10, gap: 5 }}>
                <LabelIcon
                  label={labelNameMap(i18n)['test']}
                  color={contentTypeBackground['test']}
                  icon={iconMap['test']}
                />
                <FontText style={{ marginVertical: 5 }}>{i18n.t('welcome_test_title')}</FontText>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 5,
                      backgroundColor: theme.colors.primary,
                      marginRight: 4,
                    }}
                  />
                  <FontText tiny style={{ color: theme.colors.grey3 }}>
                    {i18n.t('welcome_test_you_answered')}
                  </FontText>
                </View>
              </View>
              <View
                style={{
                  width: 76,
                  height: 102,
                  borderRadius: 8,
                  overflow: 'hidden',
                  backgroundColor: theme.colors.grey1,
                  position: 'relative',
                }}
              >
                <Image
                  source={getContentImageFromId(0)}
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
                  }}
                />
              </View>
            </View>

            <View
              style={{
                width: width * 0.7,
                transform: [{ rotate: '2.52deg' }],
                backgroundColor: '#FFF',
                borderRadius: 16,
                padding: 6.5,
                flexDirection: 'row',
              }}
            >
              <View style={{ flex: 1, justifyContent: 'center', marginLeft: 10, gap: 5 }}>
                <LabelIcon
                  label={labelNameMap(i18n)['game']}
                  color={contentTypeBackground['game']}
                  icon={iconMap['game']}
                />
                <FontText style={{ marginVertical: 5 }}>{i18n.t('welcome_game_title')}</FontText>
                <View
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 5, gap: 2 }}
                >
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 5,
                        backgroundColor: theme.colors.primary,
                        marginRight: 3,
                      }}
                    />
                    <View
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: 5,
                        backgroundColor: theme.colors.error,
                      }}
                    />
                  </View>
                  <FontText tiny style={{ color: theme.colors.grey3, flexWrap: 'wrap' }}>
                    {i18n.t('welcome_game_you_and_partner_answered')}
                  </FontText>
                </View>
              </View>
              <View
                style={{
                  width: 76,
                  height: 102,
                  borderRadius: 8,
                  overflow: 'hidden',
                  backgroundColor: theme.colors.grey1,
                  position: 'relative',
                }}
              >
                <Image
                  source={getContentImageFromId(1)}
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: 'cover',
                  }}
                />
              </View>
            </View>
          </View>
          <FontText h1 style={{ textAlign: 'center' }}>
            {i18n.t('welcome_grow_your_relationship_daily')}
          </FontText>
        </View>
      ),
    },
    {
      key: 'slide2',
      render: () => (
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              marginTop: 30,
              flex: 1,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 20,
              }}
            >
              <Card
                color={GAME_COLOR}
                icon={<ContentGameIcon width={24} height={24} />}
                title={i18n.t('explore_game_title')}
                count={139}
                rotate="5.5 deg"
                translateY={15}
              />
              <Card
                color={EXERCISE_COLOR}
                icon={<ContentExerciseIcon width={24} height={24} />}
                title={i18n.t('explore_practice_title')}
                count={196}
                rotate="-4 deg"
                translateY={-15}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 20,
              }}
            >
              <Card
                color={QUESTION_COLOR}
                icon={<ContentQuestionIcon width={24} height={24} />}
                title={i18n.t('explore_question_title')}
                count={1085}
                rotate="-5 deg"
                translateY={15}
              />
              <Card
                color={ARTICLE_COLOR}
                icon={<ContentArticleIcon width={24} height={24} />}
                title={i18n.t('explore_article_title')}
                count={74}
                rotate="2.25 deg"
                translateY={-15}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 20,
              }}
            >
              <Card
                color={TEST_COLOR}
                icon={<ContentTestIcon width={24} height={24} />}
                title={i18n.t('explore_test_title')}
                count={194}
                rotate="4.15 deg"
                translateY={15}
              />
              <Card
                color={CHECKUP_COLOR}
                icon={<ContentCheckupIcon width={24} height={24} />}
                title={i18n.t('explore_checkup_title')}
                count={124}
                rotate="-4.63 deg"
                translateY={-15}
              />
            </View>
            {!isSmallDevice() && (
              <Image style={{ marginTop: 5 }} source={WELCOME_ARROW_IMAGE_ROTATED} />
            )}
          </View>
          <FontText
            h1
            style={{
              textAlign: 'center',
              paddingHorizontal: 10,
            }}
          >
            {i18n.t('welcome_explore_1000_ways_to_connect')}
          </FontText>
        </View>
      ),
    },
    {
      key: 'slide3',
      render: () => (
        <View
          style={{
            width,
            alignItems: 'center',
            flex: 1,
            gap: 15,
            justifyContent: 'space-between',
            paddingHorizontal: 20,
          }}
        >
          <View style={{ flex: 1, justifyContent: 'center', gap: 30 }}>
            <StarsBlock>
              <FontText h3 style={{ textAlign: 'center' }}>
                {i18n.t('welcome_personalized_content')}
              </FontText>
            </StarsBlock>
            <StarsBlock>
              <FontText h3 style={{ textAlign: 'center' }}>
                {i18n.t('welcome_based_on_50_plus_researches')}
              </FontText>
            </StarsBlock>
            <StarsBlock>
              <>
                <FontText h3 style={{ textAlign: 'center' }}>
                  {i18n.t('welcome_couples_using_our_app', { coupleCount: '200 000' })}
                </FontText>
                <Image
                  source={REVIEW_STARS}
                  style={{ width: 115, height: 19, resizeMode: 'contain', marginTop: 10 }}
                />
              </>
            </StarsBlock>
          </View>
          <FontText
            h1
            style={{
              textAlign: 'center',
            }}
          >
            {i18n.t('welcome_nemlys_is_based_on_research')}
          </FontText>
        </View>
      ),
    },
  ];

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }} />
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}
      >
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={handleScroll}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            goNext(index);
          }}
        >
          {slides.map((slide) => (
            <View key={slide.key} style={{ width, justifyContent: 'center' }}>
              {slide.render()}
            </View>
          ))}
        </ScrollView>
        <View
          style={{
            marginTop: 20,
            marginBottom: 10,
            width: '100%',
            alignItems: 'center',
            backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
            paddingHorizontal: 20,
            gap: 20,
          }}
        >
          <View style={{ flexDirection: 'row' }}>{indicatorDots}</View>
          <PrimaryButton
            containerStyle={{ width: '100%' }}
            onPress={() => goNext(currentSlide + 1)}
          >
            {currentSlide < slides.length - 1 ? i18n.t('next') : i18n.t('welcome_get_started')}
          </PrimaryButton>
        </View>
      </SafeAreaView>
    </>
  );
}
