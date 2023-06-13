import React, { useState } from 'react';
import { AuthStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ANON_USER } from '@app/provider/AuthProvider';
import { localAnalytics } from '@app/utils/analytics';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import { KEYBOARD_BEHAVIOR } from '@app/utils/constants';
import { SafeAreaView, KeyboardAvoidingView, View, ScrollView } from 'react-native';
import { useTheme } from '@rneui/themed';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import StyledTextInput from '@app/components/utils/StyledTextInput';
import RecordingComponent from '@app/components/utils/RecordingComponent';
import { GoBackButton } from '@app/components/buttons/GoBackButton';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<AuthStackParamList, 'PlacementRelationshipState'>) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'audio' | 'free-form' | 'guided'>('guided');
  const [audioAnswer, setAudioAnswer] = useState<string>('');

  const freeFormQuestion = i18n.t('placement.relationship_state.free_form_question');
  const [freeFormAnswer, setFreeFormAnswer] = useState<string>('');

  const guidedQuetsionsPrefixes = [1, 2, 3, 4];
  const guidedQuestions = guidedQuetsionsPrefixes.map((g) =>
    i18n.t('placement.relationship_state.guided.' + g.toString()),
  );
  const guidedAnswers = guidedQuetsionsPrefixes.map(() => useState<string>(''));

  const getCanProceed = () => {
    switch (type) {
      case 'audio':
        return !!audioAnswer;
      case 'free-form':
        return !!freeFormAnswer;
      case 'guided':
        return guidedAnswers.map((a) => a[0]).every((a) => !!a);
    }
  };
  const canProceed = getCanProceed();

  const handlePressBack = () => {
    void localAnalytics().logEvent('PlacementRelationshipStateBackClicked', {
      screen: 'PlacementRelationshipState',
      action: 'Back is clicked',
      userId: ANON_USER,
    });
    navigation.navigate('Placement', route.params);
  };
  const handleNextPress = () => {
    void localAnalytics().logEvent('PlacementRelationshipStateNextClicked', {
      screen: 'PlacementRelationshipState',
      action: 'Next is clicked',
      userId: ANON_USER,
    });
    const getAnswer = () => {
      switch (type) {
        case 'audio':
          return `question: "${freeFormQuestion}"\nanswer:"${audioAnswer}"`;
        case 'free-form':
          return `question: "${freeFormQuestion}"\nanswer: "${freeFormAnswer}"`;

        case 'guided':
          return guidedAnswers
            .map((g, ind) => {
              return `question: "${g[0]}"\nanswer: "${guidedQuestions[ind]}"`;
            })
            .join('\n');
      }
    };
    const answer = getAnswer();
    navigation.navigate('HowWeWork', { ...route.params, relationshipStateAnswer: answer });
  };
  const zip = (a, b) => a.map((k, i) => [k, b[i]]);
  const getMainComponent = () => {
    switch (type) {
      case 'audio':
        return (
          <>
            <FontText>{freeFormQuestion}</FontText>
            <FontText>{audioAnswer}</FontText>
            <RecordingComponent
              setText={setAudioAnswer}
              bucket="anon-recordings"
            ></RecordingComponent>
          </>
        );
      case 'free-form':
        return (
          <>
            <FontText>{freeFormQuestion}</FontText>
            <StyledTextInput
              style={{ marginTop: 10 }}
              onChangeText={setFreeFormAnswer}
            ></StyledTextInput>
          </>
        );
      case 'guided':
        return (
          <>
            {zip(
              guidedQuestions,
              guidedAnswers.map((g) => g[1]),
            ).map(([q, a], ind) => (
              <View key={ind}>
                <FontText>{q}</FontText>
                <StyledTextInput style={{ marginTop: 10 }} onChangeText={a}></StyledTextInput>
              </View>
            ))}
          </>
        );
    }
  };

  return (
    <SafeAreaView style={{ flexGrow: 1, width: '100%' }}>
      <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} style={{ flexGrow: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{
            flexGrow: 1,
          }}
        >
          <View style={{ position: 'absolute', left: 15 }}>
            <GoBackButton onPress={handlePressBack}></GoBackButton>
          </View>
          <View
            style={{
              paddingHorizontal: 15,
              marginBottom: 10,
              marginTop: 40,
            }}
          >
            <View
              style={{
                marginBottom: 20,
                flexDirection: 'column',
              }}
            >
              <View>
                <FontText
                  style={{
                    alignSelf: 'flex-start',
                  }}
                  h3
                >
                  {i18n.t('placement.relationship_state.title')}
                </FontText>
              </View>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <PrimaryButton onPress={() => setType('audio')} title="audio"></PrimaryButton>
              <PrimaryButton onPress={() => setType('free-form')} title="free-form"></PrimaryButton>
              <PrimaryButton onPress={() => setType('guided')} title="guided"></PrimaryButton>
            </View>
            <FontText h1>{type}</FontText>
            <View style={{ flexDirection: 'column' }}>{getMainComponent()}</View>
            <PrimaryButton
              disabled={!canProceed}
              onPress={handleNextPress}
              title={i18n.t('next')}
            ></PrimaryButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
