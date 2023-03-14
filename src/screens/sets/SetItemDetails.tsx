import React, { useContext } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { i18n } from '@app/localization/i18n';
import { ContentBox } from '@app/components/utils/ContentBox';
import ImageOrDefault from '@app/components/utils/ImageOrDefault';
import { FontText } from '@app/components/utils/FontText';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { supabase } from '@app/api/initSupabase';
import { logErrors } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';

import analytics from '@react-native-firebase/analytics';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'SetItemDetails'>) {
  const props = route.params;
  const authContext = useContext(AuthContext);

  const join = async () => {
    const { error: waitlistCountError, count: waitlistCount } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact' })
      .eq('user_id', authContext.userId);
    if (waitlistCountError) {
      logErrors(waitlistCountError);
      return;
    }
    if (waitlistCount) {
      Alert.alert(i18n.t('waitlist.already_joined'), undefined, [
        {
          text: i18n.t('ok'),
          style: 'default',
        },
      ]);
      return;
    }

    const { error: waitlistError } = await supabase.from('waitlist').insert({
      user_id: authContext.userId,
    });
    if (waitlistError) {
      logErrors(waitlistError);
      return;
    }
    Alert.alert(
      i18n.t('waitlist.joined_successfully'),
      i18n.t('waitlist.we_will_get_back_to_you'),
      [
        {
          text: i18n.t('awesome'),
          style: 'default',
        },
      ],
    );
    void analytics().logEvent('SetItemsDetailsJoinedWaitList', {
      screen: 'SetItemsDetails',
      action: 'Joined waitlist',
      userId: authContext.userId,
    });
    return;
  };
  const joinWaitlist = () => {
    void analytics().logEvent('SetItemsDetailsJoinWaitListInititated', {
      screen: 'SetItemsDetails',
      action: 'Clicked on join waitlist',
      userId: authContext.userId,
    });
    Alert.alert(
      i18n.t('waitlist.title'),
      i18n.t('waitlist.content'),
      [
        {
          text: i18n.t('cancel'),
          style: 'cancel',
        },
        {
          text: i18n.t('join'),
          onPress: () => void join(),
          style: 'default',
        },
      ],
      {
        cancelable: true,
      },
    );
  };
  return (
    <SafeAreaView
      style={{
        flexGrow: 1,
        backgroundColor: 'white',
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,

          flexDirection: 'column',
          padding: 10,
          paddingTop: 0,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <GoBackButton
            onPress={() => {
              void analytics().logEvent('SetItemDetailsGoBack', {
                screen: 'SetItemDetails',
                action: 'Go back button clicked',
                itemTitle: props.title,
                userId: authContext.userId,
              });
              if (props.deckType === 'new') {
                navigation.navigate('SetHomeScreen', { refreshTimeStamp: undefined });
              } else if (props.deckType === 'history') {
                navigation.navigate('HistorySet');
              }
            }}
          ></GoBackButton>
        </View>
        <View style={{ height: 200 }}>
          <ImageOrDefault image={props.image}></ImageOrDefault>
        </View>
        <FontText h4 style={{ marginTop: '2%', textAlign: 'center' }}>
          {props.details}
        </FontText>
        <View>
          {(props.type === 'question' || props.type === 'action') && props.importance && (
            <ContentBox>
              <FontText style={{ fontWeight: 'bold', fontFamily: 'NunitoSans_700Bold' }}>
                {i18n.t('set.importance.title')}
              </FontText>
              <FontText>{props.importance}</FontText>
            </ContentBox>
          )}
          {props.type === 'question' && props.tips && (
            <ContentBox>
              <FontText style={{ fontWeight: 'bold' }}>{i18n.t('set.tips.title')}</FontText>
              <FontText>{props.tips}</FontText>
            </ContentBox>
          )}
          {(props.type === 'action' || props.type === 'ai_action') && props.instruction && (
            <ContentBox>
              <FontText style={{ fontWeight: 'bold' }}>{i18n.t('set.instruction.title')}</FontText>
              <FontText>{props.instruction}</FontText>
            </ContentBox>
          )}
          {(props.type === 'ai_question' || props.type === 'ai_action') && (
            <>
              <ContentBox>
                <FontText style={{ fontWeight: 'bold', fontFamily: 'NunitoSans_700Bold' }}>
                  {i18n.t('set.ai_generated.title')}
                </FontText>
                <FontText>{i18n.t('set.ai_generated.content')}</FontText>
              </ContentBox>

              <ContentBox>
                <FontText style={{ fontWeight: 'bold', fontFamily: 'NunitoSans_700Bold' }}>
                  {i18n.t('set.ai_personalization.title')}
                </FontText>
                <FontText>{i18n.t('set.ai_personalization.content')}</FontText>
              </ContentBox>
              <PrimaryButton onPress={() => joinWaitlist()}>
                {i18n.t('set.get_more_ai_cards')}
              </PrimaryButton>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
