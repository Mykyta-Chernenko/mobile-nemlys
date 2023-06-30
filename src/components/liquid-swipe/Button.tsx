import React from 'react';
import { Dimensions } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, interpolate, Extrapolate } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native';

const size = 50;

interface ButtonProps {
  progress: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
  onPress: () => void;
}

export default ({ progress, y, onPress }: ButtonProps) => {
  const { width } = Dimensions.get('window');

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 0.4],
      [width - size - 8, 0],
      Extrapolate.CLAMP,
    );
    const translateY = y.value - size / 2;
    const opacity = interpolate(progress.value, [0, 0.1], [1, 0], Extrapolate.CLAMP);
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: size,
      height: size,
      borderRadius: size / 2,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{ translateX }, { translateY }],
      opacity,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPress={onPress}>
        <Icon name="chevron-left" color="black" size={40} />
      </TouchableOpacity>
    </Animated.View>
  );
};
