import React from 'react';
import V3ExploreList from '@app/components/explore/V3ContentList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '@app/types/navigation';
import { View } from 'react-native';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { showName } from '@app/utils/strings';
import { useTheme } from '@rneui/themed';

export default function ({
  route,
}: NativeStackScreenProps<MainStackParamList, 'V3ExploreArticleList'>) {
  const { theme } = useTheme();

  function renderExerciseState(
    state: string | null,
    name: string,
    partnerName: string,
    couplesFinished: number,
  ) {
    // me_partner_answered, partner_answered, me_answered or null
    if (
      state === 'partner_answered' ||
      state === 'me_answered' ||
      state === 'me_partner_answered'
    ) {
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 5,
          }}
        >
          <FontText h1 style={{ color: theme.colors.primary }}>
            •
          </FontText>
          <FontText h1 style={{ color: theme.colors.error, marginLeft: -2 }}>
            •
          </FontText>
          <FontText small style={{ color: theme.colors.grey3 }}>
            {i18n.t('explore_content_list_me_partner_finished', {
              firstName: showName(name),
              partnerName: showName(partnerName),
            })}
          </FontText>
        </View>
      );
    } else
      return (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 5,
            flexWrap: 'wrap',
          }}
        >
          <FontText small style={{ color: theme.colors.grey3 }}>
            {i18n.t('explore_content_list_couples_finished', {
              couplesCount: couplesFinished,
            })}
          </FontText>
        </View>
      );
  }
  return (
    <V3ExploreList
      contentType="exercise"
      refreshTimeStamp={route.params?.refreshTimeStamp}
      renderState={renderExerciseState}
    />
  );
}
