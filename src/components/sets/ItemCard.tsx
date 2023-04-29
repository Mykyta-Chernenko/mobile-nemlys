import React, { useContext } from 'react';
import { TouchableOpacity, View } from 'react-native';
import ImageOrDefault from '../utils/ImageOrDefault';
import { useTheme } from '@rneui/themed';
import { MainNavigationProp, SetItemProps } from '@app/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { FontText } from '../utils/FontText';
import { AuthContext } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';

export default function (props: SetItemProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<MainNavigationProp>();
  const authContext = useContext(AuthContext);
  return (
    <TouchableOpacity
      onPress={() => {
        void localAnalytics().logEvent('SetItemCardClickShowDetails', {
          screen: 'SetItemCard',
          action: 'Card clicked to show details',
          title: props.title,
          userId: authContext.userId,
        });
        navigation.navigate('SetItemDetails', props);
      }}
    >
      <View
        style={{
          flexGrow: 0,
          flexDirection: 'row',
          alignItems: 'center',
          width: '100%',
          height: 100,
          marginVertical: '1%',
          padding: 10,
          shadowColor: 'black',
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 0.16,
          shadowRadius: 4,
          backgroundColor: theme.colors.white,
        }}
      >
        <View style={{ width: '30%', height: '100%' }}>
          <ImageOrDefault image={props.image} />
        </View>
        <View
          style={{
            flexDirection: 'column',
            width: '65%',
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          <FontText>{props.title}</FontText>
          {props.tags && (
            <View style={{ flexDirection: 'row' }}>
              {props.tags.map((t, i) => (
                <View
                  key={i}
                  style={{
                    padding: 3,
                  }}
                >
                  <FontText style={{ color: theme.colors.primary }}>{'#' + t}</FontText>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
