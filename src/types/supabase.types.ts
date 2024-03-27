import { JobSlug } from './domain';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

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
          invitation_code: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          invitation_code: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          invitation_code?: string;
          updated_at?: string;
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
          created_at: string;
          id: number;
          job: JobSlug;
          level: number;
          reflection_answer_id: number | null;
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
          reflection_answer_id?: number | null;
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
          reflection_answer_id?: number | null;
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
          {
            foreignKeyName: 'date_reflection_answer_id_fkey';
            columns: ['reflection_answer_id'];
            isOneToOne: false;
            referencedRelation: 'reflection_question_answer';
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
          free_recording_minutes: number | null;
          id: number;
          introduction_sets_count: number;
          is_premium: boolean;
          is_trial: boolean;
          premium_finish: string | null;
          premium_recording_minutes: number | null;
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
          free_recording_minutes?: number | null;
          id?: number;
          introduction_sets_count?: number;
          is_premium?: boolean;
          is_trial?: boolean;
          premium_finish?: string | null;
          premium_recording_minutes?: number | null;
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
          free_recording_minutes?: number | null;
          id?: number;
          introduction_sets_count?: number;
          is_premium?: boolean;
          is_trial?: boolean;
          premium_finish?: string | null;
          premium_recording_minutes?: number | null;
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_user: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
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
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
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
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
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
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
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
  PublicEnumNameOrOptions extends keyof Database['public']['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
  ? Database['public']['Enums'][PublicEnumNameOrOptions]
  : never;
