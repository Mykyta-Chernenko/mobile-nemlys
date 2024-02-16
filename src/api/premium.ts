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
  dailyDatesLimit: number;
  introductionDatesLimit: number;
  trialDaysLeft?: number;
  totalDateCount: number;
  todayDateCount: number;
  freeRecordingMinutes: number;
  premiumRecordingMinutes: number;
};
export type PremiumDetailsWithRecording = PremiumDetails & {
  // amount of recording second left for a date
  recordingSecondsLeft: number;
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
    // revert to state 'new' for having first 5 intro sets  without limit
    premiumState = 'free';
  } else {
    premiumState = 'free';
  }
  const dailyDatesLimit = premiumDetails.daily_sets_count;
  // revert for having first 5 intro sets without limit
  // const introductionDatesLimit = premiumDetails.introduction_sets_count;
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
  const todayDateCount = dateData
    // revert for having first 5 intro sets without limit
    // .slice(premiumDetails.introduction_sets_count - 1)
    .filter((x) => getDateFromString(x.created_at).isSame(getNow(), 'day')).length;
  const freeRecordingMinutes = premiumDetails.free_recording_minutes;
  const premiumRecordingMinutes = premiumDetails.premium_recording_minutes;
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
    freeRecordingMinutes,
    premiumRecordingMinutes,
  };
}

export async function getPremiumDetailsWithRecording(
  userId: string,
): Promise<PremiumDetailsWithRecording> {
  const details = await getPremiumDetails(userId);
  const isPremium = details.premiumState === 'premium' || details.premiumState === 'trial';
  let recordingSecondsLeft = isPremium
    ? details.premiumRecordingMinutes * 60
    : details.freeRecordingMinutes * 60;
  // if not premium, we deduct the amount of seconds spent today
  if (!isPremium) {
    const todayStart = getNow().startOf('day');
    const now = getNow();

    const { data, error } = await supabase
      .from('discussion_summary')
      .select('seconds_spent')
      .gte('created_at', todayStart.toISOString())
      .lte('created_at', now.toISOString());
    if (error) {
      throw error;
    }

    const totalSecondsSpent = data
      .map((x) => x.seconds_spent)
      .reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      }, 0);
    recordingSecondsLeft -= totalSecondsSpent;
    if (recordingSecondsLeft < 10) {
      recordingSecondsLeft = 0;
    }
  }

  return {
    ...details,
    recordingSecondsLeft,
  };
}
