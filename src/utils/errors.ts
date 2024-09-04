import { i18n } from '@app/localization/i18n';
import * as Sentry from '@sentry/react-native';
import { UNEXPECTED_ERROR } from './constants';
import { localAnalytics } from './analytics';
import { capitalize } from './strings';
import { PostgrestError } from '@supabase/supabase-js';

export function logSupaErrors(e: PostgrestError) {
  logErrorsWithMessage(e, `${e.code}:${e.message}:${e.details}:${e.hint}`);
}

export function logErrorsWithMessage(e: any, message: string | undefined = undefined) {
  if (message) {
    if (e.message && typeof e.message === 'string') {
      e.message += ' ' + message;
    } else {
      e.message = message;
    }
  }
  baseLogError(e);
  alert(i18n.t(UNEXPECTED_ERROR));
}

export function logErrorsWithMessageWithoutAlert(e: unknown) {
  baseLogError(e);
}
export const isNetworkError = (error: any): boolean => {
  // Customize this function based on your specific needs and error structure
  // This example assumes that network errors might have a specific message or code
  if (error.message) {
    // Example: Check for common network error messages
    return (
      error.message?.toLowerCase()?.includes('network') ||
      error.message?.toLowerCase()?.includes('fetch') ||
      error.message?.toLowerCase()?.includes('timeout') ||
      error.message?.toLowerCase()?.includes('request')
    );
  }

  // If error code is available
  if (error.code) {
    // Example: Check for specific error codes indicating network issues
    return (
      error.code === 'ENOTFOUND' || error.code === 'ECONNABORTED' || error.code === 'ECONNREFUSED'
    );
  }

  // Default case: Assume it's not a network error
  return false;
};

function baseLogError(e: unknown) {
  console.error(e);
  const finalError = e instanceof Error ? e : new Error(JSON.stringify(e));
  // we don't need to care about network errors, these will always be there
  if (isNetworkError(e)) {
    return;
  }
  if (!__DEV__) Sentry.captureException(finalError);
  void localAnalytics().logEvent('ErrorEncountered', {
    action: 'ErrorEncountered',
    error: e instanceof Error ? e.message || '' : JSON.stringify(e),
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
