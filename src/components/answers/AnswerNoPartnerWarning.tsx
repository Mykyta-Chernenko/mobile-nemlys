import React, { useContext } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from '@rneui/themed';
import { localAnalytics } from '@app/utils/analytics';
import BuddyWarning from '@app/icons/buddy_warning';
import { AuthContext } from '@app/provider/AuthProvider';
import { FontText } from '../utils/FontText';
import { i18n } from '@app/localization/i18n';
import { MainNavigationProp } from '@app/types/navigation';
import { useNavigation } from '@react-navigation/native';

const AnswerNoPartnerWarning = ({ prefix, partnerName }) => {
  const navigation = useNavigation<MainNavigationProp>();

  const authContext = useContext(AuthContext);
  const userId = authContext.userId;
  const { theme } = useTheme();
  const { colors } = theme;

  const handleInvite = () => {
    void localAnalytics().logEvent(`${prefix as string}PartnerInviteClicked`, {
      screen: prefix,
      userId,
    });
    navigation.navigate('OnboardingInviteCode', { fromSettings: true });
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        padding: 20,
        borderRadius: 16,
        marginBottom: 10,
        width: '100%',
      }}
    >
      <BuddyWarning height={32} width={32} />
      <View style={{ flex: 1, marginHorizontal: 5 }}>
        <FontText>{i18n.t('question_answer_no_partner', { partnerName })}</FontText>
      </View>
      <View style={{ borderRadius: 40, backgroundColor: colors.black }}>
        <TouchableOpacity style={{ padding: 10 }} onPress={() => void handleInvite()}>
          <FontText style={{ color: colors.white }}>{i18n.t('question_answer_invite')}</FontText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AnswerNoPartnerWarning;
