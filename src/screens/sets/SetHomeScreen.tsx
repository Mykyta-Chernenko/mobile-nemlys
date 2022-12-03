import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import { Image } from '@rneui/themed';
import ChosenSetComponent from '@app/components/sets/ChosenSetComponent';
import NewSetComponent from '@app/components/sets/NewSetComponent';
import { ViewWithMenu } from '@app/components/common/ViewWithMenu';
import { LinearGradient } from 'expo-linear-gradient';
import { Loading } from '@app/components/utils/Loading';
export default function ({
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'SetHomeScreen'>) {
  const [loading, setLoading] = useState(true);
  const [isSetChosen, setIsSetChosen] = useState(false);

  useEffect(() => {
    async function getCurrentLevel() {
      const currentLevel = await supabase
        .from('couple_set')
        .select()
        .eq('completed', false)
        .maybeSingle();
      if (currentLevel.error) {
        alert(currentLevel.error);
      } else if (currentLevel.data) {
        setIsSetChosen(true);
      } else {
        setIsSetChosen(false);
      }
      setLoading(false);
    }
    void getCurrentLevel();
  }, [setIsSetChosen, setLoading]);

  return (
    <ViewWithMenu>
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: 'white',
        }}
      >
        <View
          style={{
            height: 250,
          }}
        >
          <Image
            resizeMode="contain"
            style={{
              height: '100%',
              width: '100%',
              justifyContent: 'flex-end',
              zIndex: 2,
            }}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={require('../../../assets/images/home.png')}
          ></Image>
          <View
            style={{
              height: 100,
              width: '100%',
              backgroundColor: 'rgba(81, 74, 191, 1)',
              zIndex: -1,
              position: 'absolute',
              marginTop: 170,
            }}
          ></View>
        </View>
        <LinearGradient
          colors={['rgb(100, 86, 171)', 'rgb(223, 220, 238)']}
          style={{
            paddingHorizontal: 15,
            padding: 15,
            flexGrow: 1,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            zIndex: 1,
          }}
        >
          {loading ? <Loading light /> : isSetChosen ? <ChosenSetComponent /> : <NewSetComponent />}
        </LinearGradient>
      </ScrollView>
    </ViewWithMenu>
  );
}
