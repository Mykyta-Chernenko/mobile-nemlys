import React, { useContext } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import Reflection from '@app/components/reflection/Reflection';
import { AuthContext } from '@app/provider/AuthProvider';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'WriteReflection'>) {
  const { reflectionId, answer, question } = route.params;
  const authContext = useContext(AuthContext);

  const goBack = () => {
    localAnalytics().logEvent('ReflectionHome', {
      screen: 'WriteReflection',
      action: 'Back',
      userId: authContext.userId,
    });
    navigation.navigate('ReflectionHome', { refreshTimeStamp: undefined });
  };
  const onSave = () => {
    navigation.navigate('FinishedWriting');
  };

  return (
    <Reflection
      reflectionId={reflectionId}
      question={question}
      answer={answer}
      onBack={goBack}
      onSave={onSave}
    />
  );
}
