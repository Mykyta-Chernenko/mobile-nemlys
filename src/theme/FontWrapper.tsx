import React, { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
void SplashScreen.preventAutoHideAsync();

export default function (props: Props) {
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        'Epilogue-Regular': require('../../assets/fonts/Epilogue-Regular.ttf'),
        'Epilogue-SemiBold': require('../../assets/fonts/Epilogue-SemiBold.ttf'),
        'Epilogue-Bold': require('../../assets/fonts/Epilogue-Bold.ttf'),
      });
      setFontLoaded(true);
    }

    void loadFont();
  }, []);

  return <>{fontLoaded && props.children}</>;
}
