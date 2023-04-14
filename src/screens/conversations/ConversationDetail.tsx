import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AuthContext } from '@app/provider/AuthProvider';
import { useTheme } from '@rneui/themed';
import { logErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import moment from 'moment';
import analytics from '@react-native-firebase/analytics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SupabaseAnswer } from '@app/types/api';
import { Loading } from '../../components/utils/Loading';
import { GoBackButton } from '../../components/buttons/GoBackButton';
import { TIMEZONE } from '@app/utils/constants';
import { FontText } from '@app/components/utils/FontText';
import { Divider } from '@rneui/base';
import { entryTitle } from '../diary/Diary';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'ConversationDetail'>) {
  const conversationId = route.params.id;
  const [conversation, setConversation] = useState<{
    text: string;
    ai: string;
    created_at: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const authContext = useContext(AuthContext);
  const { theme } = useTheme();

  useEffect(() => {
    async function getDiaryEntries() {
      setLoading(true);
      const {
        data: data,
        error: error,
      }: SupabaseAnswer<{ text: string; ai: string; created_at: string }> = await supabase
        .from('conversation')
        .select('text, ai, created_at')
        .eq('user_id', authContext.userId)
        .eq('id', conversationId)
        .single();
      if (error) {
        logErrors(error);
        return;
      }
      setConversation(data);

      setLoading(false);
    }
    void getDiaryEntries();
  }, [authContext.userId, setConversation]);

  return (
    <SafeAreaView style={{ flexGrow: 1, width: '100%' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 10,
          paddingTop: 5,
          width: '100%',
        }}
      >
        <View style={{ flexDirection: 'row', zIndex: 1, position: 'relative' }}>
          <View style={{ position: 'absolute', top: 0 }}>
            <GoBackButton
              onPress={() => {
                void analytics().logEvent('ConversationDetailGoBack', {
                  screen: 'ConversationDetail',
                  action: 'Go back button clicked',
                  userId: authContext.userId,
                });
                navigation.navigate('Conversations');
              }}
            ></GoBackButton>
          </View>
        </View>
        <View style={{ marginTop: 10, alignSelf: 'center' }}>
          {!loading && entryTitle(theme, moment(conversation?.created_at).utcOffset(TIMEZONE))}
        </View>
        {loading ? (
          <Loading />
        ) : (
          <View>
            <View style={{ marginTop: 20 }}>
              <FontText>{conversation?.text}</FontText>
            </View>
            <Divider style={{ marginVertical: 10 }}></Divider>
            <View>
              <FontText>{conversation?.ai}</FontText>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
