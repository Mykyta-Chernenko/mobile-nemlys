import React, { ReactNode, useRef } from 'react';
import { useTheme } from '@rneui/themed';
import { Animated, StyleProp, View, ViewStyle } from 'react-native';

export default function ({
  animated = false,
  children,
}: {
  animated: boolean;
  children: ReactNode;
}) {
  const { theme } = useTheme();
  const isAnimated = animated;
  const padding = 20;
  const mainCardValue = useRef(new Animated.Value(0)).current;
  const roratedTransform = {
    rotate: mainCardValue.interpolate({
      inputRange: [0, 50, 100],
      outputRange: ['-1deg', '1deg', '-1deg'],
    }) as unknown as string,
  };
  const mainCardTransform = isAnimated ? [roratedTransform] : [{ rotate: '0deg' }];
  const cardStyle: StyleProp<ViewStyle> = {
    zIndex: 100,
    flex: 1,
    marginHorizontal: padding,
    marginVertical: '10%',
    backgroundColor: theme.colors.white,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    transform: mainCardTransform,
  };
  isAnimated &&
    Animated.loop(
      Animated.timing(mainCardValue, {
        toValue: 100,
        duration: 30000,
        useNativeDriver: true,
      }),
    ).start();

  const backgroundCardProps = [
    {
      top: 0,
      right: -10,
      zIndex: 50,
      backgroundColor: theme.colors.white,
      opacity: 0.5,
      rotation: 2.46,
      animatedValue: useRef(new Animated.Value(0)).current,
    },
    {
      top: 0,
      right: 0,
      backgroundColor: theme.colors.white,
      opacity: 0.3,
      rotation: -2,
      animatedValue: useRef(new Animated.Value(0)).current,
    },
    {
      top: 0,
      right: -5,
      backgroundColor: 'rgba(245, 233, 235, 1)',
      opacity: 0.5,
      rotation: -4,
      animatedValue: useRef(new Animated.Value(0)).current,
    },
    {
      top: 0,
      right: 0,
      zIndex: 20,
      backgroundColor: theme.colors.error,
      opacity: 1,
      rotation: 5,
      animatedValue: useRef(new Animated.Value(0)).current,
    },
    {
      top: -10,
      right: 0,
      zIndex: 10,
      backgroundColor: theme.colors.primary,
      rotation: 1,
      opacity: 1,
      animatedValue: useRef(new Animated.Value(0)).current,
    },
  ];
  isAnimated &&
    backgroundCardProps.forEach((v) => {
      Animated.loop(
        Animated.timing(v.animatedValue, {
          toValue: 100,
          duration: 30000,
          useNativeDriver: true,
        }),
      ).start();
    });

  const CorrectView = isAnimated ? Animated.View : View;

  const interpolateCard = (card: typeof backgroundCardProps[number]) =>
    card.animatedValue.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [`${card.rotation}deg`, `${-card.rotation}deg`, `${card.rotation}deg`],
    });

  return (
    <>
      <CorrectView style={cardStyle}>{children}</CorrectView>
      {backgroundCardProps.map((card, i) => (
        <CorrectView
          key={i}
          style={[
            cardStyle,
            {
              position: 'absolute',
              opacity: card.opacity,
              left: 0,
              top: card.top,
              right: card.right,
              bottom: 0,
              zIndex: card.zIndex,
              backgroundColor: card.backgroundColor,
              transform: isAnimated
                ? [{ rotate: interpolateCard(card) as unknown as string }]
                : [{ rotate: `${(-1 * card.rotation) / 4}deg` }],
            },
          ]}
        ></CorrectView>
      ))}
    </>
  );
}
