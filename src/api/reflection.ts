import { SupabaseAnswer } from '@app/types/api';
import { supabase } from './initSupabase';
import moment from 'moment';
import { logErrors } from '@app/utils/errors';

export const getIsLowPersonalization = async () => {
  const lastDate: SupabaseAnswer<{ created_at: string } | null> = await supabase
    .from('date')
    .select('created_at')
    .eq('with_partner', true)
    .limit(1)
    .order('created_at', { ascending: false })
    .maybeSingle();
  if (lastDate.error) {
    logErrors(lastDate.error);
    return false;
  }
  const lastReflection: SupabaseAnswer<{ created_at: string } | null> = await supabase
    .from('reflection_question_answer')
    .select('created_at')
    .limit(1)
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (lastReflection.error) {
    logErrors(lastReflection.error);
    return false;
  }
  if (
    lastDate.data &&
    lastReflection.data &&
    moment(lastDate.data.created_at).isAfter(moment(lastReflection.data.created_at))
  ) {
    return true;
  }
  return false;
};
