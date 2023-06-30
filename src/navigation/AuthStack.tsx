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
import PlacementRelationshipState from '@app/screens/auth/onboarding/PlacementRelationshipState';

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
        name="PrePlacement"
        component={PrePlacement}
      />
      <AuthStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="Placement"
        component={Placement}
      />
      <AuthStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="PlacementRelationshipState"
        component={PlacementRelationshipState}
      />
      <AuthStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="HowWeWork"
        component={HowWeWork}
      />
      <AuthStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="Login"
        component={Login}
      />
      <AuthStack.Screen
        options={{ animation: 'slide_from_right' }}
        name="Register"
        component={Register}
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
