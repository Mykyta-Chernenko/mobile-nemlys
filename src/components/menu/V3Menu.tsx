import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, View } from 'react-native';
import { FontText, getFontSizeForScreen } from '@app/components/utils/FontText';
import { i18n } from '@app/localization/i18n';
import { localAnalytics } from '@app/utils/analytics';
import { TouchableOpacity } from 'react-native';
import { AuthContext } from '@app/provider/AuthProvider';
import { useTheme } from '@rneui/themed';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationProp } from '@app/types/navigation';
import Story from '@app/icons/story';
import StorySelected from '@app/icons/story_selected';
import Profile from '@app/icons/profile';
import Premium from '@app/icons/premium';
import V3HomeActiveIcon from '@app/icons/v3_menu_home_active';
import V3HomeIcon from '@app/icons/v3_menu_home';
import V3ExploreIcon from '@app/icons/v3_menu_explore';
import V3ExploreActiveIcon from '@app/icons/v3_menu_explore_active';
import ProfileSelected from '@app/icons/profile_selected';
import { Loading } from '../utils/Loading';
import { getPremiumDetails } from '@app/api/premium';

export default function () {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const authContext = useContext(AuthContext);
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute();

  // Determine which page is currently active based on the route name
  const isHomeActive = route.name === 'V3Home';
  const isExploreActive = route.name.includes('V3Explore');
  const isAnswerActive = route.name === 'V3AnswerHome';
  const isProfileActive = route.name === 'V3Profile';
  const [showPremium, setShowPremium] = useState(true);
  const screenWidth = Dimensions.get('window').width;
  const menuItemWidth = showPremium ? screenWidth / 5 : screenWidth / 4;
  useEffect(() => {
    const f = async () => {
      setLoading(true);
      try {
        const { premiumState } = await getPremiumDetails(authContext.userId!);
        if (premiumState === 'premium' || premiumState === 'trial') {
          setShowPremium(false);
        } else {
          setShowPremium(true);
        }
      } finally {
        setLoading(false);
      }
    };
    void f();
  }, []);
  return (
    <View
      style={{
        backgroundColor: theme.colors.white,
        height: getFontSizeForScreen('h1') * 2.5,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.white,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingTop: '5%',
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
                justifyContent: 'center',
              }}
              onPress={() => {
                void localAnalytics().logEvent('V3MenuHomeClicked', {
                  screen: 'V3Menu',
                  action: 'HomeClicked',
                  userId: authContext.userId,
                });
                navigation.navigate('V3Home', {
                  refreshTimeStamp: new Date().toISOString(),
                });
              }}
            >
              {isHomeActive ? (
                <V3HomeActiveIcon height={32} width={32} />
              ) : (
                <V3HomeIcon height={32} width={32} />
              )}
              <FontText
                small
                ellipsizeMode="tail"
                numberOfLines={1}
                style={{
                  marginTop: 5,
                  color: isHomeActive ? theme.colors.black : theme.colors.grey3,
                  width: menuItemWidth,
                  textAlign: 'center',
                }}
              >
                {i18n.t('home_menu_home')}
              </FontText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                void localAnalytics().logEvent('V3MenuExploreClicked', {
                  screen: 'V3Menu',
                  action: 'ExploreClicked',
                  userId: authContext.userId,
                });
                navigation.navigate('V3Explore', {
                  refreshTimeStamp: new Date().toISOString(),
                });
              }}
            >
              {isExploreActive ? (
                <V3ExploreActiveIcon height={32} width={32} />
              ) : (
                <V3ExploreIcon height={32} width={32} />
              )}
              <FontText
                small
                ellipsizeMode="tail"
                numberOfLines={1}
                style={{
                  marginTop: 5,
                  color: isExploreActive ? theme.colors.black : theme.colors.grey3,
                  width: menuItemWidth,
                  textAlign: 'center',
                }}
              >
                {i18n.t('home_menu_explore')}
              </FontText>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                void localAnalytics().logEvent('V3MenuAnswerClicked', {
                  screen: 'V3Menu',
                  action: 'AnswerClicked',
                  userId: authContext.userId,
                });
                navigation.navigate('V3AnswerHome', { refreshTimeStamp: new Date().toISOString() });
              }}
            >
              {isAnswerActive ? (
                <StorySelected height={32} width={32} />
              ) : (
                <Story height={32} width={32} />
              )}
              <FontText
                small
                ellipsizeMode="tail"
                numberOfLines={1}
                style={{
                  marginTop: 5,
                  color: isAnswerActive ? theme.colors.black : theme.colors.grey3,
                  width: menuItemWidth,
                  textAlign: 'center',
                }}
              >
                {i18n.t('home_menu_answer')}
              </FontText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
                void localAnalytics().logEvent('V3MenuProfileClicked', {
                  screen: 'Menu',
                  action: 'ProfileClicked',
                  userId: authContext.userId,
                });
                navigation.navigate('V3Profile', {
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
                small
                ellipsizeMode="tail"
                numberOfLines={1}
                style={{
                  marginTop: 5,
                  color: isProfileActive ? theme.colors.black : theme.colors.grey3,
                  width: menuItemWidth,
                  textAlign: 'center',
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
                  justifyContent: 'center',
                }}
                onPress={() => {
                  void localAnalytics().logEvent('V3MenuPremiumClicked', {
                    screen: 'V3Menu',
                    action: 'PremiumClicked',
                    userId: authContext.userId,
                  });
                  navigation.navigate('V3PremiumOffer', {
                    refreshTimeStamp: new Date().toISOString(),
                    isOnboarding: false,
                  });
                }}
              >
                <Premium height={32} width={32} />
                <FontText
                  small
                  ellipsizeMode="tail"
                  numberOfLines={1}
                  style={{
                    marginTop: 5,
                    color: theme.colors.grey3,
                    width: menuItemWidth,
                    textAlign: 'center',
                  }}
                >
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
