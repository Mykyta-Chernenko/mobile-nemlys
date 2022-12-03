import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Welcome from '@app/screens/auth/onboarding/Welcome';
import PrePlacement from '@app/screens/auth/onboarding/PrePlacement';
import Placement from '@app/screens/auth/onboarding/Placement';
import HowWeWork from '@app/screens/auth/onboarding/HowWeWork';
import Login from '@app/screens/auth/Login';
import Register from '@app/screens/auth/Register';
import ForgetPassword from '@app/screens/auth/ForgotPassword';
import TypeNewPassword from '@app/screens/auth/TypeNewPassword';

const AuthStack = createNativeStackNavigator();
const Auth = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Welcome" component={Welcome} />
      <AuthStack.Screen name="PrePlacement" component={PrePlacement} />
      <AuthStack.Screen name="Placement" component={Placement} />
      <AuthStack.Screen name="HowWeWork" component={HowWeWork} />
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Register" component={Register} />
      <AuthStack.Screen name="TypeNewPassword" component={TypeNewPassword} />
      <AuthStack.Screen name="ForgetPassword" component={ForgetPassword} />
    </AuthStack.Navigator>
  );
};

export default Auth;
