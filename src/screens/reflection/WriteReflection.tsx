import React, { useContext } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import Reflection from '@app/components/reflection/Reflection';
import { AuthContext } from '@app/provider/AuthProvider';
import { NOTIFICATION_IDENTIFIERS } from '@app/types/domain';
import { removeOldNotification } from '@app/utils/notification';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'WriteReflection'>) {
  const { reflectionId, answer, question } = route.params;
  const authContext = useContext(AuthContext);

  const goBack = () => {
    localAnalytics().logEvent('WriteReflectionBack', {
      screen: 'WriteReflection',
      action: 'Back',
      userId: authContext.userId,
    });
    navigation.navigate('ReflectionHome', { refreshTimeStamp: undefined });
  };
  const onSave = () => {
    navigation.navigate('FinishedWriting');

    void removeOldNotification(
      NOTIFICATION_IDENTIFIERS.REFLECTION_AFTER_DATE + authContext.userId!,
    );
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
