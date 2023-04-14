import React, { useContext, useState } from 'react';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { logErrorsWithMessageWithoutAlert } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import { Buffer } from 'buffer';
import moment from 'moment';
import { TIMEZONE } from '@app/utils/constants';
import { supabase } from '@app/api/initSupabase';
import { i18n } from '@app/localization/i18n';
import { Loading } from '../utils/Loading';

export default function (props: { onCreatedRecording: () => void }) {
  const authContext = useContext(AuthContext);

  const [recording, setRecording] = useState<undefined | Audio.Recording>();
  const [loading, setLoading] = useState(false);

  async function startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setLoading(true);
    console.log('Stopping recording..');
    setRecording(undefined);

    try {
      await recording?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording?.getURI();
      console.log('Recording stopped and stored at', uri);
      if (!uri) return;

      const file = Buffer.from(
        await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        }),
        'base64',
      );

      const timestamp = moment().utcOffset(TIMEZONE).valueOf().toString();
      const name =
        authContext.userId! +
        '/' +
        timestamp +
        Audio.RecordingOptionsPresets.HIGH_QUALITY.ios.extension;

      const res = await supabase.storage.from('conversation-recordings').upload(name, file);
      console.log('res', res);

      const resTranscript = await supabase.functions.invoke('analyze-conversation', {
        body: { uri: res.data?.path },
      });
      console.log('resTranscript', resTranscript);
      props.onCreatedRecording();
    } catch (error: any) {
      // On Android, calling stop before any data has been collected results in
      // an E_AUDIO_NODATA error. This means no audio data has been written to
      // the output file is invalid.
      if (error.code === 'E_AUDIO_NODATA') {
        console.log(
          `Stop was called too quickly, no data has yet been received (${
            (error as Error).message
          })`,
        );
      } else {
        logErrorsWithMessageWithoutAlert(error);
      }
    } finally {
      setLoading(false);
    }
  }

  return loading ? (
    <Loading></Loading>
  ) : (
    <PrimaryButton
      size="sm"
      title={recording ? i18n.t('conversations.stop') : i18n.t('conversations.record')}
      onPress={recording ? () => void stopRecording() : () => void startRecording()}
    ></PrimaryButton>
  );
}
