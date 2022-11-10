import { Button, Divider, Text } from "@rneui/base";
import {startAsync } from "expo-auth-session";
import React from "react";
import {  Platform, View } from "react-native";
import GoogleIcon from "../../icons/google";
import { supabase } from "../../initSupabase";
import { EMAIL_CONFIRMED_PATH } from "../../screens/auth/EmailConfirmed";
import * as Linking from 'expo-linking';
import { Provider } from "@supabase/supabase-js";
export const GoogleOAuth = () => {
const onPress = async () => {
  const returnUrl = Linking.createURL(EMAIL_CONFIRMED_PATH)
  const signInParms = {
    provider: 'google' as Provider,
    options: {
        redirectTo: returnUrl,
    },
}
if(Platform.OS == 'web'){
  const { data, error } = await supabase.auth.signInWithOAuth(signInParms);
  
}
else{
  // fixes a bug in supabase
  const oldWindow = window;
  window = undefined as any;
  const { data, error } = await supabase.auth.signInWithOAuth(signInParms);
  const authUrl = data.url as string;
  const response = await startAsync({ authUrl, returnUrl });
  if(response.type == 'success'){
    Linking.openURL(response.url)
  }
  else if(response.type == 'error'){
    alert("Error happened: "+ response.error || response.errorCode)
  }else{
    alert("Something unexpected happened " + JSON.stringify(response))
  }
  window = oldWindow;
}
}
return (
  <>
    <Divider
      style={{ margin: 10}}
      color="gray"
      subHeader="Or continue with"
      subHeaderStyle={{ textAlign:"center" }}
      width={1}
      orientation="horizontal"
    />
    <View
      style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 5,
          justifyContent: "center",
        }}>
    <Button type="outline" onPress={onPress}>
      <GoogleIcon height='20' width='20'/>
      
      <Text style={{marginLeft:5}}>Google</Text>
    </Button>
  </View>
</>
)     }