import React, { useContext, useEffect, useRef, useState } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthContext } from '@app/provider/AuthProvider';
import { ScrollView, View } from 'react-native';
import { useTheme } from '@rneui/themed';
import { FontText } from '@app/components/utils/FontText';
import QuestionTriangel from '@app/icons/question_triangle';
import StorySelected from '@app/icons/story_selected';
import Profile from '@app/icons/profile';
import { i18n } from '@app/localization/i18n';
import { Image } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { localAnalytics } from '@app/utils/analytics';
import { supabase } from '@app/api/initSupabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logErrors } from '@app/utils/errors';
import { Loading } from '@app/components/utils/Loading';
import { APIReflectionQuestion, APIReflectionQuestionAnswer, SupabaseAnswer } from '@app/types/api';
import Wand from '@app/icons/wand';
import SmallArrowRight from '@app/icons/small_arrow_right';
import LockWhite from '@app/icons/lock_white';
import ReflectionCorner from '@app/icons/reflection_corner';
import ReflectionCard from '@app/components/reflection/ReflectionCard';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Carousel from 'react-native-reanimated-carousel';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { shuffle } from '../../utils/array';
import ReflectionExplanation from '@app/components/reflection/ReflectionExplanation';
import { getDateFromString } from '@app/utils/date';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'ReflectionHome'>) {
  // const viewRef = useRef();
  // const [showInstagramStory, setShowInstagramStory] = useState(false);

  // const shareDummyImage = async () => {
  //   try {
  //     const capturedUri = await captureRef(viewRef, {
  //       format: 'png',
  //       quality: 1,
  //     });

  //     void Sharing.shareAsync('file://' + capturedUri, {
  //       mimeType: 'image/jpeg',
  //     });
  //   } catch (err) {
  //     logErrors(err);
  //   }
  // };
  const { theme } = useTheme();

  const [showExplanation, setShowExplanation] = useState(false);
  const [dateCount, setDateCount] = useState(0);

  const padding = 20;
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [completedReflections, setCompletedReflections] = useState<APIReflectionQuestionAnswer[]>(
    [],
  );
  const [reflectionIndex, setReflectionindex] = useState<number>(0);
  const [width, setWidth] = useState(1);

  const [reflections, setReflecitons] = useState<APIReflectionQuestion[]>([]);

  const reflectionsAvailable = 3 + dateCount - completedReflections.length;

  async function getReflectionData() {
    setLoading(true);

    const { error, count } = await supabase
      .from('date')
      .select('*', { count: 'exact' })
      .eq('active', false)
      .eq('with_partner', true);
    if (error) {
      logErrors(error);
      return;
    }
    setDateCount(count || 0);

    const completedRes: SupabaseAnswer<APIReflectionQuestionAnswer[]> = await supabase
      .from('reflection_question_answer')
      .select(
        'id,reflection_id,answer,user_id,created_at,updated_at, reflection_question(reflection, level)',
      )
      .eq('user_id', authContext.userId)
      .order('created_at', { ascending: false });
    if (completedRes.error) {
      logErrors(completedRes.error);
      return;
    }

    setCompletedReflections(completedRes.data);

    const availableReflections: SupabaseAnswer<APIReflectionQuestion[]> = await supabase
      .from('reflection_question')
      .select('id, slug, reflection, level, active, created_at,updated_at')
      .eq('active', true)
      .gt('level', 0)
      .not('id', 'in', `(${completedRes.data.map((x) => x.reflection_id).join(',')})`);
    if (availableReflections.error) {
      logErrors(availableReflections.error);
      return;
    }
    setReflecitons(shuffle(availableReflections.data));

    setLoading(false);
    setShowExplanation(false);
    setReflectionindex(0);

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
    setReflectionindex(index);
    carouselRef?.current?.scrollTo({ index, animated: true });
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

  const getLevelText = (level: number, index: number) => {
    if (level === 0) return i18n.t('reflection.level_0');
    const introductionLevels = completedReflections.filter(
      (x) => x.reflection_question.level === 0,
    ).length;
    const l = completedReflections.length - introductionLevels - index;
    return i18n.t('reflection.level', { number: l });
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
        setWidth(width - padding * 2);
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
                  <FontText style={{ color: theme.colors.grey3, marginTop: '2%' }}>
                    {dateCount + 1} {i18n.t('level')}
                  </FontText>
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
                <TouchableOpacity
                  onPress={() => {
                    void localAnalytics().logEvent('ReflectionExplanationOpened', {
                      screen: 'ReflectionExplanation',
                      action: 'Opened',
                      userId: authContext.userId,
                    });
                    setShowExplanation(true);
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignContent: 'space-between',
                      backgroundColor: theme.colors.white,
                      padding: 20,
                      paddingHorizontal: 30,
                      borderRadius: 16,
                    }}
                  >
                    <Wand></Wand>
                    <View style={{ marginRight: 10, marginLeft: 5 }}>
                      <FontText style={{ marginLeft: 5 }}>
                        {i18n.t('onboarding.reflection.explanation')}
                      </FontText>
                    </View>
                    <SmallArrowRight></SmallArrowRight>
                  </View>
                </TouchableOpacity>
                <ReflectionExplanation
                  show={showExplanation}
                  onClose={() => setShowExplanation(false)}
                ></ReflectionExplanation>
              </View>
              <FontText h3 style={{ marginTop: 20 }}>
                {i18n.t('reflection.available', { number: reflectionsAvailable })}
              </FontText>
              {/* <PrimaryButton title={'share'} onPress={() => void shareDummyImage()}></PrimaryButton> */}

              {reflectionsAvailable > 0 ? (
                // <ViewShot style={{ height: 400 }} ref={viewRef}>
                <View style={{ height: 400 }}>
                  <ReflectionCard>
                    <View
                      style={{
                        flex: 1,
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
                          disabled={reflectionIndex === 0}
                          onPress={() => {
                            void localAnalytics().logEvent('ReflectionHomeGetPreviousReflection', {
                              screen: 'ReflectionHome',
                              action: 'GetPreviousRefleciton',
                              userId: authContext.userId,
                              currentReflection: reflections[reflectionIndex],
                            });
                            const newIndex =
                              reflectionIndex - 1 >= 0
                                ? reflectionIndex - 1
                                : reflections.length - 1;

                            handleNewIndex(newIndex);
                          }}
                        >
                          <Image
                            resizeMode="contain"
                            style={{
                              height: 24,
                              width: 24,
                              opacity: reflectionIndex === 0 ? 0.7 : 1,
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
                          disabled={reflectionIndex === reflections.length - 1}
                          onPress={() => {
                            void localAnalytics().logEvent('ReflectionHomeGetNextReflection', {
                              screen: 'ReflectionHome',
                              action: 'GetNextRefleciton',
                              userId: authContext.userId,
                              currentReflection: reflections[reflectionIndex],
                            });
                            const newIndex =
                              reflectionIndex + 1 <= reflections.length - 1
                                ? reflectionIndex + 1
                                : 0;

                            handleNewIndex(newIndex);
                          }}
                        >
                          <Image
                            resizeMode="contain"
                            style={{
                              height: 24,
                              width: 24,
                              opacity: reflectionIndex === reflections.length - 1 ? 0.7 : 1,
                            }}
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                            source={require('../../../assets/images/arrow_right_white.png')}
                          />
                        </TouchableOpacity>
                      </View>
                      <GestureHandlerRootView
                        style={{
                          flex: 1,
                        }}
                      >
                        <Carousel
                          ref={carouselRef}
                          vertical={false}
                          width={width}
                          loop={false}
                          autoPlay={false}
                          onScrollEnd={(index: number) => {
                            setReflectionindex(index);
                          }}
                          mode="parallax"
                          modeConfig={{
                            parallaxScrollingScale: 1,
                            parallaxScrollingOffset: 0,
                          }}
                          data={reflections}
                          renderItem={({ index }: { index: number }) => {
                            return (
                              <View
                                style={{
                                  paddingHorizontal: padding * 2,
                                  justifyContent: 'center',
                                  alignItems: 'center',

                                  flex: 1,
                                }}
                              >
                                <FontText h3 style={{ color: theme.colors.white }}>
                                  {reflections[index].reflection}
                                </FontText>
                              </View>
                            );
                          }}
                        />
                      </GestureHandlerRootView>
                      <PrimaryButton
                        title={i18n.t('reflection.start')}
                        buttonStyle={{
                          backgroundColor: theme.colors.warning,
                          paddingHorizontal: 60,
                        }}
                        onPress={() =>
                          writeReflection(
                            reflections[reflectionIndex].id,
                            reflections[reflectionIndex].reflection,
                          )
                        }
                        titleStyle={{ color: theme.colors.black }}
                      ></PrimaryButton>
                    </View>
                  </ReflectionCard>
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
                    <FontText style={{ color: theme.colors.grey5 }}>
                      {getLevelText(r.reflection_question.level as number, i)}
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
              height: 70,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.white,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                flexDirection: 'row',
                justifyContent: 'space-around',
                paddingTop: '5%',
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                onPress={() => {
                  void localAnalytics().logEvent('MenuHomeClicked', {
                    screen: 'Menu',
                    action: 'HomeClicked',
                    userId: authContext.userId,
                  });
                  navigation.navigate('Home', {
                    refreshTimeStamp: new Date().toISOString(),
                  });
                }}
              >
                <QuestionTriangel height={32} width={32}></QuestionTriangel>
                <FontText style={{ marginTop: 5, color: theme.colors.grey3 }}>
                  {i18n.t('home.menu.discuss')}
                </FontText>
              </TouchableOpacity>

              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <StorySelected height={32} width={32}></StorySelected>
                <FontText style={{ marginTop: 5 }}>{i18n.t('home.menu.reflect')}</FontText>
              </View>
              <TouchableOpacity
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                onPress={() => {
                  void localAnalytics().logEvent('MenuProfileClicked', {
                    screen: 'Menu',
                    action: 'ProfileClicked',
                    userId: authContext.userId,
                  });
                  navigation.navigate('Profile', {
                    refreshTimeStamp: new Date().toISOString(),
                  });
                }}
              >
                <Profile height={32} width={32}></Profile>
                <FontText style={{ marginTop: 5, color: theme.colors.grey3 }}>
                  {i18n.t('home.menu.profile')}
                </FontText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
