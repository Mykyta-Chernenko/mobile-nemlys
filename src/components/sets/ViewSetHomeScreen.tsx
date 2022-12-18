import React, { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { Image } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { ViewWithMenu } from '../common/ViewWithMenu';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@app/types/navigation';

interface Props {
  children: React.ReactNode;
}

export const ViewSetHomeScreen = (props: Props) => {
  const navigation = useNavigation<MainNavigationProp>();
  const [refreshing, setRefeshing] = useState(false);
  return (
    <ViewWithMenu>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: 'white',
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefeshing(true);
              setTimeout(() => {
                navigation.navigate('SetHomeScreen', {
                  refreshTimeStamp: new Date().toISOString(),
                });
                setRefeshing(false);
              }, 500);
            }}
          ></RefreshControl>
        }
      >
        <View
          style={{
            height: 200,
          }}
        >
          <View
            style={{
              height: 100,
              width: '100%',
              backgroundColor: 'rgba(81, 74, 191, 1)',
              position: 'absolute',
              marginTop: 140,
            }}
          ></View>
          <Image
            resizeMode="contain"
            style={{
              height: '100%',
              width: '100%',
              justifyContent: 'flex-end',
            }}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={require('../../../assets/images/home.png')}
          ></Image>
        </View>
        <LinearGradient
          colors={['rgb(108, 99, 255)', 'rgb(223, 220, 238)']}
          style={{
            flexGrow: 1,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            zIndex: 1,
          }}
        >
          {props.children}
        </LinearGradient>
      </ScrollView>
    </ViewWithMenu>
  );
};
