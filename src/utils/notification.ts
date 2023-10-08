import { supabase } from '@app/api/initSupabase';
import { APINotification, InsertAPINotification, SupabaseAnswer } from '@app/types/api';
import { NOTIFICATION_IDENTIFIERS } from '@app/types/domain';
import * as Notifications from 'expo-notifications';
import { logErrors, logErrorsWithMessage } from './errors';
import { Platform } from 'react-native';
import { isDevice } from 'expo-device';
import { DENIED_NOTIFICATION_STATUS, GRANTED_NOTIFICATION_STATUS } from '@app/utils/constants';
import { localAnalytics } from './analytics';
export async function scheduleMeetingNotification(
  title: string,
  reminderTime: Date,
  identifier: string,
) {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
    },
    trigger: reminderTime,
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

export async function removeOldMeetingNotifications(coupleSetId: number) {
  const identifiers = [
    NOTIFICATION_IDENTIFIERS.DATE_SOON + coupleSetId.toString(),
    NOTIFICATION_IDENTIFIERS.SCHEDULE_DATE + coupleSetId.toString(),
  ];
  const notifications: SupabaseAnswer<APINotification[]> = await supabase
    .from('notification')
    .select('id, created_at, updated_at, identifier, expo_notification_id')
    .in('identifier', identifiers);
  if (notifications.error) {
    logErrors(notifications.error);
    return;
  }
  for (const n of notifications.data) {
    await Notifications.cancelScheduledNotificationAsync(n.expo_notification_id);
  }
}

export const retrieveNotificationAccess = async (
  userId: string | null | undefined,
  notificationStatus: string | undefined,
  screenName: string,
  setLoading: (b: boolean) => void,
) => {
  const profileResponse: SupabaseAnswer<{
    id: number;
    ios_expo_token: string | null;
    android_expo_token: string | null;
  }> = await supabase
    .from('user_profile')
    .select('id, ios_expo_token, android_expo_token')
    .eq('user_id', userId)
    .single();
  if (profileResponse.error) {
    logErrorsWithMessage(profileResponse.error, profileResponse.error.message);
    return;
  }
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (isDevice) {
      let finalStatus = notificationStatus;
      if (notificationStatus !== GRANTED_NOTIFICATION_STATUS) {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus === GRANTED_NOTIFICATION_STATUS || finalStatus != notificationStatus) {
        void localAnalytics().logEvent(`${screenName}NotificationAccessProvided`, {
          screen: screenName,
          action: 'User gave reminder notification access',
          userId: userId,
        });
      } else if (finalStatus === DENIED_NOTIFICATION_STATUS) {
        void localAnalytics().logEvent(`${screenName}NotificationAccessDeclined`, {
          screen: screenName,
          action: 'User declined reminder notification access',
          userId: userId,
        });
      }

      if (finalStatus === GRANTED_NOTIFICATION_STATUS) {
        setLoading(true);

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        let tokenField: string | null = null;
        if (Platform.OS === 'ios') {
          tokenField = 'ios_expo_token';
        } else if (Platform.OS === 'android') {
          tokenField = 'android_expo_token';
        }
        if (token && tokenField && token != profileResponse.data?.[tokenField]) {
          const res = await supabase
            .from('user_profile')
            .update({ [tokenField]: token, updated_at: new Date() })
            .eq('id', profileResponse.data?.id);
          if (res.error) {
            logErrors(res.error);
          }
        }
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
  } finally {
    setLoading(false);
  }
};
