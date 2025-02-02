import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@rneui/themed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';
import { logSupaErrors } from '@app/utils/errors';
import { MainStackParamList } from '@app/types/navigation';
import { FontText } from '@app/components/utils/FontText';
import { Loading } from '@app/components/utils/Loading';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import V3Menu from '@app/components/menu/V3Menu';
import LockIcon from '@app/icons/lock_grey';
import RemindIcon from '@app/icons/remind';
import HomeQuestionIcon from '@app/icons/home_question';
import HomeTestIcon from '@app/icons/home_test';
import HomeGameIcon from '@app/icons/home_game';
import HomeArticleIcon from '@app/icons/home_article';
import HomeExerciseIcon from '@app/icons/home_exercise';
import HomeCheckupIcon from '@app/icons/home_checkup';
import IconStar from '@app/icons/selected_star';
import BlackSwoosh from '@app/icons/black_swoosh';
import EmptyAnswers from '@app/icons/empy_answers';
import { BACKGROUND_LIGHT_BEIGE_COLOR, BADGE_COLOR, QUESTION_COLOR } from '@app/utils/colors';
import { i18n } from '@app/localization/i18n';
import { getContentImageFromId } from '@app/utils/content';
import { getContentTitleSize, hideText, showName } from '@app/utils/strings';
import { contentDetailScreen, ContentType, contentTypeBackground } from '@app/types/domain';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { LabelIcon } from '@app/screens/menu/V3Home';
import Streak from '@app/components/menu/Streak';
import { handleStreakTouch } from '@app/screens/content/V3ShowStreak';
import { handleRemindPartner } from '@app/utils/sendNotification';
import HomeQuestion from '@app/icons/home_question';
import AnswerNoPartnerWarning from '@app/components/answers/AnswerNoPartnerWarning';
import { getDateFromString, getNow } from '@app/utils/date';
import { PostgrestError } from '@supabase/supabase-js';
import { loveNoteActions } from '@app/screens/menu/LoveNote';

type V3AnswerHomeProps = NativeStackScreenProps<MainStackParamList, 'V3AnswerHome'>;

interface HistoryItem {
  content_id: number;
  content_title: string;
  content_type:
    | 'question'
    | 'test'
    | 'game'
    | 'article'
    | 'checkup'
    | 'exercise'
    | 'journey'
    | 'love_note';
  finished_by: string[];
  reply_count: number | null;
  reply_last_1_user_id: string | null;
  reply_last_1_text: string | null;
  reply_last_2_user_id: string | null;
  reply_last_2_text: string | null;
  updated_at: string;
  page: number;
  has_next: boolean;
  jobs: string[];
}

export default function V3AnswerHome({ route, navigation }: V3AnswerHomeProps) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const userId = authContext.userId!;
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userJobs, setUserJobs] = useState<string[]>([]);
  const [hasPartner, setHasPartner] = useState(false);
  const [name, setName] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>('');
  const [streak, setStreak] = useState(0);
  const [reminderLoading, setReminderLoading] = useState(false);

  const PAGE_SIZE = 20;
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void fetchInitialData(true);
    }
  }, [route?.params?.refreshTimeStamp]);

  useEffect(() => {
    void fetchInitialData(true);
    isFirstMount.current = false;
  }, []);

  const loadItems = async (nextPage: number, reload: boolean) => {
    setLoadingMore(true);
    try {
      const historyResult = await supabase.rpc('get_history', {
        p_limit: PAGE_SIZE,
        p_page: nextPage,
      });
      if (historyResult.error) throw historyResult.error;
      localAnalytics().logEvent('V3AnswerHomeItemsLoaded', {
        screen: 'V3AnswerHome',
        action: 'ItemsLoaded',
        userId,
        page: nextPage,
        items: historyResult.data.length,
      });
      if (!historyResult.data || historyResult.data.length === 0) {
        if (reload) {
          setHistoryData([]);
        }
        setHasNext(false);
      } else {
        if (reload) {
          setHistoryData(historyResult.data);
        } else {
          setHistoryData((prev) => [...prev, ...historyResult.data]);
        }
        setHasNext(historyResult.data[0]?.has_next || false);
        setPage(historyResult.data[0]?.page || nextPage);
      }
    } catch (e) {
      setError(e as Error);
      logSupaErrors(e as PostgrestError);
      return;
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchInitialData = async (reload = false) => {
    setReminderLoading(false);
    setLoading(true);
    setError(null);
    try {
      const currentPage = reload ? 1 : page;
      const [userProfileResult, partnerResult, jobsResult, streakResult, _] = await Promise.all([
        supabase
          .from('user_profile')
          .select('first_name, partner_first_name')
          .eq('user_id', authContext.userId!)
          .single(),
        supabase.rpc('has_partner'),
        supabase.rpc('get_my_jobs'),
        supabase.rpc('get_total_streak'),
        loadItems(currentPage, reload),
      ]);
      if (userProfileResult.error) throw userProfileResult.error;
      if (partnerResult.error) throw partnerResult.error;
      if (jobsResult.error) throw jobsResult.error;
      if (streakResult.error) throw streakResult.error;
      setStreak(streakResult.data);
      setName(showName(userProfileResult.data.first_name));
      setPartnerName(showName(userProfileResult.data.partner_first_name) || i18n.t('home_partner'));
      setHasPartner(!!partnerResult.data);
      setUserJobs(jobsResult.data || []);
      localAnalytics().logEvent('V3AnswerHomeLoaded', {
        screen: 'V3AnswerHome',
        action: 'Loaded',
        userId,
        page: currentPage,
      });
    } catch (e) {
      setError(e as Error);
      logSupaErrors(e as PostgrestError);
      return;
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData(true);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!loading && hasNext) {
      await loadItems(page + 1, false);
    }
  };

  const handleReload = async () => {
    setError(null);
    await fetchInitialData(true);
  };

  const isRecommended = (jobs: string[] | undefined) => {
    if (!jobs || userJobs.length === 0) return false;
    const intersection = jobs.filter((job) => userJobs.includes(job));
    return intersection.length > 0;
  };

  const userHasAnswered = (item: HistoryItem) => item.finished_by.includes(userId);
  const partnerHasAnswered = (item: HistoryItem) =>
    item.finished_by.some((finishedId) => finishedId !== userId);
  const bothHasAnswered = (item: HistoryItem) => {
    if (item.content_type === 'exercise') return userHasAnswered(item) || partnerHasAnswered(item);
    return userHasAnswered(item) && partnerHasAnswered(item);
  };
  const handleItemPress = (item: HistoryItem) => {
    localAnalytics().logEvent('V3AnswerHomeItemClicked', {
      screen: 'V3AnswerHome',
      action: 'ItemClicked',
      userId,
      contentId: item.content_id,
      contentType: item.content_type,
    });
    // @ts-expect-error journey detail does not exist yet
    navigation.navigate(contentDetailScreen[item.content_type as ContentType], {
      id: item.content_id,
      refreshTimeStamp: new Date().toISOString(),
      shouldGoBack: true,
    });
  };

  const renderReplyContent = (id: string, text: string, user: string, noMyReplies: boolean) => {
    const isAuthor = user === authContext.userId;

    return (
      <View
        key={id}
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          marginTop: 10,
          justifyContent: isAuthor ? 'flex-end' : 'flex-start',
        }}
      >
        <View
          style={{
            borderRadius: 12,
            padding: 10,
            maxWidth: '70%',
            backgroundColor: isAuthor ? theme.colors.black : theme.colors.grey1,
            overflow: 'hidden',
          }}
        >
          {noMyReplies ? (
            <>
              <FontText
                small
                style={{
                  color: isAuthor ? theme.colors.white : theme.colors.black,
                }}
              >
                {hideText(text)}
              </FontText>
              <FontText small style={{ color: theme.colors.grey3, marginTop: 5 }}>
                {isAuthor ? name : partnerName}
              </FontText>
            </>
          ) : (
            <>
              <FontText
                small
                style={{
                  color: isAuthor ? theme.colors.white : theme.colors.black,
                }}
              >
                {text}
              </FontText>
              <FontText small style={{ color: theme.colors.grey3, marginTop: 5 }}>
                {isAuthor ? name : partnerName}
              </FontText>
            </>
          )}
        </View>
      </View>
    );
  };

  const iconMap: Record<string, JSX.Element> = {
    question: <HomeQuestionIcon width={16} height={16} />,
    test: <HomeTestIcon width={16} height={16} />,
    game: <HomeGameIcon width={16} height={16} />,
    article: <HomeArticleIcon width={16} height={16} />,
    checkup: <HomeCheckupIcon width={16} height={16} />,
    exercise: <HomeExerciseIcon width={16} height={16} />,
    journey: <HomeExerciseIcon width={16} height={16} />,
  };

  const renderQuestionItem = (item: HistoryItem, index: number) => {
    const myReplies = userHasAnswered(item);
    const partnerReplies = partnerHasAnswered(item);
    const moreReplies = (item.reply_count || 0) > 2 ? (item.reply_count || 0) - 2 : 0;
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleItemPress(item)}
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: 16,
          padding: 20,
        }}
        activeOpacity={0.9}
      >
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <HomeQuestion />
          <FontText style={{ color: QUESTION_COLOR }}>
            {i18n.t('v3_explore_question_detail_header')}
          </FontText>
        </View>
        <FontText style={{ marginTop: 8 }}>{item.content_title}</FontText>
        {moreReplies > 0 && (
          <View
            style={{
              backgroundColor: theme.colors.grey1,
              borderRadius: 8,
              padding: 8,
              justifyContent: 'center',
              alignSelf: 'center',
              marginTop: 10,
            }}
          >
            <FontText small>
              {i18n.t('v3_answer_home_x_more_replies', { count: moreReplies })}
            </FontText>
          </View>
        )}
        {item.reply_last_2_text &&
          item.reply_last_2_user_id &&
          renderReplyContent(
            `${item.content_id}-reply-2`,
            item.reply_last_2_text,
            item.reply_last_2_user_id,
            !myReplies,
          )}
        {item.reply_last_1_text &&
          item.reply_last_1_user_id &&
          renderReplyContent(
            `${item.content_id}-reply-1`,
            item.reply_last_1_text,
            item.reply_last_1_user_id,
            !myReplies,
          )}
        {!myReplies && !partnerReplies && (
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.grey1,
              padding: 10,
              borderRadius: 20,
              marginTop: 10,
              alignSelf: 'center',
            }}
            onPress={() => handleItemPress(item)}
          >
            <FontText small>{i18n.t('v3_answer_home_answer_now')}</FontText>
          </TouchableOpacity>
        )}
        {partnerReplies && !myReplies && (
          <View
            style={{
              borderRadius: 40,
              backgroundColor: theme.colors.grey1,
              padding: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignSelf: 'center',
              marginTop: 10,
            }}
          >
            <LockIcon height={20} width={20} />
            <FontText small style={{ marginLeft: 3, paddingTop: 2 }}>
              {i18n.t('v3_explore_question_detail_unlock_2')}
            </FontText>
          </View>
        )}
        {myReplies && !partnerReplies && hasPartner && (
          <SecondaryButton
            containerStyle={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginTop: 10,
            }}
            buttonStyle={{
              height: undefined,
              backgroundColor: theme.colors.grey1,
            }}
            onPress={() => {
              localAnalytics().logEvent('V3AnswerHomeRemindPartnerClicked', {
                screen: 'V3AnswerHome',
                action: 'RemindPartner',
                userId,
                contentId: item.content_id,
              });
              void handleRemindPartner(
                'V3AnswerHome',
                partnerName,
                authContext.userId!,
                setReminderLoading,
                {
                  question_id: item.content_id,
                  type: 'remind_question',
                },
                navigation,
                'V3AnswerHome',
                { refreshTimeStamp: new Date().toISOString() },
                true,
                true,
              );
            }}
            disabled={reminderLoading}
          >
            <RemindIcon height={20} width={20} />
            <FontText small style={{ marginLeft: 5 }}>
              {reminderLoading
                ? i18n.t('loading')
                : i18n.t('question_answer_remind_partner', { partnerName })}
            </FontText>
          </SecondaryButton>
        )}
      </TouchableOpacity>
    );
  };

  const labelNameMap: {
    [key: string]: string;
  } = {
    question: i18n.t('home_content_types_question'),
    test: i18n.t('home_content_types_test'),
    game: i18n.t('home_content_types_game'),
    article: i18n.t('home_content_types_article'),
    exercise: i18n.t('home_content_types_exercise'),
    checkup: i18n.t('home_content_types_checkup'),
  };

  function renderState(item: HistoryItem, name: string, partnerName: string) {
    if (bothHasAnswered(item)) {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <FontText h1 style={{ color: theme.colors.primary }}>
            •
          </FontText>
          <FontText h1 style={{ color: theme.colors.error, marginLeft: -2 }}>
            •
          </FontText>
          <FontText small style={{ color: theme.colors.grey3 }}>
            {i18n.t('explore_content_list_me_partner_finished', {
              firstName: showName(name),
              partnerName: showName(partnerName),
            })}
          </FontText>
        </View>
      );
    } else if (partnerHasAnswered(item)) {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <FontText h1 style={{ color: theme.colors.error }}>
            •
          </FontText>
          <FontText small style={{ color: theme.colors.grey3 }}>
            {i18n.t('explore_content_list_partner_finished', {
              partnerName: showName(partnerName),
            })}
          </FontText>
        </View>
      );
    } else if (userHasAnswered(item)) {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <FontText h1 style={{ color: theme.colors.primary }}>
            •
          </FontText>
          <FontText small style={{ color: theme.colors.grey3, marginTop: 5 }}>
            {i18n.t('explore_content_list_me_finished', { firstName: name })}
          </FontText>
        </View>
      );
    } else {
      return <View></View>;
    }
  }
  const renderNonQuestionItem = (item: HistoryItem, index: number) => {
    const recommended = isRecommended(item.jobs);
    const answeredStatus = renderState(item, name, partnerName);
    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleItemPress(item)}
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: 16,
          paddingVertical: 8,
          paddingLeft: 8,
          paddingRight: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
        activeOpacity={0.9}
      >
        <View
          style={{
            flex: 1,
            paddingLeft: 12,
            marginRight: 5,
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              gap: 8,
              marginTop: 15,
              justifyContent: 'space-between',
            }}
          >
            <LabelIcon
              color={contentTypeBackground[item.content_type]}
              label={labelNameMap[item.content_type]}
              icon={iconMap[item.content_type]}
            />
            <View
              style={{
                flex: 1,
                marginTop: 8,
              }}
            >
              <FontText
                style={{ color: theme.colors.black }}
                {...getContentTitleSize(item.content_title)}
              >
                {item.content_title}
              </FontText>
            </View>
            {answeredStatus}
          </View>
        </View>
        <View
          style={{
            width: 76,
            height: 102,
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: theme.colors.grey1,
            position: 'relative',
          }}
        >
          <Image
            source={getContentImageFromId(item.content_id)}
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
            {bothHasAnswered(item) && (
              <BlackSwoosh width={24} height={24} fill={theme.colors.black} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const renderLoveNote = (item: HistoryItem, index: number) => {
    const isMine = item.finished_by.some((x) => x === userId);
    const action = loveNoteActions.find((x) => x.type === item.content_title);
    if (!action) return <></>;
    const handleLoveNotePress = () => {
      localAnalytics().logEvent('V3AnswerHomeLoveNoteClicked', {
        screen: 'V3AnswerHome',
        action: 'LoveNote',
        userId,
        contentId: item.content_id,
      });
      navigation.navigate('LoveNote', { refreshTimeStamp: new Date().toISOString() });
    };
    return (
      <TouchableOpacity
        key={index}
        disabled={isMine}
        onPress={() => handleLoveNotePress()}
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: 16,
          paddingVertical: 8,
          paddingLeft: 8,
          paddingRight: 8,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
        activeOpacity={0.9}
      >
        <View
          style={{
            flex: 1,
            padding: 12,
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <action.icon />
          <View
            style={{
              flex: 1,
            }}
          >
            <FontText style={{ color: theme.colors.black }}>
              {i18n.t('history_love_note', {
                action: i18n.t(action.label),
                name: isMine ? i18n.t('home_you') : partnerName,
              })}
            </FontText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = (item: HistoryItem, index: number) => {
    if (item.content_type === 'question') {
      return renderQuestionItem(item, index);
    } else if (item.content_type === 'love_note') {
      return renderLoveNote(item, index);
    } else {
      return renderNonQuestionItem(item, index);
    }
  };

  const renderContent = () => {
    if (error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <FontText style={{ marginBottom: 10, textAlign: 'center' }}>
            {i18n.t('v3_answer_home_error_loading')}
          </FontText>
          <PrimaryButton
            onPress={() => void handleReload()}
            title={i18n.t('reload')}
          ></PrimaryButton>
        </View>
      );
    }
    if (!loading && historyData.length === 0) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <EmptyAnswers width={180} height={100} />
          <FontText
            style={{ textAlign: 'center', color: theme.colors.grey5, marginTop: 15, width: '70%' }}
          >
            {i18n.t('v3_answer_home_no_questions')}
          </FontText>
        </View>
      );
    }

    const groupedByDate = historyData.reduce<Record<string, HistoryItem[]>>((acc, item) => {
      const itemDate = getDateFromString(item.updated_at); // moment in correct timezone
      const isThisYear = itemDate.isSame(getNow(), 'year');
      // if it's a previous year, show 'D MMM, YYYY', otherwise 'D MMM'
      const dateKey = isThisYear ? itemDate.format('D MMMM') : itemDate.format('D MMMM, YYYY');

      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(item);
      return acc;
    }, {});
    return (
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
      >
        {!hasPartner && (
          <AnswerNoPartnerWarning prefix={'V3AnswerHome'} partnerName={partnerName} isV3={true} />
        )}
        {Object.entries(groupedByDate).map(([dateLabel, items]) => (
          <View key={dateLabel} style={{ gap: 12 }}>
            <FontText normal style={{ marginTop: 12, marginBottom: -6 }}>
              {dateLabel}
            </FontText>
            {items.map(renderItem)}
          </View>
        ))}
        {hasNext && (
          <View style={{ paddingVertical: 20 }}>
            <PrimaryButton loading={loadingMore} onPress={() => void handleLoadMore()}>
              {i18n.t('load_more')}
            </PrimaryButton>
          </View>
        )}
      </ScrollView>
    );
  };

  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <SafeAreaView edges={['top']} style={{ backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }} />
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={{ flex: 1, backgroundColor: theme.colors.white }}
      >
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 10,
            backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <FontText h4 style={{ color: theme.colors.black }}>
            {i18n.t('home_menu_answer')}
          </FontText>
          <TouchableOpacity
            onPress={() => void handleStreakTouch('V3AnswerHome', authContext.userId!, navigation)}
          >
            <Streak streak={streak} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}>
          {renderContent()}
        </View>
        <V3Menu />
      </SafeAreaView>
    </>
  );
}
