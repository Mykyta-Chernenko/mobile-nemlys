import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import { AuthContext } from '@app/provider/AuthProvider';
import analytics from '@react-native-firebase/analytics';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '@app/components/utils/Loading';
import { SupabaseAnswer } from '@app/types/api';
import { logErrors } from '@app/utils/errors';
import moment from 'moment';
import ImageOrDefault from '@app/components/utils/ImageOrDefault';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'HistorySetCardDetails'>) {
  const { coupleSetId } = route.params;
  const [loading, setLoading] = useState(true);
  const [discussionDescription, setDiscussionDescription] = useState<string>('');
  const [discussNext, setDiscussNext] = useState<string>('');
  const [meetingDate, setMeetingDate] = useState<null | string>(null);
  const readableDate = meetingDate
    ? moment(meetingDate).format('MMM Do, HH:mm')
    : i18n.t('set.chosen.date_is_not_set');
  const authContext = useContext(AuthContext);

  useEffect(() => {
    async function getCurrentLevel() {
      const coupleSetRes: SupabaseAnswer<{ set_id: number; meeting: string }> = await supabase
        .from('couple_set')
        .select('set_id, meeting')
        .eq('id', coupleSetId)
        .single();
      if (coupleSetRes?.error) {
        logErrors(coupleSetRes.error);
        return;
      }

      setMeetingDate(coupleSetRes.data.meeting);

      const coupleSetFeedbackRes = await supabase
        .from('couple_set_feedback')
        .select('id')
        .eq('couple_set_id', coupleSetId)
        .eq('user_id', authContext.userId)
        .single();
      if (coupleSetFeedbackRes?.error) {
        logErrors(coupleSetFeedbackRes.error);
        return;
      }
      const feedbackConversationDetailsRes = await supabase
        .from('feedback_question')
        .select('id')
        .eq('slug', 'conversation_details')
        .single();
      if (feedbackConversationDetailsRes?.error) {
        logErrors(feedbackConversationDetailsRes.error);
        return;
      }
      const feedbackAnswerConversationDetailsRes: SupabaseAnswer<{
        text_answer: string;
      }> = await supabase
        .from('couple_set_feedback_answer')
        .select('text_answer')
        .eq('couple_set_feedback_id', coupleSetFeedbackRes.data.id)
        .eq('feedback_question_id', feedbackConversationDetailsRes.data.id)
        .single();
      if (feedbackAnswerConversationDetailsRes?.error) {
        logErrors(feedbackAnswerConversationDetailsRes.error);
        return;
      }

      setDiscussionDescription(feedbackAnswerConversationDetailsRes.data.text_answer);

      const feedbackNextnDetailsRes = await supabase
        .from('feedback_question')
        .select('id')
        .eq('slug', 'discuss_next')
        .single();
      if (feedbackNextnDetailsRes?.error) {
        logErrors(feedbackNextnDetailsRes.error);
        return;
      }
      const feedbackAnswerNextDetailsRes: SupabaseAnswer<{
        text_answer: string;
      } | null> = await supabase
        .from('couple_set_feedback_answer')
        .select('text_answer')
        .eq('couple_set_feedback_id', coupleSetFeedbackRes.data.id)
        .eq('feedback_question_id', feedbackNextnDetailsRes.data.id)
        .maybeSingle();
      if (feedbackAnswerNextDetailsRes?.error) {
        logErrors(feedbackAnswerNextDetailsRes.error);
        return;
      }
      if (feedbackAnswerNextDetailsRes.data) {
        setDiscussNext(feedbackAnswerNextDetailsRes.data.text_answer);
      }
      setLoading(false);
    }
    void getCurrentLevel();
  }, [setLoading, setMeetingDate, setDiscussionDescription]);
  return loading ? (
    <Loading light />
  ) : (
    <SafeAreaView
      style={{
        flexGrow: 1,
        backgroundColor: 'white',
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexDirection: 'column',
          padding: 10,
          paddingTop: 0,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <GoBackButton
            onPress={() => {
              void analytics().logEvent('HistorySetCardDetailsGoBack', {
                screen: 'HustorySetItemDetails',
                action: 'Go back button clicked',
                userId: authContext.userId,
              });
              navigation.navigate('HistorySet');
            }}
          ></GoBackButton>
        </View>
        <View
          style={{
            marginBottom: 10,
            height: 250,
          }}
        >
          <ImageOrDefault image={'articles'}></ImageOrDefault>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FontText
            style={{
              fontWeight: 'bold',
              fontFamily: 'NunitoSans_700Bold',
              fontSize: 16,
              marginRight: 5,
            }}
          >
            {i18n.t('set.history.meeting_on')}
          </FontText>

          <FontText style={{ fontSize: 16 }}>{readableDate}</FontText>
        </View>

        <View style={{ marginTop: 15 }}>
          <FontText
            style={{
              fontWeight: 'bold',
              fontFamily: 'NunitoSans_700Bold',
              fontSize: 16,
              marginRight: 5,
            }}
          >
            {i18n.t('set.history.discussion_description_title')}
          </FontText>
          <FontText>
            {discussionDescription || i18n.t('set.history.no_discussion_description')}
          </FontText>
        </View>
        {discussNext && (
          <View style={{ marginTop: 15 }}>
            <FontText
              style={{
                fontWeight: 'bold',
                fontFamily: 'NunitoSans_700Bold',
                fontSize: 16,
                marginRight: 5,
              }}
            >
              {i18n.t('set.history.discuss_next')}
            </FontText>
            <FontText>{discussNext}</FontText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
