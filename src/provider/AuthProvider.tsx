import React, {createContext, useEffect, useState} from 'react';
import {supabase} from '../initSupabase';
import {Session} from '@supabase/supabase-js';
import {Linking} from 'react-native';

type ContextProps = {
    user: null | boolean;
    session: Session | null;
};

const AuthContext = createContext<Partial<ContextProps>>({});

interface Props {
    children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
    // user null = loading
    const [user, setUser] = useState<null | boolean>(null);
    const [session, setSession] = useState<Session | null>(null);
    useEffect(() => {
        const handleDeepLinking = async (url: string | null) => {
            if (!url) return ''
            const correctUrl = url.includes('#') ? url.replace('#', '?') : url
            const urlObject = new URL(correctUrl)
            const accessToken = urlObject.searchParams.get('access_token')
            const refreshToken = urlObject.searchParams.get('refresh_token')
            if (!refreshToken || !refreshToken) return
            // bug-fix, Buffer is used in the underlying lib, but is not imported
            global.Buffer = require('buffer').Buffer
            const res = await supabase.auth.setSession({access_token: accessToken!, refresh_token: refreshToken})
        }
        const listener = (event: { url: string }) => handleDeepLinking(event.url)
        const subscription = Linking.addEventListener('url', listener)
        Linking.getInitialURL().then(url => handleDeepLinking(url));
        return () => {
            subscription.remove()

        }
    }, [])
    useEffect(() => {
        const getInitialSession = async () => {
            const {data: {session: initialSession}} = await supabase.auth.getSession();
            setSession(initialSession);
            setUser(initialSession ? true : false);
        }
        getInitialSession()

        const {data: {subscription: authListener}} = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log(`Supabase auth event: ${event}`);
                setSession(session);
                setUser(!!session)
            }
        );
        return () => {
            authListener!.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};

export {AuthContext, AuthProvider};
