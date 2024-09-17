import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '@rneui/themed';
import { FontText } from '@app/components/utils/FontText';
import TopRightArrow from '@app/icons/top_right_arrow';

import SmallArrowRight from '@app/icons/small_arrow_right';

export const SettingsButton = ({
  title,
  action,
  data,
}: {
  title: string;
  action: () => void;
  data: string | null;
}) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      onPress={action}
      style={{
        marginTop: 15,
        width: '100%',
        height: 72,
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: 'white',
        borderRadius: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <FontText
        style={{
          flexShrink: 1,
        }}
      >
        {title}
      </FontText>
      <View
        style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {data ? (
          <>
            <FontText
              style={{
                color: theme.colors.grey3,
                marginRight: 5,
              }}
            >
              {data}
            </FontText>
            <SmallArrowRight></SmallArrowRight>
          </>
        ) : (
          <TopRightArrow></TopRightArrow>
        )}
      </View>
    </TouchableOpacity>
  );
};
