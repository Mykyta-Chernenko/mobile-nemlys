import React, { useEffect, useRef } from 'react';
import {
  Animated,
  DimensionValue,
  LayoutAnimation,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  UIManager,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@rneui/themed';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  // Optional prop to control card elevation/shadow
  elevated?: boolean;
  // Optional prop to make card pressable
  onPress?: () => void;
  // Optional prop to control animation
  animated?: boolean;
  // Optional style overrides
  containerStyle?: ViewStyle;
  // Optional prop to control card padding
  noPadding?: boolean;
  // Optional prop for rounded corners
  rounded?: boolean;
  // Optional prop for full width
  fullWidth?: boolean;
  // Optional prop for background color override
  backgroundColor?: string;
  // Optional prop for width override
  width?: DimensionValue;
  // Optional prop for card alignment
  center?: boolean;
  // Optional prop for disabled state
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  elevated = false,
  onPress,
  animated = true,
  containerStyle,
  noPadding = false,
  rounded = true,
  fullWidth = false,
  backgroundColor,
  width,
  center = false,
  disabled = false,
  ...touchableProps
}) => {
  // Theme integration for consistent styling
  const { theme } = useTheme();

  // Animation value for entrance animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Handle entrance animation on mount
  useEffect(() => {
    if (animated) {
      // Configure entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      // Configure layout animation for content changes
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [animated, fadeAnim, scaleAnim]);

  // Base styles that will be applied to all cards
  const baseStyles = StyleSheet.create({
    container: {
      backgroundColor: backgroundColor || theme.colors.white,
      borderRadius: rounded ? 16 : 0,
      padding: noPadding ? 0 : 20,
      width: fullWidth ? '100%' : width,
      alignSelf: center ? 'center' : 'auto',
      ...Platform.select({
        ios: elevated
          ? {
              shadowColor: theme.colors.black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }
          : {},
        android: elevated
          ? {
              // @ts-expect-error expected param
              elevation: 4,
            }
          : {},
      }),
    },
    pressableContainer: {
      opacity: disabled ? 0.6 : 1,
    },
  });

  // Combine animated styles with base styles
  const animatedStyle = animated
    ? {
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }
    : {};

  // Combine all styles
  const combinedStyles = [baseStyles.container, baseStyles.pressableContainer, containerStyle];

  // Render card with or without touch functionality
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        {...touchableProps}
      >
        <Animated.View style={[combinedStyles, animatedStyle]}>{children}</Animated.View>
      </TouchableOpacity>
    );
  }

  return <Animated.View style={[combinedStyles, animatedStyle]}>{children}</Animated.View>;
};

export default React.memo(Card);

export type { CardProps };
