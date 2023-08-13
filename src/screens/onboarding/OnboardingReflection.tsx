import React, { useContext, useEffect, useState } from 'react';
import { useThemeMode } from '@rneui/themed';
import { AuthContext } from '@app/provider/AuthProvider';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import Reflection from '@app/components/reflection/Reflection';
import { Loading } from '@app/components/utils/Loading';
import { SupabaseAnswer } from '@app/types/api';
import { supabase } from '@app/api/initSupabase';
import { logErrors, logErrorsWithMessage } from '@app/utils/errors';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'OnboardingReflection'>) {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState('');
  const [reflectionId, setReflectionId] = useState(0);

  useEffect(() => {
    const getData = async () => {
      const data: SupabaseAnswer<{ id: number; reflection: string }> = await supabase
        .from('reflection_question')
        .select('id, reflection')
        .eq('level', 0)
        .eq('active', true)
        .single();
      if (data.error) {
        logErrors(data.error);
        return;
      }
      setReflection(data.data.reflection);
      setReflectionId(data.data.id);
      setLoading(false);
    };
    void getData();
  }, []);

  // to set the color of status bar
  const { setMode } = useThemeMode();
  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    return unsubscribeFocus;
  }, [navigation]);
  const handlePress = async () => {
    const profileResponse = await supabase
      .from('user_profile')
      .update({
        onboarding_finished: true,
        updated_at: new Date(),
      })
      .eq('user_id', authContext.userId);
    if (profileResponse.error) {
      logErrorsWithMessage(profileResponse.error, profileResponse.error?.message);
      return;
    }
    void localAnalytics().logEvent('OnboardingReflectionContinueCLicked', {
      screen: 'OnboardingReflection',
      action: 'ContinueCLicked',
      userId: authContext.userId,
    });
    navigation.navigate('Analyzing');
  };
  const handleBack = () => {
    void localAnalytics().logEvent('OnboardingReflectionBackClicked', {
      screen: 'OnboardingReflection',
      action: 'BackClicked',
      userId: authContext.userId,
    });
    navigation.navigate('OnboardingReflectionExplanation');
  };

  return loading ? (
    <Loading></Loading>
  ) : (
    <Reflection
      reflectionId={reflectionId}
      onSave={() => void handlePress()}
      question={reflection}
      onBack={handleBack}
    ></Reflection>
  );
}
