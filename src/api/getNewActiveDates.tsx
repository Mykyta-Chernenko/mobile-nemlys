import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@app/api/initSupabase';
import { logErrorsWithMessage } from '@app/utils/errors';
import { getNow } from '@app/utils/date';
import { localAnalytics } from '@app/utils/analytics'; // Assuming you're using Expo for getting device info

export const useDatePolling = (
  hasPartner: boolean,
  currentDateId: number | undefined,
  navigation: { navigate: (screen: string, params: any) => void },
  authUserId: string,
  coupleId: number,
  isActive: boolean,
  greaterThanPreviousDateDate?: string,
) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && hasPartner && isActive) {
        startPolling();
      } else {
        stopPolling();
      }
    };

    const startPolling = () => {
      if (intervalRef.current) {
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      intervalRef.current = setInterval(async () => {
        try {
          const oneHourAgo = getNow().subtract(1, 'hour');

          const newDateRes = await supabase
            .from('date')
            .select('id, created_at, generated_question(id)')
            .eq('active', true)
            .eq('couple_id', coupleId)
            .neq('created_by', authUserId)
            .eq('with_partner', true)
            .gt('created_at', greaterThanPreviousDateDate ?? oneHourAgo.toISOString())
            .order('created_at', { ascending: false })
            .limit(1);
          if (newDateRes.error) {
            return;
          }

          if (
            newDateRes.data &&
            newDateRes.data.length > 0 &&
            newDateRes.data[0].generated_question.length > 0 &&
            newDateRes.data[0].id != currentDateId
          ) {
            if (currentDateId) {
              const deactivateRes = await supabase
                .from('date')
                .update({ active: false, updated_at: getNow().toISOString() })
                .eq('id', currentDateId);

              if (deactivateRes.error) {
                return;
              }
            }

            void localAnalytics().logEvent('SyncPollingGoToDate', {
              screen: 'SyncPolling',
              action: 'GoToDate',
              userId: authUserId,
              dateId: newDateRes.data[0].id,
              questions: newDateRes.data[0].generated_question,
            });
            navigation.navigate('OnDate', {
              id: newDateRes.data[0].id,
              refreshTimeStamp: new Date().toISOString(),
            });

            stopPolling();
            subscription.remove();
          }
        } catch (e) {
          logErrorsWithMessage(e, (e?.message as string) || '');
        }
      }, 5000);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    if (AppState.currentState === 'active' && hasPartner) {
      startPolling();
    }

    return () => {
      stopPolling();
      subscription.remove();
    };
  }, [hasPartner, currentDateId, navigation, authUserId, isActive]);
};
