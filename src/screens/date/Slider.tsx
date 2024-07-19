// components/ImageSlider.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface ImageSliderProps {
  data: any[];
  renderItem: ({ index }: { index: number }) => JSX.Element;
  onScrollEnd: (index: number) => void;
  width: number;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ data, renderItem, onScrollEnd, width }) => {
  const [index, setIndex] = useState(0);
  const translateX = useSharedValue(0);
  const sliderWidth = width;

  useEffect(() => {
    onScrollEnd(index);
  }, [index, onScrollEnd]);

  const handleGesture = (event: PanGestureHandlerGestureEvent) => {
    const { translationX, state } = event.nativeEvent;
    if (translationX > width / 2 && index > 0) {
      const newIndex = index - 1;
      setIndex(newIndex);
      translateX.value = withSpring(-sliderWidth * newIndex);
    } else if (translationX < -(width / 2) && index < data.length - 1) {
      const newIndex = index + 1;
      setIndex(newIndex);
      translateX.value = withSpring(-sliderWidth * newIndex);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value + width }],
    };
  });

  const handleNext = () => {
    if (index < data.length - 1) {
      setIndex(index + 1);
      translateX.value = withSpring(-sliderWidth * (index + 1));
    }
  };

  const handlePrev = () => {
    if (index > 0) {
      setIndex(index - 1);
      translateX.value = withSpring(-sliderWidth * (index - 1));
    }
  };

  return (
    <View style={[styles.container, { width: sliderWidth, height: '100%' }]}>
      <PanGestureHandler onGestureEvent={handleGesture}>
        <Animated.View
          style={[
            styles.slider,
            animatedStyle,
            { width: sliderWidth * data.length, height: '100%' },
          ]}
        >
          {data.map((_, idx) => (
            <View key={idx} style={{ width: sliderWidth, height: '100%' }}>
              {renderItem({ index: idx })}
              <View style={styles.buttons}>
                <Button title="Previous" onPress={handlePrev} disabled={index === 0} />
                <Button title="Next" onPress={handleNext} disabled={index === data.length - 1} />
              </View>
            </View>
          ))}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    flexDirection: 'row',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
});

export default ImageSlider;
