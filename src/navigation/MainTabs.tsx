import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import TabBarText from '@app/components/utils/TabBarText';
import TabBarIcon from '@app/components/utils/TabBarIcon';

import Home from '@app/screens/Home';

const Tabs = createBottomTabNavigator();
const MainTabs = () => {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopColor: '#c0c0c0',
          backgroundColor: '#ffffff',
        },
      }}
    >
      {/* these icons using Ionicons */}
      <Tabs.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: ({ focused }) => <TabBarText focused={focused} title="Home" />,
          tabBarIcon: ({ focused }) => <TabBarIcon focused={focused} icon={'md-home'} />,
        }}
      />
    </Tabs.Navigator>
  );
};

export default MainTabs;
