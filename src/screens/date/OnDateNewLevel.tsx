import React, { useContext, useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { Image, useTheme } from '@rneui/themed';
import { logErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { MainStackParamList } from '@app/types/navigation';
import { SecondaryButton } from '../../components/buttons/SecondaryButton';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import { Loading } from '../../components/utils/Loading';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'OnDateNewLevel'>) {
  const { withPartner } = route.params;
  const { theme } = useTheme();
  const [dateCount, setDateCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    const f = async () => {
      setLoading(true);
      const { error, count } = await supabase
        .from('date')
        .select('*', { count: 'exact' })
        .eq('active', false)
        .eq('stopped', false);
      if (error) {
        logErrors(error);
        return;
      }
      setDateCount(count || 0);
      if ((count || 0) === 1 && withPartner) {
        void localAnalytics().logEvent('NewLevelFirstDateFinished', {
          screen: 'NewLevel',
          action: 'FirstDateFinished',
          userId: authContext.userId,
        });
      } else {
        void localAnalytics().logEvent('NewLevelDateFinished', {
          screen: 'NewLevel',
          action: 'DateFinished',
          userId: authContext.userId,
        });
      }
      setLoading(false);
    };
    void f();
  }, [authContext.userId, withPartner]);

  const handleHomePress = () => {
    setLoading(true);

    void localAnalytics().logEvent('NewLevelNextClicked', {
      screen: 'NewLevel',
      action: 'NextClicked',
      userId: authContext.userId,
    });

    navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
    setLoading(false);
  };
  return loading ? (
    <Loading></Loading>
  ) : (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.black,
      }}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <ScrollView
          contentContainerStyle={{
            marginTop: '10%',
            flexGrow: 1,
            paddingHorizontal: 15,
            justifyContent: 'space-around',
            width: '100%',
          }}
        >
          <View style={{ width: '100%', height: '50%' }}>
            <Image
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: 300,
              }}
              resizeMode="contain"
              source={require('../../../assets/images/new_level.png')}
            >
              <FontText h1 style={{ color: theme.colors.white }}>
                {i18n.t('level')} {dateCount + 1}
              </FontText>
              <FontText style={{ color: theme.colors.white }}>
                {withPartner ? i18n.t('date.new_level.reached') : i18n.t('date.new_level.have')}
              </FontText>
            </Image>
          </View>
          <View style={{ alignItems: 'center' }}>
            <FontText h1 style={{ color: theme.colors.white }}>
              {withPartner
                ? i18n.t('date.new_level.title_first')
                : i18n.t('date.new_level.alone_title_first')}
            </FontText>
            <FontText h1 style={{ color: theme.colors.primary }}>
              {i18n.t('date.new_level.title_second')}
            </FontText>
          </View>
          <View>
            <SecondaryButton
              containerStyle={{ marginTop: 10 }}
              buttonStyle={{ width: '100%' }}
              onPress={() => void handleHomePress()}
              title={i18n.t('date.new_level.home')}
            ></SecondaryButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
