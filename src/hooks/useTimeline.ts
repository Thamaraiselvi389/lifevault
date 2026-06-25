import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSupabaseQuery } from '@/hooks/useSupabase'
import type {
  DiaryEntry,
  Document,
  FutureMessage,
  Goal,
  Task,
  TimelineEvent,
} from '@/types/database'

export function useTimeline() {
  const { user } = useAuth()
  const { data: documents } = useSupabaseQuery<Document>('documents', '*', {
    column: 'created_at',
    ascending: false,
  })
  const { data: tasks } = useSupabaseQuery<Task>('tasks', '*', {
    column: 'created_at',
    ascending: false,
  })
  const { data: diary } = useSupabaseQuery<DiaryEntry>('diary_entries', '*', {
    column: 'entry_date',
    ascending: false,
  })
  const { data: goals } = useSupabaseQuery<Goal>('goals', '*', {
    column: 'created_at',
    ascending: false,
  })
  const { data: messages } = useSupabaseQuery<FutureMessage>('future_messages', '*', {
    column: 'created_at',
    ascending: false,
  })

  const events = useMemo<TimelineEvent[]>(() => {
    if (!user) return []

    const items: TimelineEvent[] = [
      ...documents.map((d) => ({
        id: `doc-${d.id}`,
        type: 'document' as const,
        title: d.title,
        description: `Uploaded to ${d.category}`,
        date: d.created_at,
      })),
      ...tasks
        .filter((t) => t.is_completed && t.completed_at)
        .map((t) => ({
          id: `task-${t.id}`,
          type: 'task' as const,
          title: t.title,
          description: 'Task completed',
          date: t.completed_at!,
        })),
      ...diary.map((e) => ({
        id: `diary-${e.id}`,
        type: 'diary' as const,
        title: e.title || 'Diary entry',
        description: `Mood: ${e.mood}`,
        date: e.entry_date,
      })),
      ...goals
        .filter((g) => g.is_completed && g.completed_at)
        .map((g) => ({
          id: `goal-${g.id}`,
          type: 'achievement' as const,
          title: g.title,
          description: `Goal achieved in ${g.category}`,
          date: g.completed_at!,
        })),
      ...messages
        .filter((m) => m.is_unlocked && m.unlocked_at)
        .map((m) => ({
          id: `msg-${m.id}`,
          type: 'message' as const,
          title: m.title,
          description: 'Future message unlocked',
          date: m.unlocked_at!,
        })),
    ]

    return items.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
  }, [user, documents, tasks, diary, goals, messages])

  return { events }
}

export function useGlobalSearch(query: string) {
  const { data: documents } = useSupabaseQuery<Document>('documents')
  const { data: tasks } = useSupabaseQuery<Task>('tasks')
  const { data: goals } = useSupabaseQuery<Goal>('goals')
  const { data: diary } = useSupabaseQuery<DiaryEntry>('diary_entries')
  const { data: messages } = useSupabaseQuery<FutureMessage>('future_messages')

  return useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const results = [
      ...documents
        .filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            d.description?.toLowerCase().includes(q) ||
            d.category.includes(q),
        )
        .map((d) => ({
          id: d.id,
          type: 'document' as const,
          title: d.title,
          subtitle: d.category,
          date: d.created_at,
          href: '/documents',
        })),
      ...tasks
        .filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q),
        )
        .map((t) => ({
          id: t.id,
          type: 'task' as const,
          title: t.title,
          subtitle: t.priority,
          date: t.created_at,
          href: '/tasks',
        })),
      ...goals
        .filter(
          (g) =>
            g.title.toLowerCase().includes(q) ||
            g.description?.toLowerCase().includes(q),
        )
        .map((g) => ({
          id: g.id,
          type: 'goal' as const,
          title: g.title,
          subtitle: g.category,
          date: g.created_at,
          href: '/goals',
        })),
      ...diary
        .filter(
          (e) =>
            e.title?.toLowerCase().includes(q) ||
            e.content.toLowerCase().includes(q),
        )
        .map((e) => ({
          id: e.id,
          type: 'diary' as const,
          title: e.title || 'Diary entry',
          subtitle: e.mood,
          date: e.entry_date,
          href: '/diary',
        })),
      ...messages
        .filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.content.toLowerCase().includes(q),
        )
        .map((m) => ({
          id: m.id,
          type: 'message' as const,
          title: m.title,
          subtitle: m.is_unlocked ? 'Unlocked' : 'Locked',
          date: m.created_at,
          href: '/messages',
        })),
    ]

    return results.slice(0, 20)
  }, [query, documents, tasks, goals, diary, messages])
}
