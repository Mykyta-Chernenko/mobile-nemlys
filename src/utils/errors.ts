import { i18n } from '@app/localization/i18n';
import { Native } from 'sentry-expo';
import { UNEXPECTED_ERROR } from './constants';
import { localAnalytics } from './analytics';

export function logErrors(e: unknown) {
  logErrorsWithMessage(e, undefined);
}

export function logErrorsWithMessage(e: unknown, message: string | undefined) {
  if (!__DEV__) Native.captureException(e instanceof Error ? e : new Error(JSON.stringify(e)));
  console.error(e);
  void localAnalytics().logEvent('ErrorEncountered', {
    action: 'ErrorEncountered',
    error: e?.toString(),
  });
  alert(message || i18n.t(UNEXPECTED_ERROR));
}

export function logErrorsWithMessageWithoutAlert(e: unknown) {
  if (!__DEV__) Native.captureException(e instanceof Error ? e : new Error(JSON.stringify(e)));
  console.error(e);
}

export class UserDoesNotExistError extends Error {}
