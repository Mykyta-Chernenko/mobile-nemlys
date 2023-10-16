import moment from 'moment';
import { TIMEZONE } from './constants';

export function getDateFromString(date: string): moment.Moment {
  return moment(date).utcOffset(TIMEZONE);
}
export function getNow(): moment.Moment {
  return moment().utcOffset(TIMEZONE);
}

export function momentToDate(m: moment.Moment): Date {
  return new Date(m.valueOf() - m.utcOffset() * 60 * 1000);
}

export function sleep(time: number) {
  return new Promise((resolve) => setTimeout(() => resolve(1), time));
}
