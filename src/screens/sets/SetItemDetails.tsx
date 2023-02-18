import React, { useContext } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { i18n } from '@app/localization/i18n';
import { ContentBox } from '@app/components/utils/ContentBox';
import ImageOrDefault from '@app/components/utils/ImageOrDefault';
import { FontText } from '@app/components/utils/FontText';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { supabase } from '@app/api/initSupabase';
import { logErrors } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import analytics from '@react-native-firebase/analytics';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'SetItemDetails'>) {
  const insets = useSafeAreaInsets();
  const props = route.params;
  const authContext = useContext(AuthContext);

  const join = async () => {
    const { data: user, error } = await supabase.auth.getUser();

    console.log(user, error);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      logErrors(userError);
      return;
    }

    if (
      (await supabase.from('waitlist').select('*', { count: 'exact' }).eq('user_id', user.user?.id))
        .count
    ) {
      Alert.alert(i18n.t('waitlist.already_joined'), undefined, [
        {
          text: i18n.t('ok'),
          style: 'default',
        },
      ]);
      return;
    }

    const { error: waitlistError } = await supabase.from('waitlist').insert({
      user_id: user.user?.id,
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
    return;
  };
  const joinWaitlist = () => {
    void analytics().logEvent('SetItemsDetailsJoinWaitListInititated', {
      screen: 'SetItemsDetails',
      action: 'Clicked on get more ai sets',
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
            void analytics().logEvent('SetItemDetailsGoBack', {
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
      <View>
        {props.type === 'ai_question' && (
          <>
            <ContentBox>
              <FontText style={{ fontWeight: 'bold', fontFamily: 'NunitoSans_700Bold' }}>
                {i18n.t('set.ai_generated.title')}
              </FontText>
              <FontText style={{ fontFamily: 'NunitoSans_400Regular' }}>
                {i18n.t('set.ai_generated.content')}
              </FontText>
            </ContentBox>

            <ContentBox>
              <FontText style={{ fontWeight: 'bold', fontFamily: 'NunitoSans_700Bold' }}>
                {i18n.t('set.ai_personalization.title')}
              </FontText>
              <FontText style={{ fontFamily: 'NunitoSans_400Regular' }}>
                {i18n.t('set.ai_personalization.content')}
              </FontText>
            </ContentBox>
          </>
        )}

        {props.type !== 'ai_question' && props.importance && (
          <ContentBox>
            <FontText style={{ fontWeight: 'bold', fontFamily: 'NunitoSans_700Bold' }}>
              {i18n.t('set.importance.title')}
            </FontText>
            <FontText style={{ fontFamily: 'NunitoSans_400Regular' }}>{props.importance}</FontText>
          </ContentBox>
        )}
        {props.type === 'question' && props.tips && (
          <ContentBox>
            <FontText style={{ fontWeight: 'bold' }}>{i18n.t('set.tips.title')}</FontText>
            <FontText>{props.tips}</FontText>
          </ContentBox>
        )}
        {props.type === 'action' && props.instruction && (
          <ContentBox>
            <FontText style={{ fontWeight: 'bold' }}>{i18n.t('set.instruction.title')}</FontText>
            <FontText>{props.instruction}</FontText>
          </ContentBox>
        )}
        {props.type === 'ai_question' && (
          <PrimaryButton onPress={() => joinWaitlist()}>
            {i18n.t('set.get_more_ai_cards')}
          </PrimaryButton>
        )}
      </View>
    </ScrollView>
  );
}
