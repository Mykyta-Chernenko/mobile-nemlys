import React from 'react';
import { ScrollView, View } from 'react-native';
import { Image } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { ViewWithMenu } from '../common/ViewWithMenu';

interface Props {
  children: React.ReactNode;
}

export const ViewSetHomeScreen = (props: Props) => {
  return (
    <ViewWithMenu>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: 'white',
        }}
      >
        <View
          style={{
            height: 250,
          }}
        >
          <Image
            resizeMode="contain"
            style={{
              height: '100%',
              width: '100%',
              justifyContent: 'flex-end',
              zIndex: 2,
            }}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={require('../../../assets/images/home.png')}
          ></Image>
          <View
            style={{
              height: 100,
              width: '100%',
              backgroundColor: 'rgba(81, 74, 191, 1)',
              zIndex: -1,
              position: 'absolute',
              marginTop: 170,
            }}
          ></View>
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
