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
import Profile from '@app/icons/profile';
import Premium from '@app/icons/premium';
import StorySelected from '@app/icons/story_selected';
import StoryWithWarning from '@app/icons/story_with_warning';
import QuestionTriangelSelected from '@app/icons/question_triangle_selected';
import ProfileSelected from '@app/icons/profile_selected';
import { logErrors } from '@app/utils/errors';
import { getPremiumDetails } from '@app/api/premium';
import { Loading } from '../utils/Loading';

export default function ({ reflectionWarning }: { reflectionWarning?: boolean }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const authContext = useContext(AuthContext);
  const navigation = useNavigation<MainNavigationProp>();
  const route = useRoute();

  // Determine which page is currently active based on the route name
  const isHomeActive = route.name === 'Home';
  const isReflectionActive = route.name === 'ReflectionHome';
  const isProfileActive = route.name === 'Profile';
  const [showPremium, setShowPremium] = useState(false);
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const premiumDetails = await getPremiumDetails(authContext.userId!);
        if (premiumDetails.premiumState !== 'new') {
          setShowPremium(true);
        }
      } catch (e) {
        logErrors(e);
        return;
      } finally {
        setLoading(false);
      }
    };

    void getData();
  }, []);
  return (
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
              {i18n.t('home.menu.discuss')}
            </FontText>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onPress={() => {
              void localAnalytics().logEvent('MenuReflectClicked', {
                screen: 'Menu',
                action: 'ReflectClicked',
                userId: authContext.userId,
              });
              navigation.navigate('ReflectionHome', {
                refreshTimeStamp: new Date().toISOString(),
              });
            }}
          >
            {isReflectionActive ? (
              <StorySelected height={32} width={32} />
            ) : reflectionWarning ? (
              <StoryWithWarning height={32} width={32} />
            ) : (
              <Story height={32} width={32} />
            )}
            <FontText
              style={{
                marginTop: 5,
                color: isReflectionActive ? theme.colors.black : theme.colors.grey3,
              }}
            >
              {i18n.t('home.menu.reflect')}
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
              {i18n.t('home.menu.profile')}
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
                });
              }}
            >
              <Premium height={32} width={32} />
              <FontText style={{ marginTop: 5, color: theme.colors.grey3 }}>
                {i18n.t('home.menu.premium')}
              </FontText>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}
