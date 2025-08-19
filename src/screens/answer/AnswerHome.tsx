import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useThemeMode } from '@rneui/themed';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText, getFontSizeForScreen } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { Loading } from '@app/components/utils/Loading';
import { localAnalytics } from '@app/utils/analytics';
import { logErrorsWithMessage, logSupaErrors } from '@app/utils/errors';
import Menu from '@app/components/menu/Menu';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import HomeHeader from '@app/screens/menu/HomeHeader';
import EmptyAnswers from '@app/icons/empy_answers';
import { useFocusEffect } from '@react-navigation/native';
import RemindIcon from '@app/icons/remind';
import LockIcon from '@app/icons/lock_grey';
import { getJobs } from '@app/screens/menu/Home';
import AnswerNoPartnerWarning from '@app/components/answers/AnswerNoPartnerWarning';
import { getNow } from '@app/utils/date';
import { handleRemindPartner } from '@app/utils/sendNotification';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { hideText, showName } from '@app/utils/strings';

interface QuestionReply {
  id: number;
  text: string;
  user_id: string;
  created_at: string;
}

interface Question {
  id: number;
  question: string;
  created_at: string;
  question_reply: QuestionReply[];
  date: {
    with_partner: boolean;
    topic: string;
    job: string;
  };
}

export default function AnswerHome({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'AnswerHome'>) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPartner, setHasPartner] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [name, setName] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const fetchQuestions = async (page = 0) => {
    const localPage = page;
    if (!localPage) {
      setLoading(true);
    }
    try {
      const oneWeekAgo = getNow().subtract(7, 'days');
      const profileResult = await supabase
        .from('user_profile')
        .select('couple_id, partner_first_name, first_name')
        .eq('user_id', authContext.userId!)
        .single();
      if (profileResult.error) {
        logSupaErrors(profileResult.error);
        return;
      }

      const [questionsResult, hasPartnerResult] = await Promise.all([
        supabase
          .from('generated_question')
          .select(
            `
            id,
            question,
            created_at,
            question_reply(id, text, user_id, created_at),
            date!inner(with_partner, topic, job)
          `,
          )
          .eq('date.couple_id', profileResult.data.couple_id)
          .eq('date.with_partner', false)
          .or(`updated_at.gte.${oneWeekAgo.toISOString()},reply_count.gt.0`)
          .order('updated_at', { ascending: false })
          .range(localPage * PAGE_SIZE, (localPage + 1) * PAGE_SIZE - 1),

        supabase.rpc('has_partner'),
      ]);

      if (questionsResult.error) {
        logSupaErrors(questionsResult.error);
        return;
      }

      if (hasPartnerResult.error) {
        logSupaErrors(hasPartnerResult.error);
        return;
      }

      setPartnerName(showName(profileResult.data.partner_first_name) || i18n.t('home_partner'));
      setName(showName(profileResult.data.first_name));
      setHasPartner(hasPartnerResult.data);

      if (localPage) {
        setQuestions((prevQuestions) => [
          ...prevQuestions,
          ...(questionsResult.data as Question[]),
        ]);
      } else {
        setQuestions(questionsResult.data as Question[]);
      }

      setHasMore(questionsResult.data.length === PAGE_SIZE);
      setLoading(false);

      void localAnalytics().logEvent('AnswerHomeLoaded', {
        screen: 'AnswerHome',
        action: 'Loaded',
        userId: authContext.userId,
      });
    } catch (e) {
      logErrorsWithMessage(e, (e?.message as string) || '');
      setLoading(false);
    }
  };

  const { setMode } = useThemeMode();

  useFocusEffect(
    useCallback(() => {
      void handleRefresh();
    }, [route.params?.refreshTimeStamp]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setReminderLoading(false);
    setMode('light');
    setPartnerName('');
    setName('');
    setQuestions([]);
    setPage(0);
    setHasMore(false);
    setHasPartner(false);
    await fetchQuestions();
    setRefreshing(false);
  };

  const navigateToQuestionAnswer = (questionId: number) => {
    void localAnalytics().logEvent('AnswerHomeGoToAnswerClicked', {
      screen: 'AnswerHome',
      action: 'GoToAnswerClicked',
      userId: authContext.userId,
    });
    navigation.navigate('QuestionAnswer', { questionId, fromDate: false });
  };

  const handleLoadMore = async () => {
    if (hasMore && !loading) {
      await fetchQuestions(page + 1);
      setPage((prevPage) => prevPage + 1);
    }
  };

  const renderQuestionItem = (question: Question) => {
    const userReplies = question.question_reply.filter(
      (reply) => reply.user_id === authContext.userId,
    );
    const partnerReplies = question.question_reply.filter(
      (reply) => reply.user_id !== authContext.userId,
    );
    const lastTwoReplies = question.question_reply.slice(-2);
    const JobIcon = question.date.job
      ? getJobs().find((job) => job.slug === question.date.job)?.icon
      : null;

    const renderReplyContent = (reply: QuestionReply) => {
      const noMyReplies = partnerReplies.length > 0 && userReplies.length === 0;
      const isAuthor = reply.user_id === authContext.userId;

      return (
        <View
          key={reply.id}
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
                  {hideText(reply.text)}
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
                  {reply.text}
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
    const additionalRepliesCount = Math.max(0, question.question_reply.length - 2);
    return (
      <TouchableOpacity
        key={question.id}
        style={{
          backgroundColor: theme.colors.white,
          borderRadius: 16,
          marginTop: 20,
          padding: 20,
        }}
        onPress={() => navigateToQuestionAnswer(question.id)}
      >
        <FontText>{question.question}</FontText>
        {additionalRepliesCount > 0 && (
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
              {i18n.t('question_home_replies_count', { count: additionalRepliesCount })}
            </FontText>
          </View>
        )}

        {lastTwoReplies.map(renderReplyContent)}
        {question.question_reply.length === 0 && (
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.grey1,
              padding: 10,
              borderRadius: 20,
              marginTop: 10,
              alignSelf: 'center',
            }}
            onPress={() => navigateToQuestionAnswer(question.id)}
          >
            <FontText small style={{ textAlign: 'center' }}>
              {i18n.t('question_home_answer')}
            </FontText>
          </TouchableOpacity>
        )}
        {partnerReplies.length > 0 && userReplies.length === 0 && (
          <TouchableOpacity
            style={{
              borderRadius: 40,
              backgroundColor: theme.colors.grey1,
              padding: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignSelf: 'center',
              marginTop: 10,
            }}
            onPress={() => navigateToQuestionAnswer(question.id)}
          >
            <LockIcon height={20} width={20}></LockIcon>
            <FontText small style={{ marginLeft: 3, paddingTop: 4 }}>
              {i18n.t('question_home_unlock')}
            </FontText>
          </TouchableOpacity>
        )}

        {userReplies.length > 0 && partnerReplies.length === 0 && hasPartner && (
          <SecondaryButton
            containerStyle={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginVertical: 20,
            }}
            buttonStyle={{
              height: undefined,
              backgroundColor: theme.colors.grey1,
            }}
            disabled={reminderLoading}
            onPress={() =>
              hasPartner &&
              void handleRemindPartner(
                'AnswerHome',
                partnerName,
                authContext.userId!,
                setReminderLoading,
                {
                  question_id: question.id,
                  type: 'remind_answer',
                },
                navigation,
                'AnswerHome',
                {
                  refreshTimeStamp: new Date().toISOString(),
                },
                true,
                true,
              )
            }
          >
            <RemindIcon height={20} width={20} />
            <FontText small style={{ marginLeft: 5, paddingTop: 3 }}>
              {reminderLoading
                ? i18n.t('loading')
                : i18n.t('question_answer_remind_partner', { partnerName })}
            </FontText>
          </SecondaryButton>
        )}

        {JobIcon && (
          <View
            style={{
              marginTop: 20,
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <JobIcon
                width={getFontSizeForScreen('small')}
                height={getFontSizeForScreen('small')}
              />
              <FontText small style={{ marginLeft: 5 }}>
                {i18n.get(`topic_${question.date.job}_${question.date.topic}`)
                  ? i18n.t(`topic_${question.date.job}_${question.date.topic}`)?.slice(0, 25)
                  : question.date.topic}
              </FontText>
            </View>
            <View>
              <FontText small>
                {question.date.with_partner
                  ? i18n.t('date_mode_in_person_title')
                  : i18n.t('date_mode_online_title')}
              </FontText>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (questions.length === 0) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <EmptyAnswers />
          <FontText
            style={{
              textAlign: 'center',
              color: theme.colors.grey5,
              marginTop: 15,
              width: '70%',
            }}
          >
            {i18n.t('answer_home_no_questions')}
          </FontText>
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} />
        }
      >
        {!hasPartner && (
          <AnswerNoPartnerWarning prefix={'AnswerHome'} partnerName={partnerName} isV3={false} />
        )}
        {questions.map(renderQuestionItem)}
        {hasMore && (
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.grey1,
              padding: 10,
              borderRadius: 20,
              marginTop: 20,
              alignSelf: 'center',
            }}
            onPress={() => void handleLoadMore()}
          >
            <FontText small>{i18n.t('load_more')}</FontText>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: theme.colors.white,
      }}
    >
      <SafeAreaView style={{ flexGrow: 1 }}>
        <View style={{ flexGrow: 1, padding: 20 }}>
          <View style={{ flex: 1 }}>
            <HomeHeader />

            {loading ? (
              <Loading />
            ) : (
              <View style={{ marginHorizontal: -20, backgroundColor: theme.colors.grey1, flex: 1 }}>
                {renderContent()}
              </View>
            )}
            <View
              style={{
                backgroundColor: theme.colors.grey1,
                marginHorizontal: -20,
                height: getFontSizeForScreen('h1') * 4,
              }}
            >
              <Menu></Menu>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
