import React from 'react';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@rneui/themed';
import { i18n } from '@app/localization/i18n';
import SurveyView from '@app/components/common/SurveyView';
import { FontText } from '@app/components/utils/FontText';
export default function ({
  route,
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'PrePlacement'>) {
  const { theme } = useTheme();
  const name = route.params.name;
  const progressValue = 0.1;
  const handlePressBack = () => navigation.navigate('Welcome');
  const handlePressNext = () => {
    navigation.navigate('Placement', {
      name,
      questionIndex: undefined,
      questions: undefined,
      userAnswers: [],
    });
  };
  return (
    <SurveyView
      loading={false}
      title={i18n.t('pre_placement.title', { name })}
      progress={progressValue}
      showButton={true}
      onPress={handlePressNext}
      onBackPress={handlePressBack}
      buttonText={i18n.t('next', { name })}
    >
      <FontText
        style={{
          alignSelf: 'flex-start',
          marginBottom: 10,
          color: theme.colors.grey3,
        }}
      >
        {i18n.t('pre_placement.pretext')}
      </FontText>
    </SurveyView>
  );
}
