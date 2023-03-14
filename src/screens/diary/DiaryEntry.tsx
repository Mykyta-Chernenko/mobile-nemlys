import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@app/types/navigation';
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
import { FontText } from '../../components/utils/FontText';
import StyledMarkdown from '../../components/utils/StyledMarkdown';
export default function ({ route }) {
  const diaryEntryId = route.params.id;
  const [diaryEntry, setDiaryEntry] = useState<{ text: string; date: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<MainNavigationProp>();
  const authContext = useContext(AuthContext);
  const { theme } = useTheme();
  const entryTitle = (date: moment.Moment) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <FontText style={{ color: theme.colors.primary, fontSize: 22, marginRight: 3 }}>
          {date.format('DD')}
        </FontText>
        <FontText style={{ fontSize: 22, marginRight: 10 }}>
          {date.format('MMM').toUpperCase()}
        </FontText>
      </View>
    );
  };

  useEffect(() => {
    async function getDiaryEntries() {
      setLoading(true);
      const {
        data: diaryEntryRes,
        error: diaryEntryError,
      }: SupabaseAnswer<{ text: string; date: string }> = await supabase
        .from('diary')
        .select('text, date')
        .eq('user_id', authContext.userId)
        .eq('id', diaryEntryId)
        .single();
      if (diaryEntryError) {
        logErrors(diaryEntryError);
        return;
      }
      setDiaryEntry(diaryEntryRes);

      setLoading(false);
    }
    void getDiaryEntries();
  }, [authContext.userId, setDiaryEntry]);

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
                void analytics().logEvent('DiaryGoBack', {
                  screen: 'Diary',
                  action: 'Go back button clicked',
                  userId: authContext.userId,
                });
                navigation.navigate('Diary', {
                  refreshTimeStamp: new Date().toISOString(),
                });
              }}
            ></GoBackButton>
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          {!loading && entryTitle(moment(diaryEntry?.date).utcOffset(TIMEZONE))}
        </View>
        {loading ? (
          <Loading />
        ) : (
          <View style={{ marginTop: 20 }}>
            <StyledMarkdown>{diaryEntry?.text}</StyledMarkdown>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
