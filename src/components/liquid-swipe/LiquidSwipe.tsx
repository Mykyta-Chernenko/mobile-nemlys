/* eslint-disable @typescript-eslint/restrict-plus-operands */
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
  useAnimatedGestureHandler,
  useDerivedValue,
  Extrapolate,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import {
  initialSideWidth,
  initialWaveCenter,
  sideWidth,
  waveHorRadius,
  waveHorRadiusBack,
  waveVertRadius,
} from './WeaveHelpers';
import Content from './Content';
import Button from './Button';
import Weave from './Weave';

export const assets = [
  require('../../../assets/images/buddys.png'),
  require('../../../assets/images/buddys.png'),
];

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default () => {
  const y = useSharedValue(initialWaveCenter);
  const translationX = useSharedValue(0);
  const velocityX = useSharedValue(0);
  const state = useSharedValue(State.UNDETERMINED);
  const isBack = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translationX.value;
      ctx.startY = y.value;
    },
    onActive: (event, ctx: any) => {
      translationX.value = ctx.startX - event.translationX;
      y.value = ctx.startY + event.translationY;
    },
    onEnd: (event) => {
      velocityX.value = event.velocityX;
      (state as any).value = event.state;
    },
  });
  const progress = useDerivedValue(() => {
    const res = interpolate(
      translationX.value,
      [0, width - initialSideWidth],
      [0, 1],
      Extrapolate.CLAMP,
    );
    return withSpring(res);
  });

  const centerY = y;
  const horRadius = useDerivedValue(() =>
    isBack.value ? waveHorRadiusBack(progress) : waveHorRadius(progress),
  );
  const vertRadius = useDerivedValue(() => waveVertRadius(progress));
  const sWidth = useDerivedValue(() => sideWidth(progress));

  const animatedStyle = useAnimatedStyle(() => {
    return {
      // transform: [{ translateX: withSpring(translationX.value) }],
    };
  });
  const onPress = () => {
    const config = {
      damping: 10,
      mass: 1,
      stiffness: 100,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    };
    translationX.value = withTiming(width, {
      duration: 700,
      easing: Easing.out(Easing.linear),
    });
  };

  return (
    <View style={styles.container}>
      <Content
        backgroundColor="rgba(251, 225, 245, 1)"
        source={assets[0]}
        title1="Online"
        title2="Dating"
        color="black"
      />
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
          <Weave
            centerYp={centerY}
            sideWidthp={sWidth}
            horRadiusp={horRadius}
            vertRadiusp={vertRadius}
          >
            <Content
              backgroundColor="rgba(204, 168, 232, 1)"
              source={assets[1]}
              title1="For"
              title2="Couples"
              color="white"
            />
          </Weave>
          <Button y={y} progress={progress} onPress={onPress} />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};
