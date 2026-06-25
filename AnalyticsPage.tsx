import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import { useSupabaseQuery } from '@/hooks/useSupabase'
import { PageHeader, LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, StatCard } from '@/components/ui/Card'
import { TrendingUp, CheckSquare, Target, Smile } from 'lucide-react'
import type { Task, Goal, DiaryEntry } from '@/types/database'

const MOOD_COLORS: Record<string, string> = {
  great: '#10b981',
  good: '#6366f1',
  neutral: '#94a3b8',
  bad: '#f59e0b',
  terrible: '#ef4444',
}

const MOOD_LABELS: Record<string, string> = {
  great: 'Great',
  good: 'Good',
  neutral: 'Neutral',
  bad: 'Bad',
  terrible: 'Terrible',
}

export default function AnalyticsPage() {
  const { data: tasks, loading: tasksLoading } = useSupabaseQuery<Task>('tasks')
  const { data: goals, loading: goalsLoading } = useSupabaseQuery<Goal>('goals')
  const { data: diary, loading: diaryLoading } = useSupabaseQuery<DiaryEntry>('diary_entries')

  const taskChartData = useMemo(() => {
    const weeks: Record<string, { week: string; completed: number; pending: number }> = {}
    tasks.forEach((t) => {
      const week = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!weeks[week]) weeks[week] = { week, completed: 0, pending: 0 }
      if (t.is_completed) weeks[week].completed++
      else weeks[week].pending++
    })
    return Object.values(weeks).slice(-8)
  }, [tasks])

  const goalChartData = useMemo(() => {
    return goals.slice(0, 6).map((g) => ({
      name: g.title.length > 15 ? g.title.slice(0, 15) + '…' : g.title,
      progress: g.progress,
    }))
  }, [goals])

  const moodData = useMemo(() => {
    const counts: Record<string, number> = {}
    diary.forEach((e) => {
      counts[e.mood] = (counts[e.mood] || 0) + 1
    })
    return Object.entries(counts).map(([mood, count]) => ({
      name: MOOD_LABELS[mood] || mood,
      value: count,
      color: MOOD_COLORS[mood] || '#94a3b8',
    }))
  }, [diary])

  const productivityStats = useMemo(() => {
    const completed = tasks.filter((t) => t.is_completed).length
    const rate = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
    const avgGoal = goals.length
      ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
      : 0
    const dominantMood = moodData.sort((a, b) => b.value - a.value)[0]?.name || '—'
    return { completed, rate, avgGoal, dominantMood, totalEntries: diary.length }
  }, [tasks, goals, diary, moodData])

  if (tasksLoading || goalsLoading || diaryLoading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Insights into your productivity, goals, and wellbeing"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Task completion" value={`${productivityStats.rate}%`} icon={<CheckSquare className="h-5 w-5" />} />
        <StatCard label="Tasks completed" value={productivityStats.completed} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Avg goal progress" value={`${productivityStats.avgGoal}%`} icon={<Target className="h-5 w-5" />} />
        <StatCard label="Dominant mood" value={productivityStats.dominantMood} icon={<Smile className="h-5 w-5" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold">Task completion over time</h3>
          {taskChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={taskChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="completed" fill="#6366f1" name="Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#cbd5e1" name="Pending" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">No task data yet</p>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Goal progress</h3>
          {goalChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={goalChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="progress" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">No goals yet</p>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Mood distribution</h3>
          {moodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={moodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {moodData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-slate-500">No diary entries yet</p>
          )}
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold">Productivity summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between rounded-xl bg-vault-500/10 p-4">
              <span className="text-sm">Total tasks</span>
              <span className="font-bold">{tasks.length}</span>
            </div>
            <div className="flex justify-between rounded-xl bg-emerald-500/10 p-4">
              <span className="text-sm">Goals achieved</span>
              <span className="font-bold">{goals.filter((g) => g.is_completed).length}</span>
            </div>
            <div className="flex justify-between rounded-xl bg-indigo-500/10 p-4">
              <span className="text-sm">Journal entries</span>
              <span className="font-bold">{diary.length}</span>
            </div>
            <div className="flex justify-between rounded-xl bg-amber-500/10 p-4">
              <span className="text-sm">Completion rate</span>
              <span className="font-bold">{productivityStats.rate}%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
