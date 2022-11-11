import React from "react";
import { View } from "react-native";
import { MainStackParamList } from "@app/types/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { supabase } from "@app/initSupabase";
import { Button } from "@rneui/themed";


export default function ({
  navigation,
}: NativeStackScreenProps<MainStackParamList, "MainTabs">) {
  return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
<Button
              color="warning"
              title="Logout"
              onPress={async () => {
                const { error } = await supabase.auth.signOut();
                
              }}
              style={{
                marginTop: 10,
              }}
            />
      </View>
  );
}
