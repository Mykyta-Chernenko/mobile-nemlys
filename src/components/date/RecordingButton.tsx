import Mic from '@app/icons/mic';

import { useTheme } from '@rneui/themed';
import React from 'react';
import { View, TouchableWithoutFeedback } from 'react-native';

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

export const RecordingButton = ({ handlePress }: { handlePress: () => void }) => {
  const { theme } = useTheme();
  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View>
        <BackgroundLayer
          zIndex={1}
          width={68}
          height={87.44}
          color={theme.colors.primary}
          rotate={16.8357}
          x={3}
          y={-8.7}
        />
        <BackgroundLayer
          zIndex={2}
          width={72}
          height={83.45}
          color={theme.colors.warning}
          rotate={60.5179}
          x={3}
          y={-5}
        />
        <BackgroundLayer
          zIndex={3}
          width={68}
          height={83}
          color={theme.colors.error}
          rotate={110.934}
          x={5}
          y={-5}
        />
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
          <Mic></Mic>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
