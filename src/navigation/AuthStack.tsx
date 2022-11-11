import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from '@app/screens/auth/Login';
import Register from '@app/screens/auth/Register';
import ForgetPassword from '@app/screens/auth/ForgetPassword';
import EmailConfirmed from '@app/screens/auth/EmailConfirmed';
import TypeNewPassword from '@app/screens/auth/TypeNewPassword';

const AuthStack = createNativeStackNavigator();
const Auth = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Register" component={Register} />
      <AuthStack.Screen name="EmailConfirmed" component={EmailConfirmed} />
      <AuthStack.Screen name="TypeNewPassword" component={TypeNewPassword} />
      <AuthStack.Screen name="ForgetPassword" component={ForgetPassword} />
    </AuthStack.Navigator>
  );
};

export default Auth;
