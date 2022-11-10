import React from "react";
import 'react-native-url-polyfill/auto'
import {StatusBar} from "expo-status-bar";
import Navigation from "./src/navigation";
import {AuthProvider} from "./src/provider/AuthProvider";

export default function App() {
    return (
        <>
            <AuthProvider>
                <Navigation/>
            </AuthProvider>
            <StatusBar/>
        </>
    );
}
