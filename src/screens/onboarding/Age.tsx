import React, { useContext, useState } from 'react';
import { ImageBackground, ScrollView, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { FontText } from '@app/components/utils/FontText';
import { Progress } from '@app/components/utils/Progress';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { logErrorsWithMessage } from '@app/utils/errors';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ({ route, navigation }: NativeStackScreenProps<MainStackParamList, 'Age'>) {
  const { theme } = useTheme();
  const [chosen, setChosen] = useState<string | undefined>(undefined);
  const choices = [
    { slug: '0-18', title: i18n.t('onboarding.age.choice_1') },
    { slug: '18-24', title: i18n.t('onboarding.age.choice_2') },
    { slug: '25-34', title: i18n.t('onboarding.age.choice_3') },
    { slug: '35-44', title: i18n.t('onboarding.age.choice_4') },
    { slug: '45-54', title: i18n.t('onboarding.age.choice_5') },
    { slug: '55-150', title: i18n.t('onboarding.age.choice_6') },
  ];
  const authContext = useContext(AuthContext);

  const handlePress = async () => {
    await supabase
      .from('onboarding_poll')
      .delete()
      .match({ user_id: authContext.userId, question_slug: 'age' });
    const dateReponse = await supabase
      .from('onboarding_poll')
      .insert({ user_id: authContext.userId, question_slug: 'age', answer_slug: chosen });
    if (dateReponse.error) {
      logErrorsWithMessage(dateReponse.error, dateReponse.error.message);
      return;
    }
    void localAnalytics().logEvent('AgeContinueClicked', {
      screen: 'Age',
      action: 'ContinueClicked',
      age: chosen,
      userId: authContext.userId,
    });
    navigation.navigate('DatingLength');
  };
  return (
    <ImageBackground
      style={{
        flexGrow: 1,
      }}
      source={require('../../../assets/images/onboarding_background.png')}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <View style={{ flexGrow: 1, padding: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 15,
              alignItems: 'center',
              justifyContent: 'center',
              height: 32,
            }}
          >
            <GoBackButton
              theme="light"
              containerStyle={{ position: 'absolute', left: 0 }}
              onPress={() => {
                void localAnalytics().logEvent('AgeBackClicked', {
                  screen: 'Age',
                  action: 'BackClicked',
                  userId: authContext.userId,
                });
                navigation.navigate('PartnerName');
              }}
            ></GoBackButton>
            <Progress current={3} all={6}></Progress>
          </View>
          <View
            style={{
              flexGrow: 1,
              marginTop: '10%',
            }}
          >
            <FontText
              style={{
                textAlign: 'left',
              }}
              h1
            ></FontText>
            <FontText
              style={{
                textAlign: 'left',
              }}
              h1
            >
              {i18n.t('onboarding.age.title_first')}
              <FontText style={{ color: theme.colors.primary }} h1>
                {i18n.t('onboarding.age.title_second')}
              </FontText>
              {i18n.t('onboarding.age.title_third')}
            </FontText>
            <ScrollView style={{ marginTop: '5%', flex: 1 }}>
              {choices.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  style={{
                    marginTop: 10,
                    borderRadius: 20,
                    backgroundColor: theme.colors.white,
                    borderColor: c.slug === chosen ? theme.colors.black : theme.colors.white,
                    borderWidth: 1,
                    padding: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => void setChosen(c.slug)}
                >
                  <FontText style={{ marginLeft: 10 }}>{c.title}</FontText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        <View style={{ padding: 20 }}>
          <PrimaryButton
            disabled={!chosen}
            title={i18n.t('continue')}
            onPress={() => void handlePress()}
          />
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
