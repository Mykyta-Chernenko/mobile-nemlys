import { i18n } from '@app/localization/i18n';
import { Native } from 'sentry-expo';
import { UNEXPECTED_ERROR } from './constants';
import { localAnalytics } from './analytics';

export function logErrors(e: unknown) {
  logErrorsWithMessage(e, undefined);
}

export function logErrorsWithMessage(e: unknown, message: string | undefined) {
  baseLogError(e);
  alert(message || i18n.t(UNEXPECTED_ERROR));
}

export function logErrorsWithMessageWithoutAlert(e: unknown) {
  baseLogError(e);
}

function baseLogError(e: unknown) {
  if (!__DEV__) Native.captureException(e instanceof Error ? e : new Error(JSON.stringify(e)));
  console.error(e);
  void localAnalytics().logEvent('ErrorEncountered', {
    action: 'ErrorEncountered',
    error: e instanceof Error ? e : new Error(JSON.stringify(e)),
  });
}

export class UserDoesNotExistError extends Error {}
