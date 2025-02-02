import React from 'react';
import V3ExploreList from '@app/components/explore/V3ContentList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';

export default function ({
  route,
}: NativeStackScreenProps<MainStackParamList, 'V3ExploreTestList'>) {
  return <V3ExploreList contentType="test" refreshTimeStamp={route.params?.refreshTimeStamp} />;
}
