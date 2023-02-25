import React from 'react';
import { Image, ImageProps } from '@rneui/themed';

const DEFAULT_IMAGE = 'default_image';
const allImages = {
  pre_placement: require('../../../assets/images/pre_placement.png'),
  heartbroken: require('../../../assets/images/heartbroken.png'),
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
  group_selfie: require('../../../assets/images/group_selfie.png'),
  dreamer: require('../../../assets/images/dreamer.png'),
  special_event: require('../../../assets/images/special_event.png'),
  family: require('../../../assets/images/family.png'),
  podcast_audience: require('../../../assets/images/podcast_audience.png'),
  personal_training: require('../../../assets/images/personal_training.png'),
  personal_opinions: require('../../../assets/images/personal_opinions.png'),
  personal_trainer: require('../../../assets/images/personal_trainer.png'),
  waiting_for_you: require('../../../assets/images/waiting_for_you.png'),
  active_support: require('../../../assets/images/active_support.png'),
  feeling_blue: require('../../../assets/images/feeling_blue.png'),
  candidate: require('../../../assets/images/candidate.png'),
  articles: require('../../../assets/images/articles.png'),
  love: require('../../../assets/images/a_whole_year.png'),
  in_love: require('../../../assets/images/in_love.png'),
  artificial_intelligence: require('../../../assets/images/artificial_intelligence.png'),
  a_whole_year: require('../../../assets/images/a_whole_year.png'),
  [DEFAULT_IMAGE]: require('../../../assets/images/heartbroken.png'),
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
