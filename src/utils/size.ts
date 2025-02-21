import { Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

export function isSmallDevice() {
  return height < 850;
}

export function isBigDevice() {
  return height > 1000;
}
