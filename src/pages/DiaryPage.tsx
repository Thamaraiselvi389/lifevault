import { useMemo, useState } from 'react'
import { BookOpen, Plus, Trash2, Search, Lock } from 'lucide-react'
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/useSupabase'
import { PageHeader, LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, EmptyState, Badge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { formatDate, cn } from '@/lib/utils'
import type { DiaryEntry, Mood } from '@/types/database'
import toast from 'react-hot-toast'

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'great', label: 'Great', emoji: '😄' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'bad', label: 'Bad', emoji: '😔' },
  { value: 'terrible', label: 'Terrible', emoji: '😢' },
]

export default function DiaryPage() {
  const { data: entries, loading, refetch } = useSupabaseQuery<DiaryEntry>('diary_entries', '*', {
    column: 'entry_date',
    ascending: false,
  })
  const { insert, update, remove } = useSupabaseMutation('diary_entries')

  const [search, setSearch] = useState('')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<DiaryEntry | null>(null)
  const [form, setForm] = useState({
    title: '',
    content: '',
    mood: 'neutral' as Mood,
    entry_date: new Date().toISOString().split('T')[0],
    is_private: true,
  })

  const filtered = useMemo(() => {
    if (!search) return entries
    const q = search.toLowerCase()
    return entries.filter(
      (e) => e.title?.toLowerCase().includes(q) || e.content.toLowerCase().includes(q),
    )
  }, [entries, search])

  const calendarDays = useMemo(() => {
    const map = new Map<string, DiaryEntry[]>()
    entries.forEach((e) => {
      const key = e.entry_date
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    })
    return map
  }, [entries])

  const openCreate = () => {
    setEditing(null)
    setForm({
      title: '',
      content: '',
      mood: 'neutral',
      entry_date: new Date().toISOString().split('T')[0],
      is_private: true,
    })
    setModalOpen(true)
  }

  const openEdit = (entry: DiaryEntry) => {
    setEditing(entry)
    setForm({
      title: entry.title || '',
      content: entry.content,
      mood: entry.mood,
      entry_date: entry.entry_date,
      is_private: entry.is_private,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      title: form.title || null,
      content: form.content,
      mood: form.mood,
      entry_date: form.entry_date,
      is_private: form.is_private,
    }
    if (editing) {
      await update(editing.id, payload)
      toast.success('Entry updated')
    } else {
      await insert(payload)
      toast.success('Entry saved')
    }
    setModalOpen(false)
    refetch()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this entry?')) return
    await remove(id)
    toast.success('Entry deleted')
    refetch()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title="Personal Diary"
        subtitle="Private journal with mood tracking — your thoughts, secured"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> New entry
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="glass-input pl-10"
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView('list')}
            className={cn('rounded-xl px-4 py-2 text-sm font-medium', view === 'list' && 'bg-vault-500/15 text-vault-700')}
          >
            List
          </button>
          <button
            onClick={() => setView('calendar')}
            className={cn('rounded-xl px-4 py-2 text-sm font-medium', view === 'calendar' && 'bg-vault-500/15 text-vault-700')}
          >
            Calendar
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="Your diary is empty"
          description="Start journaling to track your thoughts and moods over time."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> Write first entry
            </Button>
          }
        />
      ) : view === 'list' ? (
        <div className="space-y-4">
          {filtered.map((entry) => {
            const mood = MOODS.find((m) => m.value === entry.mood)
            return (
              <Card key={entry.id} className="cursor-pointer" hover>
                <div className="flex items-start justify-between" onClick={() => openEdit(entry)}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{mood?.emoji}</span>
                      <h3 className="font-semibold">{entry.title || 'Untitled entry'}</h3>
                      {entry.is_private && (
                        <Badge variant="default">
                          <Lock className="mr-1 inline h-3 w-3" /> Private
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                      {entry.content}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">{formatDate(entry.entry_date)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(entry.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <h3 className="mb-4 font-semibold">Entry calendar</h3>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2 font-medium text-slate-500">
                {d}
              </div>
            ))}
            {Array.from({ length: 35 }, (_, i) => {
              const date = new Date()
              date.setDate(1)
              date.setDate(date.getDate() - date.getDay() + i)
              const key = date.toISOString().split('T')[0]
              const dayEntries = calendarDays.get(key) || []
              return (
                <div
                  key={i}
                  className={cn(
                    'rounded-lg p-2 min-h-[60px]',
                    dayEntries.length > 0 && 'bg-vault-500/10',
                  )}
                >
                  <span className="text-slate-500">{date.getDate()}</span>
                  {dayEntries.length > 0 && (
                    <div className="mt-1 text-lg">
                      {MOODS.find((m) => m.value === dayEntries[0].mood)?.emoji}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit entry' : 'New entry'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={6} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Mood" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value as Mood })} options={MOODS.map((m) => ({ value: m.value, label: `${m.emoji} ${m.label}` }))} />
            <Input label="Date" type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_private} onChange={(e) => setForm({ ...form, is_private: e.target.checked })} />
            <Lock className="h-4 w-4" /> Keep private (encrypted storage via RLS)
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save' : 'Save entry'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
