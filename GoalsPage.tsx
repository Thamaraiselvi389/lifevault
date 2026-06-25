import { useState } from 'react'
import { Target, Plus, Trash2, Trophy } from 'lucide-react'
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/useSupabase'
import { PageHeader, LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, EmptyState, Badge, ProgressBar } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { formatDate } from '@/lib/utils'
import type { Goal, GoalCategory } from '@/types/database'
import toast from 'react-hot-toast'

const CATEGORIES: { value: GoalCategory; label: string }[] = [
  { value: 'education', label: 'Education' },
  { value: 'career', label: 'Career' },
  { value: 'finance', label: 'Finance' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'personal', label: 'Personal' },
]

export default function GoalsPage() {
  const { data: goals, loading, refetch } = useSupabaseQuery<Goal>('goals', '*', {
    column: 'created_at',
    ascending: false,
  })
  const { insert, update, remove } = useSupabaseMutation('goals')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'personal' as GoalCategory,
    target_date: '',
    progress: 0,
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ title: '', description: '', category: 'personal', target_date: '', progress: 0 })
    setModalOpen(true)
  }

  const openEdit = (goal: Goal) => {
    setEditing(goal)
    setForm({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      target_date: goal.target_date || '',
      progress: goal.progress,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: form.title,
      description: form.description || null,
      category: form.category,
      target_date: form.target_date || null,
      progress: form.progress,
      is_completed: form.progress >= 100,
      completed_at: form.progress >= 100 ? new Date().toISOString() : null,
    }
    if (editing) {
      await update(editing.id, payload)
      toast.success('Goal updated')
    } else {
      await insert(payload)
      toast.success('Goal created')
    }
    setModalOpen(false)
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this goal?')) return
    await remove(id)
    toast.success('Goal deleted')
    refetch()
  }

  const activeGoals = goals.filter((g) => !g.is_completed)
  const completedGoals = goals.filter((g) => g.is_completed)

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title="Goal Tracker"
        subtitle="Set goals, track progress, and celebrate achievements"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New goal
          </Button>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          icon={<Target className="h-8 w-8" />}
          title="No goals yet"
          description="Define your first goal and start making progress."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Create goal
            </Button>
          }
        />
      ) : (
        <>
          {activeGoals.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 text-lg font-semibold">Active goals</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {activeGoals.map((goal) => (
                  <Card key={goal.id}>
                    <div className="mb-3 flex items-start justify-between">
                      <Badge variant="info">{goal.category}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <h3 className="cursor-pointer font-semibold" onClick={() => openEdit(goal)}>
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="mt-1 text-sm text-slate-500">{goal.description}</p>
                    )}
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <ProgressBar value={goal.progress} />
                    </div>
                    {goal.target_date && (
                      <p className="mt-2 text-xs text-slate-400">Target: {formatDate(goal.target_date)}</p>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

          {completedGoals.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Trophy className="h-5 w-5 text-amber-500" /> Achievements
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completedGoals.map((goal) => (
                  <Card key={goal.id} className="border-emerald-500/20 bg-emerald-500/5">
                    <Badge variant="success">{goal.category}</Badge>
                    <h3 className="mt-2 font-semibold">{goal.title}</h3>
                    <p className="mt-1 text-xs text-emerald-600">
                      Completed {formatDate(goal.completed_at)}
                    </p>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit goal' : 'New goal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as GoalCategory })} options={CATEGORIES} />
          <Input label="Target date" type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
          <div>
            <label className="mb-1 block text-sm font-medium">Progress: {form.progress}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
              className="w-full accent-vault-600"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
