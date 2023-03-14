import React, { useContext } from 'react';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { logErrorsWithMessageWithoutAlert } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import { Buffer } from 'buffer';
import moment from 'moment';
import { TIMEZONE } from '@app/utils/constants';
import { supabase } from '@app/api/initSupabase';
import { FontText } from '../utils/FontText';

export default function () {
  const authContext = useContext(AuthContext);

  const [recording, setRecording] = React.useState<undefined | Audio.Recording>();
  const [text, setText] = React.useState<string>('');

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
    console.log('Stopping recording..');
    setRecording(undefined);
    try {
      await recording?.stopAndUnloadAsync();
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
        console.log('STOP ERROR: ', error.code, error.name, error.message);
      }
      return;
    }
    try {
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

      setText(resTranscript.data.text as string);
    } catch (e: unknown) {
      logErrorsWithMessageWithoutAlert(e);
    }
  }

  return (
    <>
      <PrimaryButton
        title={recording ? 'X' : '>'}
        onPress={recording ? () => void stopRecording() : () => void startRecording()}
      />
      <FontText>{text}</FontText>
    </>
  );
}
