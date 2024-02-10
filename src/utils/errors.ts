import { i18n } from '@app/localization/i18n';
import { Native } from 'sentry-expo';
import { UNEXPECTED_ERROR } from './constants';
import { localAnalytics } from './analytics';
import { capitalize } from './strings';

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

export async function retryAsync<T>(
  name: string,
  operation: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      void localAnalytics().logEvent(capitalize(name) + 'RetryOperationError', {
        screen: name,
        action: 'RetryOperationError',
        attempt: attempt,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  throw lastError;
}

export function retry<T>(name: string, operation: () => T, maxAttempts = 3): T {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return operation();
    } catch (error) {
      lastError = error;
      void localAnalytics().logEvent(capitalize(name) + 'RetryOperationError', {
        screen: name,
        action: 'RetryOperationError',
        attempt: attempt,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  throw lastError;
}
