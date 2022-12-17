import React from 'react';
import { Image, ImageProps } from '@rneui/themed';

const DEFAULT_IMAGE = 'default_image';
const allImages = {
  loving_story: require('../../../assets/images/loving_story.png'),
  eating_together: require('../../../assets/images/eating_together.png'),
  traveling: require('../../../assets/images/traveling.png'),
  heartbroken: require('../../../assets/images/heartbroken.png'),
  dreamer: require('../../../assets/images/dreamer.png'),
  smiley_face: require('../../../assets/images/smiley_face.png'),
  [DEFAULT_IMAGE]: require('../../../assets/images/default_image.png'),
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
