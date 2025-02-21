import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, ScrollView, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@rneui/themed';
import { FontText, getFontSizeForScreen } from '@app/components/utils/FontText';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';
import { logErrorsWithMessage } from '@app/utils/errors';
import { Loading } from '@app/components/utils/Loading';
import { i18n } from '@app/localization/i18n';
import IconStar from '@app/icons/selected_star';
import BlackSwoosh from '@app/icons/black_swoosh';
import PremiumCrown from '@app/icons/premium_crown';
import {
  BACKGROUND_LIGHT_BEIGE_COLOR,
  BADGE_COLOR,
  MEDIUM_BEIGE_COLOR,
  MEDIUM_VIOLET_COLOR,
} from '@app/utils/colors';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { contentDetailScreen, ContentType, contentTypeBackground } from '@app/types/domain';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationProp } from '@app/types/navigation';
import ContentQuestionIcon from '@app/icons/content_question';
import ContentTestIcon from '@app/icons/content_test';
import ContentGameIcon from '@app/icons/content_game';
import ContentArticleIcon from '@app/icons/content_article';
import ContentExerciseIcon from '@app/icons/content_exercise';
import ContentCheckupIcon from '@app/icons/content_checkup';
import { capitalize, showName } from '@app/utils/strings';
import { getContentImageFromId } from '@app/utils/content';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';

export type ContentState = 'me_answered' | 'partner_answered' | 'me_partner_answered' | null;
export const renderStateDefault =
  (theme: ReturnType<typeof useTheme>['theme']) =>
  (state: ContentState, name: string, partnerName: string, couplesFinished?: number) => {
    // me_partner_answered, partner_answered, me_answered or null
    if (state === 'partner_answered') {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.error,
              height: getFontSizeForScreen('small') * 0.5,
              width: getFontSizeForScreen('small') * 0.5,
              borderRadius: 100,
            }}
          ></View>

          <FontText small style={{ color: theme.colors.grey3 }}>
            {i18n.t('explore_content_list_partner_finished', {
              partnerName: showName(partnerName),
            })}
          </FontText>
        </View>
      );
    } else if (state === 'me_answered') {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.primary,
              height: getFontSizeForScreen('small') * 0.5,
              width: getFontSizeForScreen('small') * 0.5,
              borderRadius: 100,
            }}
          ></View>
          <FontText small style={{ color: theme.colors.grey3 }}>
            {i18n.t('explore_content_list_me_finished', { firstName: name })}
          </FontText>
        </View>
      );
    } else if (state === 'me_partner_answered') {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.primary,
              height: getFontSizeForScreen('small') * 0.5,
              width: getFontSizeForScreen('small') * 0.5,
              borderRadius: 100,
            }}
          ></View>
          <View
            style={{
              backgroundColor: theme.colors.error,
              height: getFontSizeForScreen('small') * 0.5,
              width: getFontSizeForScreen('small') * 0.5,
              borderRadius: 100,
              marginLeft: -1,
            }}
          ></View>
          <FontText small style={{ color: theme.colors.grey3 }}>
            {i18n.t('explore_content_list_me_partner_finished', {
              firstName: showName(name),
              partnerName: showName(partnerName),
            })}
          </FontText>
        </View>
      );
    } else if (couplesFinished !== undefined) {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <FontText small style={{ color: theme.colors.grey3 }}>
            {i18n.t('explore_content_list_couples_finished', {
              couplesCount: couplesFinished,
            })}
          </FontText>
        </View>
      );
    }
  };

interface Props {
  contentType: Exclude<ContentType, 'journey' | 'question'>;
  renderState?: (
    state: string | null,
    name: string,
    partnerName: string | null,
    couplesFinished: number,
  ) => JSX.Element | null;
  getIsFinished?: (state: string | null) => boolean;
  refreshTimeStamp?: string;
}

interface ContentItem {
  id: number;
  title: string;
  couples_finished: number;
  state: string | null;
  jobs: string[];
  page: number;
  has_next: boolean;
}

interface ContentCount {
  test_count?: number;
  question_count?: number;
  exercise_count?: number;
  article_count?: number;
  game_count?: number;
  journey_count?: number;
  checkup_count?: number;
}

const iconMap: Record<ContentType, React.ReactNode> = {
  question: <ContentQuestionIcon width={24} height={24} />,
  test: <ContentTestIcon width={24} height={24} />,
  game: <ContentGameIcon width={24} height={24} />,
  article: <ContentArticleIcon width={24} height={24} />,
  exercise: <ContentExerciseIcon width={24} height={24} />,
  checkup: <ContentCheckupIcon width={24} height={24} />,
  // journey: <ContentJourneyIcon width={24} height={24} />,
};

export default function ({
  contentType,
  renderState: initialRenderState,
  getIsFinished: initialGetIsFinished,
  refreshTimeStamp,
}: Props) {
  const { theme } = useTheme();

  const renderState = initialRenderState || renderStateDefault(theme);
  function getFinishedDefault(state: string | null) {
    // me_partner_answered, partner_answered, me_answered or null
    return state === 'me_partner_answered';
  }

  const getIsFinished = initialGetIsFinished || getFinishedDefault;

  const authContext = useContext(AuthContext);
  const navigation = useNavigation<MainNavigationProp>();

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<'selected' | 'all'>('selected');

  const [name, setName] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [totalCount, setTotalCount] = useState<number>(0);
  const [userJobs, setUserJobs] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [isPremium, setIsPremium] = useState(false);

  const isFirstMount = useRef(true);

  const backgroundColor = contentTypeBackground[contentType];
  const ContentIcon = iconMap[contentType];
  type GetAllRpcType =
    | 'get_all_test'
    | 'get_all_game'
    | 'get_all_exercise'
    | 'get_all_checkup'
    | 'get_all_article';
  const rpcName: GetAllRpcType = `get_all_${contentType}`;
  const titleKey = `explore_content_list_${contentType}_header_title`;
  const descriptionKey = `explore_content_list_${contentType}_header_description`;

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);

      const [userResult, premiumResult, contentCountResult, userJobsResult, _] = await Promise.all([
        supabase
          .from('user_profile')
          .select('first_name, partner_first_name')
          .eq('user_id', authContext.userId!)
          .single(),
        supabase.rpc('is_user_premium'),
        supabase.rpc('get_content_count', { jobs: [] }),
        supabase.rpc('get_my_jobs'),
        loadItems(selectedTab === 'selected', 1),
      ]);
      if (userResult.error) throw userResult.error;
      if (premiumResult.error) throw premiumResult.error;
      if (contentCountResult.error) throw contentCountResult.error;
      if (userJobsResult.error) throw userJobsResult.error;

      const { partner_first_name: partnerName, first_name: meName } = userResult.data;
      setIsPremium(premiumResult.data);
      const dataCount = contentCountResult.data as ContentCount;

      const total = (dataCount[`${contentType}_count`] as number) || 0;

      setTotalCount(total);
      setName(meName);
      setPartnerName(partnerName || i18n.t('home_partner'));
      setUserJobs(userJobsResult.data || []);

      void localAnalytics().logEvent(`ExploreList${capitalize(contentType)}Loaded`, {
        userId: authContext.userId,
        isPremium: premiumResult.data,
        hasContent: true,
        contentType,
      });
    } catch (e) {
      logErrorsWithMessage(e, (e?.message as string) || '');
    } finally {
      setLoading(false);
    }
  }, [authContext.userId, selectedTab, contentType]);

  const loadItems = async (recommended: boolean, p_page: number) => {
    setLoadingMore(true);
    try {
      const { data, error } = await supabase.rpc(rpcName, {
        recommended: recommended,
        p_limit: 20,
        p_page,
      });

      if (error) {
        throw error;
      }

      const newItems: ContentItem[] = (data as ContentItem[]) || [];

      // null state is 2
      const statePriority: { [key: string]: number } = {
        partner_answered: 1,
        me_answered: 3,
        me_partner_answered: 4,
      };
      const nullStatePriority = 2;

      const randomKeys = new Map<number, number>();
      newItems.forEach((item) => {
        if (item.state === null) {
          randomKeys.set(item.id, Math.random());
        }
      });

      newItems.sort((a, b) => {
        const priorityA = Object.prototype.hasOwnProperty.call(statePriority, a.state)
          ? statePriority[a.state as keyof typeof statePriority]
          : nullStatePriority;
        const priorityB = Object.prototype.hasOwnProperty.call(statePriority, b.state)
          ? statePriority[b.state as keyof typeof statePriority]
          : nullStatePriority;

        // Primary sort by state priority
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // Secondary sort:
        // - If state is null, sort randomly
        // - Otherwise, sort by id ascending
        if (priorityA === nullStatePriority) {
          return (randomKeys.get(a.id) || 0) - (randomKeys.get(b.id) || 0);
        }

        return a.id - b.id;
      });

      if (p_page === 1) {
        setItems(newItems);
      } else {
        setItems((prev) => [...prev, ...newItems]);
      }

      if (newItems.length > 0) {
        const lastItem = newItems[newItems.length - 1];
        setPage(lastItem.page || p_page);
        setHasNext(lastItem.has_next || false);
      } else {
        setHasNext(false);
      }
    } catch (e) {
      logErrorsWithMessage(e, (e?.message as string) || '');
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (hasNext) {
      void localAnalytics().logEvent(`ExploreList${capitalize(contentType)}LoadMore`, {
        userId: authContext.userId,
        contentType,
      });
      await loadItems(selectedTab === 'selected', page + 1);
    }
  };

  useEffect(() => {
    if (!isFirstMount.current && refreshTimeStamp) {
      void fetchInitialData();
    }
  }, [refreshTimeStamp]);

  useEffect(() => {
    void fetchInitialData();
    isFirstMount.current = false;
  }, []);

  const goBack = () => {
    void localAnalytics().logEvent(`ExploreList${capitalize(contentType)}GoBack`, {
      userId: authContext.userId,
      contentType,
    });
    if (navigation) {
      navigation.navigate('V3Explore', { refreshTimeStamp: new Date().toISOString() });
    }
  };
  const handlePress = (id: number) => {
    void localAnalytics().logEvent(`ExploreList${capitalize(contentType)}ItemClicked`, {
      userId: authContext.userId,
      contentType,
      id,
    });
    if (navigation) {
      navigation.navigate(contentDetailScreen[contentType], {
        id,
        refreshTimeStamp: new Date().toISOString(),
        shouldGoBack: true,
      });
    }
  };

  const handleTabChange = (tab: 'selected' | 'all') => {
    setSelectedTab(tab);
    void localAnalytics().logEvent(`ExploreList${capitalize(contentType)}TabChanged`, {
      userId: authContext.userId,
      tab: tab,
      contentType,
    });
    setPage(1);
    setLoading(true);

    loadItems(tab === 'selected', 1).finally(() => setLoading(false));
  };

  const isRecommended = (jobs: string[]) => {
    if (!userJobs || userJobs.length === 0) return false;
    const intersection = jobs.filter((job) => userJobs.includes(job));
    return intersection.length > 0;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: backgroundColor }} />
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}
      >
        <View
          style={{
            flexDirection: 'column',
            flex: 1,
            backgroundColor: backgroundColor,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 10,
            }}
          >
            <GoBackButton onPress={goBack} theme={'black'} />
            <View style={{ flex: 1, alignItems: 'center' }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 40,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {ContentIcon}
              </View>
              <FontText h2 style={{ color: theme.colors.white, marginTop: 15 }}>
                {i18n.t(titleKey, { count: totalCount })}
              </FontText>
              <FontText
                small
                style={{
                  marginTop: 15,
                  marginBottom: 30,
                  color: 'rgba(255,255,255,0.7)',
                  textAlign: 'center',
                }}
              >
                {i18n.t(descriptionKey)}
              </FontText>
            </View>
            <View style={{ width: 24 }} />
          </View>

          <View
            style={{
              backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
              flex: 1,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              paddingBottom: 0,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: MEDIUM_BEIGE_COLOR,
                borderRadius: 8,
                padding: 5,
              }}
            >
              <TouchableOpacity
                onPress={() => handleTabChange('selected')}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  backgroundColor: selectedTab === 'selected' ? theme.colors.white : 'transparent',
                  borderRadius: 8,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
              >
                <IconStar
                  fill={selectedTab === 'selected' ? theme.colors.black : MEDIUM_VIOLET_COLOR}
                />
                <FontText
                  small
                  style={{
                    marginTop: 2,
                    color: selectedTab === 'selected' ? theme.colors.black : MEDIUM_VIOLET_COLOR,
                  }}
                >
                  {i18n.t('explore_content_list_selected')}
                </FontText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleTabChange('all')}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  backgroundColor: selectedTab === 'all' ? theme.colors.white : 'transparent',
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontText
                  small
                  style={{
                    color: selectedTab === 'all' ? theme.colors.black : MEDIUM_VIOLET_COLOR,
                  }}
                >
                  {i18n.t('explore_content_list_all')}
                </FontText>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ marginTop: 10 }}
              contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
              }
            >
              {items.map((item, index) => {
                const recommended = isRecommended(item.jobs);
                const answeredStatus = renderState(
                  item.state as ContentState,
                  name,
                  partnerName,
                  item.couples_finished,
                );
                const isFinished = getIsFinished(item.state);

                return (
                  <TouchableOpacity key={index} onPress={() => void handlePress(item.id)}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: theme.colors.white,
                        borderRadius: 16,
                        padding: 8,
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          gap: 5,
                          paddingLeft: 12,
                          marginRight: 5,
                          display: 'flex',
                          justifyContent: 'center',
                          flexDirection: 'column',
                        }}
                      >
                        <FontText>{item.title}</FontText>
                        {answeredStatus}
                      </View>

                      <View
                        style={{
                          width: 76,
                          height: 102,
                          borderRadius: 8,
                          overflow: 'hidden',
                          backgroundColor: '#F0F0F0',
                          position: 'relative',
                        }}
                      >
                        <Image
                          source={getContentImageFromId(item.id)}
                          style={{
                            width: '100%',
                            height: '100%',
                            resizeMode: 'cover',
                          }}
                        />
                        <View
                          style={{
                            flexDirection: 'row',
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            gap: 4,
                          }}
                        >
                          {recommended && (
                            <View
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 40,
                                backgroundColor: BADGE_COLOR,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <IconStar width={14} height={14} fill={theme.colors.black} />
                            </View>
                          )}
                          {!isPremium && (
                            <View
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 40,
                                backgroundColor: BADGE_COLOR,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <PremiumCrown width={14} height={14} fill={theme.colors.black} />
                            </View>
                          )}
                          {isFinished && (
                            <BlackSwoosh width={24} height={24} fill={theme.colors.black} />
                          )}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {hasNext && (
                <View style={{ paddingVertical: 20 }}>
                  <PrimaryButton loading={loadingMore} onPress={() => void handleLoadMore()}>
                    {i18n.t('load_more')}
                  </PrimaryButton>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}
