import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@rneui/themed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { i18n } from '@app/localization/i18n';
import { ContentBox } from '@app/components/utils/ContentBox';
import ImageOrDefault from '@app/components/utils/ImageOrDefault';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'SetItemDetails'>) {
  const insets = useSafeAreaInsets();
  const props = route.params;
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: 'white',
        flexDirection: 'column',
        paddingTop: insets.top,
        padding: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <GoBackButton
          onPress={() => {
            navigation.navigate('SetHomeScreen', { refresh: false });
          }}
        ></GoBackButton>
      </View>
      <View style={{ height: 200 }}>
        <ImageOrDefault image={props.image}></ImageOrDefault>
      </View>
      <Text h4 style={{ marginTop: '2%', textAlign: 'center' }}>
        {props.details}
      </Text>
      <ContentBox>
        <Text style={{ fontWeight: 'bold' }}>{i18n.t('set.importance.title')}</Text>
        <Text>{props.importance}</Text>
      </ContentBox>
      {props.type === 'question' && (
        <ContentBox>
          <Text style={{ fontWeight: 'bold' }}>{i18n.t('set.tips.title')}</Text>
          <Text>{props.tips}</Text>
        </ContentBox>
      )}
      {props.type === 'action' && (
        <ContentBox>
          <Text style={{ fontWeight: 'bold' }}>{i18n.t('set.instruction.title')}</Text>
          <Text>{props.instruction}</Text>
        </ContentBox>
      )}
    </ScrollView>
  );
}
