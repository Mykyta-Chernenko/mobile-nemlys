import React from 'react';
import { FontText } from './FontText';
export default ({ title, focused }: { title: string; focused: boolean }) => {
  return (
    <FontText
      style={{
        marginBottom: 5,
        color: focused ? 'white' : 'rgb(143, 155, 179)',
        fontSize: 10,
        fontWeight: 'bold',
      }}
    >
      {title}
    </FontText>
  );
};
