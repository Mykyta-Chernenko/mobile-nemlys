import React, { createContext, useEffect, useState } from 'react';
import { supabase } from '@app/api/initSupabase';
import { analyticsForgetUser, analyticsIdentifyUser, localAnalytics } from '@app/utils/analytics';
import * as Sentry from '@sentry/react-native';

export const ANON_USER = 'anon';
type ContextProps = {
  isSignedIn: null | boolean;
  userId: null | string;
  setIsSignedIn: (value: boolean) => void;
  setUserId: (value: string) => void;
};

const AuthContext = createContext<Partial<ContextProps>>({});

interface Props {
  children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
  // user null = loading
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [userId, setUserIdOriginal] = useState<string | undefined>(undefined);
  const setUserId = (userId: string | undefined) => {
    if (userId !== ANON_USER) {
      Sentry.setUser({ id: userId });
      void analyticsIdentifyUser(userId);
    } else {
      Sentry.setUser(null);
      void analyticsForgetUser();
    }
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
        // TODO something so that if nothing changes, we do not reload here
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
