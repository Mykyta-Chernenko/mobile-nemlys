import { Button, Divider, Text } from "@rneui/base";
import React from "react";
import { View } from "react-native";
import GoogleIcon from "../../icons/google";

export const GoogleOAuth = () => {

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
    <Button type="outline" onPress={() => ({})}>
      <GoogleIcon height='20' width='20'/>
      <Text style={{marginLeft:5}}>Google</Text>
    </Button>
  </View>
</>
)     }