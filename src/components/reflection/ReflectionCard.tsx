import React, { ReactNode, useRef } from 'react';
import { useTheme } from '@rneui/themed';
import { Animated, StyleProp, View, ViewStyle } from 'react-native';

export default function ({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  const mainCardTransform = [{ rotate: '1deg' }];
  const cardStyle: StyleProp<ViewStyle> = {
    zIndex: 100,
    flex: 1,
    marginVertical: '10%',
    backgroundColor: theme.colors.black,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    transform: mainCardTransform,
  };

  const backgroundCardProps = [
    {
      top: 0,
      right: 0,
      zIndex: 50,
      backgroundColor: theme.colors.primary,
      rotation: -15,
      opacity: 1,
      animatedValue: useRef(new Animated.Value(0)).current,
    },
    {
      zIndex: 20,
      top: 0,
      right: 0,
      backgroundColor: theme.colors.warning,
      opacity: 1,
      rotation: 10,
      animatedValue: useRef(new Animated.Value(0)).current,
    },

    {
      top: 0,
      right: -5,
      zIndex: 10,
      backgroundColor: theme.colors.primary,
      opacity: 0.5,
      rotation: -15,
      animatedValue: useRef(new Animated.Value(0)).current,
    },
  ];

  return (
    <>
      <View style={cardStyle}>{children}</View>
      {backgroundCardProps.map((card, i) => (
        <View
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
              transform: [{ rotate: `${(-1 * card.rotation) / 4}deg` }],
            },
          ]}
        ></View>
      ))}
    </>
  );
}
