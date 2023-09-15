import { useTheme } from '@rneui/themed';
import React, { useRef, useEffect } from 'react';
import { Text, Animated } from 'react-native';
import OrangeArrowDown from '@app/icons/orange_arrow_down';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const FakeRecordingButtonTolltip = ({ text, onPress }: { text: string; onPress: () => void }) => {
  const { theme } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false,
      }),
    ]).start();
  }, [fadeAnim, translateY]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: -58,
          bottom: 90,
          width: 186,
          backgroundColor: theme.colors.warning,
          borderRadius: 20, // Half of height to get an ellipse shape
          justifyContent: 'center',
          alignItems: 'center',
        },
        { opacity: fadeAnim, transform: [{ translateY }] },
      ]}
    >
      <TouchableWithoutFeedback onPress={onPress}>
        <Text
          style={{
            padding: 10,
            textAlign: 'center',
          }}
        >
          {text}
        </Text>
      </TouchableWithoutFeedback>
      <OrangeArrowDown style={{ bottom: -10 }}></OrangeArrowDown>
    </Animated.View>
  );
};

export default FakeRecordingButtonTolltip;
