import { i18n } from '@app/localization/i18n';
import { NOTIFICATION_IDENTIFIERS } from '@app/types/domain';
import moment from 'moment';

export function getReminderTimeForMeeting(chosenDateTime: Date): Date | null {
  if (chosenDateTime > moment(new Date()).add(1, 'hour').toDate()) {
    return moment(chosenDateTime).subtract(1, 'hour').toDate();
  }
  return null;
}

export function getNotificationForMeeting(
  chosenDateTime: Date,
  coupleSetId: number,
):
  | {
      identifier: string;
      title: string;
      reminderTime: Date;
    }
  | { identifier: null; title: null; reminderTime: null } {
  const reminderTime = getReminderTimeForMeeting(chosenDateTime);
  if (reminderTime) {
    const identifier = NOTIFICATION_IDENTIFIERS.DATE_SOON + coupleSetId.toString();
    const title = i18n.t('notifications.date_soon');
    return { identifier, title, reminderTime };
  }
  return { identifier: null, title: null, reminderTime: null };
}
