import React, { useContext } from 'react';
import { ANON_USER, AuthContext } from '@app/provider/AuthProvider';
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
  const userId = auth.userId;

  let comp = <></>;
  if (signedIn === null || userId === null) {
    comp = <Loading></Loading>;
  } else if (signedIn === true && userId !== ANON_USER) {
    comp = <Main></Main>;
  } else {
    comp = <Auth></Auth>;
  }
  return <NavigationContainer linking={linking}>{comp}</NavigationContainer>;
};
