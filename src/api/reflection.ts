import { SupabaseAnswer } from '@app/types/api';
import { supabase } from './initSupabase';
import { logSupaErrors } from '@app/utils/errors';

export const getCanPersonalTopics = async () => {
  const lastReflection: SupabaseAnswer<{ created_at: string } | null> = await supabase
    .from('reflection_question_answer')
    .select('created_at')
    .limit(1)
    .maybeSingle();

  if (lastReflection.error) {
    logSupaErrors(lastReflection.error);
    return false;
  }
  return true;
};
