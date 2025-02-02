import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '@app/api/initSupabase';
import { useTheme, useThemeMode } from '@rneui/themed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontText, getFontSizeForScreen } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { AuthContext } from '@app/provider/AuthProvider';
import { logSupaErrors } from '@app/utils/errors';
import { localAnalytics } from '@app/utils/analytics';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BACKGROUND_LIGHT_BEIGE_COLOR, QUESTION_COLOR } from '@app/utils/colors';
import { MainStackParamList } from '@app/types/navigation';
import { APIQuestionReply } from '@app/types/api';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { Loading } from '@app/components/utils/Loading';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import StyledTextInput from '@app/components/utils/StyledTextInput';
import BuddyPurple from '@app/icons/buddy_purple';
import BuddyPink from '@app/icons/buddy_pink';
import LockIcon from '@app/icons/lock_grey';
import Bulb from '@app/icons/bulb';
import RemindIcon from '@app/icons/remind';
import { getDateFromString, getNow } from '@app/utils/date';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { hideText, showName } from '@app/utils/strings';
import HomeQuestion from '@app/icons/home_question';
import { handleRemindPartner } from '@app/utils/sendNotification';
import { PostgrestError } from '@supabase/supabase-js';
import AnswerNoPartnerWarning from '@app/components/answers/AnswerNoPartnerWarning';
import { ContentFeedback } from '@app/components/content/ContentFeedback';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';

type Props = NativeStackScreenProps<MainStackParamList, 'V3ExploreQuestionDetail'>;

const STORAGE_KEY = '@v3_question_answer:';
type Reply = {
  id: number;
  text: string;
  user_id: string;
  instance_question_id: number;
  loading?: boolean;
  created_at: string;
  updated_at: string;
};
export default function V3ExploreQuestionDetail({ route, navigation }: Props) {
  const { id } = route.params;
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const { setMode } = useThemeMode();

  const [isLoading, setLoading] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [coupleId, setCoupleId] = useState<number | null>(null);
  const [instanceId, setInstanceId] = useState<number | null>(null);
  const [finishedBy, setFinishedBy] = useState<string[]>([]);
  const [questionText, setQuestionText] = useState('');
  const [replies, setReplies] = useState<Reply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [hasPartner, setHasPartner] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [messageButtonLoading, setMessageButtonLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<any>(null);
  const [contentVerticalOffset, setContentVerticalOffset] = useState(0);
  const [isListReady, setIsListReady] = useState(false);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const lastMessageRef = useRef(lastMessage);
  const instanceIdRef = useRef(instanceId);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void fetchInitialData();
    }
  }, [route?.params?.refreshTimeStamp]);

  useEffect(() => {
    void fetchInitialData();
    isFirstMount.current = false;
  }, []);

  useEffect(() => {
    lastMessageRef.current = lastMessage;
  }, [lastMessage]);

  useEffect(() => {
    instanceIdRef.current = instanceId;
  }, [instanceId]);

  useFocusEffect(
    useCallback(() => {
      setMode('light');
    }, []),
  );

  const fetchOrCreateQuestionInstance = async () => {
    const userId = authContext.userId!;
    const [
      { data: coupleCheck, error: partnerCheckErr },
      { data: profileData, error: profileError },
      { data: questionData, error: questionError },
    ] = await Promise.all([
      supabase.rpc('has_partner'),
      supabase
        .from('user_profile')
        .select('first_name, partner_first_name, couple_id')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('content_question')
        .select(
          `
      id,
      content,
      couples_finished,
      content_question_couple_instance (
        id,
        reply_count,
        finished_by,
        content_question_couple_instance_reply (
          id,
          text,
          instance_question_id,
          user_id,
          created_at,
          updated_at
        )
      )
    `,
        )
        .eq('id', id)
        .single(),
    ]);

    if (partnerCheckErr) throw partnerCheckErr;
    if (profileError) throw profileError;
    if (questionError) throw questionError;

    setHasPartner(!!coupleCheck);
    if (profileData) {
      setName(showName(profileData.first_name));
      setPartnerName(showName(profileData.partner_first_name || i18n.t('home_partner')));
      setCoupleId(profileData.couple_id);
    }
    if (questionData) {
      const instance = questionData.content_question_couple_instance[0];
      instance?.content_question_couple_instance_reply?.sort((x) =>
        getDateFromString(x.created_at).milliseconds(),
      );
      return instance
        ? {
            id: instance.id,
            reply_count: instance.reply_count,
            finished_by: instance.finished_by,
            content_question: {
              id: questionData.id,
              content: questionData.content,
              couples_finished: questionData.couples_finished,
            },
            content_question_couple_instance_reply: instance.content_question_couple_instance_reply,
          }
        : {
            content_question: {
              id: questionData.id,
              content: questionData.content,
              couples_finished: questionData.couples_finished,
            },
          };
    }

    return null;
  };

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(false);
    setMessageButtonLoading(false);
    try {
      localAnalytics().logEvent('V3ExploreQuestionDetailFetching', {
        screen: 'V3ExploreQuestionDetail',
        action: 'Fetching',
        questionId: id,
        userId: authContext.userId,
      });
      const data = await fetchOrCreateQuestionInstance();
      setInstanceId(data?.id ?? null);
      setFinishedBy(data?.finished_by ?? []);
      setQuestionText(data?.content_question.content || '');
      setReplies(
        (data?.content_question_couple_instance_reply ?? []).map((r) => ({
          id: r.id,
          text: r.text,
          instance_question_id: r.instance_question_id,
          user_id: r.user_id,
          created_at: r.created_at,
          updated_at: r.updated_at,
        })),
      );
      const input = await AsyncStorage.getItem(STORAGE_KEY + id.toString());
      if (input !== null) setNewReply(input);
      const lastMessageTime = data?.content_question_couple_instance_reply?.length
        ? data?.content_question_couple_instance_reply[
            data?.content_question_couple_instance_reply?.length - 1
          ].created_at
        : new Date().toISOString();
      setLastMessage(lastMessageTime);
    } catch (e) {
      logSupaErrors(e as PostgrestError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (flatListRef.current && replies.length === 0 && !isLoading) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 300);
      }
    }, [replies, isLoading]),
  );

  const fetchNewReplies = useCallback(async () => {
    const currentLastMessage = lastMessageRef.current;
    if (!currentLastMessage) return;
    let currentInstanceId = instanceIdRef.current;
    if (!currentInstanceId) {
      const instance = await supabase
        .from('content_question_couple_instance')
        .select('id')
        .eq('question_id', id)
        .maybeSingle();
      if (instance.error) {
        logSupaErrors(instance.error);
        return;
      }
      currentInstanceId = instance.data?.id ?? null;
      if (!currentInstanceId) return;
      setInstanceId(currentInstanceId);
      instanceIdRef.current = currentInstanceId;
    }

    const { data, error: fetchError } = await supabase
      .from('content_question_couple_instance_reply')
      .select('*')
      .eq('instance_question_id', currentInstanceId)
      .neq('user_id', authContext.userId!)
      .gt('created_at', currentLastMessage)
      .order('created_at', { ascending: true });
    if (fetchError) return;
    if (data && data.length > 0) {
      setReplies((prev) => [
        ...prev,
        ...data.map((r) => ({
          id: r.id,
          text: r.text,
          instance_question_id: r.instance_question_id,
          user_id: r.user_id,
          created_at: r.created_at,
          updated_at: r.updated_at,
        })),
      ]);
      const newLastMessage = data[data.length - 1].created_at;
      setLastMessage(newLastMessage);
      lastMessageRef.current = newLastMessage;
    }
  }, [authContext.userId, id]);

  const startPolling = useCallback(() => {
    if (pollingInterval.current) return;
    pollingInterval.current = setInterval(() => {
      void fetchNewReplies();
    }, 5000);
  }, [instanceId, lastMessage]);

  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (navigation.isFocused()) {
        void fetchNewReplies();
        startPolling();
      } else {
        stopPolling();
      }
      return () => {
        stopPolling();
      };
    }, [navigation]),
  );

  const onContentSizeChange = useCallback((_, height: number) => {
    setContentVerticalOffset(height);
    setIsListReady(true);
  }, []);

  useEffect(() => {
    if (isListReady && flatListRef.current && replies.length > 0 && !isLoading) {
      flatListRef.current.scrollToOffset({ offset: contentVerticalOffset, animated: true });
    }
  }, [contentVerticalOffset, isListReady, replies, isLoading]);

  const handleChangeText = useCallback(
    async (text: string) => {
      setNewReply(text);
      try {
        await AsyncStorage.setItem(STORAGE_KEY + id.toString(), text);
      } catch (_) {
        //   ignore
      }
    },
    [id],
  );

  const handleSendReply = useCallback(async () => {
    void localAnalytics().logEvent('V3ExploreQuestionDetailReplyStart', {
      screen: 'V3ExploreQuestionDetail',
      action: 'ReplyStart',
      userId: authContext.userId,
    });

    let currentInstanceId = instanceId;

    if (!currentInstanceId) {
      const created = await supabase
        .from('content_question_couple_instance')
        .insert({
          couple_id: coupleId!,
          question_id: id,
        })
        .select('id')
        .single();
      if (created.error) {
        logSupaErrors(created.error);
        return;
      }
      currentInstanceId = created.data.id;
      setInstanceId(currentInstanceId);
    }

    const replyText = newReply.trim();
    if (replyText === '') return;
    const oldReplies = [...replies];
    setMessageButtonLoading(true);
    const tempId = Math.random();
    const newRepliesTemp: Reply[] = [
      ...oldReplies,
      {
        id: tempId,
        text: replyText,
        instance_question_id: currentInstanceId,
        user_id: authContext.userId!,
        created_at: getNow().toISOString(),
        updated_at: getNow().toISOString(),
      },
    ];
    setReplies(newRepliesTemp);
    setNewReply('');
    try {
      const userHasAnswered = finishedBy.includes(authContext.userId!);
      const streakRegisterQuery = userHasAnswered
        ? new Promise((resolve) => resolve({ errors: null, data: false }))
        : supabase.rpc('record_streak_hit');
      const [insertResult, streakResult] = await Promise.all([
        supabase
          .from('content_question_couple_instance_reply')
          .insert({
            text: replyText,
            instance_question_id: currentInstanceId,
            user_id: authContext.userId!,
          })
          .select()
          .single(),
        streakRegisterQuery,
      ]);
      if (insertResult.error) {
        logSupaErrors(insertResult.error);
        throw insertResult.error;
      }
      await AsyncStorage.removeItem(STORAGE_KEY + id.toString());

      const streakResultTyped = streakResult as { error?: PostgrestError; data: boolean };
      if (streakResultTyped.error) {
        logSupaErrors(streakResultTyped.error);
        throw streakResultTyped.error;
      }
      if (!insertResult.data) throw new Error('insert_error');
      const updatedReplies = [...oldReplies, insertResult.data];
      setReplies(updatedReplies);
      setLastMessage(insertResult.data.created_at);
      localAnalytics().logEvent('V3ExploreQuestionDetailReplySent', {
        screen: 'V3ExploreQuestionDetail',
        action: 'ReplySent',
        questionId: id,
        userId: authContext.userId,
      });

      if (hasPartner) {
        void handleRemindPartner(
          'V3ExploreQuestionDetail',
          partnerName,
          authContext.userId!,
          setReminderLoading,
          {
            question_id: id,
            type: 'remind_question',
          },
          navigation,
          undefined,
          undefined,
          false,
          false,
        );
      }
      if (streakResultTyped.data) {
        navigation.navigate('V3ShowStreak', {
          refreshTimeStamp: new Date().toISOString(),
          nextScreen: 'V3ExploreQuestionDetail',
          screenParams: {
            id,
            refreshTimeStamp: new Date().toISOString(),
          },
        });
        setFinishedBy([...finishedBy, authContext.userId!]);
      }
    } catch (_) {
      setReplies(oldReplies);
    } finally {
      setMessageButtonLoading(false);
    }
  }, [
    instanceId,
    coupleId,
    id,
    newReply,
    replies,
    finishedBy,
    hasPartner,
    partnerName,
    authContext.userId,
    navigation,
    route.params.shouldGoBack,
  ]);

  const handleGoBack = useCallback(() => {
    localAnalytics().logEvent('V3ExploreQuestionDetailBackPressed', {
      screen: 'V3ExploreQuestionDetail',
      action: 'BackPressed',
      questionId: id,
      userId: authContext.userId,
    });
    if (route.params.fromHome) {
      navigation.navigate('V3Home', {
        refreshTimeStamp: new Date().toISOString(),
      });
    } else if (navigation.canGoBack() && route.params.shouldGoBack) {
      navigation.goBack();
    } else {
      navigation.navigate('V3ExploreQuestionList', { refreshTimeStamp: new Date().toISOString() });
    }
  }, [navigation, id, authContext.userId]);

  const renderReply = useCallback(
    ({ item }: { item: APIQuestionReply }) => {
      const isUser = item.user_id === authContext.userId;
      return (
        <View
          key={item.id}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            marginBottom: 10,
            justifyContent: isUser ? 'flex-end' : 'flex-start',
          }}
        >
          {isUser ? (
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
                <FontText style={{ color: theme.colors.white }}>{item.text}</FontText>
                <FontText style={{ marginTop: 5, color: theme.colors.grey3 }}>{name}</FontText>
              </View>
              <BuddyPurple style={{ marginLeft: 5 }} />
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
                <FontText style={{ color: theme.colors.black }}>
                  {replies.some((r) => r.user_id === authContext.userId)
                    ? item.text
                    : hideText(item.text)}
                </FontText>
                <FontText style={{ marginTop: 5, color: theme.colors.grey3 }}>
                  {partnerName}
                </FontText>
              </View>
            </>
          )}
        </View>
      );
    },
    [
      authContext.userId,
      replies,
      theme.colors.black,
      theme.colors.white,
      theme.colors.grey3,
      name,
      partnerName,
    ],
  );

  const renderUnlockButton = useCallback(() => {
    if (replies.length > 0 && replies.every((reply) => reply.user_id !== authContext.userId)) {
      return (
        <View
          key={'unlock'}
          style={{
            borderRadius: 40,
            backgroundColor: theme.colors.white,
            marginTop: 20,
            padding: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            alignSelf: 'center',
          }}
        >
          <LockIcon height={20} width={20} />
          <FontText style={{ marginLeft: 3, paddingTop: 2 }}>
            {i18n.t('v3_explore_question_detail_unlock_2')}
          </FontText>
        </View>
      );
    }
    return null;
  }, [replies, authContext.userId, theme.colors.white]);

  const handleRemindPartnerClick = async () => {
    setReminderLoading(true);
    try {
      await handleRemindPartner(
        'V3ExploreQuestionDetail',
        partnerName,
        authContext.userId!,
        setReminderLoading,
        {
          question_id: id,
          type: 'remind_question',
        },
        navigation,
        'V3ExploreQuestionDetail',
        {
          id,
          refreshTimeStamp: new Date().toISOString(),
          shouldGoBack: route.params.shouldGoBack,
          fromHome: route.params.fromHome,
        },
        true,
        true,
      );
    } finally {
      setReminderLoading(false);
    }
  };
  const renderRemindPartnerButton = useCallback(() => {
    if (
      hasPartner &&
      replies.length > 0 &&
      replies.every((reply) => reply.user_id === authContext.userId)
    ) {
      return (
        <SecondaryButton
          key={'reminder'}
          containerStyle={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 20,
          }}
          buttonStyle={{
            height: undefined,
          }}
          disabled={reminderLoading}
          onPress={() => void handleRemindPartnerClick()}
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
  }, [hasPartner, replies, authContext.userId, reminderLoading, partnerName, id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}>
      <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} style={{ flex: 1, paddingHorizontal: 15 }}>
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
        </View>
        {isLoading ? (
          <Loading />
        ) : error ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <FontText>{i18n.t('v3_answer_home_error_loading')}</FontText>
            <SecondaryButton onPress={() => void onRefresh()} containerStyle={{ marginTop: 20 }}>
              <FontText>{i18n.t('reload')}</FontText>
            </SecondaryButton>
          </View>
        ) : (
          <View style={{ marginTop: 10, flex: 1 }}>
            <FlatList
              ref={flatListRef}
              data={replies}
              renderItem={renderReply}
              keyExtractor={(item) => item.id?.toString()}
              refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={() => void onRefresh()} />
              }
              onContentSizeChange={onContentSizeChange}
              ListHeaderComponent={
                <View
                  key={'header'}
                  style={{
                    padding: 20,
                    backgroundColor: theme.colors.white,
                    marginTop: 15,
                    borderRadius: 16,
                    marginBottom: 10,
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <HomeQuestion />
                    <FontText h4 style={{ color: QUESTION_COLOR }}>
                      {i18n.t('v3_explore_question_detail_header')}
                    </FontText>
                  </View>
                  <FontText h4 style={{ marginTop: 10 }}>
                    {questionText}
                  </FontText>
                </View>
              }
              ListFooterComponent={
                <>
                  {renderUnlockButton()}
                  {instanceId && replies.some((r) => r.user_id === authContext.userId) && (
                    <ContentFeedback
                      title={i18n.t('content_feedback_question')}
                      contentType="question"
                      instanceId={instanceId}
                      marginTop={20}
                    />
                  )}
                </>
              }
              ListEmptyComponent={
                <View
                  key="empty"
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
                      {i18n.t('v3_explore_question_detail_hint', { partnerName })}
                    </FontText>
                  </View>
                </View>
              }
            />
            {renderRemindPartnerButton()}
            {!hasPartner && replies.length > 0 && (
              <AnswerNoPartnerWarning
                isV3={true}
                prefix={'V3ExploreQuqestionDetail'}
                partnerName={partnerName}
              />
            )}

            <View
              key={'input-field'}
              style={{ flexDirection: 'row', marginVertical: 10, maxHeight: '40%' }}
            >
              <StyledTextInput
                ref={inputRef}
                value={newReply}
                onChangeText={(text) => void handleChangeText(text)}
                placeholder={i18n.t('v3_explore_question_detail_write')}
                style={{ marginHorizontal: 5, paddingVertical: 5 }}
              />
              {messageButtonLoading ? (
                <ActivityIndicator size={getFontSizeForScreen('h3')} color={theme.colors.primary} />
              ) : (
                <TouchableOpacity
                  onPress={() => void handleSendReply()}
                  style={{ justifyContent: 'center' }}
                >
                  {/* @ts-expect-error Icon used correctly */}
                  <Icon name="send" size={getFontSizeForScreen('h3')} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
