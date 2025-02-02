import React from 'react';
import { View, Image, ImageSourcePropType } from 'react-native';

export default function ({ image }: { image: ImageSourcePropType }) {
  return (
    <View style={{ position: 'relative', width: 180, height: 240, marginBottom: 8 }}>
      <View
        style={{
          position: 'absolute',
          top: 8,
          left: 13,
          width: 155,
          height: 229,
          backgroundColor: '#f5e9eb33',
          borderRadius: 12,
          transform: [{ rotate: '3.55deg' }],
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: 8,
          left: 13,
          width: 155,
          height: 229,
          backgroundColor: '#f5e9eb33',
          borderRadius: 12,
          transform: [{ rotate: '-2.62deg' }],
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: 8,
          left: 13,
          width: 155,
          height: 229,
          backgroundColor: '#f5e9eb33',
          borderRadius: 12,
          transform: [{ rotate: '6.63deg' }],
        }}
      />

      <Image
        source={image}
        style={{
          position: 'absolute',
          top: 8,
          left: 13,
          width: 155,
          height: 229,
          borderRadius: 12,
        }}
        resizeMode="cover"
      />
    </View>
  );
}
