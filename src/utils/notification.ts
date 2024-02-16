import { supabase } from '@app/api/initSupabase';
import { APINotification, InsertAPINotification, SupabaseAnswer } from '@app/types/api';
import * as Notifications from 'expo-notifications';
import { logSupaErrors } from './errors';
import { Platform } from 'react-native';
import { isDevice } from 'expo-device';
import { DENIED_NOTIFICATION_STATUS, GRANTED_NOTIFICATION_STATUS } from '@app/utils/constants';
import { localAnalytics } from './analytics';
import { NotificationTriggerInput } from 'expo-notifications';
import { getNow } from './date';
export async function createNewNotification(
  title: string,
  body: string,
  trigger: NotificationTriggerInput,
  identifier: string,
  screen: string,
) {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === GRANTED_NOTIFICATION_STATUS) {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { screen },
      },
      trigger,
    });
    const newNotification: InsertAPINotification = {
      identifier,
      expo_notification_id: notificationId,
    };
    const res = await supabase.from('notification').insert(newNotification);

    if (res.error) {
      logSupaErrors(res.error);
    }
  }
}

export async function removeOldNotification(identifier: string) {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === GRANTED_NOTIFICATION_STATUS) {
    const notification: SupabaseAnswer<APINotification[]> = await supabase
      .from('notification')
      .select('id, created_at, updated_at, identifier, expo_notification_id')
      .eq('identifier', identifier);
    if (notification.error) {
      logSupaErrors(notification.error);
      return;
    }
    for (const d of notification.data) {
      await Notifications.cancelScheduledNotificationAsync(d.expo_notification_id);
      await supabase.from('notification').delete().eq('identifier', identifier);
    }
  }
}

export async function recreateNotification(
  userId: string,
  identifier: string,
  screen: string,
  title: string,
  body: string,
  trigger: NotificationTriggerInput,
) {
  void localAnalytics().logEvent('NotificationRecreated', {
    screen: 'Notification',
    action: 'Recreate',
    userId,
    identifier,
    screenNotification: screen,
    title,
    body,
    trigger,
  });
  await removeOldNotification(identifier);
  await createNewNotification(title, body, trigger, identifier, screen);
}
export async function recreateNotifications(
  userId: string,
  identifier: string,
  screen: string,
  title: string,
  body: string,
  triggers: NotificationTriggerInput[],
) {
  void localAnalytics().logEvent('NotificationRecreated', {
    screen: 'Notification',
    action: 'Recreate',
    userId,
    identifier,
    screenNotification: screen,
    title,
    body,
    triggers,
  });
  await removeOldNotification(identifier);
  for (const trigger of triggers) {
    await createNewNotification(title, body, trigger, identifier, screen);
  }
}

export const retrieveNotificationAccess = async (
  userId: string | null | undefined,
  notificationStatus: string | undefined,
  screenName: string,
  setLoading: (b: boolean) => void,
): Promise<string | undefined> => {
  let finalStatus = notificationStatus;

  const profileResponse = await supabase
    .from('user_profile')
    .select('id, ios_expo_token, android_expo_token')
    .eq('user_id', userId!)
    .single();
  if (profileResponse.error) {
    logSupaErrors(profileResponse.error);
    return finalStatus;
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
            .update({ [tokenField]: token, updated_at: getNow().toISOString() })
            .eq('id', profileResponse.data?.id);
          if (res.error) {
            logSupaErrors(res.error);
          }
        }
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }
  } finally {
    setLoading(false);
  }
  return finalStatus;
};
