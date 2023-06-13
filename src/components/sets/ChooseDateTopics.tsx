import React, { useState } from 'react';
import { useTheme } from '@rneui/themed';
import { View, StyleSheet } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { FontText } from '../utils/FontText';
import { PrimaryButton } from '../buttons/PrimaryButtons';

export default function (props: {
  topics: string[];
  modes: string[];
  onNextPress: (topics: string[], modes: string[]) => void;
}) {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    tag: {
      margin: 5,
      backgroundColor: theme.colors.white,
      color: theme.colors.black,
      padding: 10,
    },
    selectedTag: {
      backgroundColor: theme.colors.black,
      color: theme.colors.white,
    },
  });

  const topics = [
    i18n.t('date.topic.future'),
    i18n.t('date.topic.partner_attitude'),
    i18n.t('date.topic.commitment'),
    i18n.t('date.topic.past'),
    i18n.t('date.topic.relationship_image'),
    i18n.t('date.topic.goals'),
    i18n.t('date.topic.friends'),
    i18n.t('date.topic.polyamory'),
    i18n.t('date.topic.worldview'),
    i18n.t('date.topic.money'),
  ];
  const [pickedTopics, setPickedTopics] = useState<typeof topics>(props.topics);
  const modes = [
    'God mode',
    'Normal',
    'Lowkey',
    'Blessed',
    'Curious',
    'Funny',
    'Happy',
    'Flirty',

    'High',
    'Existential',
    'First-date',
    'Arguing',
    'Anxious',
    'Bored',
  ];
  const [pickedModes, setPickedModes] = useState<typeof modes>(props.modes);

  const toggleInList = (
    list: string[],
    setList: (list: string[]) => void,
    entity: string,
  ): void => {
    list.includes(entity) ? setList(list.filter((x) => x !== entity)) : setList([...list, entity]);
  };
  const isInList = (list: string[], entity: string): boolean => {
    return list.includes(entity);
  };
  const isPressEnabled = pickedModes.length > 0 && pickedTopics.length > 0;

  return (
    <View
      style={{
        flexGrow: 1,
        width: '100%',
      }}
    >
      <FontText h3>{i18n.t('date.topic.title')}</FontText>
      <View style={{ margin: 10 }}>
        {topics.map((t, i) => (
          <TouchableOpacity key={i} onPress={() => toggleInList(pickedTopics, setPickedTopics, t)}>
            <FontText
              style={
                isInList(pickedTopics, t)
                  ? StyleSheet.compose(styles.tag, styles.selectedTag)
                  : styles.tag
              }
            >
              {t}
            </FontText>
          </TouchableOpacity>
        ))}
      </View>

      <FontText h3>{i18n.t('date.mod.title')}</FontText>
      <View style={{ margin: 10 }}>
        {modes.map((m, i) => (
          <TouchableOpacity key={i} onPress={() => toggleInList(pickedModes, setPickedModes, m)}>
            <FontText
              style={
                isInList(pickedModes, m)
                  ? StyleSheet.compose(styles.tag, styles.selectedTag)
                  : styles.tag
              }
            >
              {m}
            </FontText>
          </TouchableOpacity>
        ))}
      </View>
      <PrimaryButton
        disabled={!isPressEnabled}
        onPress={() => props.onNextPress(pickedTopics, pickedModes)}
      >
        {i18n.t('next')}
      </PrimaryButton>
    </View>
  );
}
