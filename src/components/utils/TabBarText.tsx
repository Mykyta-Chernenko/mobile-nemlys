import React from 'react';
import { Text } from '@rneui/themed';
export default ({ title, focused }: { title: string; focused: boolean }) => {
  return (
    <Text
      style={{
        marginBottom: 5,
        color: focused ? 'white' : 'rgb(143, 155, 179)',
        fontSize: 10,
        fontWeight: 'bold',
      }}
    >
      {title}
    </Text>
  );
};
