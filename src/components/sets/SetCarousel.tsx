import * as React from 'react';
import { Alert, Platform, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@rneui/themed';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { CarouselCardsType, SetQuestionAction } from '@app/types/domain';
import { useContext, useState } from 'react';
import { FontText } from '../utils/FontText';
import { i18n } from '@app/localization/i18n';

import { AuthContext } from '@app/provider/AuthProvider';
import { MainNavigationProp } from '@app/types/navigation';
import { useNavigation } from '@react-navigation/native';
import ImageOrDefault from '../utils/ImageOrDefault';
import { supabase } from '@app/api/initSupabase';
import { logErrors } from '@app/utils/errors';
import { BlurView } from 'expo-blur';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AIIcon from '@app/icons/ai';

import { PrimaryButton } from '../buttons/PrimaryButtons';
import { SecondaryButton } from '../buttons/SecondaryButton';
import { HistorySetScreenName } from '@app/utils/constants';
import { localAnalytics } from '@app/utils/analytics';
export default (props: {
  setsQuestionAction: SetQuestionAction[];
  deckType: CarouselCardsType;
}) => {
  const { theme } = useTheme();
  const { deckType } = props;
  const [width, setWidth] = useState(10);
  const [isUnavailableCardActive, setIsUnavailableCardActive] = useState(false);
  const [isAiCardActive, setIsAieCardActive] = useState(false);
  const { setsQuestionAction: setsQuestionActionSorted } = props;

  let cardTitle = '';
  if (deckType === 'history') {
    cardTitle = i18n.t('set.history.title');
  } else if (isUnavailableCardActive) {
    cardTitle = i18n.t('set.new.unavailable_card_title');
  } else if (isAiCardActive) {
    cardTitle = i18n.t('set.new.ai_title');
  } else {
    cardTitle = i18n.t('set.new.title');
  }
  const progressValue = useSharedValue<number>(0);
  return (
    <View
      style={{
        alignItems: 'center',
        width: '100%',
        height: '75%',
      }}
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setWidth(width);
      }}
    >
      <FontText
        style={{
          color: theme.colors.white,
          textAlign: 'center',
          fontSize: 18,
          paddingTop: '1%',
        }}
      >
        {cardTitle}
      </FontText>
      <GestureHandlerRootView>
        <Carousel
          vertical={false}
          width={width}
          loop={false}
          autoPlay={false}
          onProgressChange={(_, absoluteProgress) => {
            progressValue.value = absoluteProgress;
            if (setsQuestionActionSorted[Math.round(absoluteProgress)].type === 'unavailable') {
              setIsUnavailableCardActive(true);
            } else {
              setIsUnavailableCardActive(false);
            }
            if (setsQuestionActionSorted[Math.round(absoluteProgress)].type === 'ai') {
              setIsAieCardActive(true);
            } else {
              setIsAieCardActive(false);
            }
          }}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.95,
            parallaxScrollingOffset: width * 0.23,
          }}
          data={setsQuestionActionSorted}
          renderItem={({ index }) => (
            <View style={{ paddingHorizontal: '10%' }}>
              <CardItem {...{ ...setsQuestionActionSorted[index], deckType }}></CardItem>
            </View>
          )}
        />
      </GestureHandlerRootView>
      {!!progressValue && setsQuestionActionSorted.length > 1 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 5,
            alignSelf: 'center',
          }}
        >
          {setsQuestionActionSorted.map((x, index) => {
            return (
              <View style={{ marginHorizontal: 2 }} key={index}>
                <PaginationItem
                  backgroundColor={theme.colors.primary}
                  animValue={progressValue}
                  setsQuestionAction={setsQuestionActionSorted}
                  index={index}
                  length={setsQuestionActionSorted.length}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const PaginationItem: React.FC<{
  index: number;
  backgroundColor: string;
  length: number;
  setsQuestionAction: SetQuestionAction[];
  animValue: Animated.SharedValue<number>;
  isRotate?: boolean;
}> = (props) => {
  const { theme } = useTheme();

  const { animValue, index, length, backgroundColor, isRotate, setsQuestionAction } = props;

  const unavailable = setsQuestionAction[index].type === 'unavailable';

  const width = 10;

  const animStyle = useAnimatedStyle(() => {
    let inputRange = [index - 1, index, index + 1];
    let outputRange = [-width, 0, width];

    if (index === 0 && animValue?.value > length - 1) {
      inputRange = [length - 1, length, length + 1];
      outputRange = [-width, 0, width];
    }

    return {
      transform: [
        {
          translateX: interpolate(animValue?.value, inputRange, outputRange, Extrapolate.CLAMP),
        },
      ],
    };
  }, [animValue, index, length]);
  return (
    <View
      style={{
        backgroundColor: unavailable ? theme.colors.grey2 : theme.colors.white,
        width,
        height: width,
        borderRadius: 50,
        overflow: 'hidden',
        transform: [
          {
            rotateZ: isRotate ? '90deg' : '0deg',
          },
        ],
      }}
    >
      {!unavailable && (
        <Animated.View
          style={[
            {
              borderRadius: 50,
              backgroundColor,
              flex: 1,
            },
            animStyle,
          ]}
        />
      )}
    </View>
  );
};

const CardItem: React.FC<SetQuestionAction & { deckType: CarouselCardsType }> = (props) => {
  const { theme } = useTheme();

  const { setId, coupleSetId, action, question, type, deckType } = props;
  const unavailable = type === 'unavailable';
  const ai = type === 'ai';
  const authContext = useContext(AuthContext);
  const navigation = useNavigation<MainNavigationProp>();
  const androidBlurredStyle = {
    textAlign: 'center',
    color: 'transparent',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  };
  const blurredTextStyle = Platform.OS === 'android' ? androidBlurredStyle : {};
  const normalTextStyle = ai
    ? { textAlign: 'center', paddingHorizontal: 30, width: '100%' }
    : { textAlign: 'center', width: '100%' };
  const skipCard = async () => {
    void localAnalytics().logEvent('SetItemCardSkipCardConfirm', {
      screen: 'SetItemCard',
      action: 'Attempt to skip card was confirmed',
      setId: setId,
      userId: authContext.userId,
    });

    const res = await supabase.functions.invoke('skip-set', { body: { set_id: setId } });

    if (res.error) {
      logErrors(res.error);
      return;
    }
    navigation.navigate('SetHomeScreen', { refreshTimeStamp: new Date().toISOString() });
  };
  const skipCardAlert = () => {
    Alert.alert(
      i18n.t('set.skip_alert'),
      i18n.t('set.skip_alert_details'),
      [
        {
          text: i18n.t('cancel'),
          onPress: () => {
            void localAnalytics().logEvent('SetItemCardSkipCardCancelled', {
              screen: 'SetItemCard',
              action: 'Attempt to skip card was cancelled',
              setId: setId,
              userId: authContext.userId,
            });
          },
          style: 'cancel',
        },
        {
          text: i18n.t('remove'),
          onPress: () => void skipCard(),
          style: 'destructive',
        },
      ],
      {
        cancelable: true,
      },
    );
  };
  const onQuestionPress = () => {
    void localAnalytics().logEvent('SetItemCardClickShowDetails', {
      screen: 'SetItemCard',
      action: 'Question clicked to show details',
      setId: setId,
      title: question.title,
      userId: authContext.userId,
    });
    navigation.navigate('SetItemDetails', {
      ...question,
      deckType,
      tags: [],
      type: ai ? 'ai_question' : 'question',
    });
  };
  const onActionPress = () => {
    void localAnalytics().logEvent('SetItemCardClickShowDetails', {
      screen: 'SetItemCard',
      action: 'Action clicked to show details',
      setId: setId,
      title: action.title,
      userId: authContext.userId,
    });

    navigation.navigate('SetItemDetails', {
      ...action,
      deckType,
      tags: [],
      type: ai ? 'ai_action' : 'action',
    });
  };
  return (
    <View
      style={{
        justifyContent: 'space-between',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: 20,
        padding: 10,
      }}
    >
      {unavailable && (
        <BlurView
          intensity={Platform.OS === 'ios' ? 20 : 100}
          tint="light"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 1,
            borderRadius: 20,
            overflow: 'hidden',
          }}
        ></BlurView>
      )}
      {ai && (
        <View
          style={{
            borderRadius: 50,
            borderWidth: 2,
            height: 35,
            width: 35,
            borderColor: theme.colors.primary,
            padding: 5,
            position: 'absolute',
            right: 5,
            top: 5,
          }}
        >
          <AIIcon height={20} width={20} />
        </View>
      )}
      <View
        style={{
          height: '40%',
          width: '100%',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}
      >
        <TouchableOpacity onPress={onQuestionPress} style={{ width: '100%' }}>
          <View style={{ flexDirection: 'row', width: '100%', paddingTop: 10 }}>
            <FontText style={unavailable ? blurredTextStyle : normalTextStyle}>
              {question.title}
            </FontText>
          </View>
        </TouchableOpacity>

        <View style={{ width: '100%', height: '60%' }}>
          <ImageOrDefault onPress={onQuestionPress} image={question.image} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 3 }}>
        <View
          style={{ height: 2, backgroundColor: theme.colors.primary, flexGrow: 1, marginRight: 4 }}
        ></View>
        <FontText style={{ textAlign: 'center', color: theme.colors.primary, fontSize: 14 }}>
          {i18n.t('set.more_details')}
        </FontText>
        <View
          style={{ height: 2, backgroundColor: theme.colors.primary, flexGrow: 1, marginLeft: 4 }}
        ></View>
      </View>
      <View
        style={{
          height: '55%',
          width: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity onPress={onActionPress} style={{ paddingHorizontal: 10, width: '100%' }}>
          <FontText style={unavailable ? blurredTextStyle : { textAlign: 'center' }}>
            {action.title}
          </FontText>
        </TouchableOpacity>

        <View style={{ width: '100%', height: '52%' }}>
          <ImageOrDefault onPress={onActionPress} image={action.image} />
        </View>

        {deckType == 'new' && (
          <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <SecondaryButton
              onPress={() => {
                void localAnalytics().logEvent('NewSetSkipCardInitiated', {
                  screen: 'NewSet',
                  action: 'SkipCard',
                  userId: authContext.userId,
                  setId: setId,
                });
                void skipCardAlert();
              }}
            >
              {i18n.t('remove')}
            </SecondaryButton>
            <View style={{ width: 15 }}></View>
            <PrimaryButton
              onPress={() => {
                void localAnalytics().logEvent('NewSetAcceptSetClicked', {
                  screen: 'NewSet',
                  action: 'AcceptSetClicked',
                  userId: authContext.userId,
                });
                navigation.navigate('SetReminder', {
                  setId,
                });
              }}
            >
              {i18n.t('set.accept')}
            </PrimaryButton>
          </View>
        )}
        {deckType == 'history' && (
          <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <PrimaryButton
              onPress={() => {
                void localAnalytics().logEvent('HistorySetHowDidItGoClicked', {
                  screen: HistorySetScreenName,
                  action: 'HowDidItGoClicked',
                  userId: authContext.userId,
                });
                navigation.navigate('HistorySetCardDetails', {
                  coupleSetId: coupleSetId!,
                });
              }}
            >
              {i18n.t('set.history.card_button_title')}
            </PrimaryButton>
          </View>
        )}
      </View>
    </View>
  );
};
