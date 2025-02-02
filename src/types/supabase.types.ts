import { ContentType, JobSlug, LoveNoteAction } from './domain';

export type Json =
  | string
  | number
  | boolean
  | null
  | {
      [key: string]: Json | undefined;
    }
  | Json[];

export type Database = {
  public: {
    Tables: {
      action: {
        Row: {
          ai_generated: boolean | null;
          created_at: string;
          details: string;
          id: number;
          image: string | null;
          importance: string;
          instruction: string;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          ai_generated?: boolean | null;
          created_at?: string;
          details: string;
          id?: number;
          image?: string | null;
          importance: string;
          instruction: string;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          ai_generated?: boolean | null;
          created_at?: string;
          details?: string;
          id?: number;
          image?: string | null;
          importance?: string;
          instruction?: string;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      app_settings: {
        Row: {
          created_at: string;
          id: number;
          interview_link: string | null;
          updated_at: string;
          version: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
          interview_link?: string | null;
          updated_at?: string;
          version: number;
        };
        Update: {
          created_at?: string;
          id?: number;
          interview_link?: string | null;
          updated_at?: string;
          version?: number;
        };
        Relationships: [];
      };
      beta_users: {
        Row: {
          created_at: string;
          id: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'beta_users_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      conversation: {
        Row: {
          ai: string;
          created_at: string;
          id: number;
          text: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai: string;
          created_at?: string;
          id?: number;
          text: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai?: string;
          created_at?: string;
          id?: number;
          text?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'conversation_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      couple: {
        Row: {
          created_at: string;
          id: number;
          invite_code: string;
          updated_at: string;
          language: string;
          timezone?: string;
          v2_user: boolean;
          switched_to_v3: boolean;
        };
        Insert: {
          created_at?: string;
          id?: number;
          invite_code: string;
          updated_at?: string;
          language: string;
          timezone?: string;
          v2_user?: boolean;
          switched_to_v3?: boolean;
        };
        Update: {
          created_at?: string;
          id?: number;
          invite_code?: string;
          updated_at?: string;
          language?: string;
          timezone?: string;
          v2_user?: boolean;
          switched_to_v3?: boolean;
        };
        Relationships: [];
      };
      couple_set: {
        Row: {
          completed: boolean;
          couple_id: number;
          created_at: string;
          id: number;
          meeting: string | null;
          order: number;
          schedule_reminder: string | null;
          set_id: number;
          updated_at: string;
        };
        Insert: {
          completed?: boolean;
          couple_id: number;
          created_at?: string;
          id?: number;
          meeting?: string | null;
          order: number;
          schedule_reminder?: string | null;
          set_id: number;
          updated_at?: string;
        };
        Update: {
          completed?: boolean;
          couple_id?: number;
          created_at?: string;
          id?: number;
          meeting?: string | null;
          order?: number;
          schedule_reminder?: string | null;
          set_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'couple_set_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'couple_set_set_id_fkey';
            columns: ['set_id'];
            isOneToOne: false;
            referencedRelation: 'set';
            referencedColumns: ['id'];
          },
        ];
      };
      couple_set_action: {
        Row: {
          couple_set_id: number;
          created_at: string;
          id: number;
          set_action_id: number;
          updated_at: string;
        };
        Insert: {
          couple_set_id: number;
          created_at?: string;
          id?: number;
          set_action_id: number;
          updated_at?: string;
        };
        Update: {
          couple_set_id?: number;
          created_at?: string;
          id?: number;
          set_action_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'couple_set_action_couple_set_id_fkey';
            columns: ['couple_set_id'];
            isOneToOne: false;
            referencedRelation: 'couple_set';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'couple_set_action_set_action_id_fkey';
            columns: ['set_action_id'];
            isOneToOne: false;
            referencedRelation: 'set_action';
            referencedColumns: ['id'];
          },
        ];
      };
      couple_set_feedback: {
        Row: {
          couple_set_id: number;
          created_at: string;
          id: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          couple_set_id: number;
          created_at?: string;
          id?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          couple_set_id?: number;
          created_at?: string;
          id?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'couple_set_feedback_couple_set_id_fkey';
            columns: ['couple_set_id'];
            isOneToOne: false;
            referencedRelation: 'couple_set';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'couple_set_feedback_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      couple_set_feedback_answer: {
        Row: {
          bool_answer: boolean | null;
          couple_set_feedback_id: number;
          created_at: string;
          feedback_choice_id: number | null;
          feedback_question_id: number;
          id: number;
          text_answer: string | null;
          type: string;
          updated_at: string;
        };
        Insert: {
          bool_answer?: boolean | null;
          couple_set_feedback_id: number;
          created_at?: string;
          feedback_choice_id?: number | null;
          feedback_question_id: number;
          id?: number;
          text_answer?: string | null;
          type: string;
          updated_at?: string;
        };
        Update: {
          bool_answer?: boolean | null;
          couple_set_feedback_id?: number;
          created_at?: string;
          feedback_choice_id?: number | null;
          feedback_question_id?: number;
          id?: number;
          text_answer?: string | null;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'couple_set_feedback_answer_couple_set_feedback_id_fkey';
            columns: ['couple_set_feedback_id'];
            isOneToOne: false;
            referencedRelation: 'couple_set_feedback';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'couple_set_feedback_answer_feedback_choice_id_fkey';
            columns: ['feedback_choice_id'];
            isOneToOne: false;
            referencedRelation: 'feedback_choice';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'couple_set_feedback_answer_feedback_question_id_fkey';
            columns: ['feedback_question_id'];
            isOneToOne: false;
            referencedRelation: 'feedback_question';
            referencedColumns: ['id'];
          },
        ];
      };
      couple_set_question: {
        Row: {
          couple_set_id: number;
          created_at: string;
          id: number;
          set_question_id: number;
          updated_at: string;
        };
        Insert: {
          couple_set_id: number;
          created_at?: string;
          id?: number;
          set_question_id: number;
          updated_at?: string;
        };
        Update: {
          couple_set_id?: number;
          created_at?: string;
          id?: number;
          set_question_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'couple_set_question_couple_set_id_fkey';
            columns: ['couple_set_id'];
            isOneToOne: false;
            referencedRelation: 'couple_set';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'couple_set_question_set_question_id_fkey';
            columns: ['set_question_id'];
            isOneToOne: false;
            referencedRelation: 'set_question';
            referencedColumns: ['id'];
          },
        ];
      };
      date: {
        Row: {
          active: boolean;
          couple_id: number;
          created_by: string;
          created_at: string;
          id: number;
          job: JobSlug;
          level: number;
          issue: string | null;
          stopped: boolean;
          topic: string;
          updated_at: string;
          with_partner: boolean | null;
        };
        Insert: {
          active: boolean;
          couple_id: number;
          created_at?: string;
          id?: number;
          job?: JobSlug;
          level: number;
          issue?: string | null;
          stopped?: boolean;
          topic: string;
          updated_at?: string;
          with_partner?: boolean | null;
        };
        Update: {
          active?: boolean;
          couple_id?: number;
          created_at?: string;
          id?: number;
          job?: JobSlug;
          level?: number;
          issue?: string | null;
          stopped?: boolean;
          topic?: string;
          updated_at?: string;
          with_partner?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'date_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
        ];
      };
      diary: {
        Row: {
          ai_summary: string | null;
          created_at: string;
          date: string;
          id: number;
          text: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          ai_summary?: string | null;
          created_at?: string;
          date: string;
          id?: number;
          text: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          ai_summary?: string | null;
          created_at?: string;
          date?: string;
          id?: number;
          text?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'diary_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'diary_user_id_fkey1';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      discussion_summary: {
        Row: {
          couple_id: number;
          created_at: string;
          date_id: number;
          id: number;
          seconds_spent: number;
          summary: string;
          transcribe: string;
          updated_at: string;
        };
        Insert: {
          couple_id: number;
          created_at?: string;
          date_id: number;
          id?: number;
          seconds_spent: number;
          summary: string;
          transcribe?: string;
          updated_at?: string;
        };
        Update: {
          couple_id?: number;
          created_at?: string;
          date_id?: number;
          id?: number;
          seconds_spent?: number;
          summary?: string;
          transcribe?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'discussion_summary_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'discussion_summary_date_id_fkey';
            columns: ['date_id'];
            isOneToOne: true;
            referencedRelation: 'date';
            referencedColumns: ['id'];
          },
        ];
      };
      email_tracking: {
        Row: {
          created_at: string;
          id: number;
          opened: boolean;
          type: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          opened?: boolean;
          type: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          opened?: boolean;
          type?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          created_at: string;
          id: number;
          text: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          text: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          text?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      feedback_choice: {
        Row: {
          created_at: string;
          feedback_question_id: number;
          id: number;
          order: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          feedback_question_id: number;
          id?: number;
          order: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          feedback_question_id?: number;
          id?: number;
          order?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'feedback_choice_feedback_question_id_fkey';
            columns: ['feedback_question_id'];
            isOneToOne: false;
            referencedRelation: 'feedback_question';
            referencedColumns: ['id'];
          },
        ];
      };
      feedback_question: {
        Row: {
          created_at: string;
          id: number;
          order: number;
          slug: string;
          title: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          order: number;
          slug: string;
          title: string;
          type: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          order?: number;
          slug?: string;
          title?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      generated_question: {
        Row: {
          created_at: string;
          date_id: number;
          feedback_score: number | null;
          finished: boolean | null;
          id: number;
          manual_question_id: number | null;
          question: string;
          seconds_spent: number | null;
          skipped: boolean | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          date_id: number;
          feedback_score?: number | null;
          finished?: boolean | null;
          id?: number;
          manual_question_id?: number | null;
          question: string;
          seconds_spent?: number | null;
          skipped?: boolean | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          date_id?: number;
          feedback_score?: number | null;
          finished?: boolean | null;
          id?: number;
          manual_question_id?: number | null;
          question?: string;
          seconds_spent?: number | null;
          skipped?: boolean | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'generated_question_date_id_fkey';
            columns: ['date_id'];
            isOneToOne: false;
            referencedRelation: 'date';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'generated_question_manual_question_id_fkey';
            columns: ['manual_question_id'];
            isOneToOne: false;
            referencedRelation: 'manual_question';
            referencedColumns: ['id'];
          },
        ];
      };
      job_topics: {
        Row: {
          active: boolean | null;
          created_at: string;
          id: number;
          job_slug: string;
          topic: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string;
          id?: number;
          job_slug: string;
          topic: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean | null;
          created_at?: string;
          id?: number;
          job_slug?: string;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      manual_question: {
        Row: {
          created_at: string;
          id: number;
          job: JobSlug;
          level: number;
          question: string;
          topic: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          job: JobSlug;
          level: number;
          question: string;
          topic: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          job?: JobSlug;
          level?: number;
          question?: string;
          topic?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      notification: {
        Row: {
          band?: string;
          created_at: string;
          expo_notification_id: string;
          id: number;
          identifier: string;
          subtype?: string;
          type?: string;
          updated_at: string;
          user_id?: string;
        };
        Insert: {
          band?: string;
          created_at?: string;
          expo_notification_id: string;
          id?: number;
          identifier: string;
          subtype?: string;
          updated_at?: string;
          type: string;
          user_id: string;
        };
        Update: {
          band?: string;
          created_at?: string;
          expo_notification_id?: string;
          id?: number;
          identifier?: string;
          subtype?: string;
          updated_at?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      onboarding_answer: {
        Row: {
          content: string;
          created_at: string;
          id: number;
          onboarding_question_id: number;
          order: number;
          slug: string;
          text_answer: string | null;
          type: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: number;
          onboarding_question_id: number;
          order: number;
          slug: string;
          text_answer?: string | null;
          type?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: number;
          onboarding_question_id?: number;
          order?: number;
          slug?: string;
          text_answer?: string | null;
          type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'onboarding_answer_onboarding_question_id_fkey';
            columns: ['onboarding_question_id'];
            isOneToOne: false;
            referencedRelation: 'onboarding_question';
            referencedColumns: ['id'];
          },
        ];
      };
      onboarding_poll: {
        Row: {
          answer_slug: string;
          created_at: string;
          id: number;
          question_slug: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          answer_slug: string;
          created_at?: string;
          id?: number;
          question_slug: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          answer_slug?: string;
          created_at?: string;
          id?: number;
          question_slug?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'onboarding_poll_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      onboarding_question: {
        Row: {
          content: string;
          created_at: string;
          id: number;
          order: number;
          slug: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          id?: number;
          order: number;
          slug: string;
          type?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          id?: number;
          order?: number;
          slug?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      onboarding_relationship_state: {
        Row: {
          answer: string;
          created_at: string;
          id: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          answer: string;
          created_at?: string;
          id?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          answer?: string;
          created_at?: string;
          id?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      question: {
        Row: {
          ai_generated: boolean | null;
          created_at: string;
          details: string;
          id: number;
          image: string | null;
          importance: string;
          slug: string;
          tips: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          ai_generated?: boolean | null;
          created_at?: string;
          details: string;
          id?: number;
          image?: string | null;
          importance: string;
          slug: string;
          tips: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          ai_generated?: boolean | null;
          created_at?: string;
          details?: string;
          id?: number;
          image?: string | null;
          importance?: string;
          slug?: string;
          tips?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      question_question_tag: {
        Row: {
          created_at: string;
          id: number;
          question_id: number;
          tag_id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          question_id: number;
          tag_id: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          question_id?: number;
          tag_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_question_tag_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'question';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_question_tag_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'question_tag';
            referencedColumns: ['id'];
          },
        ];
      };
      question_tag: {
        Row: {
          created_at: string;
          id: number;
          slug: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          slug: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          slug?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reflection: {
        Row: {
          ai_generated: boolean | null;
          created_at: string;
          details: string;
          id: number;
          image: string | null;
          importance: string;
          slug: string;
          tips: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          ai_generated?: boolean | null;
          created_at?: string;
          details: string;
          id?: number;
          image?: string | null;
          importance: string;
          slug: string;
          tips: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          ai_generated?: boolean | null;
          created_at?: string;
          details?: string;
          id?: number;
          image?: string | null;
          importance?: string;
          slug?: string;
          tips?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reflection_notification: {
        Row: {
          id: number;
          level: number;
          user_id: string;
        };
        Insert: {
          id?: number;
          level: number;
          user_id: string;
        };
        Update: {
          id?: number;
          level?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reflection_notification_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      reflection_question: {
        Row: {
          active: boolean | null;
          created_at: string;
          id: number;
          level: number;
          reflection: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean | null;
          created_at?: string;
          id?: number;
          level: number;
          reflection: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean | null;
          created_at?: string;
          id?: number;
          level?: number;
          reflection?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reflection_question_answer: {
        Row: {
          answer: string;
          created_at: string;
          id: number;
          reflection_id: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          answer: string;
          created_at?: string;
          id?: number;
          reflection_id: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          answer?: string;
          created_at?: string;
          id?: number;
          reflection_id?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reflection_question_answer_reflection_id_fkey';
            columns: ['reflection_id'];
            isOneToOne: false;
            referencedRelation: 'reflection_question';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reflection_question_answer_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      set: {
        Row: {
          ai_for_couple_id: number | null;
          ai_generated: boolean | null;
          created_at: string;
          id: number;
          level: number;
          updated_at: string;
        };
        Insert: {
          ai_for_couple_id?: number | null;
          ai_generated?: boolean | null;
          created_at?: string;
          id?: number;
          level: number;
          updated_at?: string;
        };
        Update: {
          ai_for_couple_id?: number | null;
          ai_generated?: boolean | null;
          created_at?: string;
          id?: number;
          level?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'set_ai_for_couple_id_fkey';
            columns: ['ai_for_couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
        ];
      };
      set_action: {
        Row: {
          action_id: number;
          created_at: string;
          id: number;
          order: number;
          set_id: number;
          updated_at: string;
        };
        Insert: {
          action_id: number;
          created_at?: string;
          id?: number;
          order: number;
          set_id: number;
          updated_at?: string;
        };
        Update: {
          action_id?: number;
          created_at?: string;
          id?: number;
          order?: number;
          set_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'set_action_action_id_fkey';
            columns: ['action_id'];
            isOneToOne: false;
            referencedRelation: 'action';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'set_action_set_id_fkey';
            columns: ['set_id'];
            isOneToOne: false;
            referencedRelation: 'set';
            referencedColumns: ['id'];
          },
        ];
      };
      set_question: {
        Row: {
          created_at: string;
          id: number;
          order: number;
          question_id: number;
          set_id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          order: number;
          question_id: number;
          set_id: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          order?: number;
          question_id?: number;
          set_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'set_question_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'question';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'set_question_set_id_fkey';
            columns: ['set_id'];
            isOneToOne: false;
            referencedRelation: 'set';
            referencedColumns: ['id'];
          },
        ];
      };
      set_reflection: {
        Row: {
          created_at: string;
          id: number;
          order: number;
          reflection_id: number;
          set_id: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          order: number;
          reflection_id: number;
          set_id: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          order?: number;
          reflection_id?: number;
          set_id?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'set_reflection_reflection_id_fkey';
            columns: ['reflection_id'];
            isOneToOne: false;
            referencedRelation: 'reflection';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'set_reflection_set_id_fkey';
            columns: ['set_id'];
            isOneToOne: false;
            referencedRelation: 'set';
            referencedColumns: ['id'];
          },
        ];
      };
      user_onboarding_answer: {
        Row: {
          created_at: string;
          id: number;
          onboarding_answer_id: number;
          onboarding_question_id: number;
          text_answer: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          onboarding_answer_id: number;
          onboarding_question_id: number;
          text_answer?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          onboarding_answer_id?: number;
          onboarding_question_id?: number;
          text_answer?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_onboarding_answer_onboarding_answer_id_fkey';
            columns: ['onboarding_answer_id'];
            isOneToOne: false;
            referencedRelation: 'onboarding_answer';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_onboarding_answer_onboarding_question_id_fkey';
            columns: ['onboarding_question_id'];
            isOneToOne: false;
            referencedRelation: 'onboarding_question';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_onboarding_answer_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_premium: {
        Row: {
          created_at: string;
          daily_sets_count: number;
          id: number;
          introduction_sets_count: number;
          is_premium: boolean;
          is_trial: boolean;
          premium_finish: string | null;
          premium_start: string | null;
          transaction: string | null;
          trial_finish: string | null;
          trial_length: number;
          trial_start: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          daily_sets_count?: number;
          id?: number;
          introduction_sets_count?: number;
          is_premium?: boolean;
          is_trial?: boolean;
          premium_finish?: string | null;
          premium_start?: string | null;
          transaction?: string | null;
          trial_finish?: string | null;
          trial_length?: number;
          trial_start?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          daily_sets_count?: number;
          id?: number;
          introduction_sets_count?: number;
          is_premium?: boolean;
          is_trial?: boolean;
          premium_finish?: string | null;
          premium_start?: string | null;
          transaction?: string | null;
          trial_finish?: string | null;
          trial_length?: number;
          trial_start?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_premium_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_profile: {
        Row: {
          agreed_on_interview: boolean | null;
          android_expo_token: string | null;
          couple_id: number;
          created_at: string;
          first_name: string;
          id: number;
          ios_expo_token: string | null;
          onboarding_finished: boolean;
          partner_first_name: string | null;
          relationship_story: string | null;
          set_skip_available: number | null;
          showed_interview_request: boolean | null;
          showed_rating: boolean | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          agreed_on_interview?: boolean | null;
          android_expo_token?: string | null;
          couple_id: number;
          created_at?: string;
          first_name: string;
          id?: number;
          ios_expo_token?: string | null;
          onboarding_finished?: boolean;
          partner_first_name?: string | null;
          relationship_story?: string | null;
          set_skip_available?: number | null;
          showed_interview_request?: boolean | null;
          showed_rating?: boolean | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          agreed_on_interview?: boolean | null;
          android_expo_token?: string | null;
          couple_id?: number;
          created_at?: string;
          first_name?: string;
          id?: number;
          ios_expo_token?: string | null;
          onboarding_finished?: boolean;
          partner_first_name?: string | null;
          relationship_story?: string | null;
          set_skip_available?: number | null;
          showed_interview_request?: boolean | null;
          showed_rating?: boolean | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_profile_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_profile_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_profile_user_id_fkey1';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_profile_user_id_fkey2';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      question_reply: {
        Row: {
          id: number;
          text: string;
          question_id: number;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          text: string;
          question_id: number;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          text?: string;
          question_id?: number;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_profile_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_profile_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_profile_user_id_fkey1';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_profile_user_id_fkey2';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_technical_details: {
        Row: {
          after_trial_premium_offered: boolean;
          created_at: string;
          id: number;
          language: string | null;
          sent_interview_email: boolean;
          showed_challenge_notification: boolean;
          unsubscribe: boolean;
          updated_at: string;
          user_id: string;
          user_locale: string | null;
          user_timezone: string | null;
          wants_recordings: boolean;
          showed_text_interview: boolean;
          agreed_on_text_interview: boolean;
        };
        Insert: {
          after_trial_premium_offered?: boolean;
          created_at?: string;
          id?: number;
          language?: string | null;
          sent_interview_email?: boolean;
          showed_challenge_notification?: boolean;
          unsubscribe?: boolean;
          updated_at?: string;
          user_id: string;
          user_locale?: string | null;
          user_timezone?: string | null;
          wants_recordings?: boolean;
          showed_text_interview?: boolean;
          agreed_on_text_interview?: boolean;
        };
        Update: {
          after_trial_premium_offered?: boolean;
          created_at?: string;
          id?: number;
          language?: string | null;
          sent_interview_email?: boolean;
          showed_challenge_notification?: boolean;
          unsubscribe?: boolean;
          updated_at?: string;
          user_id?: string;
          user_locale?: string | null;
          user_timezone?: string | null;
          wants_recordings?: boolean;
          showed_text_interview?: boolean;
          agreed_on_text_interview?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'user_technical_details_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      waitlist: {
        Row: {
          created_at: string;
          id: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'waitlist_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      streak_hits: {
        Row: {
          id: number;
          couple_id: number;
          hit_date: string;
        };
        Insert: {
          id?: number;
          couple_id: number;
          hit_date: string;
        };
        Update: {
          id?: number;
          couple_id?: number;
          hit_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'streak_hits_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
        ];
      };
      content_question_couple_instance_reply: {
        Row: {
          id: number;
          text: string;
          instance_question_id: number;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          text: string;
          instance_question_id: number;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          text?: string;
          instance_question_id?: number;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_question_couple_instance_reply_instance_question_id_fkey';
            columns: ['instance_question_id'];
            isOneToOne: false;
            referencedRelation: 'content_question_couple_instance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_question_couple_instance_reply_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      content_checkup_couple_instance_question_answer: {
        Row: {
          id: number;
          instance_checkup_id: number;
          question_id: number;
          answer: number;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          instance_checkup_id: number;
          question_id: number;
          answer: number;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          instance_checkup_id?: number;
          question_id?: number;
          answer?: number;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_checkup_couple_instance_question_answer_instance_checkup_id_fkey';
            columns: ['instance_checkup_id'];
            isOneToOne: false;
            referencedRelation: 'content_checkup_couple_instance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_checkup_couple_instance_question_answer_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'content_checkup_question';
            referencedColumns: ['id'];
          },
        ];
      };
      content_game_couple_instance_answer: {
        Row: {
          id: number;
          text: string;
          instance_game_id: number;
          question_id: number;
          option_id: number;
          user_id: string;
          about_partner: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          text: string;
          instance_game_id: number;
          question_id: number;
          option_id: number;
          user_id: string;
          about_partner: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          text?: string;
          instance_game_id?: number;
          question_id?: number;
          option_id?: number;
          user_id?: string;
          about_partner?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_game_couple_instance_answer_instance_game_id_fkey';
            columns: ['instance_game_id'];
            isOneToOne: false;
            referencedRelation: 'content_game_couple_instance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_game_couple_instance_answer_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'content_game_question';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_game_couple_instance_answer_option_id_fkey';
            columns: ['option_id'];
            isOneToOne: false;
            referencedRelation: 'content_game_question_option';
            referencedColumns: ['id'];
          },
        ];
      };
      content_test_couple_instance_answer: {
        Row: {
          id: number;
          text: string;
          instance_test_id: number;
          question_id: number;
          option_id: number;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          text: string;
          instance_test_id: number;
          question_id: number;
          option_id: number;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          text?: string;
          instance_test_id?: number;
          question_id?: number;
          option_id?: number;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_test_couple_instance_answer_instance_test_id_fkey';
            columns: ['instance_test_id'];
            isOneToOne: false;
            referencedRelation: 'content_test_couple_instance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_test_couple_instance_answer_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'content_test_question';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_test_couple_instance_answer_option_id_fkey';
            columns: ['option_id'];
            isOneToOne: false;
            referencedRelation: 'content_test_question_option';
            referencedColumns: ['id'];
          },
        ];
      };
      content_test_couple_instance_result: {
        Row: {
          id: number;
          text: string;
          instance_test_id: number;
          result_id: number;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          text: string;
          instance_test_id: number;
          result_id: number;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          text?: string;
          instance_test_id?: number;
          result_id?: number;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_test_couple_instance_result_instance_test_id_fkey';
            columns: ['instance_test_id'];
            isOneToOne: false;
            referencedRelation: 'content_test_couple_instance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_test_couple_instance_result_result_id_fkey';
            columns: ['result_id'];
            isOneToOne: false;
            referencedRelation: 'content_test_result';
            referencedColumns: ['id'];
          },
        ];
      };
      job: {
        Row: {
          slug: string;
        };
        Insert: {
          slug: string;
        };
        Update: {
          slug?: string;
        };
        Relationships: [];
      };
      job_couple: {
        Row: {
          job_slug: string;
          couple_id: number;
        };
        Insert: {
          job_slug: string;
          couple_id: number;
        };
        Update: {
          job_slug?: string;
          couple_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'job_couple_job_slug_fkey';
            columns: ['job_slug'];
            isOneToOne: false;
            referencedRelation: 'job';
            referencedColumns: ['slug'];
          },
          {
            foreignKeyName: 'job_couple_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
        ];
      };
      content_question: {
        Row: {
          id: number;
          slug: string;
          language: string;
          created_at: string;
          updated_at: string;
          content: string;
          couples_finished: number;
        };
        Insert: {
          id?: number;
          slug: string;
          language: string;
          created_at?: string;
          updated_at?: string;
          content: string;
        };
        Update: {
          id?: number;
          slug: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
          content?: string;
        };
        Relationships: [];
      };
      content_article: {
        Row: {
          id: number;
          slug: string;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
          test_question: string;
          preview: string;
          couples_finished: number;
        };
        Insert: {
          id?: number;
          slug: string;
          language: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          test_question: string;
          preview: string;
        };
        Update: {
          id?: number;
          slug?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          test_question?: string;
          preview?: string;
        };
        Relationships: [];
      };
      content_article_details: {
        Row: {
          id: number;
          article_id: number;
          language: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          article_id: number;
          language: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          article_id?: number;
          language?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_article_details_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'content_article';
            referencedColumns: ['id'];
          },
        ];
      };
      daily_plan: {
        Row: {
          id: number;
          question_id: number;
          test_id: number | null;
          game_id: number | null;
          exercise_id: number | null;
          checkup_id: number | null;
          article_id: number | null;
          date: string;
          couple_id: number;
          free_content_type: string;
        };
        Insert: {
          id?: number;
          question_id: number;
          test_id?: number | null;
          game_id?: number | null;
          exercise_id?: number | null;
          checkup_id?: number | null;
          article_id?: number | null;
          date: string;
          couple_id: number;
          free_content_type?: string | null;
        };
        Update: {
          id?: number;
          question_id?: number;
          test_id?: number | null;
          game_id?: number | null;
          exercise_id?: number | null;
          checkup_id?: number | null;
          article_id?: number | null;
          date?: string;
          couple_id?: number;
          free_content_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'daily_plan_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'content_question';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'daily_plan_test_id_fkey';
            columns: ['test_id'];
            isOneToOne: false;
            referencedRelation: 'content_test';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'daily_plan_game_id_fkey';
            columns: ['game_id'];
            isOneToOne: false;
            referencedRelation: 'content_game';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'daily_plan_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'content_exercise';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'daily_plan_checkup_id_fkey';
            columns: ['checkup_id'];
            isOneToOne: false;
            referencedRelation: 'content_checkup';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'daily_plan_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'content_article';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'daily_plan_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
        ];
      };
      job_content_question: {
        Row: {
          job_slug: string;
          content_question_id: number;
        };
        Insert: {
          job_slug: string;
          content_question_id: number;
        };
        Update: {
          job_slug?: string;
          content_question_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'job_content_question_job_slug_fkey';
            columns: ['job_slug'];
            isOneToOne: false;
            referencedRelation: 'job';
            referencedColumns: ['slug'];
          },
          {
            foreignKeyName: 'job_content_question_content_question_id_fkey';
            columns: ['content_question_id'];
            isOneToOne: false;
            referencedRelation: 'content_question';
            referencedColumns: ['id'];
          },
        ];
      };
      job_content_article: {
        Row: {
          job_slug: string;
          content_article_id: number;
        };
        Insert: {
          job_slug: string;
          content_article_id: number;
        };
        Update: {
          job_slug?: string;
          content_article_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'job_content_article_job_slug_fkey';
            columns: ['job_slug'];
            isOneToOne: false;
            referencedRelation: 'job';
            referencedColumns: ['slug'];
          },
          {
            foreignKeyName: 'job_content_article_content_article_id_fkey';
            columns: ['content_article_id'];
            isOneToOne: false;
            referencedRelation: 'content_article';
            referencedColumns: ['id'];
          },
        ];
      };
      job_content_journey: {
        Row: {
          job_slug: string;
          content_journey_id: number;
        };
        Insert: {
          job_slug: string;
          content_journey_id: number;
        };
        Update: {
          job_slug?: string;
          content_journey_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'job_content_journey_job_slug_fkey';
            columns: ['job_slug'];
            isOneToOne: false;
            referencedRelation: 'job';
            referencedColumns: ['slug'];
          },
          {
            foreignKeyName: 'job_content_journey_content_journey_id_fkey';
            columns: ['content_journey_id'];
            isOneToOne: false;
            referencedRelation: 'content_journey';
            referencedColumns: ['id'];
          },
        ];
      };
      content_question_couple_instance: {
        Row: {
          id: number;
          couple_id: number;
          question_id: number;
          reply_count: number;
          created_at: string;
          updated_at: string;
          finished_by: string[];
        };
        Insert: {
          id?: number;
          couple_id: number;
          question_id: number;
          reply_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          couple_id?: number;
          question_id?: number;
          reply_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_question_couple_instance_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_question_couple_instance_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'content_question';
            referencedColumns: ['id'];
          },
        ];
      };
      content_test_couple_instance: {
        Row: {
          id: number;
          couple_id: number;
          test_id: number;
          created_at: string;
          updated_at: string;
          finished_by: string[];
        };
        Insert: {
          id?: number;
          couple_id: number;
          test_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          couple_id?: number;
          test_id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_test_couple_instance_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_test_couple_instance_test_id_fkey';
            columns: ['test_id'];
            isOneToOne: false;
            referencedRelation: 'content_test';
            referencedColumns: ['id'];
          },
        ];
      };
      content_exercise_couple_instance: {
        Row: {
          id: number;
          couple_id: number;
          exercise_id: number;
          created_at: string;
          updated_at: string;
          finished_by: string[];
        };
        Insert: {
          id?: number;
          couple_id: number;
          exercise_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          couple_id?: number;
          exercise_id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_exercise_couple_instance_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_exercise_couple_instance_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'content_exercise';
            referencedColumns: ['id'];
          },
        ];
      };
      content_game_couple_instance: {
        Row: {
          id: number;
          couple_id: number;
          game_id: number;
          created_at: string;
          updated_at: string;
          finished_by: string[];
        };
        Insert: {
          id?: number;
          couple_id: number;
          game_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          couple_id?: number;
          game_id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_game_couple_instance_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_game_couple_instance_game_id_fkey';
            columns: ['game_id'];
            isOneToOne: false;
            referencedRelation: 'content_game';
            referencedColumns: ['id'];
          },
        ];
      };
      content_checkup_couple_instance: {
        Row: {
          id: number;
          couple_id: number;
          checkup_id: number;
          created_at: string;
          updated_at: string;
          finished_by: string[];
        };
        Insert: {
          id?: number;
          couple_id: number;
          checkup_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          couple_id?: number;
          checkup_id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_checkup_couple_instance_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_checkup_couple_instance_checkup_id_fkey';
            columns: ['checkup_id'];
            isOneToOne: false;
            referencedRelation: 'content_checkup';
            referencedColumns: ['id'];
          },
        ];
      };
      content_article_couple_instance: {
        Row: {
          id: number;
          couple_id: number;
          article_id: number;
          created_at: string;
          updated_at: string;
          finished_by: string[];
        };
        Insert: {
          id?: number;
          couple_id: number;
          article_id: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          couple_id?: number;
          article_id?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_article_couple_instance_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_article_couple_instance_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'content_article';
            referencedColumns: ['id'];
          },
        ];
      };
      content_article_couple_instance_finish: {
        Row: {
          id: number;
          instance_article_id: number;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          instance_article_id: number;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          instance_article_id?: number;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_article_couple_instance_finish_instance_article_id_fkey';
            columns: ['instance_article_id'];
            isOneToOne: false;
            referencedRelation: 'content_article_couple_instance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_article_couple_instance_finish_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      content_exercise_couple_instance_finish: {
        Row: {
          id: number;
          instance_exercise_id: number;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          instance_exercise_id: number;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          instance_exercise_id?: number;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_exercise_couple_instance_finish_instance_exercise_id_fkey';
            columns: ['instance_exercise_id'];
            isOneToOne: false;
            referencedRelation: 'content_exercise_couple_instance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_exercise_couple_instance_finish_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      content_journey_couple_instance: {
        Row: {
          id: number;
          couple_id: number;
          journey_id: number;
          state: string;
          current_day: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          couple_id: number;
          journey_id: number;
          state?: string;
          current_day?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          couple_id?: number;
          journey_id?: number;
          state?: string;
          current_day?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_journey_couple_instance_couple_id_fkey';
            columns: ['couple_id'];
            isOneToOne: false;
            referencedRelation: 'couple';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_journey_couple_instance_journey_id_fkey';
            columns: ['journey_id'];
            isOneToOne: false;
            referencedRelation: 'content_journey';
            referencedColumns: ['id'];
          },
        ];
      };
      job_content_checkup: {
        Row: {
          job_slug: string;
          content_checkup_id: number;
        };
        Insert: {
          job_slug: string;
          content_checkup_id: number;
        };
        Update: {
          job_slug?: string;
          content_checkup_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'job_content_checkup_job_slug_fkey';
            columns: ['job_slug'];
            isOneToOne: false;
            referencedRelation: 'job';
            referencedColumns: ['slug'];
          },
          {
            foreignKeyName: 'job_content_checkup_content_checkup_id_fkey';
            columns: ['content_checkup_id'];
            isOneToOne: false;
            referencedRelation: 'content_checkup';
            referencedColumns: ['id'];
          },
        ];
      };
      job_content_exercise: {
        Row: {
          job_slug: string;
          content_exercise_id: number;
        };
        Insert: {
          job_slug: string;
          content_exercise_id: number;
        };
        Update: {
          job_slug?: string;
          content_exercise_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'job_content_exercise_job_slug_fkey';
            columns: ['job_slug'];
            isOneToOne: false;
            referencedRelation: 'job';
            referencedColumns: ['slug'];
          },
          {
            foreignKeyName: 'job_content_exercise_content_exercise_id_fkey';
            columns: ['content_exercise_id'];
            isOneToOne: false;
            referencedRelation: 'content_exercise';
            referencedColumns: ['id'];
          },
        ];
      };
      job_content_game: {
        Row: {
          job_slug: string;
          content_game_id: number;
        };
        Insert: {
          job_slug: string;
          content_game_id: number;
        };
        Update: {
          job_slug?: string;
          content_game_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'job_content_game_job_slug_fkey';
            columns: ['job_slug'];
            isOneToOne: false;
            referencedRelation: 'job';
            referencedColumns: ['slug'];
          },
          {
            foreignKeyName: 'job_content_game_content_game_id_fkey';
            columns: ['content_game_id'];
            isOneToOne: false;
            referencedRelation: 'content_game';
            referencedColumns: ['id'];
          },
        ];
      };
      content_article_answer: {
        Row: {
          id: number;
          article_id: number;
          language: string;
          title: string;
          content: string;
          correct: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          article_id: number;
          language: string;
          title: string;
          content: string;
          correct?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          article_id?: number;
          language?: string;
          title?: string;
          content?: string;
          correct?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_article_answer_article_id_fkey';
            columns: ['article_id'];
            isOneToOne: false;
            referencedRelation: 'content_article';
            referencedColumns: ['id'];
          },
        ];
      };
      content_checkup: {
        Row: {
          id: number;
          slug: string;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
          research: string;
          description: string;
          couples_finished: number;
        };
        Insert: {
          id?: number;
          slug: string;
          language: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          research: string;
          description: string;
        };
        Update: {
          id?: number;
          slug?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          research?: string;
          description?: string;
        };
        Relationships: [];
      };
      content_checkup_question: {
        Row: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          checkup_id: number;
          content: string;
        };
        Insert: {
          id?: number;
          language: string;
          created_at?: string;
          updated_at?: string;
          checkup_id: number;
          content: string;
        };
        Update: {
          id?: number;
          language?: string;
          created_at?: string;
          updated_at?: string;
          checkup_id?: number;
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_checkup_question_checkup_id_fkey';
            columns: ['checkup_id'];
            isOneToOne: false;
            referencedRelation: 'content_checkup';
            referencedColumns: ['id'];
          },
        ];
      };
      content_exercise: {
        Row: {
          id: number;
          slug: string;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string;
          couples_finished: number;
        };
        Insert: {
          id?: number;
          slug?: string;
          language: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          description: string;
        };
        Update: {
          id?: number;
          slug?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          description?: string;
        };
        Relationships: [];
      };
      content_exercise_step: {
        Row: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          exercise_id: number;
          title: string;
          content: string;
        };
        Insert: {
          id?: number;
          language: string;
          created_at?: string;
          updated_at?: string;
          exercise_id: number;
          title: string;
          content: string;
        };
        Update: {
          id?: number;
          language?: string;
          created_at?: string;
          updated_at?: string;
          exercise_id?: number;
          title?: string;
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_exercise_step_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'content_exercise';
            referencedColumns: ['id'];
          },
        ];
      };
      content_game: {
        Row: {
          id: number;
          slug: string;
          description: string;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
          couples_finished: number;
        };
        Insert: {
          id?: number;
          slug: string;
          description: string;
          language: string;
          created_at?: string;
          updated_at?: string;
          title: string;
        };
        Update: {
          id?: number;
          slug?: string;
          description?: string;
          language?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
        };
        Relationships: [];
      };
      content_game_question: {
        Row: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          game_id: number;
          title: string;
        };
        Insert: {
          id?: number;
          language: string;
          created_at?: string;
          updated_at?: string;
          game_id: number;
          title: string;
        };
        Update: {
          id?: number;
          language?: string;
          created_at?: string;
          updated_at?: string;
          game_id?: number;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_game_question_game_id_fkey';
            columns: ['game_id'];
            isOneToOne: false;
            referencedRelation: 'content_game';
            referencedColumns: ['id'];
          },
        ];
      };
      content_game_question_option: {
        Row: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          game_question_id: number;
          title: string;
        };
        Insert: {
          id?: number;
          language: string;
          created_at?: string;
          updated_at?: string;
          game_question_id: number;
          title: string;
        };
        Update: {
          id?: number;
          language?: string;
          created_at?: string;
          updated_at?: string;
          game_question_id?: number;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_game_question_option_game_question_id_fkey';
            columns: ['game_question_id'];
            isOneToOne: false;
            referencedRelation: 'content_game_question';
            referencedColumns: ['id'];
          },
        ];
      };
      content_test: {
        Row: {
          id: number;
          slug: string;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
          research: string;
          description: string;
          couples_finished: number;
        };
        Insert: {
          id?: number;
          language: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          research: string;
          description: string;
        };
        Update: {
          id?: number;
          language?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          research?: string;
          description?: string;
        };
        Relationships: [];
      };
      content_test_question: {
        Row: {
          id: number;
          test_id: number;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
        };
        Insert: {
          id?: number;
          test_id: number;
          language: string;
          created_at?: string;
          updated_at?: string;
          title: string;
        };
        Update: {
          id?: number;
          test_id?: number;
          language?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_test_question_test_id_fkey';
            columns: ['test_id'];
            isOneToOne: false;
            referencedRelation: 'content_test';
            referencedColumns: ['id'];
          },
        ];
      };
      content_test_result: {
        Row: {
          id: number;
          test_id: number;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string;
          advice: string;
        };
        Insert: {
          id?: number;
          test_id: number;
          language: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          description: string;
          advice: string;
        };
        Update: {
          id?: number;
          test_id?: number;
          language?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          description?: string;
          advice?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_test_result_test_id_fkey';
            columns: ['test_id'];
            isOneToOne: false;
            referencedRelation: 'content_test';
            referencedColumns: ['id'];
          },
        ];
      };
      content_test_combination: {
        Row: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          result_1_id: number;
          result_2_id: number;
          description: string;
          advice: string;
        };
        Insert: {
          id?: number;
          language: string;
          created_at?: string;
          updated_at?: string;
          result_1_id: number;
          result_2_id: number;
          description: string;
          advice: string;
        };
        Update: {
          id?: number;
          language?: string;
          created_at?: string;
          updated_at?: string;
          result_1_id?: number;
          result_2_id?: number;
          description?: string;
          advice?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'content_test_combination_result_1_id_fkey';
            columns: ['result_1_id'];
            isOneToOne: false;
            referencedRelation: 'content_test_result';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_test_combination_result_2_id_fkey';
            columns: ['result_2_id'];
            isOneToOne: false;
            referencedRelation: 'content_test_result';
            referencedColumns: ['id'];
          },
        ];
      };
      content_test_question_option: {
        Row: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
          result_id: number;
          question_id: number;
        };
        Insert: {
          id?: number;
          language: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          result_id: number;
          question_id: number;
        };
        Update: {
          id?: number;
          language?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          result_id?: number;
          question_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'content_test_question_option_result_id_fkey';
            columns: ['result_id'];
            isOneToOne: false;
            referencedRelation: 'content_test_result';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_test_question_option_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'content_test_question';
            referencedColumns: ['id'];
          },
        ];
      };
      content_journey: {
        Row: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string;
          couples_finished: number;
        };
        Insert: {
          id?: number;
          language: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          description?: string;
        };
        Update: {
          id?: number;
          language?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          description?: string;
        };
        Relationships: [];
      };
      content_journey_step: {
        Row: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string | null;
          journey_id: number;
        };
        Insert: {
          id?: number;
          language: string;
          created_at?: string;
          updated_at?: string;
          title: string;
          description?: string | null;
          journey_id: number;
        };
        Update: {
          id?: number;
          language?: string;
          created_at?: string;
          updated_at?: string;
          title?: string;
          description?: string | null;
          journey_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'content_journey_step_journey_id_fkey';
            columns: ['journey_id'];
            isOneToOne: false;
            referencedRelation: 'content_journey';
            referencedColumns: ['id'];
          },
        ];
      };
      content_journey_step_content: {
        Row: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          journey_id: number;
          journey_step_id: number;
          day: number;
        };
        Insert: {
          id?: number;
          language: string;
          created_at?: string;
          updated_at?: string;
          journey_id: number;
          journey_step_id: number;
          day: number;
        };
        Update: {
          id?: number;
          language?: string;
          created_at?: string;
          updated_at?: string;
          journey_id?: number;
          journey_step_id?: number;
          day?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'content_journey_step_content_journey_id_fkey';
            columns: ['journey_id'];
            isOneToOne: false;
            referencedRelation: 'content_journey';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'content_journey_step_content_journey_step_id_fkey';
            columns: ['journey_step_id'];
            isOneToOne: false;
            referencedRelation: 'content_journey_step';
            referencedColumns: ['id'];
          },
        ];
      };
      job_content_test: {
        Row: {
          job_slug: string;
          content_test_id: number;
        };
        Insert: {
          job_slug: string;
          content_test_id: number;
        };
        Update: {
          job_slug?: string;
          content_test_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'job_content_test_job_slug_fkey';
            columns: ['job_slug'];
            isOneToOne: false;
            referencedRelation: 'job';
            referencedColumns: ['slug'];
          },
          {
            foreignKeyName: 'job_content_test_content_test_id_fkey';
            columns: ['content_test_id'];
            isOneToOne: false;
            referencedRelation: 'content_test';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_user: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      leave_couple: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      join_couple: {
        Args: {
          invite_code: string;
        };
        Returns: 'SUCCESS' | 'WRONG_CODE' | 'COUPLE_IS_FULL' | 'ERROR';
      };
      has_partner: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      create_instance_feedback: {
        Args: {
          content_type: ContentType;
          instance_id: number;
          feedback: number;
        };
        Returns: undefined;
      };
      instance_feedback_exists: {
        Args: {
          content_type: ContentType;
          instance_id: number;
        };
        Returns: boolean;
      };
      discard_instance_feedback: {
        Args: {
          content_type: ContentType;
          instance_id: number;
        };
        Returns: boolean;
      };
      send_love_note: {
        Args: {
          type: LoveNoteAction;
        };
        Returns: number;
      };
      get_total_streak: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      get_last_week_streak: {
        Args: Record<PropertyKey, never>;
        Returns: {
          hit_date: string;
          state: 'hit' | 'freeze' | 'miss' | null;
        }[];
      };
      is_user_premium: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      record_streak_hit: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      create_plan_for_date: {
        Args: {
          p_couple_id: number;
          p_date: string;
        };
        Returns: {
          id: number;
          free_content_type: string;
          question_id: number;
          question_title: string;
          question_is_finished: boolean;
          test_id: number | null;
          test_title: string | null;
          test_is_finished: boolean;
          game_id: number | null;
          game_title: string | null;
          game_is_finished: boolean;
          exercise_id: number | null;
          exercise_title: string | null;
          exercise_is_finished: boolean;
          checkup_id: number | null;
          checkup_title: string | null;
          checkup_is_finished: boolean;
          article_id: number | null;
          article_title: string | null;
          article_is_finished: boolean;
        }[];
      };

      create_today_plan: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: number;
          free_content_type: string;
          question_id: number;
          question_title: string;
          question_is_finished: boolean;
          test_id: number | null;
          test_title: string | null;
          test_is_finished: boolean;
          game_id: number | null;
          game_title: string | null;
          game_is_finished: boolean;
          exercise_id: number | null;
          exercise_title: string | null;
          exercise_is_finished: boolean;
          checkup_id: number | null;
          checkup_title: string | null;
          checkup_is_finished: boolean;
          article_id: number | null;
          article_title: string | null;
          article_is_finished: boolean;
        }[];
      };

      create_tomorrow_plan: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: number;
          free_content_type: string;
          question_id: number;
          question_title: string;
          question_is_finished: boolean;
          test_id: number | null;
          test_title: string | null;
          test_is_finished: boolean;
          game_id: number | null;
          game_title: string | null;
          game_is_finished: boolean;
          exercise_id: number | null;
          exercise_title: string | null;
          exercise_is_finished: boolean;
          checkup_id: number | null;
          checkup_title: string | null;
          checkup_is_finished: boolean;
          article_id: number | null;
          article_title: string | null;
          article_is_finished: boolean;
        }[];
      };
      get_my_jobs: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
      get_partner_jobs: {
        Args: Record<PropertyKey, never>;
        Returns: string[];
      };
      get_journey_count: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      get_content_count: {
        Args: { jobs?: string[] };
        Returns: {
          journey_count: number;
          game_count: number;
          test_count: number;
          exercise_count: number;
          checkup_count: number;
          article_count: number;
          question_count: number;
        };
      };
      get_question_job_count: {
        Args: Record<PropertyKey, never>;
        Returns: [{ job: string; count: number }];
      };
      get_recommended_journey: {
        Args: {
          p_limit?: number;
        };
        Returns: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string | null;
        }[];
      };
      get_recommended_question: {
        Args: {
          p_limit?: number;
        };
        Returns: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          content: string;
        }[];
      };
      get_recommended_game: {
        Args: {
          p_limit?: number;
        };
        Returns: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
        }[];
      };
      get_recommended_exercise: {
        Args: {
          p_limit?: number;
        };
        Returns: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
          description: string;
        }[];
      };
      get_recommended_article: {
        Args: {
          p_limit?: number;
        };
        Returns: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
          test_question: string;
        }[];
      };
      get_recommended_checkup: {
        Args: {
          p_limit?: number;
        };
        Returns: {
          id: number;
          language: string;
          created_at: string;
          updated_at: string;
          title: string;
          research: string;
        }[];
      };
      update_couple_timezone: {
        Args: {
          p_timezone: string;
        };
        Returns: undefined;
      };
      get_all_test: {
        Args: {
          recommended?: boolean;
          p_limit?: number;
          p_page?: number;
        };
        Returns: {
          id: number;
          title: string;
          state: 'partner_answered' | 'me_answered' | 'me_partner_answered' | null;
          jobs: string[];
          page: number;
          has_next: boolean;
          couples_finished: number;
        }[];
      };
      get_all_exercise: {
        Args: {
          recommended?: boolean;
          p_limit?: number;
          p_page?: number;
        };
        Returns: {
          id: number;
          title: string;
          state: 'partner_answered' | 'me_answered' | 'me_partner_answered' | null;
          jobs: string[];
          page: number;
          has_next: boolean;
          couples_finished: number;
        }[];
      };
      get_all_checkup: {
        Args: {
          recommended?: boolean;
          p_limit?: number;
          p_page?: number;
        };
        Returns: {
          id: number;
          title: string;
          state: 'partner_answered' | 'me_answered' | 'me_partner_answered' | null;
          jobs: string[];
          page: number;
          has_next: boolean;
          couples_finished: number;
        }[];
      };
      get_all_game: {
        Args: {
          recommended?: boolean;
          p_limit?: number;
          p_page?: number;
        };
        Returns: {
          id: number;
          title: string;
          state: 'partner_answered' | 'me_answered' | 'me_partner_answered' | null;
          jobs: string[];
          page: number;
          has_next: boolean;
          couples_finished: number;
        }[];
      };
      get_all_article: {
        Args: {
          recommended?: boolean;
          p_limit?: number;
          p_page?: number;
        };
        Returns: {
          id: number;
          title: string;
          state: 'partner_answered' | 'me_answered' | 'me_partner_answered' | null;
          jobs: string[];
          page: number;
          has_next: boolean;
          couples_finished: number;
        }[];
      };
      get_job_question: {
        Args: {
          job: string;
          recommended?: boolean;
          p_limit?: number;
          p_page?: number;
        };
        Returns: {
          id: number;
          title: string;
          state: 'partner_answered' | 'me_answered' | 'me_partner_answered' | null;
          page: number;
          has_next: boolean;
          couples_finished: number;
        }[];
      };
      get_finished_test_count: {
        Args: {
          slug: string;
        };
        Returns: number;
      };
      get_finished_checkup_count: {
        Args: {
          slug: string;
        };
        Returns: number;
      };
      get_finished_game_count: {
        Args: {
          slug: string;
        };
        Returns: number;
      };
      get_test_result: {
        Args: {
          test_id: number;
          answers: { question_id: number; option_id: number }[];
        };
        Returns: number;
      };
      get_game_result: {
        Args: {
          game_id: number;
          answers: { question_id: number; option_id: number; about_partner: boolean }[];
        };
        Returns: number;
      };
      get_checkup_result: {
        Args: {
          checkup_id: number;
          answers: { question_id: number; answer: number }[];
        };
        Returns: number;
      };
      get_finished_article_count: {
        Args: {
          slug: string;
        };
        Returns: number;
      };
      get_finished_exercise_count: {
        Args: {
          slug: string;
        };
        Returns: number;
      };
      finish_article: {
        Args: {
          article_id: number;
        };
        Returns: undefined;
      };
      finish_exercise: {
        Args: {
          exercise_id: number;
        };
        Returns: undefined;
      };
      get_history: {
        Args: {
          p_limit?: number;
          p_page?: number;
        };
        Returns: {
          content_id: number;
          content_title: string;
          content_type:
            | 'question'
            | 'test'
            | 'game'
            | 'article'
            | 'checkup'
            | 'exercise'
            | 'journey';
          finished_by: string[];
          updated_at: string;
          jobs: string[];
          reply_count: number | null;
          reply_last_1_user_id: string | null;
          reply_last_1_text: string | null;
          reply_last_2_user_id: string | null;
          reply_last_2_text: string | null;
          page: number;
          has_next: boolean;
        }[];
      };
      set_own_jobs: {
        Args: {
          jobs: string[];
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | {
        schema: keyof Database;
      },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends {
  schema: keyof Database;
}
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
      Database['public']['Views'])
  ? (Database['public']['Tables'] & Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | {
        schema: keyof Database;
      },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | {
        schema: keyof Database;
      },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | {
        schema: keyof Database;
      },
  EnumName extends PublicEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends {
  schema: keyof Database;
}
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
  ? Database['public']['Enums'][PublicEnumNameOrOptions]
  : never;
