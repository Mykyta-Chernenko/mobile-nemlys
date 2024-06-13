import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '@app/api/initSupabase';
import { SupabaseUser } from '@app/types/api';
import { analyticsIdentifyUser, localAnalytics } from '@app/utils/analytics';

export type HandleUser = (user: SupabaseUser) => Promise<void>;
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

interface Props {
  children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
  // user null = loading
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [userId, setUserIdOriginal] = useState<string | undefined>(undefined);
  const setUserId = (userId: string | undefined) => {
    void analyticsIdentifyUser(userId === ANON_USER ? undefined : userId);
    setUserIdOriginal(userId);
  };

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
        setIsSignedIn(!!session);
        setUserId(session?.user.id || ANON_USER);
        localAnalytics().logEvent('SupabaseAuthEvent', {
          event,
          userId: session?.user.id || userId || ANON_USER,
        });
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
