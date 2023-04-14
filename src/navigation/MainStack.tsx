import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SetHomeScreen from '@app/screens/sets/SetHomeScreen';
import SetItemDetails from '@app/screens/sets/SetItemDetails';
import SetReminder from '@app/screens/sets/SetReminder';
import CompleteSetReflect from '@app/screens/sets/completeSet/CompleteSetReflect';
import CompleteSetQuestion from '@app/screens/sets/completeSet/CompleteSetQuestion';
import CompleteSetFinal from '@app/screens/sets/completeSet/CompleteSetFinal';
import HistorySet from '@app/components/sets/HistorySet';
import HistorySetCardDetails from '@app/screens/sets/history/HistorySetCardDetails';
import Diary from '@app/screens/diary/Diary';
import Settings from '@app/screens/settings/Settings';
import DiaryNewEntry from '@app/screens/diary/DiaryNewEntry';
import { HistorySetScreenName, SetHomeScrenName } from '@app/utils/constants';
import DiaryEntry from '@app/screens/diary/DiaryEntry';
import Conversations from '@app/screens/conversations/Conversations';
import ConversationDetail from '@app/screens/conversations/ConversationDetail';

const MainStack = createNativeStackNavigator();
const Main = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        // disable ios gesture back
        gestureEnabled: false,
      }}
    >
      <MainStack.Screen
        options={{ animation: 'simple_push' }}
        name={SetHomeScrenName}
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
      <MainStack.Screen
        options={{ animation: 'fade' }}
        name={HistorySetScreenName}
        component={HistorySet}
      />
      <MainStack.Screen
        options={{ animation: 'fade' }}
        name="HistorySetCardDetails"
        component={HistorySetCardDetails}
      />
      <MainStack.Screen
        options={{ animation: 'fade' }}
        name="DiaryNewEntry"
        component={DiaryNewEntry}
      ></MainStack.Screen>
      <MainStack.Screen
        options={{ animation: 'fade' }}
        name="Diary"
        component={Diary}
      ></MainStack.Screen>
      <MainStack.Screen
        options={{ animation: 'fade' }}
        name="DiaryEntry"
        component={DiaryEntry}
      ></MainStack.Screen>

      <MainStack.Screen
        options={{ animation: 'fade' }}
        name="Settings"
        component={Settings}
      ></MainStack.Screen>
      <MainStack.Screen
        options={{ animation: 'fade' }}
        name="Conversations"
        component={Conversations}
      ></MainStack.Screen>
      <MainStack.Screen
        options={{ animation: 'fade' }}
        name="ConversationDetail"
        component={ConversationDetail}
      ></MainStack.Screen>
    </MainStack.Navigator>
  );
};

export default Main;
