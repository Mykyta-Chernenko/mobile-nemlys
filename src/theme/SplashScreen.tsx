import React, { useEffect, useState } from 'react';

import * as SplashScreen from 'expo-splash-screen';
import { Image, ImageBackground } from 'react-native';
interface Props {
  children: React.ReactNode;
}
void SplashScreen.preventAutoHideAsync();

export default function (props: Props) {
  const [show, setShow] = useState(true);
  useEffect(() => {
    // so the splash is both hid and rendered on the same tick, no white screen between
    setTimeout(() => void SplashScreen.hideAsync(), 100);
  });
  useEffect(() => {
    // to hide the gif after some time
    setTimeout(() => setShow(false), 2000);
  });
  return show ? (
    <ImageBackground
      style={{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      source={require('../../assets/splash.png')}
    >
      <Image
        style={{
          height: 70,
          width: 70,
          borderRadius: 7,
        }}
        source={require('../../assets/icon.gif')}
      ></Image>
    </ImageBackground>
  ) : (
    <>{props.children}</>
  );
}
