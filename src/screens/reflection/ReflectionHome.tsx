import React, { useContext, useEffect, useRef, useState } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthContext } from '@app/provider/AuthProvider';
import { ScrollView, View } from 'react-native';
import { useTheme } from '@rneui/themed';
import { FontText, getFontSizeForScreen } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { localAnalytics } from '@app/utils/analytics';
import { supabase } from '@app/api/initSupabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logSupaErrors } from '@app/utils/errors';
import { Loading } from '@app/components/utils/Loading';
import { APIReflectionQuestion, APIReflectionQuestionAnswer } from '@app/types/api';
import Bulb from '@app/icons/bulb';
import SmallArrowRight from '@app/icons/small_arrow_right';
import LockWhite from '@app/icons/lock_white';
import ReflectionCorner from '@app/icons/reflection_corner';
import ReflectionCard from '@app/components/reflection/ReflectionCard';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { shuffle } from '@app/utils/array';
import { getDateFromString } from '@app/utils/date';
import Menu from '@app/components/menu/Menu';
import SwiperFlatList from 'react-native-swiper-flatlist';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'ReflectionHome'>) {
  const { theme } = useTheme();

  const [dateCount, setDateCount] = useState(0);

  const padding = 20;
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [completedReflections, setCompletedReflections] = useState<APIReflectionQuestionAnswer[]>(
    [],
  );
  const [width, setWidth] = useState(1);

  const [reflections, setReflections] = useState<APIReflectionQuestion[]>([]);

  const reflectionsAvailable = 3 + dateCount - completedReflections.length;

  async function getReflectionData() {
    setLoading(true);

    const { error, count } = await supabase
      .from('date')
      .select('*', { count: 'exact' })
      .eq('active', false)
      .eq('stopped', false);
    if (error) {
      logSupaErrors(error);
      return;
    }
    setDateCount(count || 0);

    const completedRes = await supabase
      .from('reflection_question_answer')
      .select(
        'id,reflection_id,answer,user_id,created_at,updated_at, reflection_question(reflection, level)',
      )
      .eq('user_id', authContext.userId!)
      .order('created_at', { ascending: false });
    if (completedRes.error) {
      logSupaErrors(completedRes.error);
      return;
    }

    setCompletedReflections(completedRes.data);

    const availableReflections = await supabase
      .from('reflection_question')
      .select('id, slug, reflection, level, active, created_at,updated_at')
      .eq('active', true)
      .gt('level', 0)
      .not('id', 'in', `(${completedRes.data.map((x) => x.reflection_id).join(',')})`);
    if (availableReflections.error) {
      logSupaErrors(availableReflections.error);
      return;
    }
    setReflections(
      shuffle(availableReflections.data).map((x, index) => ({
        ...x,
        index,
      })),
    );

    setLoading(false);

    void localAnalytics().logEvent('ReflectionHomeLoaded', {
      screen: 'ReflectionHome',
      action: 'Loaded',
      userId: authContext.userId,
    });
  }
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void getReflectionData();
    }
  }, [route?.params?.refreshTimeStamp]);
  useEffect(() => {
    void getReflectionData();
    isFirstMount.current = false;
  }, []);

  const carouselRef = useRef(null) as any;
  const handleNewIndex = (index: number) => {
    carouselRef?.current?.scrollToIndex({ index, animated: true });
  };

  const writeReflection = (reflectionId: number, question: string) => {
    void localAnalytics().logEvent('ReflectionHomeWriteNew', {
      screen: 'ReflectionHome',
      action: 'Start button clicked',
      userId: authContext.userId,
      reflectionId: reflectionId,
    });

    navigation.navigate('WriteReflection', { reflectionId, question, answer: undefined });
  };

  const rewriteReflection = (reflectionId: number, question: string, answer: string) => {
    void localAnalytics().logEvent('ReflectionHomeChangeReflection', {
      screen: 'ReflectionHome',
      action: 'ChangeReflection',
      userId: authContext.userId,
      reflectionId: reflectionId,
    });

    navigation.navigate('WriteReflection', { reflectionId, question, answer });
  };

  const getFontSize = (reflection) => {
    if (reflection.length > 70) {
      return { h4: true };
    } else {
      return { h3: true };
    }
  };

  return loading ? (
    <Loading></Loading>
  ) : (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.white,
      }}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setWidth(width);
      }}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <View
          style={{
            flexGrow: 1,
            padding: padding,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.grey1,
              marginHorizontal: -padding,
              height: 50,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.white,
                borderBottomLeftRadius: 24,
                borderBottomRightRadius: 24,
                flexDirection: 'row',
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                }}
              >
                <View
                  style={{
                    flexDirection: 'column',
                    paddingHorizontal: padding,
                    paddingBottom: '3%',
                  }}
                >
                  <FontText h3>{i18n.t('reflection.title')}</FontText>
                  <FontText style={{ color: theme.colors.grey3, marginTop: '2%' }}></FontText>
                </View>
                <View
                  style={{
                    justifyContent: 'flex-end',
                  }}
                >
                  <ReflectionCorner />
                </View>
              </View>
            </View>
          </View>
          <ScrollView
            style={{ flex: 1, backgroundColor: theme.colors.grey1, marginHorizontal: -padding }}
          >
            <View style={{ padding, flex: 1 }}>
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    backgroundColor: theme.colors.white,
                    padding: 20,
                    paddingHorizontal: 20,
                    borderRadius: 16,
                  }}
                >
                  <Bulb></Bulb>
                  <View style={{ marginLeft: 10 }}>
                    <FontText>{i18n.t('onboarding.reflection.explanation')}</FontText>
                  </View>
                </View>
              </View>
              <FontText h3 style={{ marginTop: 20 }}>
                {i18n.t('reflection.available', { number: reflectionsAvailable })}
              </FontText>

              {reflectionsAvailable > 0 ? (
                <View style={{ height: 400, marginHorizontal: -20 }}>
                  <SwiperFlatList
                    ref={carouselRef}
                    index={0}
                    data={reflections}
                    renderItem={({ item }) => {
                      return (
                        <View style={{ margin: padding }}>
                          <ReflectionCard>
                            <View
                              style={{
                                flex: 1,
                                width: width - 40,
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding,
                                paddingHorizontal: padding * 2,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'center',
                                }}
                              >
                                <TouchableOpacity
                                  style={{
                                    borderRadius: 40,
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 40,
                                    width: 40,
                                    marginRight: 3,
                                  }}
                                  disabled={item.index === 0}
                                  onPress={() => {
                                    void localAnalytics().logEvent(
                                      'ReflectionHomeGetPreviousReflection',
                                      {
                                        screen: 'ReflectionHome',
                                        action: 'GetPreviousRefleciton',
                                        userId: authContext.userId,
                                        currentReflection: item.reflection,
                                      },
                                    );
                                    const newIndex =
                                      item.index - 1 >= 0 ? item.index - 1 : reflections.length - 1;

                                    handleNewIndex(newIndex);
                                  }}
                                >
                                  <Image
                                    resizeMode="contain"
                                    style={{
                                      height: 24,
                                      width: 24,
                                      opacity: item.index === 0 ? 0.7 : 1,
                                    }}
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                    source={require('../../../assets/images/arrow_left_white.png')}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={{
                                    borderRadius: 40,
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 40,
                                    width: 40,
                                    marginLeft: 3,
                                  }}
                                  disabled={item.index === reflections.length - 1}
                                  onPress={() => {
                                    void localAnalytics().logEvent(
                                      'ReflectionHomeGetNextReflection',
                                      {
                                        screen: 'ReflectionHome',
                                        action: 'GetNextRefleciton',
                                        userId: authContext.userId,
                                        currentReflection: item.reflection,
                                      },
                                    );
                                    const newIndex =
                                      (item.index as number) + 1 <= reflections.length - 1
                                        ? (item.index as number) + 1
                                        : 0;

                                    handleNewIndex(newIndex);
                                  }}
                                >
                                  <Image
                                    resizeMode="contain"
                                    style={{
                                      height: 24,
                                      width: 24,
                                      opacity: item.index === reflections.length - 1 ? 0.7 : 1,
                                    }}
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                    source={require('../../../assets/images/arrow_right_white.png')}
                                  />
                                </TouchableOpacity>
                              </View>

                              <View
                                style={{
                                  // paddingHorizontal: padding * 2,
                                  justifyContent: 'center',
                                  alignItems: 'center',

                                  flex: 1,
                                }}
                              >
                                <FontText
                                  {...getFontSize((item as APIReflectionQuestion).reflection)}
                                  style={{ color: theme.colors.white }}
                                >
                                  {(item as APIReflectionQuestion).reflection}
                                </FontText>
                              </View>

                              <PrimaryButton
                                title={i18n.t('reflection.start')}
                                buttonStyle={{
                                  backgroundColor: theme.colors.warning,
                                  paddingHorizontal: 60,
                                }}
                                onPress={() =>
                                  writeReflection(
                                    (item as APIReflectionQuestion).id,
                                    (item as APIReflectionQuestion).reflection,
                                  )
                                }
                                titleStyle={{ color: theme.colors.black }}
                              ></PrimaryButton>
                            </View>
                          </ReflectionCard>
                        </View>
                      );
                    }}
                  ></SwiperFlatList>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignContent: 'space-between',
                    backgroundColor: theme.colors.black,
                    padding: 20,
                    paddingHorizontal: 30,
                    borderRadius: 16,
                    marginTop: 20,
                  }}
                >
                  <LockWhite></LockWhite>
                  <View style={{ marginRight: 40, marginLeft: 10 }}>
                    <FontText style={{ color: theme.colors.white }}>
                      {i18n.t('reflection.no_reflection')}
                    </FontText>
                  </View>
                  <SmallArrowRight></SmallArrowRight>
                </TouchableOpacity>
              )}
              <FontText h3 style={{ marginTop: 20 }}>
                {i18n.t('reflection.completed', { number: completedReflections.length })}
              </FontText>
              {completedReflections.map((r, i) => (
                <TouchableOpacity
                  key={i}
                  style={{
                    backgroundColor: theme.colors.white,
                    borderRadius: 16,
                    marginTop: 20,
                    padding: 20,
                  }}
                  onPress={() =>
                    rewriteReflection(
                      r.reflection_id,
                      r.reflection_question.reflection as string,
                      r.answer,
                    )
                  }
                >
                  <FontText h3>{r.reflection_question.reflection}</FontText>
                  <FontText style={{ marginVertical: 15 }}>{r.answer}</FontText>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <FontText style={{ color: theme.colors.grey5 }}>
                      {getDateFromString(r.created_at).format('DD MMM')}
                    </FontText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View
            style={{
              backgroundColor: theme.colors.grey1,
              marginHorizontal: -padding,
              height: getFontSizeForScreen('h1') * 2,
            }}
          >
            <Menu></Menu>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
