import React, { useState } from 'react';
import { Slider, useTheme } from '@rneui/themed';
import { View } from 'react-native';
import { i18n } from '@app/localization/i18n';
import { FontText } from '../utils/FontText';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import LevelLight from '@app/icons/level_light';
import LevelNormal from '@app/icons/level_normal';
import LevelDeep from '@app/icons/level_deep';

export default function (props: { level?: number; onNextPress: (level: number) => void }) {
  const { theme } = useTheme();

  const [chosenLevel, setChosenLevel] = useState<number>(props.level || 1);

  const getSlideByLevel = (level: number) => {
    const colorsByLevel = {
      1: '#BD8AFF',
      2: '#F32F9B',
      3: '#B5E88D',
    };
    const marginByLevel = {
      1: 72,
      2: 0,
      3: -72,
    };
    const iconByLevel = {
      1: LevelLight,
      2: LevelNormal,
      3: LevelDeep,
    };
    const Icon = iconByLevel[level];
    const iconTextByLevel = {
      1: i18n.t('date.level.light'),
      2: i18n.t('date.level.normal'),
      3: i18n.t('date.level.deep'),
    };
    const dotHeight = 10 + 5 * level;

    return (
      <View
        style={{
          marginTop: '5%',
          marginLeft: marginByLevel[level],
          height: 109,
          width: 109,
          borderRadius: 109,
          backgroundColor: colorsByLevel[level],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            height: 159,
            width: 109,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            left: 0,
            bottom: 110,
          }}
        >
          <View
            style={{
              width: '100%',
              backgroundColor: 'white',
              height: 140,
              borderRadius: 40,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon></Icon>
            <FontText style={{ marginTop: 10 }}>{iconTextByLevel[level]}</FontText>
          </View>
          <View
            style={{
              height: 0,
              width: 0,
              borderLeftWidth: 17.5,
              borderLeftColor: 'transparent',
              borderRightWidth: 17.5,
              borderRightColor: 'transparent',
              borderTopWidth: 17.5,
              borderTopColor: theme.colors.white,
            }}
          ></View>
        </View>
        <View
          style={{
            height: dotHeight,
            width: dotHeight,
            backgroundColor: theme.colors.black,
            borderRadius: 109,
          }}
        ></View>
      </View>
    );
  };
  const currentSlides = getSlideByLevel(chosenLevel);

  return (
    <View
      style={{
        marginTop: '5%',
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <View>
        <FontText
          style={{
            textAlign: 'left',
          }}
          h1
        >
          {i18n.t('date.level_title_first')}
          <FontText style={{ color: theme.colors.primary }} h1>
            {i18n.t('date.level_title_second')}
          </FontText>
          {i18n.t('date.level_title_third')}
        </FontText>
      </View>
      <View style={{ backgroundColor: 'white', margin: -20, paddingHorizontal: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            flexWrap: 'wrap',
            backgroundColor: theme.colors.white,
          }}
        >
          <Slider
            style={{
              width: '100%',
              height: 109,
            }}
            value={chosenLevel}
            onValueChange={setChosenLevel}
            maximumValue={3}
            minimumValue={1}
            step={1}
            allowTouchTrack
            orientation="horizontal"
            maximumTrackTintColor="rgba(242, 236, 238, 1)"
            minimumTrackTintColor="rgba(242, 236, 238, 1)"
            trackStyle={{
              height: 72,
              backgroundColor: 'F2ECEE',
              borderRadius: 40,
            }}
            thumbStyle={{
              justifyContent: 'center',
              height: 0,
              alignItems: 'center',
            }}
            thumbProps={{
              children: currentSlides,
            }}
          />
        </View>
        <PrimaryButton
          buttonStyle={{ marginTop: '10%', marginBottom: '2%' }}
          onPress={() => {
            props.onNextPress(chosenLevel);
          }}
        >
          {i18n.t('continue')}
        </PrimaryButton>
      </View>
    </View>
  );
}
