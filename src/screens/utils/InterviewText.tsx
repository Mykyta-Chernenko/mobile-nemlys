import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText, getFontSizeForScreen } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { useTheme, useThemeMode } from '@rneui/themed';
import { MainStackParamList } from '@app/types/navigation';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import { CloseButton } from '@app/components/buttons/CloseButton';
import { logSupaErrors } from '@app/utils/errors';
import { supabase } from '@app/api/initSupabase';
import { ScrollView } from 'react-native';
import { getNow } from '@app/utils/date';
import { Loading } from '@app/components/utils/Loading';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'InterviewText'>) {
  // to set the color of status bar
  const { setMode } = useThemeMode();
  const [isLoading, isetIsLoading] = useState(false);
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('dark'));
    return unsubscribeFocus;
  }, [navigation]);

  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const loadData = async () => {
    isetIsLoading(true);
    const r = await supabase
      .from('user_technical_details')
      .select('agreed_on_text_interview')
      .eq('user_id', authContext.userId!)
      .single();
    if (r.error) {
      logSupaErrors(r.error);
      return;
    }
    if (r.data.agreed_on_text_interview) {
      void localAnalytics().logEvent('InterviewTextAlreadyAgreedClosing', {
        screen: 'InterviewText',
        action: 'AlreadyAgreedClosing',
        userId: authContext.userId,
      });
      navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
    } else {
      void localAnalytics().logEvent('InterviewTextShowed', {
        screen: 'InterviewText',
        action: 'Showed',
        userId: authContext.userId,
      });
      isetIsLoading(false);
    }
  };

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void loadData();
    }
  }, [route.params?.refreshTimeStamp]);
  useEffect(() => {
    void loadData();
    isFirstMount.current = false;
  }, []);

  const saveAgreed = async (agreed: boolean) => {
    const r = await supabase
      .from('user_profile')
      .update({
        showed_interview_request: true,
        updated_at: getNow().toISOString(),
      })
      .eq('user_id', authContext.userId!);
    if (r.error) {
      logSupaErrors(r.error);
      return;
    }
    const newResponse = await supabase
      .from('user_technical_details')
      .update({
        agreed_on_text_interview: agreed,
        showed_text_interview: true,
        updated_at: getNow().toISOString(),
      })
      .eq('user_id', authContext.userId!);

    if (newResponse.error) {
      logSupaErrors(newResponse.error);
      return;
    }
    navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
  };
  const onPress = async () => {
    void localAnalytics().logEvent('InterviewTextAgreed', {
      screen: 'InterviewText',
      action: 'Agreed',
      userId: authContext.userId,
    });
    void saveAgreed(true);
    const user = await supabase.auth.getUser();
    alert(i18n.t('interview_text.thank', { email: user.data.user?.email }));
  };
  const onClosePressed = () => {
    void localAnalytics().logEvent('InterviewTextClosePressed', {
      screen: 'InterviewText',
      action: 'ClosePressed',
      userId: authContext.userId,
    });
    void saveAgreed(false);
  };
  const Content = (
    <SafeAreaView style={{ flexGrow: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 15,
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <CloseButton onPress={onClosePressed} theme="black"></CloseButton>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Image
            style={{
              height: getFontSizeForScreen('h2') * 2,
              width: getFontSizeForScreen('h2') * 2,
            }}
            source={require('../../../assets/images/mykyta.png')}
          ></Image>
          <Image
            style={{
              height: getFontSizeForScreen('h2') * 2,
              width: getFontSizeForScreen('h2') * 2,
            }}
            source={require('../../../assets/images/mark.png')}
          ></Image>
          <Image
            style={{
              height: getFontSizeForScreen('h2') * 2,
              width: getFontSizeForScreen('h2') * 2,
            }}
            source={require('../../../assets/images/lily.png')}
          ></Image>
        </View>
        <View>
          <FontText h1 style={{ color: theme.colors.white }}>
            {i18n.t('interview_text.title_first')}
            <FontText h1 style={{ color: theme.colors.primary }}>
              {i18n.t('interview_text.title_second')}
            </FontText>
          </FontText>
        </View>
        <View>
          {[
            { i: 1, color: theme.colors.primary },
            { i: 2, color: theme.colors.error },
            { i: 3, color: theme.colors.warning },
          ].map((x) => (
            <View
              key={x.i}
              style={{
                marginTop: 10,
                paddingHorizontal: 20,
                minHeight: 80,
                alignItems: 'center',
                justifyContent: 'flex-start',
                flexDirection: 'row',
                backgroundColor: 'rgba(245, 233, 235, 0.1)',
                borderRadius: 20,
              }}
            >
              <View
                style={{
                  borderRadius: 100,
                  height: 32,
                  width: 32,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.colors.black,
                  marginRight: 10,
                }}
              >
                <FontText style={{ color: theme.colors.white }}>{x.i}</FontText>
              </View>
              <View
                style={{
                  flex: 1,
                }}
              >
                <FontText style={{ color: theme.colors.white }}>
                  {i18n.t(`interview_text.reason_${x.i}_title_1`)}
                  <FontText style={{ color: x.color }}>
                    {i18n.t(`interview_text.reason_${x.i}_title_2`)}
                  </FontText>
                  {i18n.t(`interview_text.reason_${x.i}_title_3`)}
                </FontText>
              </View>
            </View>
          ))}
        </View>

        <SecondaryButton
          buttonStyle={{ marginBottom: 10 }}
          title={i18n.t('interview_text.button')}
          onPress={() => void onPress()}
        ></SecondaryButton>
      </ScrollView>
    </SafeAreaView>
  );
  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.black,
      }}
    >
      {isLoading ? <Loading light></Loading> : Content}
    </View>
  );
}
