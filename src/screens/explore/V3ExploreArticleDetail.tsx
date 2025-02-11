import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@rneui/themed';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { MainStackParamList } from '@app/types/navigation';
import { BACKGROUND_LIGHT_BEIGE_COLOR, MEDIUM_BEIGE_COLOR } from '@app/utils/colors';
import { logSupaErrors } from '@app/utils/errors';
import { localAnalytics } from '@app/utils/analytics';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { i18n } from '@app/localization/i18n';
import { handleRemindPartner } from '@app/utils/sendNotification';
import { showName } from '@app/utils/strings';
import PremiumLock from '@app/icons/premium_lock';
import Option1 from '@app/icons/option_1';
import Option2 from '@app/icons/option_2';
import Option3 from '@app/icons/option_3';
import Option4 from '@app/icons/option_4';
import Option5 from '@app/icons/option_5';
import { contentListScreen, contentTypeBackground } from '@app/types/domain';
import V3LayeredGreyImage from '@app/components/explore/V3LayeredGreyImage';
import ContentBuddyPink from '@app/icons/content_buddy_pink';
import IconStar from '@app/icons/selected_star';
import { getContentImageFromId } from '@app/utils/content';
import ContentBuddyPurple from '@app/icons/content_buddy_purple';
import Remind from '@app/icons/remind';
import V3ContentDetailInfoBlock from '@app/components/explore/V3ContentDetailInfoBlock';
import { PostgrestError } from '@supabase/supabase-js';
import { ContentFeedback } from '@app/components/content/ContentFeedback';

type Props = NativeStackScreenProps<MainStackParamList, 'V3ExploreArticleDetail'>;

interface ArticleData {
  id: number;
  slug: string;
  language: string;
  title: string;
  test_question: string;
  preview: string;
}

interface ArticleDetailData {
  id: number;
  content: string;
}

interface ArticleAnswerData {
  id: number;
  title: string;
  content: string;
  correct: boolean;
}

export default function V3ExploreArticleDetail({ route, navigation }: Props) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const articleId = route.params.id;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [articleData, setArticleData] = useState<ArticleData | null>(null);
  const [articleDetails, setArticleDetails] = useState<ArticleDetailData | null>(null);
  const [articleAnswers, setArticleAnswers] = useState<ArticleAnswerData[]>([]);
  const [mySelectedAnswerId, setMySelectedAnswerId] = useState<number | null>(null);
  const [finishedCount, setFinishedCount] = useState<number>(0);
  const [hasFinished, setHasFinished] = useState<boolean>(false);
  const [partnerHasFinished, setPartnerHasFinished] = useState<boolean>(false);
  const [partnerName, setPartnerName] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [showSelected, setShowSelected] = useState<boolean>(false);
  const [instanceId, setInstanceId] = useState<number | null>(null);

  const isFirstMount = useRef(true);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = authContext.userId;
      if (!userId) {
        setLoading(false);
        return;
      }

      localAnalytics().logEvent('V3ArticleDetailLoadingStarted', {
        userId,
        articleId,
      });

      const [
        userRes,
        articleRes,
        jobsRes,
        jobArticleResult,
        streakResult,
        premiumResult,
        articleDetailsQuery,
        articleAnswersQuery,
        instanceQuery,
      ] = await Promise.all([
        supabase
          .from('user_profile')
          .select('user_id,first_name,partner_first_name')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('content_article')
          .select('id,slug,language,title,test_question,preview,couples_finished')
          .eq('id', articleId)
          .single(),
        supabase.rpc('get_my_jobs'),
        supabase.from('job_content_article').select('job_slug').eq('content_article_id', articleId),
        supabase.rpc('get_total_streak'),
        supabase.rpc('is_user_premium'),
        supabase
          .from('content_article_details')
          .select('id,content')
          .eq('article_id', articleId)
          .maybeSingle(),
        supabase
          .from('content_article_answer')
          .select('id,title,content,correct')
          .eq('article_id', articleId),
        supabase
          .from('content_article_couple_instance')
          .select('id, finished_by')
          .eq('article_id', articleId)
          .maybeSingle(),
      ]);
      if (userRes.error) throw userRes.error;
      if (articleRes.error) throw articleRes.error;
      if (jobsRes.error) throw jobsRes.error;
      if (jobArticleResult.error) throw jobArticleResult.error;
      if (streakResult.error) throw streakResult.error;
      if (premiumResult.error) throw premiumResult.error;
      if (articleDetailsQuery.error) throw articleDetailsQuery.error;
      if (articleAnswersQuery.error) throw articleAnswersQuery.error;
      if (instanceQuery.error) throw instanceQuery.error;

      setPartnerName(showName(userRes.data.partner_first_name) || i18n.t('home_partner'));
      setName(showName(userRes.data.first_name));
      setArticleData(articleRes.data);
      let isSelected = false;
      const userJobs = jobsRes.data || [];

      if (jobArticleResult.data && jobArticleResult.data.length > 0) {
        const articleSlugs = jobArticleResult.data.map((row) => row.job_slug);
        isSelected = articleSlugs.some((slug) => userJobs.includes(slug));
      }
      setShowSelected(isSelected);

      if (articleDetailsQuery.data) {
        setArticleDetails(articleDetailsQuery.data);
      }

      setFinishedCount(articleRes.data.couples_finished);
      setArticleAnswers(articleAnswersQuery.data || []);

      let userHasFinished = false;
      let partnerFinished = false;

      if (instanceQuery.data) {
        setInstanceId(instanceQuery.data.id);
        const finishedUsers = instanceQuery.data.finished_by;
        userHasFinished = finishedUsers.includes(userId);
        partnerFinished = finishedUsers.some((uid: string) => uid !== userId);
      }

      setHasFinished(userHasFinished);
      setPartnerHasFinished(partnerFinished);
      setIsPremium(
        premiumResult.data || partnerFinished || userHasFinished || !!route.params.canActivate,
      );

      localAnalytics().logEvent('V3ArticleDetailLoaded', {
        userId,
        articleId,
      });
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  }, [authContext.userId, articleId]);

  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void fetchInitialData();
    }
  }, [route?.params?.refreshTimeStamp]);

  useEffect(() => {
    void fetchInitialData();
    isFirstMount.current = false;
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const timeToComplete = Math.round((articleDetails?.content.length ?? 2500) / 500);

  const handlePressFinish = async () => {
    try {
      localAnalytics().logEvent('V3ArticleDetailMarkAsFinishedClicked', {
        userId: authContext.userId,
        articleId,
      });
      setLoading(true);
      const [_, streakRes, finishRes] = await Promise.all([
        handleRemindPartner(
          'ArticleDetail',
          partnerName,
          authContext.userId!,
          () => {},
          {
            article_id: articleId,
            type: 'remind_article',
          },
          navigation,
          undefined,
          undefined,
          false,
          false,
        ),
        supabase.rpc('record_streak_hit'),
        supabase.rpc('finish_article', {
          article_id: articleId,
        }),
      ]);

      if (streakRes.error) throw streakRes.error;
      if (finishRes.error) throw finishRes.error;

      if (streakRes.data === true) {
        navigation.navigate('V3ShowStreak', {
          refreshTimeStamp: new Date().toISOString(),
          nextScreen: 'V3ExploreArticleDetail',
          screenParams: {
            id: articleId,
            refreshTimeStamp: new Date().toISOString(),
          },
        });
      } else {
        await fetchInitialData();
      }
    } catch (e) {
      logSupaErrors(e as PostgrestError);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPremium = () => {
    localAnalytics().logEvent('V3ArticleDetailRedirectPremium', {
      userId: authContext.userId,
      articleId,
    });
    navigation.navigate('V3PremiumOffer', {
      refreshTimeStamp: new Date().toISOString(),
      isOnboarding: false,
    });
  };

  const optionLabels = [Option1, Option2, Option3, Option4, Option5];

  const handleSelectOption = (answerId: number) => {
    setMySelectedAnswerId(answerId);
  };

  const DoneIndicator = () => (
    <V3ContentDetailInfoBlock>
      <ContentBuddyPurple width={32} height={32} />
      <FontText small style={{ flex: 1 }}>
        {i18n.t('article_detail_me_finished', {
          partnerName,
        })}
      </FontText>
    </V3ContentDetailInfoBlock>
  );
  const BothDoneIndicator = () => (
    <V3ContentDetailInfoBlock gap={2}>
      <ContentBuddyPurple width={32} height={32} />
      <ContentBuddyPink width={32} height={32} style={{ marginRight: 4 }} />
      <FontText small style={{ flex: 1 }}>
        {i18n.t('explore_content_detail_both_finished', {
          partnerName,
          name,
        })}
      </FontText>
    </V3ContentDetailInfoBlock>
  );
  const getButtonLabel = () => {
    if (!isPremium) {
      return i18n.t('article_detail_unlock');
    }
    if (!hasFinished) {
      return i18n.t('detail_mark_as_finished');
    }
    if (hasFinished && !partnerHasFinished) {
      return i18n.t('article_detail_recommend', { partnerName });
    }
    return null;
  };

  const renderAnswersBlock = () => {
    return (
      <View
        style={{
          marginTop: 20,
          marginBottom: 20,
          borderRadius: 12,
        }}
      >
        <FontText small style={{ opacity: 0.5, marginBottom: 8 }}>
          {i18n.t('article_detail_quick_check')}
        </FontText>
        <FontText normal style={{ marginBottom: 16 }}>
          {articleData?.test_question}
        </FontText>
        {articleAnswers.slice(0, 5).map((opt, index) => {
          const Label = optionLabels[index % optionLabels.length];
          const selected = mySelectedAnswerId === opt.id;
          const recommended = opt.correct;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => {
                handleSelectOption(opt.id);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.white,
                borderRadius: 20,
                padding: 20,
                marginBottom: 8,
                gap: 12,
                borderWidth: selected ? 1 : 0,
                borderColor: selected ? theme.colors.black : 'transparent',
              }}
            >
              <Label width={24} height={24} />
              <View style={{ flex: 1 }}>
                <FontText normal>{opt.title}</FontText>
                {selected && (
                  <View
                    style={{
                      marginTop: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                      borderRadius: 16,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <FontText small style={{ color: theme.colors.black }}>
                      {i18n.t('article_detail_you_voted')}
                    </FontText>
                  </View>
                )}
                {mySelectedAnswerId && recommended && (
                  <View
                    style={{
                      marginTop: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: theme.colors.black,
                      borderRadius: 16,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <FontText small style={{ color: theme.colors.white }}>
                      {i18n.t('article_detail_recommended')}
                    </FontText>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: contentTypeBackground['article'] }} />
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: theme.colors.white }}
      >
        <View style={{ flex: 1, backgroundColor: contentTypeBackground['article'] }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <GoBackButton
              onPress={() => {
                localAnalytics().logEvent('V3ArticleDetailBackClicked', {
                  userId: authContext.userId,
                  articleId,
                });
                if (route.params.fromHome) {
                  navigation.navigate('V3Home', {
                    refreshTimeStamp: new Date().toISOString(),
                  });
                } else if (navigation.canGoBack() && route.params.shouldGoBack) {
                  navigation.goBack();
                } else {
                  navigation.navigate(contentListScreen['article'], {
                    refreshTimeStamp: new Date().toISOString(),
                  });
                }
              }}
              theme="black"
              style={{ marginBottom: 5 }}
            />
          </View>
          {loading ? (
            <Loading />
          ) : (
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
              }
            >
              <View style={{ alignItems: 'center', marginBottom: 24, paddingHorizontal: 20 }}>
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 40,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    marginBottom: 24,
                  }}
                >
                  <FontText small style={{ color: theme.colors.white }}>
                    {i18n.t('article_detail_label')}
                  </FontText>
                </View>
                <FontText
                  h2
                  style={{ color: theme.colors.white, textAlign: 'center', marginBottom: 8 }}
                >
                  {articleData?.title}
                </FontText>
                <>
                  <V3LayeredGreyImage image={getContentImageFromId(articleId)} />
                  <FontText small style={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                    {i18n.t('explore_content_detail_finished_count', {
                      count: finishedCount,
                    })}
                  </FontText>
                </>
                {!loading && hasFinished && !partnerHasFinished && <DoneIndicator />}
                {!loading && hasFinished && partnerHasFinished && <BothDoneIndicator />}

                {partnerHasFinished && !hasFinished && (
                  <View
                    style={{
                      marginTop: 25,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      padding: 12,
                      backgroundColor: theme.colors.white,
                      borderRadius: 12,
                      marginBottom: 8,
                    }}
                  >
                    <ContentBuddyPink width={32} height={32} />
                    <FontText small style={{ flex: 1 }}>
                      {i18n.t('article_detail_partner_finished', {
                        partnerName,
                      })}
                    </FontText>
                  </View>
                )}
              </View>
              <View
                style={{
                  flex: 1,
                  backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  paddingHorizontal: 20,
                  paddingTop: 20,
                  paddingBottom: 50,
                }}
              >
                {!hasFinished && (
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 24,
                    }}
                  >
                    {showSelected && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: theme.colors.black,
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: 40,
                        }}
                      >
                        <IconStar height={18} width={18} fill={theme.colors.white} />
                        <FontText small style={{ color: theme.colors.white, marginTop: 2 }}>
                          {i18n.t('explore_content_detail_selected')}
                        </FontText>
                      </View>
                    )}

                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: MEDIUM_BEIGE_COLOR,
                        paddingVertical: 4,
                        paddingHorizontal: 8,
                        borderRadius: 40,
                      }}
                    >
                      <FontText small>
                        {i18n.t('explore_content_detail_time', {
                          minutes: timeToComplete,
                        })}
                      </FontText>
                    </View>
                  </View>
                )}
                {hasFinished && (
                  <ContentFeedback
                    title={i18n.t('content_feedback_article')}
                    contentType="article"
                    instanceId={instanceId}
                  />
                )}
                {isPremium ? (
                  <>
                    <FontText normal style={{ color: theme.colors.black, marginBottom: 50 }}>
                      {articleDetails?.content.replaceAll('<br>', '\n')}
                    </FontText>
                  </>
                ) : (
                  <>
                    <FontText normal style={{ color: theme.colors.black, marginBottom: 50 }}>
                      {(articleData?.preview.replaceAll('<br>', '\n') || '') + '...'}
                    </FontText>
                  </>
                )}
                {renderAnswersBlock()}
              </View>
            </ScrollView>
          )}

          {!!getButtonLabel() && !loading && (
            <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
              <PrimaryButton
                buttonStyle={{ width: '100%' }}
                onPress={() => {
                  if (!isPremium) {
                    handleStartPremium();
                  } else if (!hasFinished) {
                    void handlePressFinish();
                  } else if (hasFinished && !partnerHasFinished) {
                    void handleRemindPartner(
                      'ArticleDetail',
                      partnerName,
                      authContext.userId!,
                      setLoading,
                      {
                        article_id: articleId,
                        type: 'remind_article',
                      },
                      navigation,
                      'V3ExploreArticleDetail',
                      {
                        id: articleId,
                        refreshTimeStamp: new Date().toISOString(),
                        shouldGoBack: route.params.shouldGoBack,
                        fromHome: route.params.fromHome,
                      },
                      true,
                      true,
                    );
                  }
                }}
              >
                {!isPremium && (
                  <PremiumLock
                    width={24}
                    height={24}
                    stroke={theme.colors.white}
                    style={{ marginBottom: 2, marginRight: 4 }}
                  />
                )}
                {hasFinished && !partnerHasFinished && (
                  <Remind
                    width={24}
                    height={24}
                    stroke={theme.colors.white}
                    style={{ marginBottom: 2, marginRight: 4 }}
                  />
                )}
                <FontText style={{ color: theme.colors.white }}>{getButtonLabel()}</FontText>
              </PrimaryButton>
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
}
