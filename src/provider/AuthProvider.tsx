import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '@app/api/initSupabase';
import { Linking } from 'react-native';

type ContextProps = {
  isSignedIn: null | boolean;
  setIsSignedIn: (value: boolean) => void;
};

const AuthContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

export async function setSession(
  accessToken: string,
  refreshToken: string,
  setIsSignedIn: ContextProps['setIsSignedIn'],
) {
  // bug-fix, Buffer is used in the underlying lib, but is not imported
  global.Buffer = require('buffer').Buffer;
  await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  setIsSignedIn(true);
}
const AuthProvider = (props: Props) => {
  // user null = loading
  const [isSignedIn, setIsSignedIn] = useState<null | boolean>(null);
  useEffect(() => {
    const handleDeepLinking = async (url: string | null): Promise<void> => {
      if (!url) return;
      const correctUrl = url.includes('#') ? url.replace('#', '?') : url;
      const urlObject = new URL(correctUrl);
      const accessToken = urlObject.searchParams.get('access_token');
      const refreshToken = urlObject.searchParams.get('refresh_token');
      if (!refreshToken || !refreshToken) return;
      await setSession(accessToken, refreshToken, setIsSignedIn);
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
    };
    void getInitialSession();
  }, []);

  useEffect(() => {
    if (isSignedIn) {
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
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
