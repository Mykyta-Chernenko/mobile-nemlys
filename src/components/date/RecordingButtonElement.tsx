import Mic from '@app/icons/mic';
import { i18n } from '@app/localization/i18n';

import { useTheme } from '@rneui/themed';
import React, { useEffect, useRef } from 'react';
import { View, TouchableWithoutFeedback, Animated } from 'react-native';
import StopDark from '@app/icons/stop_dark';
import RecordingDelete from '@app/icons/recording_delete';

import { FontText } from '../utils/FontText';
import { Loading } from '../utils/Loading';

const BackgroundLayer = ({
  width,
  height,
  color,
  rotate,
  zIndex,
  x,
  y,
}: {
  width: number;
  height: number;
  color: string;
  rotate: number;
  zIndex: number;
  x: number;
  y: number;
}) => (
  <View
    style={{
      position: 'absolute',
      width,
      height,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex,
      left: x,
      top: y,
    }}
  >
    <View
      style={{
        width,
        height,
        borderRadius: 50,
        backgroundColor: color,
        transform: [{ rotate: `${rotate}deg` }],
      }}
    ></View>
  </View>
);

const RecordingButtonElement = ({
  handlePress,
  state,
  recordingSeconds,
}: {
  handlePress: () => void;
  state: 'not_started' | 'in_progress' | 'finished' | 'uploading';
  recordingSeconds: number;
}) => {
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const scale3 = useRef(new Animated.Value(1)).current;
  const { theme } = useTheme();
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };
  useEffect(() => {
    let isCancelled = false;
    const isRecording = state === 'in_progress';
    const animateScale = (scale: Animated.Value) => {
      const randomScale = 1 + Math.random() * 0.2;

      Animated.sequence([
        Animated.timing(scale, {
          toValue: randomScale,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (!isCancelled && isRecording) animateScale(scale);
      });
    };
    if (isRecording) {
      animateScale(scale1);
      setTimeout(() => animateScale(scale2), 200); // Offset each animation for a varied effect
      setTimeout(() => animateScale(scale3), 400);
    } else {
      [scale1, scale2, scale3].forEach((scale) => {
        Animated.timing(scale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      });
    }
    return () => {
      isCancelled = true;
      [scale1, scale2, scale3].forEach((scale) => scale.stopAnimation());
    };
  }, [state]);

  let CenterElement = <></>;
  switch (state) {
    case 'not_started':
      CenterElement = (
        <>
          <Mic></Mic>
          <FontText small>{i18n.t('recording.button')}</FontText>
        </>
      );
      break;
    case 'in_progress':
      CenterElement = (
        <>
          <StopDark></StopDark>
          <FontText small>{formatTime(recordingSeconds)}</FontText>
        </>
      );
      break;
    case 'finished':
      CenterElement = (
        <>
          <View style={{ position: 'absolute', right: 0, top: 0 }}>
            <RecordingDelete></RecordingDelete>
          </View>
          <Mic></Mic>
          <FontText small>{formatTime(recordingSeconds)}</FontText>
        </>
      );
      break;
    case 'uploading':
      CenterElement = (
        <>
          <Loading></Loading>
        </>
      );
      break;
  }
  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View>
        <Animated.View style={{ transform: [{ scale: scale1 }] }}>
          <BackgroundLayer
            zIndex={1}
            width={68}
            height={87.44}
            color={theme.colors.primary}
            rotate={16.8357}
            x={3}
            y={-8.7}
          />
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: scale2 }] }}>
          <BackgroundLayer
            zIndex={2}
            width={72}
            height={83.45}
            color={theme.colors.warning}
            rotate={60.5179}
            x={3}
            y={-5}
          />
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: scale3 }] }}>
          <BackgroundLayer
            zIndex={3}
            width={68}
            height={83}
            color={theme.colors.error}
            rotate={110.934}
            x={5}
            y={-5}
          />
        </Animated.View>

        <View
          style={{
            zIndex: 5,
            backgroundColor: theme.colors.white,
            borderRadius: 50,
            height: 72,
            width: 72,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {CenterElement}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
export default RecordingButtonElement;
