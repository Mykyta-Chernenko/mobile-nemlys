import React, { useCallback, useContext, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@rneui/themed';
import { FontText } from '@app/components/utils/FontText';
import BuddiesCorner from '@app/icons/buddies_corner';
import { i18n } from '@app/localization/i18n';
import { supabase } from '@app/api/initSupabase';
import { AuthContext } from '@app/provider/AuthProvider';
import { logSupaErrors } from '@app/utils/errors';
import { useFocusEffect } from '@react-navigation/native';

const HomeHeader: React.FC = () => {
  const { theme } = useTheme();
  const padding = 20;
  const authContext = useContext(AuthContext);

  const [firstName, setFirstName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [dateCount, setDateCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const fetchHeaderData = async () => {
    // Fetch user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('user_profile')
      .select('first_name, partner_first_name')
      .eq('user_id', authContext.userId!)
      .single();

    if (profileError) {
      logSupaErrors(profileError);
      return;
    }

    setFirstName(profileData.first_name || '');
    setPartnerName(profileData.partner_first_name || '');

    // Fetch date count
    const { count, error: dateError } = await supabase
      .from('date')
      .select('*', { count: 'exact' })
      .eq('active', false)
      .eq('created_by', authContext.userId!);

    if (dateError) {
      logSupaErrors(dateError);
      return;
    }

    setDateCount(count || 0);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void fetchHeaderData().then(() => {
        setLoading(false);
      });
    }, []),
  );

  if (loading)
    return (
      <ActivityIndicator size="large" style={{ alignSelf: 'center' }} color={theme.colors.black} />
    );
  return (
    <View
      style={{
        backgroundColor: theme.colors.grey1,
        marginHorizontal: -padding,
        height: '10%',
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.white,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          flexDirection: 'row',
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <View
            style={{
              flexDirection: 'column',
              paddingHorizontal: padding,
              paddingBottom: '3%',
            }}
          >
            <FontText h3>
              {firstName || i18n.t('home_you')}
              {' & '}
              {partnerName || i18n.t('home_partner')}
            </FontText>
            <FontText style={{ color: theme.colors.grey3, marginTop: '2%' }}>
              {dateCount} {i18n.t('discussed_questions')}
            </FontText>
          </View>
          <View
            style={{
              justifyContent: 'flex-end',
            }}
          >
            <BuddiesCorner />
          </View>
        </View>
      </View>
    </View>
  );
};

export default HomeHeader;
