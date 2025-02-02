import { supabase } from '@app/api/initSupabase';
import * as Notifications from 'expo-notifications';
import { NotificationTriggerInput } from 'expo-notifications';
import { logErrorsWithMessageWithoutAlert, logSupaErrors } from './errors';
import { Platform } from 'react-native';
import { isDevice } from 'expo-device';
import { DENIED_NOTIFICATION_STATUS, GRANTED_NOTIFICATION_STATUS } from '@app/utils/constants';
import { localAnalytics } from './analytics';
import { calculateEveningTimeAfterDays, calculateHourTimeAfterDays, getNow } from './date';
import { Mutex } from 'async-mutex';
import Constants from 'expo-constants';
import { i18n } from '@app/localization/i18n';
import {
  NOTIFICATION_IDENTIFIERS,
  NOTIFICATION_SUBTYPE,
  NOTIFICATION_TYPE,
  V3_NOTIFICATION_IDENTIFIERS,
  V3_NOTIFICATION_SUBTYPE,
  V3_NOTIFICATION_TYPE,
} from '@app/types/domain';
import { shuffle } from '@app/utils/array';
import _ from 'lodash';
import {
  SchedulableNotificationTriggerInput,
  SchedulableTriggerInputTypes,
} from 'expo-notifications/src/Notifications.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function createFinishDateNotifications(userId: string) {
  const finishDateIdentifier = NOTIFICATION_IDENTIFIERS.FINISH_DATE + userId;

  const notificationOrder = shuffle([
    NOTIFICATION_SUBTYPE.FINISH_DATE_1,
    NOTIFICATION_SUBTYPE.FINISH_DATE_2,
  ]);
  const trigerSeconds = [30 * 60, 4 * 60 * 60];
  const notifications = (
    _.zip(notificationOrder, trigerSeconds) as [NOTIFICATION_SUBTYPE, number][]
  ).map(([subtype, seconds]) => ({
    screen: 'Home',
    title: i18n.t(`notification_finish_date_${subtype}_title`),
    body: i18n.t(`notification_finish_date_${subtype}_body`),
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    } as SchedulableNotificationTriggerInput,
    subtype,
  }));
  await recreateNotificationList(
    userId,
    finishDateIdentifier,
    [
      ...notifications,
      {
        screen: 'Home',
        title: i18n.t(`notification_finish_date_${NOTIFICATION_SUBTYPE.FINISH_DATE_1}_title`),
        body: i18n.t(`notification_finish_date_${NOTIFICATION_SUBTYPE.FINISH_DATE_1}_body`),
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: calculateEveningTimeAfterDays(1),
          repeats: false,
        },
        subtype: NOTIFICATION_SUBTYPE.FINISH_DATE_1,
      },
      {
        screen: 'Home',
        title: i18n.t(`notification_finish_date_${NOTIFICATION_SUBTYPE.FINISH_DATE_2}_title`),
        body: i18n.t(`notification_finish_date_${NOTIFICATION_SUBTYPE.FINISH_DATE_2}_body`),
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: calculateEveningTimeAfterDays(7),
          repeats: false,
        },
        subtype: NOTIFICATION_SUBTYPE.FINISH_DATE_2,
      },
    ],
    NOTIFICATION_TYPE.FINISH_DATE,
    [
      ...notificationOrder,
      NOTIFICATION_SUBTYPE.FINISH_DATE_1,
      NOTIFICATION_SUBTYPE.FINISH_DATE_2,
    ].join(':'),
  );
}

export async function createAfterDateNotifications(userId: string) {
  const finishDateIdentifier = NOTIFICATION_IDENTIFIERS.FINISH_DATE + userId;

  const afterDateIdentifier = NOTIFICATION_IDENTIFIERS.DATE + userId;
  void removeOldNotification(finishDateIdentifier);
  const notificationOrder = shuffle([
    NOTIFICATION_SUBTYPE.AFTER_DATE_1,
    NOTIFICATION_SUBTYPE.AFTER_DATE_2,
    NOTIFICATION_SUBTYPE.AFTER_DATE_3,
    NOTIFICATION_SUBTYPE.AFTER_DATE_4,
    NOTIFICATION_SUBTYPE.AFTER_DATE_5,
  ]);
  const trigerSeconds = [...Array(10)].map((_, i) => calculateEveningTimeAfterDays(i + 1));
  const notifications = (
    _.zip([...notificationOrder, ...notificationOrder], trigerSeconds) as [
      NOTIFICATION_SUBTYPE,
      number,
    ][]
  ).map(([subtype, seconds]) => ({
    screen: 'Home',
    title: i18n.t(`notification_after_date_${subtype}_title`),
    body: i18n.t(`notification_after_date_${subtype}_body`),
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    } as SchedulableNotificationTriggerInput,
    subtype,
  }));
  await recreateNotificationList(
    userId,
    afterDateIdentifier,
    [
      ...notifications,
      {
        screen: 'Home',
        title: i18n.t(`notification_after_date_${NOTIFICATION_SUBTYPE.AFTER_DATE_1}_title`),
        body: i18n.t(`notification_after_date_${NOTIFICATION_SUBTYPE.AFTER_DATE_1}_body`),
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: calculateEveningTimeAfterDays(20),
          repeats: false,
        },
        subtype: NOTIFICATION_SUBTYPE.AFTER_DATE_1,
      },
      {
        screen: 'Home',
        title: i18n.t(`notification_after_date_${NOTIFICATION_SUBTYPE.AFTER_DATE_1}_title`),
        body: i18n.t(`notification_after_date_${NOTIFICATION_SUBTYPE.AFTER_DATE_1}_body`),
        trigger: {
          type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: calculateEveningTimeAfterDays(40),
          repeats: false,
        },
        subtype: NOTIFICATION_SUBTYPE.AFTER_DATE_1,
      },
    ],
    NOTIFICATION_TYPE.AFTER_DATE,
    [
      ...notificationOrder,
      ...notificationOrder,
      NOTIFICATION_SUBTYPE.AFTER_DATE_1,
      NOTIFICATION_SUBTYPE.AFTER_DATE_2,
    ].join(':'),
  );
}

export async function createDailyContentNotifications(
  userId: string,
  firstName: string,
  partnerName: string,
) {
  const identifier = V3_NOTIFICATION_IDENTIFIERS.DAILY_CONTENT;

  const notificationOrder = _.shuffle(
    _.range(4).flatMap(() => [
      V3_NOTIFICATION_SUBTYPE.DAILY_CONTENT_1,
      V3_NOTIFICATION_SUBTYPE.DAILY_CONTENT_2,
      V3_NOTIFICATION_SUBTYPE.DAILY_CONTENT_3,
      V3_NOTIFICATION_SUBTYPE.DAILY_CONTENT_4,
      V3_NOTIFICATION_SUBTYPE.DAILY_CONTENT_5,
      V3_NOTIFICATION_SUBTYPE.DAILY_CONTENT_6,
      V3_NOTIFICATION_SUBTYPE.DAILY_CONTENT_7,
    ]),
  );
  const triggerSeconds = [...Array(28)].map((_, i) => calculateHourTimeAfterDays(i + 1, 18));
  const notifications = (
    _.zip(notificationOrder, triggerSeconds) as [V3_NOTIFICATION_SUBTYPE, number][]
  ).map(([subtype, seconds]) => ({
    screen: 'Home',
    title: i18n.t(`notification_daily_content_${subtype}_title`, { firstName, partnerName }),
    body: i18n.t(`notification_daily_content_${subtype}_body`, { firstName, partnerName }),
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    } as SchedulableNotificationTriggerInput,
    subtype,
  }));
  await recreateNotificationList(
    userId,
    identifier,
    notifications,
    V3_NOTIFICATION_TYPE.DAILY_CONTENT,
    notificationOrder.join(':'),
  );
}
export async function createInactivityNotifications(
  userId: string,
  firstName: string,
  partnerName: string,
) {
  const identifier = V3_NOTIFICATION_IDENTIFIERS.INACTIVITY;

  const notificationOrder = [
    V3_NOTIFICATION_SUBTYPE.INACTIVITY_1,
    V3_NOTIFICATION_SUBTYPE.INACTIVITY_2,
    V3_NOTIFICATION_SUBTYPE.INACTIVITY_3,
    V3_NOTIFICATION_SUBTYPE.INACTIVITY_4,
    V3_NOTIFICATION_SUBTYPE.INACTIVITY_5,
    V3_NOTIFICATION_SUBTYPE.INACTIVITY_6,
    V3_NOTIFICATION_SUBTYPE.INACTIVITY_7,
    V3_NOTIFICATION_SUBTYPE.INACTIVITY_8,
  ];
  const triggerSeconds = [
    calculateHourTimeAfterDays(3, 10),
    calculateHourTimeAfterDays(7, 10),
    calculateHourTimeAfterDays(14, 10),
    calculateHourTimeAfterDays(30, 10),
    calculateHourTimeAfterDays(60, 10),
    calculateHourTimeAfterDays(90, 10),
    calculateHourTimeAfterDays(182, 10),
    calculateHourTimeAfterDays(365, 10),
  ];
  const notifications = (
    _.zip(notificationOrder, triggerSeconds) as [V3_NOTIFICATION_SUBTYPE, number][]
  ).map(([subtype, seconds]) => ({
    screen: 'Home',
    title: i18n.t(`notification_inactivity_${subtype}_title`, { firstName, partnerName }),
    body: i18n.t(`notification_inactivity_${subtype}_body`, { firstName, partnerName }),
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
    } as SchedulableNotificationTriggerInput,
    subtype,
  }));
  await recreateNotificationList(
    userId,
    identifier,
    notifications,
    V3_NOTIFICATION_TYPE.INACTIVITY,
    notificationOrder.join(':'),
  );
}

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
    try {
      const key = `notification:${identifier}`;
      const storedData = await AsyncStorage.getItem(key);
      const notifications = storedData ? JSON.parse(storedData) : [];
      notifications.push(newNotification);
      await AsyncStorage.setItem(key, JSON.stringify(notifications));
    } catch (error) {
      logErrorsWithMessageWithoutAlert(error, 'error storing notification');
    }
  }
}

export async function removeOldNotification(identifier: string) {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === GRANTED_NOTIFICATION_STATUS) {
    try {
      const key = `notification:${identifier}`;
      const storedData = await AsyncStorage.getItem(key);
      const notifications: { expo_notification_id: string }[] = storedData
        ? JSON.parse(storedData)
        : [];
      for (const n of notifications) {
        await Notifications.cancelScheduledNotificationAsync(n.expo_notification_id);
      }
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('error removing notifications', error);
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
    trigger: SchedulableNotificationTriggerInput;
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
        if (token && tokenField && userId) {
          const res = await supabase
            .from('user_profile')
            .update({ [tokenField]: token, updated_at: getNow().toISOString() })
            .eq('user_id', userId);
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
