import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Platform } from 'react-native';
import RecordingButtonTolltip from './RecordingButtonTolltip';
import { i18n } from '@app/localization/i18n';
import { supabase } from '@app/api/initSupabase';
import { logErrors, logErrorsWithMessage } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import RecordingButtonPermissionPopup from './RecordingButtonPermissionPopup';
import RecordingButtonDeletePopup from './RecordingButtonDeletePopup';
import { localAnalytics } from '@app/utils/analytics';
import { SupabaseAnswer } from '@app/types/api';
import RecordingButtonElement from './RecordingButtonElement';
import { Audio } from 'expo-av';
import { getNow, sleep } from '@app/utils/date';
import { getPremiumDetailsWithRecording } from '@app/api/premium';
import { useCurrentTime } from '@app/utils/hooks';
import { Linking } from 'react-native';
import Constants from 'expo-constants';
import * as IntentLauncher from 'expo-intent-launcher';
import { useTheme } from '@rneui/themed';
import { Loading } from '../utils/Loading';
import RecordingButtonStopPopup from './RecordingButtonStopPopup';

export interface Props {
  dateCount: number;
  setRecordingUri: (uri: string | undefined) => void;
  setSecondsSpent: (number) => void;
}
const RecordButton = (props: Props) => {
  const { theme } = useTheme();

  const { dateCount, setRecordingUri, setSecondsSpent } = props;

  const authContext = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [startedRecording, setStartedRecording] = useState<undefined | moment.Moment>();
  const [finishedRecording, setFinishedRecording] = useState<undefined | moment.Moment>();
  const now = useCurrentTime();

  const recordingSeconds = startedRecording
    ? finishedRecording
      ? finishedRecording.diff(startedRecording, 'second')
      : now.diff(startedRecording, 'second')
    : 0;
  const [audio, setAudio] = useState<undefined | Audio.Recording>();
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [showStopPopup, setShowStopPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const [showTooltip, setShowTooltip] = useState(true);
  const [maxRecordingSeconds, setMaxRecordingSeconds] = useState(0);
  const [recordState, setRecordState] = useState<'not_started' | 'in_progress' | 'finished'>(
    'not_started',
  );

  const [recordPermissionsGranted, setRecordPermissionGranted] = useState(false);
  const [canAskForPermission, setCanAskForPermission] = useState(true);
  const [wantsRecording, setWantsRecording] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [interacted, setInteracted] = useState(false);

  let tooltipStatus: 'none' | 'wanted_recording' | 'feature_intro' | 'limit_reached' = 'none';
  if (loading || interacted || (!recordPermissionsGranted && !canAskForPermission)) {
    tooltipStatus = 'none';
  } else if (limitReached) {
    tooltipStatus = 'limit_reached';
  } else if (wantsRecording && !recordPermissionsGranted && canAskForPermission) {
    tooltipStatus = 'wanted_recording';
  } else if (
    !recordPermissionsGranted &&
    (dateCount === 0 || dateCount === 4 || dateCount === 9 || dateCount === 14)
  ) {
    tooltipStatus = 'feature_intro';
  }

  const reset = () => {
    setRecordState('not_started');
    setLimitReached(false);
    setStartedRecording(undefined);
    setFinishedRecording(undefined);
    setRecordingUri(undefined);
    setSecondsSpent(0);
  };
  useEffect(() => {
    const f = async () => {
      const res = await Audio.getPermissionsAsync();

      if (res.granted) setRecordPermissionGranted(true);
      if (Platform.OS !== 'android' && res.status === 'denied' && !res.canAskAgain) {
        setCanAskForPermission(false);
      }
    };
    void f();
  }, []);
  const cleanupRef = useRef<() => void>(() => {});
  cleanupRef.current = () => {
    if (recordState === 'in_progress') {
      void localAnalytics().logEvent('OnDateRecordStoppingAutomatically', {
        screen: 'OnDate',
        action: 'RecordStoppingAutomatically',
        userId: authContext.userId,
      });
      void handleRecordingPress();
    }
  };

  useEffect(() => {
    const f = async () => {
      setLoading(true);
      const profileResponse: SupabaseAnswer<{
        wants_recordings: boolean;
      }> = await supabase
        .from('user_technical_details')
        .select('wants_recordings')
        .eq('user_id', authContext.userId)
        .single();
      if (profileResponse.error) {
        logErrorsWithMessage(profileResponse.error, profileResponse.error.message);
      } else {
        setWantsRecording(profileResponse.data.wants_recordings);
      }
      try {
        const premium = await getPremiumDetailsWithRecording(authContext.userId!);
        setMaxRecordingSeconds(premium.recordingSecondsLeft);
      } catch (e) {
        logErrors(e);
      }
      void localAnalytics().logEvent('OnDateRecordingButtonLoaded', {
        screen: 'OnDate',
        action: 'RecordingButtonLoaded',
        userId: authContext.userId,
      });
      setLoading(false);
    };
    void f();

    return () => cleanupRef.current();
  }, []);

  useEffect(() => {
    if (recordState === 'in_progress' && recordingSeconds >= maxRecordingSeconds) {
      void localAnalytics().logEvent('OnDateRecordingLimitReached', {
        screen: 'OnDate',
        action: 'RecordingLimitReached',
        userId: authContext.userId,
      });
      setLimitReached(true);
      void handleRecordingPress();
    }
  }, [recordState, recordingSeconds, maxRecordingSeconds]);

  async function startRecording(recentlyPermissionGranted = false) {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // so that the activity turns back to the active one, a problem on IOS maybe on Android as well
      if (recentlyPermissionGranted) {
        await sleep(500);
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setAudio(recording);
      setRecordState('in_progress');
      setFinishedRecording(undefined);
      setStartedRecording(getNow());
    } catch (err: unknown) {
      (err as Error).message = 'Failed to start recording: ' + (err as Error)?.message;
      logErrors(err);
    }
  }

  async function stopRecording() {
    setRecordState('finished');
    setFinishedRecording(getNow());
    setAudio(undefined);

    try {
      setSecondsSpent(recordingSeconds);
      await audio?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = audio?.getURI();
      if (!uri) return;

      setRecordingUri(uri);
      void localAnalytics().logEvent('OnDateRecordSetRecordingUri', {
        screen: 'OnDate',
        action: 'RecordSetRecordingUri',
        userId: authContext.userId,
        uri,
      });
    } catch (error) {
      logErrors(error);
    }
  }

  const handleRecordingPress = async () => {
    setInteracted(true);
    switch (recordState) {
      case 'not_started':
        setLoading(true);
        void localAnalytics().logEvent('OnDateRecordButtonPressed', {
          screen: 'OnDate',
          action: 'RecordButtonPressed',
          userId: authContext.userId,
        });
        if ((await Audio.requestPermissionsAsync()).granted) {
          await startRecording(!recordPermissionsGranted);
        } else {
          setRecordPermissionGranted(false);
          setCanAskForPermission(false);
          setShowPermissionPopup(true);
        }
        setLoading(false);
        break;
      case 'in_progress':
        void localAnalytics().logEvent('OnDateRecordStopped', {
          screen: 'OnDate',
          action: 'RecordStopped',
          userId: authContext.userId,
        });
        setShowStopPopup(true);

        break;
      case 'finished':
        void localAnalytics().logEvent('OnDateRecordDeleteInitiated', {
          screen: 'OnDate',
          action: 'RecordDelete',
          userId: authContext.userId,
        });
        setShowDeletePopup(true);
        break;
    }
  };
  const handlePermissionOpenSettings = async () => {
    void localAnalytics().logEvent('OnDateRecordingPermissionOpenSettings', {
      screen: 'OnDate',
      action: 'PermissionOpenSettings',
      userId: authContext.userId,
    });
    const pkg = Constants.manifest?.releaseChannel
      ? Constants.manifest?.android?.package
      : 'host.exp.exponent';

    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else if (pkg) {
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
        {
          data: 'package:' + pkg,
        },
      );
    }

    setShowPermissionPopup(false);
  };
  const handlePermissionPopupClosed = () => {
    void localAnalytics().logEvent('OnDateRecordingPermissionPopupClosed', {
      screen: 'OnDate',
      action: 'RecordingPermissionPopupClosed',
      userId: authContext.userId,
    });
    setShowPermissionPopup(false);
  };
  const handleRemoveConfirm = () => {
    void localAnalytics().logEvent('OnDateRecordingRemoveConfirm', {
      screen: 'OnDate',
      action: 'RecordingRemoveConfirm',
      userId: authContext.userId,
    });
    reset();
    setShowDeletePopup(false);
  };
  const handleRemoveCancel = () => {
    void localAnalytics().logEvent('OnDateRecordingRemoveCancel', {
      screen: 'OnDate',
      action: 'RecordingRemoveCancel',
      userId: authContext.userId,
    });
    setShowDeletePopup(false);
  };
  const handleStopConfirm = async () => {
    void localAnalytics().logEvent('OnDateRecordingStopConfirm', {
      screen: 'OnDate',
      action: 'RecordingStopConfirm',
      userId: authContext.userId,
    });
    setShowStopPopup(false);
    await stopRecording();
  };
  const handleStopCancel = () => {
    void localAnalytics().logEvent('OnDateRecordingStopCancel', {
      screen: 'OnDate',
      action: 'RecordingStopCancel',
      userId: authContext.userId,
    });
    setShowStopPopup(false);
  };
  const onTooltipPress = () => setShowTooltip(false);
  const getTooltip = () => {
    switch (tooltipStatus) {
      case 'none':
        return <></>;
      case 'wanted_recording':
        return (
          <RecordingButtonTolltip
            onPress={onTooltipPress}
            text={i18n.t('recording.tooltip.wanted_recording')}
            color={theme.colors.primary}
          ></RecordingButtonTolltip>
        );
      case 'feature_intro':
        return (
          <RecordingButtonTolltip
            onPress={onTooltipPress}
            text={i18n.t('recording.tooltip.feature_intro')}
            color={theme.colors.warning}
          ></RecordingButtonTolltip>
        );
      case 'limit_reached':
        return (
          <RecordingButtonTolltip
            onPress={onTooltipPress}
            text={i18n.t('recording.tooltip.limit_reached')}
            color={theme.colors.error}
          ></RecordingButtonTolltip>
        );
    }
  };
  return maxRecordingSeconds === 0 ? (
    <View></View>
  ) : loading ? (
    <Loading></Loading>
  ) : (
    <View>
      {showPermissionPopup && (
        <RecordingButtonPermissionPopup
          onClose={handlePermissionPopupClosed}
          onConfirm={() => void handlePermissionOpenSettings()}
        ></RecordingButtonPermissionPopup>
      )}
      {showStopPopup && (
        <RecordingButtonStopPopup
          onClose={handleStopCancel}
          onConfirm={() => void handleStopConfirm()}
        ></RecordingButtonStopPopup>
      )}
      {showDeletePopup && (
        <RecordingButtonDeletePopup
          onClose={handleRemoveCancel}
          onConfirm={handleRemoveConfirm}
        ></RecordingButtonDeletePopup>
      )}
      {showTooltip && getTooltip()}
      <RecordingButtonElement
        handlePress={() => void handleRecordingPress()}
        recordingSeconds={recordingSeconds}
        state={recordState}
      ></RecordingButtonElement>
    </View>
  );
};

export default RecordButton;
