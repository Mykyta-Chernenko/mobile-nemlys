import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '@app/api/initSupabase';
import { Linking } from 'react-native';
import { SupabaseUser } from '@app/types/api';
import { logErrors } from '@app/utils/errors';
import { analyticsIdentifyUser } from '@app/utils/analytics';

export type HandleUser = (user: SupabaseUser, exists: boolean) => Promise<void>;
export const ANON_USER = 'anon';
type ContextProps = {
  isSignedIn: null | boolean;
  userId: null | string;
  setIsSignedIn: (value: boolean) => void;
  setUserId: (value: string) => void;
};

export const globalHandleUser: { value: HandleUser | null } = {
  value: null,
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
  setUserId: (value: string) => void,
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
    setUserId(user.user.id);
  }
}

interface Props {
  children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
  // user null = loading
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [userId, setUserIdOriginal] = useState<string | undefined>(undefined);
  const setUserId = (userId: string | undefined) => {
    void analyticsIdentifyUser(userId);
    setUserIdOriginal(userId);
  };
  useEffect(() => {
    const handleDeepLinking = async (url: string | null): Promise<void> => {
      if (!url) return;
      const correctUrl = url.includes('#') ? url.replace('#', '?') : url;
      const urlObject = new URL(correctUrl);
      const accessToken = urlObject.searchParams.get('access_token');
      const refreshToken = urlObject.searchParams.get('refresh_token');
      if (!accessToken || !refreshToken) return;
      const defaultUserHandler = async (_user: SupabaseUser, _exists: boolean) => {};

      try {
        await handleAuthTokens(
          accessToken,
          refreshToken,
          globalHandleUser.value || defaultUserHandler,
          setIsSignedIn,
          setUserId,
        );
        globalHandleUser.value = null;
      } catch (e: unknown) {
        logErrors(e as Error);
        await supabase.auth.signOut();
      }
    };
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
      setUserId(initialSession?.user.id || ANON_USER);
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
        setUserId(session?.user.id || ANON_USER);
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
        setUserId,
        userId,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
