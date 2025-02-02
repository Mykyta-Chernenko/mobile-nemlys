import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme, useThemeMode } from '@rneui/themed';
import BinIcon from '@app/icons/bin';
import PlusIcon from '@app/icons/plus';
import QuestionMarkIcon from '@app/icons/question_mark';
import BuddyPurple from '@app/icons/content_buddy_purple';
import { BACKGROUND_LIGHT_BEIGE_COLOR } from '@app/utils/colors';
import { MainStackParamList } from '@app/types/navigation';
import { FontText } from '@app/components/utils/FontText';
import { AuthContext } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';
import { supabase } from '@app/api/initSupabase';
import { logErrorsWithMessage, logSupaErrors } from '@app/utils/errors';
import { Loading } from '@app/components/utils/Loading';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { SecondaryButton } from '@app/components/buttons/SecondaryButton';
import { i18n } from '@app/localization/i18n';
import { getJobsDetails } from '@app/utils/jobs';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { Toast } from 'react-native-toast-message/lib/src/Toast';

type Props = NativeStackScreenProps<MainStackParamList, 'ChangePlan'>;

export default function ChangePlan({ route, navigation }: Props) {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const { theme } = useTheme();
  const { setMode } = useThemeMode();
  const jobsDetails = getJobsDetails(i18n);
  const isFirstMount = useRef(true);

  useFocusEffect(
    useCallback(() => {
      setMode('light');
    }, []),
  );

  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void fetchInitialData();
    }
  }, [route?.params?.refreshTimeStamp]);

  useEffect(() => {
    void fetchInitialData();
    isFirstMount.current = false;
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(false);
    localAnalytics().logEvent('ChangePlanLoading', {
      screen: 'ChangePlan',
      action: 'StartFetch',
      userId: authContext.userId,
    });
    try {
      const [topicsResult] = await Promise.all([supabase.rpc('get_my_jobs')]);

      if (topicsResult.error) {
        logSupaErrors(topicsResult.error);
        throw topicsResult.error;
      }

      const currentTopics: string[] = topicsResult.data || [];
      setSelectedTopics(currentTopics);

      setLoading(false);
      localAnalytics().logEvent('ChangePlanLoaded', {
        screen: 'ChangePlan',
        action: 'DataLoaded',
        userId: authContext.userId,
        currentTopics,
      });
    } catch (e) {
      setLoading(false);
      setError(true);
      logErrorsWithMessage(e, (e as Error)?.message || '');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleClosed = () => {
    localAnalytics().logEvent('ChangePlanClosed', {
      screen: 'ChangePlan',
      action: 'CancelClicked',
      userId: authContext.userId,
    });
    navigation.navigate('OnboardingPlan', {
      isOnboarding: route.params.isOnboarding,
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  const handleSelectTopic = (slug: string) => {
    if (selectedTopics.length >= 5) {
      return;
    }
    if (!selectedTopics.includes(slug)) {
      const newSelection = [...selectedTopics, slug];
      setSelectedTopics(newSelection);
      void handleSaveChanges(newSelection);
    }
  };

  const handleRemoveTopic = (slug: string) => {
    if (selectedTopics.length < 2) return;
    const filtered = selectedTopics.filter((t) => t !== slug);
    setSelectedTopics(filtered);
    void handleSaveChanges(filtered);
  };

  const handleQuiz = () => {
    localAnalytics().logEvent('ChangePlanQuizClicked', {
      screen: 'ChangePlan',
      action: 'QuizClicked',
      userId: authContext.userId,
    });
    navigation.navigate('OnboardingQuiz', {
      isOnboarding: route.params.isOnboarding,
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  const handleSaveChanges = async (topics: string[]) => {
    localAnalytics().logEvent('ChangePlanSaveClicked', {
      screen: 'ChangePlan',
      action: 'SaveChanges',
      userId: authContext.userId,
      topics,
    });
    setLoading(true);
    try {
      const response = await supabase.rpc('set_own_jobs', {
        jobs: topics,
      });
      if (response.error) {
        logSupaErrors(response.error);
        throw response.error;
      }
      setLoading(false);
      Toast.show({
        type: 'success',
        text1: i18n.t('change_plan_success_toast'),
        visibilityTime: 1000,
        onPress: () => Toast.hide(),
      });
    } catch (e) {
      setLoading(false);
      logErrorsWithMessage(e, (e as Error)?.message || '');
    }
  };

  const renderSelectedTopics = () => {
    if (selectedTopics.length === 0) {
      return (
        <View style={{ marginTop: 8 }}>
          <FontText style={{ marginTop: 8 }}>{i18n.t('change_plan_no_topics_selected')}</FontText>
        </View>
      );
    }
    return selectedTopics.map((slug, index) => {
      const job = jobsDetails[slug];
      if (!job) return null;
      return (
        <View key={slug}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginTop: index === 0 ? 8 : 16,
            }}
          >
            <job.icon style={{ marginRight: 8 }} />
            <FontText style={{ flexShrink: 1 }}>
              {job.title} — {job.description}
            </FontText>
            <TouchableOpacity
              onPress={() => handleRemoveTopic(slug)}
              style={{
                width: 24,
                height: 24,
                borderRadius: 24,
                backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              <BinIcon width={16} height={16} />
            </TouchableOpacity>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
              marginTop: 16,
            }}
          />
        </View>
      );
    });
  };

  const renderAvailableTopics = () => {
    const filtered = Object.keys(jobsDetails).filter((t) => !selectedTopics.includes(t));
    if (filtered.length === 0) return null;
    return filtered.map((slug, index) => {
      const job = jobsDetails[slug];
      return (
        <View key={slug}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginTop: index === 0 ? 8 : 16,
            }}
          >
            <job.icon style={{ marginRight: 8 }} />
            <FontText style={{ flexShrink: 1 }}>
              {job.title} — {job.description}
            </FontText>
            <TouchableOpacity
              onPress={() => handleSelectTopic(slug)}
              style={{
                width: 24,
                height: 24,
                borderRadius: 24,
                backgroundColor: theme.colors.black,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              <PlusIcon stroke={theme.colors.white} width={16} height={16} />
            </TouchableOpacity>
          </View>
          {index < filtered.length - 1 && (
            <View
              style={{
                height: 1,
                backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
                marginTop: 16,
              }}
            />
          )}
        </View>
      );
    });
  };

  const renderReloadButton = () => {
    if (!error) return null;
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
        <SecondaryButton
          onPress={() => void fetchInitialData()}
          containerStyle={{ borderRadius: 40 }}
        >
          <FontText>{i18n.t('reload')}</FontText>
        </SecondaryButton>
      </View>
    );
  };

  const renderContent = () => {
    if (loading && !refreshing) {
      return <Loading light={false} />;
    }
    return (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
        }
      >
        <View
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 16,
            padding: 20,
            marginTop: 8,
          }}
        >
          <BuddyPurple />
          <FontText style={{ marginTop: 16 }} h4>
            {i18n.t('change_plan_edit_your_focus')}
          </FontText>
          <View style={{ marginTop: 16 }}>{renderSelectedTopics()}</View>
          <FontText style={{ marginTop: 16, color: theme.colors.grey5 }} small>
            {i18n.t('change_plan_min_max')}
          </FontText>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 16,
            padding: 20,
            marginTop: 16,
            gap: 16,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 24,
              backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QuestionMarkIcon />
          </View>
          <FontText h4>{i18n.t('change_plan_not_sure')}</FontText>
          <PrimaryButton
            onPress={() => handleQuiz()}
            buttonStyle={{ backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}
          >
            <FontText style={{ color: theme.colors.black }}>
              {i18n.t('change_plan_answer_quiz')}
            </FontText>
          </PrimaryButton>
        </View>

        <View
          style={{
            backgroundColor: theme.colors.white,
            borderRadius: 16,
            padding: 20,
            marginTop: 16,
            gap: 16,
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 24,
              backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlusIcon width={16} height={16} />
          </View>
          <FontText h4>{i18n.t('change_plan_add_custom_topics')}</FontText>
          <View>{renderAvailableTopics()}</View>
        </View>

        {renderReloadButton()}
        <View style={{ height: 120 }} />
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR }}>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: BACKGROUND_LIGHT_BEIGE_COLOR,
            paddingHorizontal: 20,
            justifyContent: 'space-between',
          }}
        >
          <GoBackButton onPress={() => handleClosed()} />
        </View>

        {renderContent()}
      </View>
    </SafeAreaView>
  );
}
