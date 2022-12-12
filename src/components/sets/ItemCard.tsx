import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import ImageOrDefault from '../utils/ImageOrDefault';
import { useTheme, Text } from '@rneui/themed';
import { ProfileScreenNavigationProp, SetItemProps } from '@app/types/navigation';
import { useNavigation } from '@react-navigation/native';

export default function (props: SetItemProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  return (
    <TouchableOpacity onPress={() => navigation.navigate('SetItemDetails', props)}>
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
          <Text>{props.title}</Text>
          {props.tags && (
            <View style={{ flexDirection: 'row' }}>
              {props.tags.map((t, i) => (
                <View
                  key={i}
                  style={{
                    borderRadius: 10,
                    borderColor: theme.colors.primary,
                    borderWidth: 1,
                    padding: 3,
                  }}
                >
                  <Text style={{ color: theme.colors.primary }}>{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
