import { APIUserPremium, SupabaseAnswer } from '@app/types/api';
import { supabase } from './initSupabase';
import { getDateFromString, getNow } from '@app/utils/date';
import moment from 'moment';

export type PremiumState = 'free' | 'trial' | 'new' | 'premium';
export type PremiumDetails = {
  premiumState: PremiumState;
  trialExpired: boolean;
  trialStart?: moment.Moment;
  trialFinish?: moment.Moment;
  afterTrialPremiumOffered: boolean;
  premiumStart?: moment.Moment;
  dailySetCounts: number;
  introductionSetCounts: number;
  trialDaysLeft?: number;
  totalDateCount: number;
  todayDateCount: number;
};
export async function getPremiumDetails(userId: string): Promise<PremiumDetails> {
  const [dateResponse, premiumDetailsResponse] = await Promise.all([
    supabase.from('date').select('id, created_at').order('id').eq('active', false),
    supabase.from('user_premium').select('*').eq('user_id', userId).single(),
  ]);

  const { data: dateData, error: dateError } = dateResponse as SupabaseAnswer<
    { id: string; created_at: string }[]
  >;
  if (dateError) {
    throw dateError;
  }
  const dateCount = dateData.length;

  const { data: premiumDetails, error: premiumDetailsError } =
    premiumDetailsResponse as SupabaseAnswer<APIUserPremium>;
  if (premiumDetailsError) {
    throw premiumDetailsError;
  }
  const {
    data: techDetails,
    error: techDetailsError,
  }: SupabaseAnswer<{ after_trial_premium_offered: boolean }> = await supabase
    .from('user_technical_details')
    .select('after_trial_premium_offered')
    .eq('user_id', userId)
    .single();
  if (techDetailsError) {
    throw techDetailsError;
  }
  let premiumState: PremiumState = 'free';
  if (premiumDetails.is_premium) {
    premiumState = 'premium';
  } else if (
    premiumDetails.is_trial &&
    premiumDetails.trial_finish &&
    getDateFromString(premiumDetails.trial_finish).isAfter(getNow())
  ) {
    premiumState = 'trial';
  } else if (dateCount < premiumDetails.introduction_sets_count) {
    premiumState = 'new';
  } else {
    premiumState = 'free';
  }
  const dailySetCounts = premiumDetails.daily_sets_count;
  const introductionSetCounts = premiumDetails.introduction_sets_count;
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
  const todayDateCount = dateData
    .slice(premiumDetails.introduction_sets_count - 1)
    .filter((x) => getDateFromString(x.created_at).isSame(getNow(), 'day')).length;

  return {
    premiumState,
    trialStart,
    trialFinish,
    trialExpired,
    afterTrialPremiumOffered,
    dailySetCounts,
    introductionSetCounts,
    premiumStart,
    trialDaysLeft,
    totalDateCount,
    todayDateCount,
  };
}
