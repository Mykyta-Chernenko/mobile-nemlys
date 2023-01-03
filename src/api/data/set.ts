import { APIAction, APIQuestion, SupabaseAnswer } from '@app/types/api';
import { Action, Question } from '@app/types/domain';
import { logErrors } from '@app/utils/errors';
import { supabase } from '../initSupabase';

export async function getQuestionsAndActionsForSet(
  setId: number,
): Promise<{ questions: Question[]; actions: Action[] } | undefined> {
  const [{ data: questionIds }, { data: actionsIds }] = await Promise.all([
    supabase.from('set_question').select('question_id').eq('set_id', setId),
    supabase.from('set_action').select('action_id').eq('set_id', setId),
  ]);
  const [{ data: questions, error: questionError }, { data: actions, error: actionError }]: [
    SupabaseAnswer<APIQuestion[] | null>,
    SupabaseAnswer<APIAction[] | null>,
  ] = await Promise.all([
    supabase
      .from('question')
      .select(
        'id, slug, title, image, details, tips, importance, created_at, updated_at, question_tag:question_question_tag (question_question_tag:tag_id(slug, title))',
      )
      .in(
        'id',
        (questionIds ?? []).map((x) => x.question_id),
      ),
    supabase
      .from('action')
      .select('id, slug, title, image, details, importance, instruction, created_at, updated_at')
      .in(
        'id',
        (actionsIds ?? []).map((x) => x.action_id),
      ),
  ]);
  if (questionError || actionError) {
    logErrors(questionError || actionError);
    return;
  }
  return {
    questions: (questions ?? []).map((q) => {
      const tags: string[] = [];
      const firstLevelTags = Array.isArray(q.question_tag) ? q.question_tag : [q.question_tag];
      firstLevelTags.map((tt) => {
        if (tt) {
          if (Array.isArray(tt.question_question_tag)) {
            tt.question_question_tag.map((ttt) => tags.push(ttt.title));
          } else if (tt.question_question_tag) {
            tags.push(tt.question_question_tag.title);
          }
        }
      });
      return {
        ...q,
        tags,
      };
    }),
    actions: actions ?? [],
  };
}
