import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { Image, useTheme } from '@rneui/themed';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { AuthContext } from '@app/provider/AuthProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Loading } from '@app/components/utils/Loading';
import { APIConversation, SupabaseAnswer } from '@app/types/api';
import { supabase } from '@app/api/initSupabase';
import { logErrors } from '@app/utils/errors';
import { FontText } from '@app/components/utils/FontText';
import RecordDiscussion from '@app/components/conversations/RecordConversation';
import { TIMEZONE } from '@app/utils/constants';
import moment from 'moment';
import { entryTitle } from '../diary/Diary';
import { Divider } from '@rneui/base';
import { i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';

export default function ({
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'Conversations'>) {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<APIConversation[]>([]);
  const { theme } = useTheme();

  async function getConversations() {
    setLoading(true);
    const { data: data, error: error }: SupabaseAnswer<APIConversation[]> = await supabase
      .from('conversation')
      .select('id, user_id, ai, text, created_at, updated_at')
      .eq('user_id', authContext.userId)
      .order('created_at', { ascending: false });
    if (error) {
      logErrors(error);
      return;
    }
    setConversations(data);

    setLoading(false);
  }
  useEffect(() => {
    void getConversations();
  }, [authContext.userId, setConversations]);
  const navigateToConversation = (id: number) => {
    void localAnalytics().logEvent('ConversationGoToDetail', {
      screen: 'Converstions',
      action: 'Go to conversation detail button clicked',
      userId: authContext.userId,
      id,
    });
    navigation.navigate('ConversationDetail', {
      id,
    });
  };
  return (
    <SafeAreaView style={{ flexGrow: 1, backgroundColor: 'white' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <View style={{ position: 'absolute', zIndex: 1, top: 10, left: 10 }}>
          <GoBackButton
            onPress={() => {
              void localAnalytics().logEvent('ConversationsGoBack', {
                screen: 'Conversations',
                action: 'Go back button clicked',
                userId: authContext.userId,
              });
              navigation.navigate('Settings');
            }}
          ></GoBackButton>
        </View>

        <View
          style={{
            height: 200,
          }}
        >
          <Image
            resizeMode="contain"
            style={{
              height: '100%',
              width: '100%',
            }}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            // source={require('../../../assets/images/audio_conversation.png')}
          ></Image>
        </View>
        {loading ? (
          <Loading />
        ) : (
          <View>
            <FontText style={{ margin: 10, color: theme.colors.grey3 }}>
              {i18n.t('conversations.instruction')}
            </FontText>
            <View style={{ width: '40%', justifyContent: 'center', alignSelf: 'center' }}>
              <RecordDiscussion onCreatedRecording={() => void getConversations()} />
            </View>
            <View>
              {conversations.map((k, i) => (
                <TouchableOpacity
                  key={i}
                  style={{ marginTop: 10, padding: 15 }}
                  onPress={() => void navigateToConversation(k.id)}
                >
                  {entryTitle(theme, moment(k.created_at, 'YYYY-MM-DD').utcOffset(TIMEZONE))}
                  <FontText>{k.text.slice(0, 100) + '...'}</FontText>
                  <Divider style={{ marginVertical: 10 }}></Divider>
                  <FontText>{k.ai.slice(0, 200) + '...'}</FontText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
