import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@app/types/navigation';
import { AuthContext } from '@app/provider/AuthProvider';
import { useTheme } from '@rneui/themed';
import { logErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import moment from 'moment';
import analytics from '@react-native-firebase/analytics';
import * as Notifications from 'expo-notifications';

import { APIDiary, APINotification, InsertAPINotification, SupabaseAnswer } from '@app/types/api';
import { i18n } from '@app/localization/i18n';
import { Loading } from '../../components/utils/Loading';
import { GoBackButton } from '../../components/buttons/GoBackButton';
import { GRANTED_NOTIFICATION_STATUS, TIMEZONE } from '@app/utils/constants';
import { FontText } from '../../components/utils/FontText';
import { PrimaryButton } from '../../components/buttons/PrimaryButtons';
import StyledMarkdown from '../../components/utils/StyledMarkdown';
import { NOTIFICATION_IDENTIFIERS } from '@app/types/domain';
export default function ({ route }) {
  const [diaryEntires, setDiaryEntires] = useState<APIDiary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<MainNavigationProp>();
  const authContext = useContext(AuthContext);
  const { theme } = useTheme();
  const setupDiaryNotification = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === GRANTED_NOTIFICATION_STATUS) {
      const identifier = NOTIFICATION_IDENTIFIERS.DIARY + authContext.userId!;
      const diaryNotification: SupabaseAnswer<APINotification | null> = await supabase
        .from('notification')
        .select('id, created_at, updated_at, identifier, expo_notification_id')
        .eq('identifier', identifier)
        .maybeSingle();
      if (diaryNotification.error) {
        logErrors(diaryNotification.error);
        return;
      }
      if (diaryNotification.data) {
        // notification exist already
        return;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: i18n.t('notification.diary.title'),
          body: i18n.t('notification.diary.body'),
          data: {
            screen: 'DiaryNewEntry',
          },
        },
        trigger: {
          seconds: 60 * 60 * 24 * 3,
          repeats: true,
        },
      });
      const newNotification: InsertAPINotification = {
        identifier,
        expo_notification_id: notificationId,
      };
      const res = await supabase.from('notification').insert(newNotification);
      if (res.error) {
        logErrors(res.error);
      }
    }
  };
  useEffect(() => {
    void setupDiaryNotification();
  }, []);
  const entryTitle = (date: moment.Moment) => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', alignContent: 'center' }}>
        <FontText style={{ color: theme.colors.primary, fontSize: 18, marginRight: 3 }}>
          {date.format('DD')}
        </FontText>
        <FontText style={{ fontSize: 18, marginRight: 10 }}>
          {date.format('MMM').toUpperCase()}
        </FontText>
        <FontText style={{ fontSize: 14, color: theme.colors.grey4 }}>
          {date.format('YYYY, dddd')}
        </FontText>
      </View>
    );
  };
  const navigateToEntry = (id: number) => {
    void analytics().logEvent('DiaryGoToDiaryEntry', {
      screen: 'Diary',
      action: 'Go to diary entry button clicked',
      userId: authContext.userId,
      id,
    });
    navigation.navigate('DiaryEntry', {
      id,
    });
  };

  async function getDiaryEntries() {
    setLoading(true);
    const { data: diaryEntriesRes, error: diaryEntriesError }: SupabaseAnswer<APIDiary[]> =
      await supabase
        .from('diary')
        .select('id, user_id, date, text, created_at, updated_at')
        .eq('user_id', authContext.userId)
        .order('date', { ascending: false });
    if (diaryEntriesError) {
      logErrors(diaryEntriesError);
      return;
    }
    setDiaryEntires(diaryEntriesRes);

    setLoading(false);
  }
  useEffect(() => {
    void getDiaryEntries();
  }, [authContext.userId, setDiaryEntires]);
  useEffect(() => {
    if (route.params?.refreshTimeStamp) {
      void getDiaryEntries();
    }
  }, [route.params?.refreshTimeStamp]);

  const entryToday = diaryEntires.find((d) => moment().isSame(d.date, 'day'));
  const otherEntries = diaryEntires.filter((d) => d.id !== entryToday?.id);
  const diaryEntryStyle: StyleProp<ViewStyle> = {
    maxHeight: 100,
    marginTop: 10,
    overflow: 'hidden',
  };

  return (
    <SafeAreaView style={{ flexGrow: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 10,
          paddingTop: 5,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
          <View style={{ position: 'absolute', zIndex: 1 }}>
            <GoBackButton
              onPress={() => {
                void analytics().logEvent('DiaryGoBack', {
                  screen: 'Diary',
                  action: 'Go back button clicked',
                  userId: authContext.userId,
                });
                navigation.navigate('SetHomeScreen', {
                  refreshTimeStamp: new Date().toISOString(),
                });
              }}
            ></GoBackButton>
          </View>
          <FontText h3 style={{ width: '100%', textAlign: 'center' }}>
            {i18n.t('diary.title')}
          </FontText>
        </View>
        {loading ? (
          <Loading />
        ) : (
          <View>
            <FontText
              style={{ fontWeight: 'bold', marginVertical: 20, fontSize: 14, textAlign: 'center' }}
            >
              {i18n.t('diary.ai_motivation_title')}
            </FontText>
            <View>
              {entryToday ? (
                <TouchableOpacity onPress={() => navigateToEntry(entryToday.id)}>
                  {entryTitle(moment().utcOffset(TIMEZONE))}
                  <View style={diaryEntryStyle}>
                    <StyledMarkdown>{entryToday.text}</StyledMarkdown>
                  </View>
                </TouchableOpacity>
              ) : (
                <>
                  {entryTitle(moment().utcOffset(TIMEZONE))}

                  <PrimaryButton
                    size="sm"
                    style={{ width: '40%', alignSelf: 'center', marginVertical: 20 }}
                    onPress={() => {
                      void analytics().logEvent('DiaryAddEntryClicked', {
                        screen: 'Diary',
                        action: 'AddEntry clicked',
                        userId: authContext.userId,
                      });
                      navigation.navigate('DiaryNewEntry');
                    }}
                  >
                    {i18n.t('diary.add_button')}
                  </PrimaryButton>
                </>
              )}
            </View>
            {otherEntries.map((d) => (
              <TouchableOpacity
                onPress={() => navigateToEntry(d.id)}
                key={d.id}
                style={{ marginTop: 15 }}
              >
                {entryTitle(moment(d.date, 'YYYY-MM-DD').utcOffset(TIMEZONE))}
                <View style={diaryEntryStyle}>
                  <StyledMarkdown>{d.text}</StyledMarkdown>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
