import {
  useFonts,
  Epilogue_100Thin,
  Epilogue_100Thin_Italic,
  Epilogue_400Regular,
  Epilogue_500Medium,
  Epilogue_500Medium_Italic,
  Epilogue_200ExtraLight,
  Epilogue_200ExtraLight_Italic,
  Epilogue_300Light,
  Epilogue_300Light_Italic,
  Epilogue_400Regular_Italic,
  Epilogue_600SemiBold,
  Epilogue_600SemiBold_Italic,
  Epilogue_700Bold,
  Epilogue_700Bold_Italic,
  Epilogue_800ExtraBold,
  Epilogue_800ExtraBold_Italic,
  Epilogue_900Black,
  Epilogue_900Black_Italic,
} from '@expo-google-fonts/epilogue';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

import * as SplashScreen from 'expo-splash-screen';

void SplashScreen.preventAutoHideAsync();

export default function (props: Props) {
  const [fontsLoaded] = useFonts({
    Epilogue_100Thin,
    Epilogue_100Thin_Italic,
    Epilogue_200ExtraLight,
    Epilogue_200ExtraLight_Italic,
    Epilogue_300Light,
    Epilogue_300Light_Italic,
    Epilogue_400Regular,
    Epilogue_400Regular_Italic,
    Epilogue_500Medium,
    Epilogue_500Medium_Italic,
    Epilogue_600SemiBold,
    Epilogue_600SemiBold_Italic,
    Epilogue_700Bold,
    Epilogue_700Bold_Italic,
    Epilogue_800ExtraBold,
    Epilogue_800ExtraBold_Italic,
    Epilogue_900Black,
    Epilogue_900Black_Italic,
  });
  return <>{fontsLoaded && props.children}</>;
}
