import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SetHomeScreen from '@app/screens/sets/SetHomeScreen';
import SetItemDetails from '@app/screens/sets/SetItemDetails';
import SetReminder from '@app/screens/sets/SetReminder';
import CompleteSetReflect from '@app/screens/sets/completeSet/CompleteSetReflect';
import CompleteSetQuestion from '@app/screens/sets/completeSet/CompleteSetQuestion';
import CompleteSetFinal from '@app/screens/sets/completeSet/CompleteSetFinal';

const MainStack = createNativeStackNavigator();
const Main = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen
        options={{ animation: 'simple_push' }}
        name="SetHomeScreen"
        component={SetHomeScreen}
      />
      <MainStack.Screen
        options={{ animation: 'fade' }}
        name="SetItemDetails"
        component={SetItemDetails}
      />
      <MainStack.Screen
        options={{ animation: 'fade' }}
        name="SetReminder"
        component={SetReminder}
      />
      <MainStack.Screen
        options={{ animation: 'fade' }}
        name="CompleteSetReflect"
        component={CompleteSetReflect}
      />
      <MainStack.Screen
        options={{ animation: 'fade' }}
        name="CompleteSetQuestion"
        component={CompleteSetQuestion}
      />
      <MainStack.Screen
        options={{ animation: 'fade' }}
        name="CompleteSetFinal"
        component={CompleteSetFinal}
      />
    </MainStack.Navigator>
  );
};

export default Main;
