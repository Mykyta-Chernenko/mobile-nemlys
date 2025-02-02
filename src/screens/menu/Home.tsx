import React, { useContext, useEffect, useRef } from 'react';
import { MainStackParamList } from '@app/types/navigation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '@app/api/initSupabase';
import { Loading } from '@app/components/utils/Loading';
import { logSupaErrors } from '@app/utils/errors';
import { AuthContext } from '@app/provider/AuthProvider';
import DateIssues from '@app/icons/date_issues';
import DateSex from '@app/icons/date_sex';
import DateKnow from '@app/icons/date_know';
import DateHard from '@app/icons/date_hard';
import DateMeaningful from '@app/icons/date_meaningful';
import DateFun from '@app/icons/date_fun';
import { i18n } from '@app/localization/i18n';
import { JobSlug } from '@app/types/domain';
import { logout } from '@app/utils/auth';
import { localAnalytics } from '@app/utils/analytics';

export function getJobs(): { slug: JobSlug; title: string; icon: (props: any) => JSX.Element }[] {
  return [
    { slug: 'issues', title: i18n.t('jobs_issues'), icon: DateIssues },
    { slug: 'sex', title: i18n.t('jobs_sex'), icon: DateSex },
    { slug: 'know', title: i18n.t('jobs_know'), icon: DateKnow },
    { slug: 'hard', title: i18n.t('jobs_hard'), icon: DateHard },
    { slug: 'meaningful', title: i18n.t('jobs_meaningful'), icon: DateMeaningful },
    { slug: 'fun', title: i18n.t('jobs_fun'), icon: DateFun },
  ];
}

export default function ({
  route,
  navigation,
}: NativeStackScreenProps<MainStackParamList, 'Home'>) {
  const authContext = useContext(AuthContext);

  async function getVersionRedirect() {
    const userId = authContext.userId!;
    const profileResponse = await supabase
      .from('user_profile')
      .select('id, couple(switched_to_v3, v2_user)')
      .eq('user_id', authContext.userId!)
      .single();

    if (profileResponse.error) {
      logSupaErrors(profileResponse.error);
      void logout();
      return;
    }

    const switchedToV3 = profileResponse.data?.couple?.switched_to_v3;
    const v2User = profileResponse.data?.couple?.v2_user;
    void localAnalytics().logEvent('HomeLoaded', {
      screen: 'Home',
      action: 'Loaded',
      userId,
      switchedToV3,
      v2User,
    });
    if (switchedToV3) {
      navigation.navigate('V3Home', { refreshTimeStamp: new Date().toISOString() });
    } else {
      navigation.navigate('V2Home', { refreshTimeStamp: new Date().toISOString() });
    }
  }

  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!isFirstMount.current && route?.params?.refreshTimeStamp) {
      void getVersionRedirect();
    }
  }, [route?.params?.refreshTimeStamp]);
  useEffect(() => {
    void getVersionRedirect();
    isFirstMount.current = false;
  }, []);

  return <Loading />;
}
