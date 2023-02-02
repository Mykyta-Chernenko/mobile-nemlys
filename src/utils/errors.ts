import { i18n } from '@app/localization/i18n';
import { Native } from 'sentry-expo';
import { UNEXPECTED_ERROR } from './constants';

export function logErrors(e: unknown) {
  logErrorsWithMessage(e, undefined);
}

export function logErrorsWithMessage(e: unknown, message: string | undefined) {
  if (!__DEV__) Native.captureException(e);
  console.error(e);
  alert(message || i18n.t(UNEXPECTED_ERROR));
}

export function logErrorsWithMessageWithoutAlert(e: unknown) {
  if (!__DEV__) Native.captureException(e);
  console.error(e);
}

export class UserDoesNotExistError extends Error {}
