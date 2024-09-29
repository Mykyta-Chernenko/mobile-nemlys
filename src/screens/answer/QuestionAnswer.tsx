import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '@app/api/initSupabase';
import { useTheme, useThemeMode } from '@rneui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthContext } from '@app/provider/AuthProvider';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { APIQuestionReply } from '@app/types/api';
import { FontText, getFontSizeForScreen } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { logErrorsWithMessageWithoutAlert, logSupaErrors } from '@app/utils/errors';
import { localAnalytics } from '@app/utils/analytics';
import BuddyPurple from '@app/icons/buddy_purple';
import BuddyPink from '@app/icons/buddy_pink';
import LockIcon from '@app/icons/lock_grey';
import Bulb from '@app/icons/bulb';
import { JobSlug } from '@app/types/domain';
import StyledTextInput from '@app/components/utils/StyledTextInput';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { Loading } from '@app/components/utils/Loading';
import RemindIcon from '@app/icons/remind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jobs } from '@app/screens/menu/Home';
import AnswerNoPartnerWarning from '@app/components/answers/AnswerNoPartnerWarning';
import { getFontSize } from '@app/utils/strings';
import { handleRemindPartner } from '@app/utils/sendNotification';
import { AppState } from 'react-native';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { getNow } from '@app/utils/date';

const STORAGE_KEY = '@question_answer:';

export const truncateText = (text: string) => {
  return text.replace(/\S/gu, '*');
};
export default function QuestionAnswer({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'QuestionAnswer'>) {
  const { questionId, fromDate } = route.params;
  const [question, setQuestion] = useState('');
  const [replies, setReplies] = useState<APIQuestionReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [messageButtonLoading, setMessageButtonLoading] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [name, setName] = useState('');
  const [hasPartner, setHasPartner] = useState(false);
  const [dateJob, setDateJob] = useState<JobSlug | null>(null);
  const [dateTopic, setDateTopic] = useState('');
  const [dateId, setDateId] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);

  const { setMode } = useThemeMode();

  const fetchData = useCallback(async () => {
    const [questionData, repliesData, profileData, hasPartnerData] = await Promise.all([
      supabase
        .from('generated_question')
        .select('question, date_id, date!inner(job, topic)')
        .eq('id', questionId)
        .single(),
      supabase
        .from('question_reply')
        .select('*')
        .eq('question_id', questionId)
        .order('created_at', { ascending: true }),
      supabase
        .from('user_profile')
        .select('partner_first_name, first_name')
        .eq('user_id', authContext.userId!)
        .single(),
      supabase.rpc('has_partner'),
    ]);

    if (questionData.error) {
      logSupaErrors(questionData.error);
      return;
    }
    if (repliesData.error) {
      logSupaErrors(repliesData.error);
      return;
    }
    if (profileData.error) {
      logSupaErrors(profileData.error);
      return;
    }
    if (hasPartnerData.error) {
      logSupaErrors(hasPartnerData.error);
      return;
    }

    setQuestion(questionData.data.question);
    setReplies(repliesData.data);
    setPartnerName(profileData.data.partner_first_name!);
    setName(profileData.data.first_name!);
    setHasPartner(hasPartnerData.data);
    setDateId(questionData.data.date_id);
    setDateJob(questionData.data.date!.job);
    setDateTopic(questionData.data.date!.topic);

    void localAnalytics().logEvent('QuestionAnswerDataFetched', {
      screen: 'QuestionAnswer',
      action: 'DataFetched',
      questionId,
      fromDate,
      userId: authContext.userId,
    });
  }, [questionId, fromDate, authContext.userId]);

  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const isFocused = useIsFocused();
  const appState = useRef(AppState.currentState);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const fetchNewReplies = useCallback(async () => {
    if (!lastFetchTime) return;

    const { data, error } = await supabase
      .from('question_reply')
      .select('*')
      .eq('question_id', questionId)
      .neq('user_id', authContext.userId!)
      .gt('created_at', lastFetchTime.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      return;
    }

    if (data && data.length > 0) {
      setReplies((prevReplies) => [...prevReplies, ...data]);
      setLastFetchTime(new Date());
    }
  }, [questionId, lastFetchTime]);

  const startPolling = useCallback(() => {
    if (pollingInterval.current) return;
    pollingInterval.current = setInterval(() => {
      void fetchNewReplies();
    }, 5000);
  }, [fetchNewReplies]);

  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        void fetchNewReplies();
        startPolling();
      } else if (nextAppState.match(/inactive|background/)) {
        stopPolling();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      stopPolling();
    };
  }, [fetchNewReplies, startPolling, stopPolling]);

  useEffect(() => {
    if (isFocused) {
      void fetchNewReplies();
      startPolling();
    } else {
      stopPolling();
    }
  }, [isFocused, fetchNewReplies, startPolling, stopPolling]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && replies?.length === 0) {
      const focusTimeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(focusTimeout);
    }
  }, [replies, isLoading]);

  const handleRefresh = async () => {
    setIsLoading(true);
    setReminderLoading(false);
    setMessageButtonLoading(false);
    setNewReply('');
    setReplies([]);
    setQuestion('');
    setPartnerName('');
    setHasPartner(false);
    setDateJob(null);
    setDateTopic('');
    const input = await AsyncStorage.getItem(STORAGE_KEY + questionId?.toString());
    if (input !== null) {
      setNewReply(input);
    }
    await fetchData();
    setLastFetchTime(new Date());
    setIsLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      setMode('light');
      void handleRefresh();
    }, [route.params.questionId]),
  );

  const [contentVerticalOffset, setContentVerticalOffset] = useState(0);
  const [isListReady, setIsListReady] = useState(false);
  useEffect(() => {
    if (isListReady && flatListRef.current && replies.length > 0 && !isLoading) {
      flatListRef.current.scrollToOffset({ offset: contentVerticalOffset, animated: true });
    }
  }, [contentVerticalOffset, isListReady, replies, isLoading]);

  const onContentSizeChange = useCallback((_, height: number) => {
    setContentVerticalOffset(height);
    setIsListReady(true);
  }, []);

  const handleSendReply = async () => {
    const reply = newReply.trim();
    if (reply === '') return;
    const oldReplies = replies;
    setMessageButtonLoading(true);
    try {
      const newRepliesTemp = [
        ...oldReplies,
        {
          id: -1,
          text: reply,
          question_id: questionId,
          user_id: authContext.userId!,
          created_at: getNow().toISOString(),
          updated_at: getNow().toString(),
          loading: true,
        },
      ];
      setReplies(newRepliesTemp);
      const { data, error } = await supabase
        .from('question_reply')
        .insert({ text: reply, question_id: questionId, user_id: authContext.userId! })
        .select()
        .single();

      if (error) {
        logSupaErrors(error);
        throw error;
      }
      const newReplies = [...oldReplies, data];
      setReplies(newReplies);
      setNewReply('');
      const sendToPartner = async () => {
        if (hasPartner) {
          const type = newReplies.every((reply) => reply.user_id === authContext.userId)
            ? 'partner_answered'
            : 'partner_replied';
          const res = await supabase.functions.invoke('send-partner-notification', {
            body: { type: type, question_id: questionId },
          });
          if (res.error) {
            logErrorsWithMessageWithoutAlert(res.error, 'notify partner function returned error');
            throw res.error;
          }
        }
      };
      void sendToPartner();

      void localAnalytics().logEvent('QuestionAnswerReplySent', {
        screen: 'QuestionAnswer',
        action: 'ReplySent',
        questionId,
        userId: authContext.userId,
      });
    } catch (_) {
      setReplies(oldReplies);
    } finally {
      setMessageButtonLoading(false);
    }
  };

  const handleContinue = async () => {
    if (fromDate && dateId) {
      const { error } = await supabase.from('date').update({ active: false }).eq('id', dateId);

      if (error) {
        logSupaErrors(error);
        return;
      }
    }

    void localAnalytics().logEvent('QuestionAnswerContinuePressed', {
      screen: 'QuestionAnswer',
      action: 'ContinuePressed',
      questionId,
      fromDate,
      userId: authContext.userId,
    });

    navigation.replace('AnswerHome', { refreshTimeStamp: new Date().toISOString() });
  };

  const handleGoBack = () => {
    void localAnalytics().logEvent('QuestionAnswerBackPressed', {
      screen: 'QuestionAnswer',
      action: 'BackPressed',
      questionId,
      fromDate,
      userId: authContext.userId,
    });

    navigation.goBack();
  };

  const renderReply = ({ item }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 10,
        justifyContent: item.user_id === authContext.userId ? 'flex-end' : 'flex-start',
      }}
    >
      {item.user_id === authContext.userId ? (
        <>
          <View
            style={{
              borderRadius: 12,
              padding: 10,
              maxWidth: '70%',
              backgroundColor: theme.colors.black,
              flexDirection: 'column',
            }}
          >
            <FontText
              style={{
                color: theme.colors.white,
              }}
            >
              {item.text}
            </FontText>
            <FontText style={{ marginTop: 5, color: theme.colors.grey3 }}>{name}</FontText>
          </View>
          {item.loading ? (
            <View style={{ marginLeft: 5 }}>
              <ActivityIndicator size={getFontSizeForScreen('h1')} color={theme.colors.primary} />
            </View>
          ) : (
            <BuddyPurple style={{ marginLeft: 5 }} />
          )}
        </>
      ) : (
        <>
          <BuddyPink style={{ marginRight: 5 }} />
          <View
            style={{
              borderRadius: 12,
              padding: 10,
              maxWidth: '70%',
              backgroundColor: theme.colors.white,
              flexDirection: 'column',
            }}
          >
            <FontText
              style={{
                color: theme.colors.black,
              }}
            >
              {replies.some((reply) => reply.user_id === authContext.userId)
                ? item.text
                : truncateText(item.text as string)}
            </FontText>
            <FontText style={{ marginTop: 5, color: theme.colors.grey3 }}>{partnerName}</FontText>
          </View>
        </>
      )}
    </View>
  );

  const renderUnlockButton = () => {
    if (replies.length > 0 && replies.every((reply) => reply.user_id !== authContext.userId)) {
      return (
        <View
          style={{
            borderRadius: 40,
            backgroundColor: theme.colors.white,
            marginVertical: 20,
            padding: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            alignSelf: 'center',
          }}
        >
          <LockIcon height={20} width={20} />
          <FontText style={{ marginLeft: 3, paddingTop: 4 }}>
            {i18n.t('question_home_unlock')}
          </FontText>
        </View>
      );
    }
    return null;
  };

  const renderRemindPartnerButton = () => {
    if (
      hasPartner &&
      replies.length > 0 &&
      replies.every((reply) => reply.user_id === authContext.userId)
    ) {
      return (
        <SecondaryButton
          containerStyle={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginVertical: 20,
          }}
          buttonStyle={{
            height: undefined,
          }}
          disabled={reminderLoading}
          onPress={() =>
            hasPartner &&
            void handleRemindPartner(
              questionId,
              partnerName,
              authContext.userId!,
              setReminderLoading,
            )
          }
        >
          <RemindIcon height="20" width="20" />
          <FontText style={{ marginLeft: 5, paddingTop: 3 }}>
            {reminderLoading
              ? i18n.t('loading')
              : i18n.t('question_answer_remind_partner', { partnerName })}
          </FontText>
        </SecondaryButton>
      );
    }
    return null;
  };

  const JobIcon = dateJob ? jobs.find((job) => job.slug === dateJob)?.icon : null;

  const handleChangeText = async (text: string) => {
    setNewReply(text);
    try {
      await AsyncStorage.setItem(STORAGE_KEY + questionId?.toString(), text);
    } catch (e) {
      console.error('Failed to save the selected mode to storage');
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5E9EB' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, paddingHorizontal: 15 }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <GoBackButton
            theme="light"
            containerStyle={{ alignSelf: 'flex-start' }}
            onPress={() => void handleGoBack()}
          />
          <View style={{ borderRadius: 40, backgroundColor: theme.colors.white }}>
            <TouchableOpacity style={{ padding: 10 }} onPress={() => void handleContinue()}>
              <FontText>{i18n.t('done')}</FontText>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <Loading></Loading>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={replies}
              renderItem={renderReply}
              keyExtractor={(item) => item.id.toString()}
              refreshControl={
                <RefreshControl refreshing={isLoading} onRefresh={() => void handleRefresh()} />
              }
              style={{ marginVertical: 10 }}
              onContentSizeChange={onContentSizeChange}
              ListHeaderComponent={
                <View
                  style={{
                    padding: 20,
                    backgroundColor: theme.colors.white,
                    marginTop: 15,
                    borderRadius: 16,
                    marginBottom: 10,
                  }}
                >
                  {JobIcon && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 10,
                      }}
                    >
                      <JobIcon
                        width={getFontSizeForScreen('h2')}
                        height={getFontSizeForScreen('h2')}
                      />
                      <FontText h4 style={{ color: '#87778D' }}>
                        {dateTopic}
                      </FontText>
                    </View>
                  )}
                  <FontText {...getFontSize(question)}>{question}</FontText>
                </View>
              }
              ListFooterComponent={renderUnlockButton()}
              ListEmptyComponent={
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    backgroundColor: theme.colors.grey2,
                    padding: 20,
                    paddingVertical: 15,
                    borderRadius: 16,
                    marginBottom: 10,
                  }}
                >
                  <Bulb />
                  <View style={{ flex: 1, marginLeft: 5 }}>
                    <FontText style={{ marginTop: 3 }}>
                      {i18n.t('question_answer_hint', { partnerName })}
                    </FontText>
                  </View>
                </View>
              }
            />
            {renderRemindPartnerButton()}
            {!hasPartner && replies.length > 0 && (
              <AnswerNoPartnerWarning prefix={'QuestionAnswer'} partnerName={partnerName} />
            )}
            <View style={{ flexDirection: 'row', marginBottom: 10, maxHeight: '40%' }}>
              <StyledTextInput
                ref={inputRef}
                value={newReply}
                onChangeText={(text) => void handleChangeText(text)}
                placeholder={i18n.t('question_answer_write')}
                style={{ marginHorizontal: 5, paddingVertical: 5 }}
              />
              {messageButtonLoading ? (
                <ActivityIndicator size={getFontSizeForScreen('h3')} color={theme.colors.primary} />
              ) : (
                <TouchableOpacity
                  disabled={messageButtonLoading}
                  onPress={() => void handleSendReply()}
                  style={{ justifyContent: 'center' }}
                >
                  <Icon name="send" size={getFontSizeForScreen('h3')} />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
