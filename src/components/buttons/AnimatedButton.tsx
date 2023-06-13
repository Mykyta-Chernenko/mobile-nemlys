import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, PanResponder } from 'react-native';

interface AnimatedButtonProps {
  onPress: () => void;
  title: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ onPress, title }) => {
  const rotateZ = useRef(new Animated.Value(0)).current;
  const backgroundColor = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event) => {
        rotateZ.setValue(event.nativeEvent.locationX / 10);
        backgroundColor.setValue(event.nativeEvent.locationX / 100);
      },
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(rotateZ, {
            toValue: 0,
            useNativeDriver: false,
          }),
          Animated.timing(backgroundColor, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ]).start();
      },
    }),
  ).current;

  const animatedStyle = {
    backgroundColor: backgroundColor.interpolate({
      inputRange: [0, 1],
      outputRange: ['#2196F3', '#4CAF50'],
    }),
    transform: [
      { perspective: 400 },
      {
        rotateY: rotateZ.interpolate({
          inputRange: [-360, 360],
          outputRange: ['-360deg', '360deg'],
        }),
      },
    ],
  };

  const onButtonPress = () => {
    onPress();
  };

  return (
    <Animated.View style={[styles.button, animatedStyle]} {...panResponder.panHandlers}>
      <TouchableOpacity onPress={onButtonPress} style={styles.touchable}>
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 50,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  touchable: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: 18,
    color: '#FFF',
  },
});

export default AnimatedButton;
