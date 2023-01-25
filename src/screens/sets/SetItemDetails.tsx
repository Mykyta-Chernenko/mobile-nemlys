import React, { useContext } from 'react';
import { ScrollView, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { i18n } from '@app/localization/i18n';
import { ContentBox } from '@app/components/utils/ContentBox';
import ImageOrDefault from '@app/components/utils/ImageOrDefault';
import { FontText } from '@app/components/utils/FontText';
import { logEvent } from 'expo-firebase-analytics';
import { AuthContext } from '@app/provider/AuthProvider';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'SetItemDetails'>) {
  const insets = useSafeAreaInsets();
  const props = route.params;
  const authContext = useContext(AuthContext);
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
            void logEvent('SetItemDetailsGoBack', {
              screen: 'SetItemDetails',
              action: 'Go back button clicked',
              itemTitle: props.title,
              userId: authContext.userId,
            });
            navigation.navigate('SetHomeScreen', { refreshTimeStamp: undefined });
          }}
        ></GoBackButton>
      </View>
      <View style={{ height: 200 }}>
        <ImageOrDefault image={props.image}></ImageOrDefault>
      </View>
      <FontText h4 style={{ marginTop: '2%', textAlign: 'center' }}>
        {props.details}
      </FontText>
      <ContentBox>
        <FontText style={{ fontWeight: 'bold', fontFamily: 'NunitoSans_700Bold' }}>
          {i18n.t('set.importance.title')}
        </FontText>
        <FontText style={{ fontFamily: 'NunitoSans_400Regular' }}>{props.importance}</FontText>
      </ContentBox>
      {props.type === 'question' && (
        <ContentBox>
          <FontText style={{ fontWeight: 'bold' }}>{i18n.t('set.tips.title')}</FontText>
          <FontText>{props.tips}</FontText>
        </ContentBox>
      )}
      {props.type === 'action' && (
        <ContentBox>
          <FontText style={{ fontWeight: 'bold' }}>{i18n.t('set.instruction.title')}</FontText>
          <FontText>{props.instruction}</FontText>
        </ContentBox>
      )}
    </ScrollView>
  );
}
