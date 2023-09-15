import { useTheme } from '@rneui/themed';
import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import Mic from '@app/icons/mic';
import { TouchableOpacity } from 'react-native-gesture-handler';
import FakeRecordingButtonTolltip from './FakeRecordingButtonTolltip';
import { i18n } from '@app/localization/i18n';
import { supabase } from '@app/api/initSupabase';
import { logErrors, logErrorsWithMessage } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import FakeRecordingButtonPopup from './FakeRecordingButtonPopup';
import { localAnalytics } from '@app/utils/analytics';
import { SupabaseAnswer } from '@app/types/api';
const BackgroundLayer = ({
  width,
  height,
  color,
  rotate,
  zIndex,
  x,
  y,
}: {
  width: number;
  height: number;
  color: string;
  rotate: number;
  zIndex: number;
  x: number;
  y: number;
}) => (
  <View
    style={{
      position: 'absolute',
      width,
      height,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex,
      left: x,
      top: y,
    }}
  >
    <View
      style={{
        width,
        height,
        borderRadius: 50,
        backgroundColor: color,
        transform: [{ rotate: `${rotate}deg` }],
      }}
    ></View>
  </View>
);
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
      <TouchableOpacity containerStyle={{ display: 'flex' }} onPress={() => void handlePress()}>
        <BackgroundLayer
          zIndex={1}
          width={68}
          height={87.44}
          color={theme.colors.primary}
          rotate={16.8357}
          x={3}
          y={-8.7}
        />
        <BackgroundLayer
          zIndex={2}
          width={72}
          height={83.45}
          color={theme.colors.warning}
          rotate={60.5179}
          x={3}
          y={-5}
        />
        <BackgroundLayer
          zIndex={3}
          width={68}
          height={83}
          color={theme.colors.error}
          rotate={110.934}
          x={5}
          y={-5}
        />
        <View
          style={{
            zIndex: 4,
            backgroundColor: theme.colors.white,
            borderRadius: 50,
            height: 72,
            width: 72,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Mic></Mic>
        </View>
      </TouchableOpacity>
    </View>
  );
}
