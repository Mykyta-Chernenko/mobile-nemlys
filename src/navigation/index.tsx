import React, { useContext } from 'react';
import { AuthContext } from '@app/provider/AuthProvider';
import { NavigationContainer } from '@react-navigation/native';

import Main from './MainStack';
import Auth from './AuthStack';
import { TYPE_NEW_PASSWORD_PATH } from '@app/screens/auth/TypeNewPassword';
import { Loading } from '@app/components/utils/Loading';
const linking = {
  prefixes: ['nemlys://', 'exp://192.168.0.9:19000/--/'],
  config: {
    screens: {
      TypeNewPassword: {
        path: TYPE_NEW_PASSWORD_PATH,
      },
    },
  },
};

export default () => {
  const auth = useContext(AuthContext);
  const signedIn = auth.isSignedIn;

  return (
    <NavigationContainer linking={linking}>
      {signedIn == null && <Loading />}
      {signedIn == false && <Auth />}
      {signedIn == true && <Main />}
    </NavigationContainer>
  );
};
