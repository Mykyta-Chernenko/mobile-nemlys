import React, { useEffect, useState } from 'react';
import { supabase } from '@app/api/initSupabase';
import { ViewSetHomeScreen } from './ViewSetHomeScreen';
import { Action, Question } from '@app/types/domain';
import { getQuestionsAndActionsForSet } from '@app/api/data/set';
import { APICoupleSet, SupabaseAnswer } from '@app/types/api';
import SetList from './SetList';
import { TouchableOpacity, View } from 'react-native';
import { Dialog, Text, useTheme } from '@rneui/themed';
import { Loading } from '../utils/Loading';
import { i18n } from '@app/localization/i18n';
import moment from 'moment';
import ClockIcon from '@app/icons/clock';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { combineDateWithTime } from '@app/utils/time';
import { MainNavigationProp } from '@app/types/navigation';
import { useNavigation } from '@react-navigation/native';

export default function () {
  const navigation = useNavigation<MainNavigationProp>();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [currentSet, setCurrentSet] = useState<APICoupleSet | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const meetingDate = currentSet?.meeting ? moment(currentSet.meeting) : undefined;
  const readableDate = meetingDate
    ? meetingDate.format('MMM Do, HH:mm')
    : i18n.t('set.chosen.date_is_not_set');

  const [now, setNow] = useState<Date>(new Date());
  const meetingSet = currentSet?.meeting;
  const meetingHappened = currentSet?.meeting && new Date(currentSet.meeting) < now;
  const halfHour = 1000 * 60 * 30;
  const setCreatedTooRecently =
    currentSet?.created_at &&
    new Date(new Date(currentSet.created_at).getTime() + halfHour) > new Date();
  const enableCompletedButton = meetingSet && meetingHappened;

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  });

  useEffect(() => {
    async function getCurrentLevel() {
      const res: SupabaseAnswer<APICoupleSet | null> = await supabase
        .from('couple_set')
        .select(
          'id, created_at, updated_at, set_id,couple_id,order,completed,schedule_reminder,meeting',
        )
        .eq('completed', false)
        .maybeSingle();
      if (res.error) {
        alert(res.error.message);
        return;
      }
      if (res.data) {
        setCurrentSet(res.data);
        const questionsActions = await getQuestionsAndActionsForSet(res.data.set_id);
        if (questionsActions) {
          setQuestions(questionsActions.questions);
          setActions(questionsActions.actions);
        }
      }
      setLoading(false);
    }
    void getCurrentLevel();
  }, [setLoading, setQuestions, setActions]);

  const defaultDate = (currentSet?.meeting && new Date(currentSet?.meeting)) || now;
  const [showChangeDate, setShowChangeDate] = useState(false);
  const [chosenDate, setChosenDate] = useState<Date>(defaultDate);
  const [chosenDateTouched, setChosenDateTouched] = useState<boolean>(false);
  const [chosenTime, setChosenTime] = useState<Date>(defaultDate);
  const [chosenTimeTouched, setChosenTimeTouched] = useState<boolean>(false);

  const updateMeetingDate = async () => {
    if (!currentSet) {
      return;
    }
    try {
      setLoading(true);
      const res: SupabaseAnswer<APICoupleSet> = await supabase
        .from('couple_set')
        .update({
          meeting: combineDateWithTime(chosenDate, chosenTime),
          schedule_reminder: undefined,
          updated_at: new Date(),
        })
        .eq('id', currentSet.id)
        .select()
        .single();
      if (res.error) {
        alert(JSON.stringify(res));
        return;
      }
      setCurrentSet(res.data);
    } finally {
      setShowChangeDate(false);
      setLoading(false);
    }
  };

  const handleButton = () => {
    if (!currentSet) return;
    navigation.navigate('CompleteSetReflect', {
      setId: currentSet.set_id,
      coupleSetId: currentSet.id,
    });
  };
  return (
    <ViewSetHomeScreen>
      {loading ? (
        <Loading light />
      ) : (
        <View
          style={{
            flexGrow: 1,
            width: '100%',
            padding: 15,
          }}
        >
          <View
            style={{
              marginBottom: 25,
              marginTop: 10,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
              <Text style={{ color: theme.colors.white, fontSize: 18 }}>
                {i18n.t('set.chosen.title')}
              </Text>
              <Text style={{ color: theme.colors.grey4, fontSize: 12 }}>
                {i18n.t('set.chosen.click_tips')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setChosenDate(defaultDate);
                setChosenTime(defaultDate);
                setChosenTimeTouched(false);
                setChosenDateTouched(false);
                setShowChangeDate(true);
              }}
            >
              <View style={{ flexDirection: 'row' }}>
                <View
                  style={{
                    backgroundColor: theme.colors.white,
                    borderRadius: 10,
                    paddingHorizontal: 7,
                    paddingVertical: 5,
                    flexDirection: 'row',
                  }}
                >
                  <View style={{ flexDirection: 'column', paddingRight: 20 }}>
                    <Text style={{ color: theme.colors.grey2 }}>
                      {i18n.t('set.chosen.next_date_is')}
                    </Text>
                    <Text>
                      {readableDate}
                      <View>
                        <Text style={{ transform: [{ rotateZ: '90deg' }] }}>✎</Text>
                      </View>
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', position: 'absolute', right: 0, top: 20 }}>
                  <ClockIcon height={30} width={30} />
                </View>
              </View>

              <Dialog isVisible={showChangeDate} onBackdropPress={() => setShowChangeDate(false)}>
                <Dialog.Title title={i18n.t('set.chosen.change_meeting_date.title')} />
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    marginTop: 10,
                  }}
                >
                  <DateTimePicker
                    testID="datePicker"
                    value={chosenDate}
                    mode="date"
                    onChange={(event, value) => {
                      setChosenDateTouched(true);
                      setChosenDate(value || defaultDate);
                    }}
                    themeVariant={theme.mode}
                    style={{ marginRight: 5 }}
                  />
                  <DateTimePicker
                    testID="timePicker"
                    value={chosenTime}
                    mode="time"
                    is24Hour={true}
                    onChange={(event, value) => {
                      setChosenTimeTouched(true);
                      setChosenTime(value || defaultDate);
                    }}
                    themeVariant={theme.mode}
                  />
                </View>
                <Dialog.Actions>
                  <Dialog.Button
                    title={i18n.t('save')}
                    disabled={!chosenDateTouched && !chosenTimeTouched}
                    onPress={() => void updateMeetingDate()}
                  />
                  <Dialog.Button title={i18n.t('close')} onPress={() => setShowChangeDate(false)} />
                </Dialog.Actions>
              </Dialog>
            </TouchableOpacity>
          </View>
          <SetList actions={actions} questions={questions} chosenSet={true}></SetList>
          <View style={{ marginTop: 10 }}>
            {!meetingSet && (
              <Text style={{ color: theme.colors.grey2, marginBottom: 5 }}>
                {i18n.t('set.chosen.button.disable_before_meeting_set')}
              </Text>
            )}
            {meetingSet && !meetingHappened && (
              <Text style={{ color: theme.colors.grey2, marginBottom: 5 }}>
                {i18n.t('set.chosen.button.disable_before_meeting_happened')}
              </Text>
            )}
            {meetingHappened && setCreatedTooRecently && (
              <Text style={{ color: theme.colors.grey2, marginBottom: 5 }}>
                {i18n.t('set.chosen.button.set_created_too_recently')}
              </Text>
            )}
            <PrimaryButton disabled={!enableCompletedButton} onPress={handleButton}>
              {i18n.t('set.chosen.button.title')}
            </PrimaryButton>
          </View>
        </View>
      )}
    </ViewSetHomeScreen>
  );
}
