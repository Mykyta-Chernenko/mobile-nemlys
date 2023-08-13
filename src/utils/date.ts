import moment from 'moment';
import { TIMEZONE } from './constants';

export function getDateFromString(date: string): moment.Moment {
  return moment(date).utcOffset(TIMEZONE);
}
