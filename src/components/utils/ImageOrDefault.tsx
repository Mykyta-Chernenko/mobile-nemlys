import React from 'react';
import { Image, ImageProps } from '@rneui/themed';

const DEFAULT_IMAGE = 'default_image';
const allImages = {
  pre_placement: require('../../../assets/images/pre_placement.png'),
  [DEFAULT_IMAGE]: require('../../../assets/images/buddys.png'),
};
export default function ({ image, ...props }: { image: string | undefined } & ImageProps) {
  const resultImage = allImages[image || DEFAULT_IMAGE] || allImages[DEFAULT_IMAGE];
  return (
    <Image
      resizeMode="contain"
      style={[
        {
          height: '100%',
          width: '100%',
        },
        props?.style,
      ]}
      {...props}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      source={resultImage}
    ></Image>
  );
}
