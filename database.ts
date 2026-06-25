export type DocumentCategory =
  | 'education'
  | 'medical'
  | 'finance'
  | 'insurance'
  | 'identity'
  | 'personal'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible'

export type GoalCategory =
  | 'education'
  | 'career'
  | 'finance'
  | 'fitness'
  | 'personal'

export type TimelineEventType =
  | 'document'
  | 'task'
  | 'diary'
  | 'goal'
  | 'message'
  | 'achievement'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  title: string
  description: string | null
  category: DocumentCategory
  file_path: string | null
  file_name: string | null
  file_size: number | null
  mime_type: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  priority: TaskPriority
  due_date: string | null
  is_completed: boolean
  is_recurring: boolean
  recurrence_pattern: RecurrencePattern | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface DiaryEntry {
  id: string
  user_id: string
  title: string | null
  content: string
  mood: Mood
  entry_date: string
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  category: GoalCategory
  target_date: string | null
  progress: number
  is_completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface FutureMessage {
  id: string
  user_id: string
  title: string
  content: string
  unlock_date: string
  is_unlocked: boolean
  unlocked_at: string | null
  created_at: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
}

export interface EmergencyProfile {
  id: string
  user_id: string
  blood_group: string | null
  allergies: string[] | null
  medical_conditions: string[] | null
  medications: string[] | null
  emergency_contacts: EmergencyContact[]
  qr_visible_fields: string[]
  public_token: string
  updated_at: string
}

export interface Reminder {
  id: string
  user_id: string
  title: string
  reminder_date: string
  is_completed: boolean
  source_type: string | null
  source_id: string | null
  created_at: string
}

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  title: string
  description: string | null
  date: string
  icon?: string
  metadata?: Record<string, unknown>
}

export interface SearchResult {
  id: string
  type: 'document' | 'task' | 'goal' | 'diary' | 'message'
  title: string
  subtitle: string
  date: string
  href: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string }
        Update: Partial<Profile>
      }
      documents: {
        Row: Document
        Insert: Omit<Document, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
        }
        Update: Partial<Document>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'is_completed' | 'completed_at'> & {
          id?: string
          is_completed?: boolean
          completed_at?: string | null
        }
        Update: Partial<Task>
      }
      diary_entries: {
        Row: DiaryEntry
        Insert: Omit<DiaryEntry, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
        }
        Update: Partial<DiaryEntry>
      }
      goals: {
        Row: Goal
        Insert: Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'progress' | 'is_completed' | 'completed_at'> & {
          id?: string
          progress?: number
          is_completed?: boolean
          completed_at?: string | null
        }
        Update: Partial<Goal>
      }
      future_messages: {
        Row: FutureMessage
        Insert: Omit<FutureMessage, 'id' | 'created_at' | 'is_unlocked' | 'unlocked_at'> & {
          id?: string
          is_unlocked?: boolean
          unlocked_at?: string | null
        }
        Update: Partial<FutureMessage>
      }
      emergency_profiles: {
        Row: EmergencyProfile
        Insert: Omit<EmergencyProfile, 'id' | 'public_token' | 'updated_at'> & {
          id?: string
          public_token?: string
        }
        Update: Partial<EmergencyProfile>
      }
      reminders: {
        Row: Reminder
        Insert: Omit<Reminder, 'id' | 'created_at' | 'is_completed'> & {
          id?: string
          is_completed?: boolean
        }
        Update: Partial<Reminder>
      }
    }
  }
}
