import { useTheme } from '@rneui/themed';
import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import FakeRecordingButtonTolltip from './FakeRecordingButtonTolltip';
import { i18n } from '@app/localization/i18n';
import { supabase } from '@app/api/initSupabase';
import { logErrors, logErrorsWithMessage } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import FakeRecordingButtonPopup from './FakeRecordingButtonPopup';
import { localAnalytics } from '@app/utils/analytics';
import { SupabaseAnswer } from '@app/types/api';
import { RecordingButton } from './RecordingButton';

export default function ({
  dateCount,
  questionIndex,
}: {
  dateCount: number;
  questionIndex: number;
}) {
  const { theme } = useTheme();
  const authContext = useContext(AuthContext);
  const [showTooltip, setShowTooltip] = useState(false);
  useEffect(() => {
    const f = async () => {
      const profileResponse: SupabaseAnswer<{
        wants_recordings: boolean;
      }> = await supabase
        .from('user_technical_details')
        .select('wants_recordings')
        .eq('user_id', authContext.userId)
        .single();
      if (profileResponse.error) {
        logErrorsWithMessage(profileResponse.error, profileResponse.error.message);
        return;
      }
      setShowTooltip(
        !profileResponse.data.wants_recordings &&
          questionIndex === 0 &&
          (dateCount === 0 || dateCount === 4 || dateCount === 9 || dateCount === 14),
      );
    };
    void f();
  }, []);

  const [showPopup, setShowPopup] = useState(false);
  const handlePress = async () => {
    void localAnalytics().logEvent('OnDateRecordButtonPressed', {
      screen: 'OnDate',
      action: 'RecordButtonPressed',
      userId: authContext.userId,
    });
    const updateProfile = await supabase
      .from('user_technical_details')
      .update({ wants_recordings: true, updated_at: new Date() })
      .eq('user_id', authContext.userId);
    if (updateProfile.error) {
      logErrors(updateProfile.error);
      return;
    }

    setShowPopup(true);
  };
  return (
    <View>
      {showPopup && (
        <FakeRecordingButtonPopup onClose={() => setShowPopup(false)}></FakeRecordingButtonPopup>
      )}
      {showTooltip && (
        <FakeRecordingButtonTolltip
          onPress={() => setShowTooltip(false)}
          text={i18n.t('date.recording_text')}
        ></FakeRecordingButtonTolltip>
      )}
      <RecordingButton handlePress={() => void handlePress()}></RecordingButton>
    </View>
  );
}
