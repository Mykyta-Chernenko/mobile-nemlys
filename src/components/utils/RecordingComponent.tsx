import React, { useContext, useState } from 'react';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { logErrorsWithMessageWithoutAlert } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import { Buffer } from 'buffer';
import { supabase } from '@app/api/initSupabase';
import { i18n } from '@app/localization/i18n';
import { Loading } from '../utils/Loading';
import { getNow } from '@app/utils/date';

export default function (props: { bucket: string; onRecorded: (url: string) => void }) {
  const authContext = useContext(AuthContext);

  const [recording, setRecording] = useState<undefined | Audio.Recording>();
  const [loading, setLoading] = useState(false);

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setLoading(true);
    setRecording(undefined);

    try {
      await recording?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording?.getURI();
      if (!uri) return;

      const file = Buffer.from(
        await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        }),
        'base64',
      );

      const timestamp = getNow().valueOf().toString();
      const name =
        authContext.userId! +
        '/' +
        timestamp +
        Audio.RecordingOptionsPresets.HIGH_QUALITY.ios.extension;

      const res = await supabase.storage.from(props.bucket).upload(name, file);
      if (res.error) {
        logErrorsWithMessageWithoutAlert(res.error);
      }

      props.onRecorded(res.data?.path || '');
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
