import React, { useContext, useState } from 'react';
import { View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import { i18n } from '@app/localization/i18n';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '@app/components/utils/FontText';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { localAnalytics } from '@app/utils/analytics';
import { useTheme } from '@rneui/themed';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import * as StoreReview from 'expo-store-review';
import StarRating from '@app/icons/star_rating';
import TopRightArrow from '@app/icons/top_right_arrow';
import { TouchableOpacity } from 'react-native';
import Feedback from '@app/screens/settings/Feedback';
import StarReviewIcon from '@app/icons/star_review';
import { MEDIUM_BEIGE_COLOR } from '@app/utils/colors';

export default function () {
  const authContext = useContext(AuthContext);
  const [rating, setRating] = useState<number | null>(null);
  const [ratingStarsVisible, setRatingStarsVisible] = useState(false);
  const [ratingFeedbackVisible, setRatingFeedbackVisible] = useState(false);
  const { theme } = useTheme();

  const openInitialRating = () => {
    void localAnalytics().logEvent('V3ProfileRatingClicked', {
      screen: 'V3Profile',
      action: 'RatingClicked',
    });
    setRatingStarsVisible(true);
  };
  const handleRatingStars = () => {
    void localAnalytics().logEvent('V3ProfileRatingStarsClicked', {
      screen: 'V3Profile',
      action: 'RatingStarsClicked',
      rating: rating,
    });
    if ((rating ?? 0) < 4) {
      setRatingFeedbackVisible(true);
    } else {
      void manageReview();
    }
  };
  const manageReview = async () => {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
      setRatingStarsVisible(false);
    }
  };

  const cancelDialog = () => {
    void localAnalytics().logEvent('SettingsRatingStarsCancel', {
      screen: 'Settings',
      action: 'RatingStarsCancel',
      userId: authContext.userId,
    });
    setRatingFeedbackVisible(false);
    setRatingStarsVisible(false);
  };

  const handleSubmit = () => {
    void setRatingFeedbackVisible(false);
    void setRatingStarsVisible(false);
  };
  return (
    <>
      <TouchableOpacity
        onPress={() => void openInitialRating()}
        style={{
          marginTop: 15,
          width: '100%',
          height: 72,
          paddingHorizontal: 20,
          paddingVertical: 24,
          backgroundColor: theme.colors.warning,
          borderRadius: 20,
          justifyContent: 'space-between',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <StarRating></StarRating>
          <FontText
            style={{
              marginLeft: 10,
              flexShrink: 1,
            }}
          >
            {i18n.t('profile_rate')}
          </FontText>
        </View>
        <TopRightArrow></TopRightArrow>
      </TouchableOpacity>
      <Modal
        avoidKeyboard
        isVisible={ratingStarsVisible}
        style={{
          backgroundColor: theme.colors.grey1,
          height: '70%',
          flex: 1,
          display: 'flex',
        }}
      >
        <SafeAreaView
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'space-between',
            marginVertical: 40,
          }}
        >
          <GoBackButton theme="light" onPress={cancelDialog} />
          <View
            style={{ width: '100%', flex: 1, paddingVertical: 20, alignItems: 'center', gap: 20 }}
          >
            <Image
              source={require('../../../assets/images/buddies_rating.png')}
              height={113}
              width={105}
            />
            <FontText h1>{i18n.t('settings_rating_stars_title')}</FontText>
            <View
              style={{
                flexDirection: 'row',
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => void setRating(star)}
                  style={{ marginHorizontal: 4 }}
                >
                  {
                    <StarReviewIcon
                      fill={(rating ?? 0) >= star ? theme.colors.primary : MEDIUM_BEIGE_COLOR}
                      width={60}
                      height={60}
                    />
                  }
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
            <PrimaryButton
              disabled={!rating}
              onPress={() => void handleRatingStars()}
              containerStyle={{ width: '100%' }}
            >
              {i18n.t('submit')}
            </PrimaryButton>
          </View>
        </SafeAreaView>
      </Modal>
      {ratingFeedbackVisible && (
        <Feedback
          title={i18n.t('setting_rating_back_feedback_title')}
          initialVisible={true}
          placeholder={i18n.t('setting_rating_back_feedback_placeholder')}
          onSubmit={handleSubmit}
        ></Feedback>
      )}
    </>
  );
}
