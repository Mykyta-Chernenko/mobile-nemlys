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
import { SetQuestionAction } from '@app/types/domain';
import { useContext, useState } from 'react';
import { FontText } from '../utils/FontText';
import { PrimaryButton } from '../buttons/PrimaryButtons';
import { logEvent } from 'expo-firebase-analytics';
import { i18n } from '@app/localization/i18n';

import { AuthContext } from '@app/provider/AuthProvider';
import { MainNavigationProp } from '@app/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { SecondaryButton } from '../buttons/SecondaryButton';
import ImageOrDefault from '../utils/ImageOrDefault';
import { supabase } from '@app/api/initSupabase';
import { logErrors } from '@app/utils/errors';
import { BlurView } from 'expo-blur';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const AVAILABLE_CARD_SET_COUNT = 3;
export default (props: { setsQuestionAction: SetQuestionAction[] }) => {
  const { theme } = useTheme();
  const [width, setWidth] = useState(10);
  const [isUnavailableCardActive, setIsUnavailableCardActive] = useState(false);

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
        {isUnavailableCardActive
          ? i18n.t('set.new.unavailable_card_title')
          : i18n.t('set.new.title')}
      </FontText>
      <GestureHandlerRootView>
        <Carousel
          vertical={false}
          width={width}
          loop={false}
          autoPlay={false}
          onProgressChange={(_, absoluteProgress) => {
            progressValue.value = absoluteProgress;
            if (
              props.setsQuestionAction.length > AVAILABLE_CARD_SET_COUNT &&
              Math.round(absoluteProgress) === props.setsQuestionAction.length - 1
            ) {
              setIsUnavailableCardActive(true);
            } else {
              setIsUnavailableCardActive(false);
            }
          }}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: 0.95,
            parallaxScrollingOffset: width * 0.23,
          }}
          data={props.setsQuestionAction}
          renderItem={({ index }) => (
            <View style={{ paddingHorizontal: '10%' }}>
              <CardItem
                {...{
                  ...props.setsQuestionAction[index],
                  unavailable:
                    props.setsQuestionAction.length > AVAILABLE_CARD_SET_COUNT &&
                    index === props.setsQuestionAction.length - 1,
                }}
              ></CardItem>
            </View>
          )}
        />
      </GestureHandlerRootView>
      {!!progressValue && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: 60,
            marginTop: 5,
            alignSelf: 'center',
          }}
        >
          {props.setsQuestionAction.map((x, index) => {
            return (
              <PaginationItem
                backgroundColor={theme.colors.primary}
                animValue={progressValue}
                index={index}
                key={index}
                length={props.setsQuestionAction.length}
              />
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
  animValue: Animated.SharedValue<number>;
  isRotate?: boolean;
}> = (props) => {
  const { theme } = useTheme();

  const { animValue, index, length, backgroundColor, isRotate } = props;
  const notAvailable = length > AVAILABLE_CARD_SET_COUNT && index === length - 1;

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
        backgroundColor: notAvailable ? theme.colors.grey2 : theme.colors.white,
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
      {!notAvailable && (
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

const CardItem: React.FC<SetQuestionAction & { unavailable: boolean }> = (props) => {
  const { theme } = useTheme();

  const { setId, action, question, unavailable } = props;
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
  const skipCard = async () => {
    await logEvent('SetItemCardSkipCardConfirm', {
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
            void logEvent('SetItemCardSkipCardCancelled', {
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
      <View
        style={{
          height: '40%',
          width: '100%',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            void logEvent('SetItemCardClickShowDetails', {
              screen: 'SetItemCard',
              action: 'Question clicked to show details',
              setId: setId,
              title: question.title,
              userId: authContext.userId,
            });
            navigation.navigate('SetItemDetails', { ...question, tags: [], type: 'question' });
          }}
          style={{ paddingHorizontal: 10 }}
        >
          <FontText style={unavailable ? blurredTextStyle : { textAlign: 'center' }}>
            {question.title}
          </FontText>
        </TouchableOpacity>
        <View style={{ width: '100%', height: '60%' }}>
          <ImageOrDefault image={question.image} />
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
        <TouchableOpacity
          onPress={() => {
            void logEvent('SetItemCardClickShowDetails', {
              screen: 'SetItemCard',
              action: 'Action clicked to show details',
              setId: setId,
              title: action.title,
              userId: authContext.userId,
            });
            navigation.navigate('SetItemDetails', { ...action, tags: [], type: 'action' });
          }}
          style={{ paddingHorizontal: 10 }}
        >
          <FontText style={unavailable ? blurredTextStyle : { textAlign: 'center' }}>
            {action.title}
          </FontText>
        </TouchableOpacity>
        <View style={{ width: '100%', height: '52%' }}>
          <ImageOrDefault image={action.image} />
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 3 }}>
          <SecondaryButton
            onPress={() => {
              void logEvent('NewSetSkipCardInitiated', {
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
              void logEvent('NewSetAcceptSetClicked', {
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
      </View>
    </View>
  );
};
