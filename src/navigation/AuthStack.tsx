import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Welcome from '@app/screens/auth/onboarding/Welcome';
import Login from '@app/screens/auth/Login';
import ForgetPassword from '@app/screens/auth/ForgotPassword';
import TypeNewPassword from '@app/screens/auth/TypeNewPassword';

const AuthStack = createNativeStackNavigator();
const Auth = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        // disable ios gesture back
        gestureEnabled: false,
      }}
    >
      <AuthStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="Welcome"
        component={Welcome}
      />

      <AuthStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="Login"
        component={Login}
      />
      <AuthStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="TypeNewPassword"
        component={TypeNewPassword}
      />
      <AuthStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="ForgetPassword"
        component={ForgetPassword}
      />
    </AuthStack.Navigator>
  );
};

export default Auth;
