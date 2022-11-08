import React, { useContext } from 'react';
import { AuthContext } from '../provider/AuthProvider';
import Constants from "expo-constants"
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';

import Main from './MainStack';
import Auth from './AuthStack';
import Loading from '../screens/utils/Loading';
import { EMAIL_CONFIRMED_PATH } from '../screens/auth/EmailConfirmed';

const linking = {
  prefixes: ['nemlys://', 'exp://192.168.0.9:19000/--/'],
	config: {
		screens: {
      EmailConfirmed: {
        path: EMAIL_CONFIRMED_PATH
      }
    }
	}
};

export default () => {
	const auth = useContext(AuthContext);
	const user = auth.user;
	return (
		<NavigationContainer linking={linking} >
			{user == null && <Loading />}
			{user == false && <Auth />}
			{user == true && <Main />}
		</NavigationContainer>
	);
};
