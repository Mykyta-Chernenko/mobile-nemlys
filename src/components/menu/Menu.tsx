import React, { useContext, useEffect, useState } from 'react';
import { View } from 'react-native';
import { FontText } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';
import { TouchableOpacity } from 'react-native';
import { AuthContext } from '@app/provider/AuthProvider';
import { useTheme } from '@rneui/themed';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from '@app/types/navigation';
import QuestionTriangel from '@app/icons/question_triangle';
import Story from '@app/icons/story';
import StorySelected from '@app/icons/story_selected';
import Profile from '@app/icons/profile';
import Premium from '@app/icons/premium';
import QuestionTriangelSelected from '@app/icons/question_triangle_selected';
import ProfileSelected from '@app/icons/profile_selected';
import { Loading } from '../utils/Loading';
import PurpleHeartIcon from '@app/icons/heart_purple';
import SmallArrowRight from '@app/icons/small_arrow_right';
export default function () {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const authContext = useContext(AuthContext);
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute();

  // Determine which page is currently active based on the route name
  const isHomeActive = route.name === 'V2Home';
  const isAnswerActive = route.name === 'AnswerHome';
  const isProfileActive = route.name === 'Profile';
  const [showPremium, setShowPremium] = useState(false);
  useEffect(() => {
    setLoading(false);
    setShowPremium(true);
  }, []);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.black,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
    >
      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.black,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 20,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        onPress={() => {
          void localAnalytics().logEvent('MenuTryNewVersionClicked', {
            screen: 'Menu',
            action: 'TryNewVersionClicked',
            userId: authContext.userId,
          });
          navigation.navigate('V3Upgrade');
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <PurpleHeartIcon width={24} height={24} />
          <FontText style={{ color: theme.colors.white, marginLeft: 8 }}>
            {i18n.t('home_menu_try_new_version_with_more_content')}
          </FontText>
        </View>
        <SmallArrowRight width={24} height={24} />
      </TouchableOpacity>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingTop: '5%',
          backgroundColor: theme.colors.white,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          flex: 1,
        }}
      >
        {loading ? (
          <Loading></Loading>
        ) : (
          <>
            <TouchableOpacity
              style={{
                flexDirection: 'column',
                alignItems: 'center',
              }}
              onPress={() => {
                void localAnalytics().logEvent('MenuHomeClicked', {
                  screen: 'Menu',
                  action: 'HomeClicked',
                  userId: authContext.userId,
                });
                navigation.navigate('Home', {
                  refreshTimeStamp: new Date().toISOString(),
                });
              }}
            >
              {isHomeActive ? (
                <QuestionTriangelSelected height={32} width={32} />
              ) : (
                <QuestionTriangel height={32} width={32} />
              )}
              <FontText
                style={{
                  marginTop: 5,
                  color: isHomeActive ? theme.colors.black : theme.colors.grey3,
                }}
              >
                {i18n.t('home_menu_discuss')}
              </FontText>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'column',
                alignItems: 'center',
              }}
              onPress={() => {
                void localAnalytics().logEvent('MenuAnswerClicked', {
                  screen: 'Menu',
                  action: 'AnswerClicked',
                  userId: authContext.userId,
                });
                navigation.navigate('AnswerHome', { refreshTimeStamp: new Date().toISOString() });
              }}
            >
              {isAnswerActive ? (
                <StorySelected height={32} width={32} />
              ) : (
                <Story height={32} width={32} />
              )}
              <FontText
                style={{
                  marginTop: 5,
                  color: isAnswerActive ? theme.colors.black : theme.colors.grey3,
                }}
              >
                {i18n.t('home_menu_answer')}
              </FontText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: 'column',
                alignItems: 'center',
              }}
              onPress={() => {
                void localAnalytics().logEvent('MenuProfileClicked', {
                  screen: 'Menu',
                  action: 'ProfileClicked',
                  userId: authContext.userId,
                });
                navigation.navigate('Profile', {
                  refreshTimeStamp: new Date().toISOString(),
                });
              }}
            >
              {isProfileActive ? (
                <ProfileSelected height={32} width={32} />
              ) : (
                <Profile height={32} width={32} />
              )}
              <FontText
                style={{
                  marginTop: 5,
                  color: isProfileActive ? theme.colors.black : theme.colors.grey3,
                }}
              >
                {i18n.t('home_menu_profile')}
              </FontText>
            </TouchableOpacity>
            {showPremium && (
              <TouchableOpacity
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                onPress={() => {
                  void localAnalytics().logEvent('MenuPremiumClicked', {
                    screen: 'Menu',
                    action: 'PremiumClicked',
                    userId: authContext.userId,
                  });
                  navigation.navigate('PremiumOffer', {
                    refreshTimeStamp: new Date().toISOString(),
                    isOnboarding: false,
                  });
                }}
              >
                <Premium height={32} width={32} />
                <FontText style={{ marginTop: 5, color: theme.colors.grey3 }}>
                  {i18n.t('home_menu_premium')}
                </FontText>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </View>
  );
}
