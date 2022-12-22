import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '@app/api/initSupabase';
import { Linking } from 'react-native';
import { SupabaseUser } from '@app/types/api';
import * as Sentry from 'sentry-expo';
import { i18n } from '@app/localization/i18n';

export type HandleUser = (user: SupabaseUser, exists: boolean) => Promise<void>;
type ContextProps = {
  isSignedIn: null | boolean;
  setIsSignedIn: (value: boolean) => void;
  setHandleUser: (value: HandleUser | null) => void;
};

const AuthContext = createContext<Partial<ContextProps>>({});

export async function setSession(accessToken: string, refreshToken: string) {
  // bug-fix, Buffer is used in the underlying lib, but is not imported
  global.Buffer = require('buffer').Buffer;

  await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
}

export async function handleAuthTokens(
  accessToken: string,
  refreshToken: string,
  handleUser: HandleUser,
  setIsSignedIn: (value: boolean) => void,
) {
  await setSession(accessToken, refreshToken);
  const { data: user, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  } else {
    const userId = user.user.id;
    const { error, count } = await supabase
      .from('user_profile')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    if (error) {
      throw error;
    }
    await handleUser(user.user, !!count);
    setIsSignedIn(true);
  }
}

interface Props {
  children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
  // user null = loading
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [handleUser, setHandleUser] = useState<HandleUser | null>(null);
  useEffect(() => {
    const handleDeepLinking = async (url: string | null): Promise<void> => {
      if (!url) return;
      const correctUrl = url.includes('#') ? url.replace('#', '?') : url;
      const urlObject = new URL(correctUrl);
      const accessToken = urlObject.searchParams.get('access_token');
      const refreshToken = urlObject.searchParams.get('refresh_token');
      if (!accessToken || !refreshToken) return;
      Sentry.Native.captureMessage(url);
      if (handleUser) {
        try {
          await handleAuthTokens(accessToken, refreshToken, handleUser, setIsSignedIn);
          setHandleUser(null);
        } catch (e: unknown) {
          Sentry.Native.captureException(e);
          alert(
            e?.['message']
              ? `Error happened: ${e?.['message'] as string}`
              : i18n.t('unexpected_error'),
          );
          await supabase.auth.signOut();
        }
      } else {
        await setSession(accessToken, refreshToken);
        setIsSignedIn(true);
      }
    };
    // # TODO maybe this is how it works
    const listener = (event: { url: string }) => {
      void handleDeepLinking(event.url);
    };
    const subscription = Linking.addEventListener('url', listener);
    void Linking.getInitialURL().then((url) => handleDeepLinking(url));
    return () => {
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();
      setIsSignedIn(!!initialSession);
    };
    void getInitialSession();
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      console.log('Listen to supabasse events');
      const {
        data: { subscription: authListener },
      } = supabase.auth.onAuthStateChange((event, session) => {
        console.log(`Supabase auth event: ${event}`);
        setIsSignedIn(!!session);
      });
      return () => {
        console.log('Unsubsribing fromm supabase onAuthStateChange events');
        authListener.unsubscribe();
      };
    }
  }, [isSignedIn]);
  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        setIsSignedIn,
        setHandleUser,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
