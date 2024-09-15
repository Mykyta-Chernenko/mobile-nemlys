import moment from 'moment';
import { TIMEZONE } from './constants';

export function getDateFromString(date: string): moment.Moment {
  return moment(date).utcOffset(TIMEZONE);
}
export function getNow(): moment.Moment {
  return moment().utcOffset(TIMEZONE);
}
export function calculateEveningTimeAfterDays(daysOffset: number) {
  const targetTime = getNow().add(daysOffset, 'days').set({ hour: 19, minute: 0, second: 0 });
  return targetTime.diff(getNow(), 'seconds');
}

export function momentToDate(m: moment.Moment): Date {
  return new Date(m.valueOf() - m.utcOffset() * 60 * 1000);
}

export function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
