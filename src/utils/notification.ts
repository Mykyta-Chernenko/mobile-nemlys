import { supabase } from '@app/api/initSupabase';
import { APINotification, InsertAPINotification, SupabaseAnswer } from '@app/types/api';
import { NOTIFICATION_IDENTIFIERS } from '@app/types/domain';
import * as Notifications from 'expo-notifications';
import { logErrors } from './errors';

// TODO send to the partner as well
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
