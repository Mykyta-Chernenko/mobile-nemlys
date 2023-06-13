import {
  useSharedValue,
  useDerivedValue,
  withSpring,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';

export const useFollowPointer = (value) => {
  const position = useSharedValue(0);
  const config = {
    damping: 10,
    mass: 1,
    stiffness: 100,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  };

  position.value = withSpring(value.value, config);

  return position;
};

export const useSnapProgress = (value, gestureState, isBack, point) => {
  const offset = useSharedValue(0);
  const position = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      offset.value = position.value;
    },
    onActive: (event) => {
      position.value = event.translationX + offset.value;
    },
    onEnd: (event) => {
      position.value = withSpring(point, {
        damping: 26,
        mass: 1,
        stiffness: 170,
        overshootClamping: false,
        restSpeedThreshold: 0.01,
        restDisplacementThreshold: 0.01,
      });
      isBack.value = point;
    },
  });

  useDerivedValue(() => {
    position.value = withSpring(value.value, {
      damping: 26,
      mass: 1,
      stiffness: 170,
      overshootClamping: false,
      restSpeedThreshold: 0.01,
      restDisplacementThreshold: 0.01,
    });
  });

  return {
    position,
    gestureHandler,
  };
};
