import { useMemo } from 'react'
import {
  FileText,
  CheckSquare,
  Target,
  TrendingUp,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSupabaseQuery } from '@/hooks/useSupabase'
import { useTimeline } from '@/hooks/useTimeline'
import { PageHeader } from '@/components/ui/LoadingSpinner'
import { Card, StatCard, Badge } from '@/components/ui/Card'
import { formatDate, formatRelative, formatDueLabel } from '@/lib/utils'
import type { Task, Goal, Reminder, FutureMessage } from '@/types/database'
import { Link } from 'react-router-dom'

export default function DashboardPage() {
  const { profile } = useAuth()
  const { data: tasks } = useSupabaseQuery<Task>('tasks', '*', {
    column: 'created_at',
    ascending: false,
  })
  const { data: goals } = useSupabaseQuery<Goal>('goals')
  const { data: documents } = useSupabaseQuery('documents')
  const { data: diary } = useSupabaseQuery('diary_entries')
  const { data: reminders } = useSupabaseQuery<Reminder>('reminders', '*', {
    column: 'reminder_date',
    ascending: true,
  })
  const { data: messages } = useSupabaseQuery<FutureMessage>('future_messages')
  const { events } = useTimeline()

  const stats = useMemo(() => {
    const completedTasks = tasks.filter((t) => t.is_completed).length
    const activeGoals = goals.filter((g) => !g.is_completed).length
    const avgGoalProgress =
      goals.length > 0
        ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
        : 0
    const pendingTasks = tasks.filter((t) => !t.is_completed).length

    return { completedTasks, activeGoals, avgGoalProgress, pendingTasks, documents: documents.length }
  }, [tasks, goals, documents])

  const upcomingTasks = tasks.filter((t) => !t.is_completed && t.due_date).slice(0, 5)
  const upcomingReminders = reminders.filter((r) => !r.is_completed).slice(0, 5)
  const lockedMessages = messages.filter((m) => !m.is_unlocked).slice(0, 3)

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${profile?.full_name?.split(' ')[0] || 'there'} 👋`}
        subtitle="Here's an overview of your life vault today"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Documents" value={stats.documents} icon={<FileText className="h-5 w-5" />} />
        <StatCard
          label="Pending tasks"
          value={stats.pendingTasks}
          icon={<CheckSquare className="h-5 w-5" />}
          trend={`${stats.completedTasks} completed`}
        />
        <StatCard label="Active goals" value={stats.activeGoals} icon={<Target className="h-5 w-5" />} />
        <StatCard
          label="Goal progress"
          value={`${stats.avgGoalProgress}%`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Recent activity</h2>
            <Link to="/timeline" className="text-sm text-vault-600 hover:underline dark:text-vault-400">
              View timeline
            </Link>
          </div>
          <div className="space-y-4">
            {events.slice(0, 6).map((event) => (
              <div key={event.id} className="flex gap-3 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-vault-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-white">{event.title}</p>
                  <p className="text-sm text-slate-500">{event.description}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{formatRelative(event.date)}</span>
              </div>
            ))}
            {events.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-500">No activity yet. Start building your vault!</p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Calendar className="h-4 w-4 text-vault-500" /> Upcoming
            </h2>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="rounded-xl bg-white/40 p-3 dark:bg-slate-800/40">
                  <p className="text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-slate-500">{formatDueLabel(task.due_date)}</p>
                </div>
              ))}
              {upcomingReminders.map((r) => (
                <div key={r.id} className="rounded-xl bg-white/40 p-3 dark:bg-slate-800/40">
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-slate-500">{formatDate(r.reminder_date)}</p>
                </div>
              ))}
              {upcomingTasks.length === 0 && upcomingReminders.length === 0 && (
                <p className="text-sm text-slate-500">Nothing upcoming</p>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4 text-vault-500" /> Future messages
            </h2>
            {lockedMessages.map((m) => (
              <div key={m.id} className="mb-2 rounded-xl bg-white/40 p-3 dark:bg-slate-800/40">
                <p className="text-sm font-medium">{m.title}</p>
                <Badge variant="info">Unlocks {formatDate(m.unlock_date)}</Badge>
              </div>
            ))}
            {lockedMessages.length === 0 && (
              <p className="text-sm text-slate-500">No locked messages</p>
            )}
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <h2 className="mb-4 font-semibold">Productivity overview</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-emerald-500/10 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{stats.completedTasks}</p>
            <p className="text-sm text-slate-500">Tasks done</p>
          </div>
          <div className="rounded-xl bg-vault-500/10 p-4 text-center">
            <p className="text-2xl font-bold text-vault-600">{diary.length}</p>
            <p className="text-sm text-slate-500">Journal entries</p>
          </div>
          <div className="rounded-xl bg-indigo-500/10 p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {goals.filter((g) => g.is_completed).length}
            </p>
            <p className="text-sm text-slate-500">Goals achieved</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
