import { supabase } from '@app/api/initSupabase';
import * as Notifications from 'expo-notifications';
import { logSupaErrors } from './errors';
import { Platform } from 'react-native';
import { isDevice } from 'expo-device';
import { DENIED_NOTIFICATION_STATUS, GRANTED_NOTIFICATION_STATUS } from '@app/utils/constants';
import { localAnalytics } from './analytics';
import { NotificationTriggerInput } from 'expo-notifications';
import { getNow } from './date';
import { Mutex } from 'async-mutex';
import Constants from 'expo-constants';

export async function createNewNotification(
  userId: string,
  title: string,
  body: string,
  trigger: NotificationTriggerInput,
  identifier: string,
  screen: string,
  type: string,
  band: string | undefined = undefined,
  subtype: string | undefined = undefined,
) {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === GRANTED_NOTIFICATION_STATUS) {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { screen, type, band, subtype },
      },
      trigger,
    });
    const newNotification = {
      user_id: userId,
      identifier,
      expo_notification_id: notificationId,
      type,
      subtype,
      band,
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
    const notification = await supabase
      .from('notification')
      .select(
        'id, created_at, updated_at, identifier, expo_notification_id, type, subtype, band, user_id',
      )
      .eq('identifier', identifier);
    if (notification.error) {
      logSupaErrors(notification.error);
      return;
    }
    if (notification.data.length > 1) {
      const type = notification.data[0].type;
      const band = notification.data[0].band;
      const userId = notification.data[0].user_id;
      void localAnalytics().logEvent('PushNotificationBandRemoved', {
        screen: 'PushNotification',
        action: 'Removed',
        userId,
        identifier,
        type,
        band,
      });
    } else if (notification.data.length === 1) {
      const type = notification.data[0].type;
      const subtype = notification.data[0].subtype;
      const userId = notification.data[0].user_id;
      void localAnalytics().logEvent('PushNotificationRemoved', {
        screen: 'PushNotification',
        action: 'Removed',
        userId,
        identifier,
        type,
        subtype,
      });
    }
    for (const d of notification.data) {
      await Notifications.cancelScheduledNotificationAsync(d.expo_notification_id);
      await supabase.from('notification').delete().eq('identifier', identifier);
    }
  }
}

const recreateNotificationMutex = new Mutex();

export async function recreateNotification(
  userId: string,
  identifier: string,
  screen: string,
  title: string,
  body: string,
  trigger: NotificationTriggerInput,
  type: string,
  subtype: string,
) {
  const release = await recreateNotificationMutex.acquire();
  try {
    void localAnalytics().logEvent('PushNotificationCreated', {
      screen: 'PushNotification',
      action: 'Created',
      userId,
      identifier,
      screenNotification: screen,
      title,
      body,
      trigger,
      type,
      subtype,
    });
    await removeOldNotification(identifier);
    await createNewNotification(
      userId,
      title,
      body,
      trigger,
      identifier,
      screen,
      type,
      undefined,
      subtype,
    );
  } finally {
    release();
  }
}
const recreateNotificationListMutex = new Mutex();
export async function recreateNotificationList(
  userId: string,
  identifier: string,
  notifications: {
    screen: string;
    title: string;
    body: string;
    trigger: NotificationTriggerInput;
    subtype: string;
  }[],
  type: string,
  band: string,
) {
  const release = await recreateNotificationListMutex.acquire();
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status === GRANTED_NOTIFICATION_STATUS) {
      await removeOldNotification(identifier);
      for (const n of notifications) {
        await createNewNotification(
          userId,
          n.title,
          n.body,
          n.trigger,
          identifier,
          n.screen,
          type,
          band,
          n.subtype,
        );
      }
      void localAnalytics().logEvent('PushNotificationBandCreated', {
        screen: 'PushNotification',
        action: 'Created',
        userId,
        identifier,
        type,
        band,
      });
    }
  } finally {
    release();
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

        const token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas.projectId,
          })
        ).data;
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
