import React, { useContext, useEffect, useState } from 'react';
import { View, ImageBackground } from 'react-native';
import { useTheme, useThemeMode } from '@rneui/themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { localAnalytics } from '@app/utils/analytics';
import { AuthContext } from '@app/provider/AuthProvider';
import { GoBackButton } from '@app/components/buttons/GoBackButton';
import { PrimaryButton } from '@app/components/buttons/PrimaryButtons';
import { i18n } from '@app/localization/i18n';
import { FontText } from '@app/components/utils/FontText';
import OnlineIcon from '@app/icons/story_selected';
import InPersonIcon from '@app/icons/two_small_buddies';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@date_mode_selection';

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'DateIsWithPartner'>) {
  const { job } = route.params;
  const jobTitle = i18n.t(`jobs_${job}`);

  const { theme } = useTheme();
  const { setMode } = useThemeMode();
  const authContext = useContext(AuthContext);
  const [selectedMode, setSelectedMode] = useState<'online' | 'in_person' | null>(null);

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => setMode('light'));
    void loadSelectedMode();
    return unsubscribeFocus;
  }, [navigation]);

  const loadSelectedMode = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      if (value !== null) {
        setSelectedMode(value as 'online' | 'in_person');
      }
    } catch (e) {
      console.error('Failed to load the selected mode from storage');
    }
  };

  const saveSelectedMode = async (mode: 'online' | 'in_person') => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      console.error('Failed to save the selected mode to storage');
    }
  };

  const handleModeSelection = (mode: 'online' | 'in_person') => {
    setSelectedMode(mode);
    void saveSelectedMode(mode);
  };

  const handleContinue = () => {
    localAnalytics().logEvent('DateStartIsWithPartner', {
      screen: 'Date',
      action: 'StartIsWithPartner',
      withPartner: selectedMode === 'in_person',
      userId: authContext.userId,
    });
    navigation.navigate('ConfigureDate', {
      job,
      withPartner: selectedMode === 'in_person',
      refreshTimeStamp: new Date().toISOString(),
    });
  };

  const goBack = () => {
    void localAnalytics().logEvent('DateIsWithPartnerGoBack', {
      screen: 'DateIsWithPartner',
      action: 'Go back pressed',
      userId: authContext.userId,
    });
    navigation.navigate('Home', { refreshTimeStamp: new Date().toISOString() });
  };

  return (
    <ImageBackground
      style={{ flex: 1 }}
      source={require('../../../assets/images/onboarding_background.png')}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 24 }}>
          <GoBackButton
            theme="light"
            containerStyle={{ alignSelf: 'flex-start' }}
            onPress={() => void goBack()}
          />
          <View style={{ marginTop: 24, marginBottom: 24 }}>
            <FontText small style={{ color: theme.colors.grey5, fontWeight: '600' }}>
              {jobTitle}
            </FontText>
          </View>
          <FontText h2 style={{ marginBottom: 24 }}>
            {i18n.t('date_mode_choose_mode')}
          </FontText>
          <View style={{ gap: 15 }}>
            <ModeButton
              icon={<OnlineIcon />}
              title={i18n.t('date_mode_online_title')}
              subtitle={i18n.t('date_mode_online_description')}
              onPress={() => handleModeSelection('online')}
              isActive={selectedMode === 'online'}
            />
            <ModeButton
              icon={<InPersonIcon />}
              title={i18n.t('date_mode_in_person_title')}
              subtitle={i18n.t('date_mode_in_person_description')}
              onPress={() => handleModeSelection('in_person')}
              isActive={selectedMode === 'in_person'}
            />
          </View>
          <View style={{ flex: 1 }} />
          <PrimaryButton
            containerStyle={{
              width: '100%',
            }}
            onPress={handleContinue}
            disabled={!selectedMode}
          >
            {i18n.t('continue')}
          </PrimaryButton>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

interface ModeButtonProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  isActive: boolean;
}

const ModeButton: React.FC<ModeButtonProps> = ({ icon, title, subtitle, onPress, isActive }) => {
  const { theme } = useTheme();

  return (
    <PrimaryButton
      buttonStyle={{
        backgroundColor: isActive ? theme.colors.black : theme.colors.white,
        borderRadius: 20,
        padding: 16,
        height: 'auto',
      }}
      onPress={onPress}
    >
      <View style={{ alignItems: 'flex-start', flex: 1, marginHorizontal: 8 }}>
        <View style={{ marginBottom: 10 }}>{icon}</View>
        <FontText
          h3
          style={{
            color: isActive ? theme.colors.white : theme.colors.black,
          }}
        >
          {title}
        </FontText>
        <FontText
          h4
          style={{
            color: isActive ? theme.colors.grey5 : theme.colors.grey3,
            marginTop: 5,
          }}
        >
          {subtitle}
        </FontText>
      </View>
    </PrimaryButton>
  );
};
