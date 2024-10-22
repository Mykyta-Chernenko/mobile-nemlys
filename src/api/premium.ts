import { supabase } from './initSupabase';
import { getDateFromString, getNow } from '@app/utils/date';
import moment from 'moment';

export type PremiumState = 'free' | 'trial' | 'new' | 'premium';
export type PremiumDetails = {
  premiumState: PremiumState;
  forcePremium: boolean;
  trialExpired: boolean;
  trialStart?: moment.Moment;
  trialFinish?: moment.Moment;
  afterTrialPremiumOffered: boolean;
  premiumStart?: moment.Moment;
  dailyDatesLimit: number;
  introductionDatesLimit: number;
  trialDaysLeft?: number;
  totalDateCount: number;
  todayDateCount: number;
};

export async function getPremiumDetails(userId: string): Promise<PremiumDetails> {
  const [dateResponse, premiumResponse, profileResponse, technicalResponse] = await Promise.all([
    supabase
      .from('date')
      .select('id, created_at')
      .eq('active', false)
      .eq('created_by', userId)
      .order('created_at', { ascending: true }),
    supabase.from('user_premium').select('*').eq('user_id', userId).single(),
    supabase.from('user_profile').select('couple!inner(created_at)').eq('user_id', userId).single(),
    supabase
      .from('user_technical_details')
      .select('after_trial_premium_offered')
      .eq('user_id', userId)
      .single(),
  ]);

  if (dateResponse.error) throw dateResponse.error;
  if (premiumResponse.error) throw premiumResponse.error;
  if (profileResponse.error) throw profileResponse.error;
  if (technicalResponse.error) throw technicalResponse.error;

  const dateData = dateResponse.data;
  const premiumDetails = premiumResponse.data;
  const profileDetails = profileResponse.data;
  const techDetails = technicalResponse.data;

  const dateCount = dateData.length;

  let premiumState: PremiumState = 'free';
  if (
    premiumDetails.is_premium &&
    premiumDetails.premium_finish &&
    getDateFromString(premiumDetails.premium_finish).isAfter(getNow())
  ) {
    premiumState = 'premium';
  } else if (
    premiumDetails.is_trial &&
    premiumDetails.trial_finish &&
    getDateFromString(premiumDetails.trial_finish).isAfter(getNow())
  ) {
    premiumState = 'trial';
  } else if (dateCount < premiumDetails.introduction_sets_count) {
    premiumState = 'free';
  }

  const dailyDatesLimit = premiumDetails.daily_sets_count;
  const introductionDatesLimit = 0;
  const trialStart = premiumDetails.trial_start
    ? getDateFromString(premiumDetails.trial_start)
    : undefined;
  const trialFinish = premiumDetails.trial_finish
    ? getDateFromString(premiumDetails.trial_finish)
    : undefined;
  const trialDaysLeft = trialFinish ? trialFinish.diff(getNow(), 'days') + 1 : undefined;
  const trialExpired = premiumDetails.is_trial && !!trialFinish && trialFinish.isBefore(getNow());
  const afterTrialPremiumOffered = techDetails.after_trial_premium_offered;

  const premiumStart = premiumDetails.premium_start
    ? getDateFromString(premiumDetails.premium_start)
    : undefined;

  const totalDateCount = dateCount;

  const todayDateCount = dateData.filter((x) =>
    getDateFromString(x.created_at).isSame(getNow(), 'day'),
  ).length;

  const forcePremium =
    !(premiumState === 'premium' || premiumState === 'trial') &&
    getDateFromString(profileDetails.couple!.created_at).isAfter(
      getDateFromString('2024-10-20T08:00:00Z'),
    );

  return {
    premiumState,
    trialStart,
    trialFinish,
    trialExpired,
    afterTrialPremiumOffered,
    dailyDatesLimit,
    introductionDatesLimit,
    premiumStart,
    trialDaysLeft,
    totalDateCount,
    todayDateCount,
    forcePremium,
  };
}
