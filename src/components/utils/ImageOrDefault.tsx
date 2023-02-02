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
  goals: require('../../../assets/images/goals.png'),
  having_fun: require('../../../assets/images/having_fun.png'),
  online_posts: require('../../../assets/images/online_posts.png'),
  partying: require('../../../assets/images/partying.png'),
  personal_file: require('../../../assets/images/personal_file.png'),
  pleasant_surprise: require('../../../assets/images/pleasant_surprise.png'),
  romantic_gateway: require('../../../assets/images/romantic_gateway.png'),
  showing_support: require('../../../assets/images/showing_support.png'),
  staying_in: require('../../../assets/images/showing_support.png'),
  the_world_is_mine: require('../../../assets/images/the_world_is_mine.png'),
  things_to_say: require('../../../assets/images/things_to_say.png'),
  [DEFAULT_IMAGE]: require('../../../assets/images/staying_in.png'),
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
