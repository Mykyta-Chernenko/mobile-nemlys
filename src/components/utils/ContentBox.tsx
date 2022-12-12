import React from 'react';
import { View } from 'react-native';

interface Props {
  children: React.ReactNode;
}

export const ContentBox = (props: Props) => {
  return (
    <View
      style={{
        marginVertical: '3%',
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,

        elevation: 3,
        backgroundColor: 'rgba(255,255,255, 1)',
      }}
    >
      {props.children}
    </View>
  );
};
