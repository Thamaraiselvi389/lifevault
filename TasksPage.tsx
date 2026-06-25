import { useMemo, useState } from 'react'
import { CheckSquare, Plus, Trash2, Calendar, Repeat } from 'lucide-react'
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/useSupabase'
import { PageHeader, LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, EmptyState, Badge, ProgressBar } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { formatDueLabel, cn } from '@/lib/utils'
import type { Task, TaskPriority, RecurrencePattern } from '@/types/database'
import toast from 'react-hot-toast'

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const priorityVariant = {
  low: 'default' as const,
  medium: 'info' as const,
  high: 'warning' as const,
  urgent: 'danger' as const,
}

export default function TasksPage() {
  const { data: tasks, loading, refetch } = useSupabaseQuery<Task>('tasks', '*', {
    column: 'due_date',
    ascending: true,
  })
  const { insert, update, remove } = useSupabaseMutation('tasks')

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    due_date: '',
    is_recurring: false,
    recurrence_pattern: 'weekly' as RecurrencePattern,
  })

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === 'active') return !t.is_completed
      if (filter === 'completed') return t.is_completed
      return true
    })
  }, [tasks, filter])

  const progress = useMemo(() => {
    if (tasks.length === 0) return 0
    return Math.round((tasks.filter((t) => t.is_completed).length / tasks.length) * 100)
  }, [tasks])

  const openCreate = () => {
    setEditing(null)
    setForm({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      is_recurring: false,
      recurrence_pattern: 'weekly',
    })
    setModalOpen(true)
  }

  const openEdit = (task: Task) => {
    setEditing(task)
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date || '',
      is_recurring: task.is_recurring,
      recurrence_pattern: task.recurrence_pattern || 'weekly',
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: form.title,
      description: form.description || null,
      priority: form.priority,
      due_date: form.due_date || null,
      is_recurring: form.is_recurring,
      recurrence_pattern: form.is_recurring ? form.recurrence_pattern : null,
    }

    if (editing) {
      await update(editing.id, payload)
      toast.success('Task updated')
    } else {
      await insert(payload)
      toast.success('Task created')
    }
    setModalOpen(false)
    refetch()
  }

  const toggleComplete = async (task: Task) => {
    await update(task.id, {
      is_completed: !task.is_completed,
      completed_at: !task.is_completed ? new Date().toISOString() : null,
    })
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return
    await remove(id)
    toast.success('Task deleted')
    refetch()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title="Smart To-Do Manager"
        subtitle="Organize tasks with priorities, due dates, and recurring schedules"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New task
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Overall progress</span>
          <span className="text-sm text-slate-500">{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </Card>

      <div className="mb-6 flex gap-2">
        {(['active', 'completed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-medium capitalize transition',
              filter === f
                ? 'bg-vault-500/15 text-vault-700 dark:text-vault-300'
                : 'text-slate-500 hover:bg-white/50 dark:hover:bg-slate-800/50',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-8 w-8" />}
          title="No tasks found"
          description="Create your first task to start tracking your productivity."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Add task
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <Card key={task.id} className="flex items-start gap-4 !p-4">
              <button
                onClick={() => toggleComplete(task)}
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition',
                  task.is_completed
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-300 hover:border-vault-500',
                )}
              >
                {task.is_completed && '✓'}
              </button>
              <div className="min-w-0 flex-1 cursor-pointer" onClick={() => openEdit(task)}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={cn(
                      'font-medium',
                      task.is_completed && 'text-slate-400 line-through',
                    )}
                  >
                    {task.title}
                  </h3>
                  <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                  {task.is_recurring && (
                    <Badge variant="info">
                      <Repeat className="mr-1 inline h-3 w-3" />
                      {task.recurrence_pattern}
                    </Badge>
                  )}
                </div>
                {task.description && (
                  <p className="mt-1 text-sm text-slate-500">{task.description}</p>
                )}
                {task.due_date && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" /> {formatDueLabel(task.due_date)}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit task' : 'New task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })} options={PRIORITIES} />
          <Input label="Due date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_recurring}
              onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })}
            />
            Recurring task
          </label>
          {form.is_recurring && (
            <Select
              label="Recurrence"
              value={form.recurrence_pattern}
              onChange={(e) => setForm({ ...form, recurrence_pattern: e.target.value as RecurrencePattern })}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
            />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
