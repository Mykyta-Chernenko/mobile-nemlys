import React, { useContext, useRef, useState } from 'react';
import { useTheme } from '@rneui/themed';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Switch, View } from 'react-native';
import { AuthContext } from '@app/provider/AuthProvider';
import analytics from '@react-native-firebase/analytics';
import StyledTextInput from '@app/components/utils/StyledTextInput';
import { GoBackButton } from '../../components/buttons/GoBackButton';
import { FontText } from '../../components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { PrimaryButton } from '../../components/buttons/PrimaryButtons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { TextInput } from 'react-native-gesture-handler';
import { logErrors } from '@app/utils/errors';
import { Loading } from '../../components/utils/Loading';
import moment from 'moment';
import { TIMEZONE } from '@app/utils/constants';
import { supabase } from '@app/api/initSupabase';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'DiaryNewEntry'>) {
  const [isLoading, setIsLoading] = useState(false);
  const [isQuestionsOn, setIsQuestionsOn] = useState(true);
  const toggleSwitch = () => setIsQuestionsOn((previousState) => !previousState);
  const inputType = isQuestionsOn ? 'questions' : 'freewriting';

  const { theme } = useTheme();

  const [freewriting, setFreewriting] = useState('');

  const [feel, setFeel] = useState('');
  const [learnt, setLearnt] = useState('');
  const [challenges, setChallenges] = useState('');

  const saveEnabled =
    inputType === 'freewriting'
      ? freewriting.trim()
      : feel.trim() || learnt.trim() || challenges.trim();

  const learntRef = useRef<TextInput>(null);
  const challengesRef = useRef<TextInput>(null);
  const scrollViewRef = React.useRef<KeyboardAwareScrollView>(null);

  const authContext = useContext(AuthContext);

  const handleBack = () => {
    void analytics().logEvent('DiaryNewEntryGoBackClicked', {
      screen: 'DiaryNewEntry',
      action: 'Go back button clicked',
      userId: authContext.userId,
    });
    navigation.navigate('Diary', { refreshTimeStamp: new Date().toISOString() });
  };

  const saveDiaryEntry = async () => {
    setIsLoading(true);
    try {
      void analytics().logEvent('DiaryNewEntrySaveClicked', {
        screen: 'DiaryNewEntry',
        action: 'Save button clicked',
        userId: authContext.userId,
      });

      const feelSummary = feel.trim()
        ? i18n.t('diary.new.questions.feel_summary') + '\n' + feel.trim() + '\n\n'
        : '';
      const learntSummary = learnt.trim()
        ? i18n.t('diary.new.questions.learnt_summary') + '\n' + learnt.trim() + '\n\n'
        : '';
      const challengesSummary = challenges.trim()
        ? i18n.t('diary.new.questions.challenges_summary') + '\n' + challenges.trim() + '\n\n'
        : '';
      const content =
        inputType === 'freewriting'
          ? freewriting.trim()
          : (feelSummary + learntSummary + challengesSummary).trim();
      // const res = await supabase.functions.invoke('save-diary-entry', {
      //   body: { text: content, date: moment().utcOffset(TIMEZONE).format('YYYY-MM-DD') },
      // });
      const res = await supabase.from('diary').insert({
        user_id: authContext.userId,
        text: content,
        date: moment().utcOffset(TIMEZONE).format('YYYY-MM-DD'),
      });
      if (res.error) {
        logErrors(res.error);
        return;
      }
      navigation.navigate('Diary', { refreshTimeStamp: new Date().toISOString() });
    } finally {
      setIsLoading(false);
    }
  };

  let mainCointent = <View></View>;
  if (inputType === 'questions') {
    mainCointent = (
      <View>
        <View style={{ marginTop: 30 }} key="feel">
          <FontText style={{ fontWeight: 'bold' }}>{i18n.t('diary.new.questions.feel')}</FontText>
          <StyledTextInput
            autoFocus={true}
            style={{ marginTop: 10 }}
            onChangeText={setFeel}
            onSubmitEditing={() => {
              learntRef?.current?.focus();
            }}
          ></StyledTextInput>
        </View>
        <View style={{ marginTop: 30 }} key="learnt">
          <FontText style={{ fontWeight: 'bold' }}>{i18n.t('diary.new.questions.learnt')}</FontText>
          <StyledTextInput
            style={{ marginTop: 10 }}
            onChangeText={setLearnt}
            onSubmitEditing={() => {
              challengesRef?.current?.focus();
            }}
            ref={learntRef}
          ></StyledTextInput>
        </View>
        <View style={{ marginTop: 30 }} key="challenges">
          <FontText style={{ fontWeight: 'bold' }}>
            {i18n.t('diary.new.questions.challenges')}
          </FontText>
          <StyledTextInput
            style={{ marginTop: 10 }}
            onChangeText={setChallenges}
            onSubmitEditing={() => {
              scrollViewRef?.current?.scrollToEnd(true);
            }}
            ref={challengesRef}
          ></StyledTextInput>
        </View>
      </View>
    );
  } else if (inputType === 'freewriting') {
    mainCointent = (
      <View>
        <View style={{ marginTop: 30 }} key="freewriting">
          <FontText style={{ fontWeight: 'bold' }}>{i18n.t('diary.new.freewriting')}</FontText>
          <StyledTextInput
            autoFocus={true}
            style={{ marginTop: 10 }}
            onChangeText={setFreewriting}
            returnKeyLabel="default"
            returnKeyType="default"
          ></StyledTextInput>
        </View>
      </View>
    );
  }
  return (
    <SafeAreaView style={{ flexGrow: 1, backgroundColor: 'white' }}>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 15,
          paddingTop: 5,
        }}
        automaticallyAdjustsScrollIndicatorInsets={true}
        ref={scrollViewRef}
      >
        {isLoading ? (
          <Loading></Loading>
        ) : (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
              <View style={{ position: 'absolute', zIndex: 1 }}>
                <GoBackButton onPress={handleBack}></GoBackButton>
              </View>
              <FontText h3 style={{ width: '100%', textAlign: 'center' }}>
                {i18n.t('diary.new.title')}
              </FontText>
            </View>
            <View style={{ marginTop: 30 }}>
              <FontText style={{ fontWeight: 'bold', fontSize: 18 }}>
                {i18n.t('diary.new.type.title')}
              </FontText>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <FontText style={{ fontWeight: '600' }}>
                  {i18n.t('diary.new.type.freewriting')}
                </FontText>
                <Switch
                  style={{ marginHorizontal: 10 }}
                  trackColor={{ false: theme.colors.grey0, true: theme.colors.primary }}
                  thumbColor={theme.colors.white}
                  ios_backgroundColor={theme.colors.grey0}
                  onValueChange={toggleSwitch}
                  value={isQuestionsOn}
                ></Switch>
                <FontText style={{ fontWeight: '600' }}>
                  {i18n.t('diary.new.type.questions')}
                </FontText>
              </View>
            </View>
            <View>{mainCointent}</View>

            <PrimaryButton
              buttonStyle={{ marginTop: 20, width: 120, alignSelf: 'center' }}
              onPress={() => void saveDiaryEntry()}
              disabled={!saveEnabled}
            >
              {i18n.t('save')}
            </PrimaryButton>
          </View>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
