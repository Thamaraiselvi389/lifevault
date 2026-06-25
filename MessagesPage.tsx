import { useEffect, useState } from 'react'
import { Mail, Plus, Lock, Unlock, Clock, Trash2 } from 'lucide-react'
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/useSupabase'
import { supabase } from '@/lib/supabase'
import { PageHeader, LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, EmptyState, Badge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { formatDate, getDaysUntil } from '@/lib/utils'
import type { FutureMessage } from '@/types/database'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const { data: messages, loading, refetch } = useSupabaseQuery<FutureMessage>('future_messages', '*', {
    column: 'unlock_date',
    ascending: true,
  })
  const { insert, remove } = useSupabaseMutation('future_messages')

  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<FutureMessage | null>(null)
  const [form, setForm] = useState({ title: '', content: '', unlock_date: '' })

  useEffect(() => {
    supabase.rpc('unlock_due_messages' as never).then(() => refetch())
  }, [refetch])

  const locked = messages.filter((m) => !m.is_unlocked)
  const unlocked = messages.filter((m) => m.is_unlocked)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await insert({
      title: form.title,
      content: form.content,
      unlock_date: form.unlock_date,
    })
    if (!error) {
      toast.success('Message scheduled!')
      setModalOpen(false)
      setForm({ title: '', content: '', unlock_date: '' })
      refetch()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return
    await remove(id)
    toast.success('Message deleted')
    refetch()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title="Future Messages"
        subtitle="Write letters to your future self — they unlock on your chosen date"
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> New message
          </Button>
        }
      />

      {messages.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-8 w-8" />}
          title="No future messages"
          description="Write a letter to your future self and schedule when it unlocks."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> Write message
            </Button>
          }
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Lock className="h-4 w-4" /> Locked ({locked.length})
            </h2>
            <div className="space-y-3">
              {locked.map((msg) => {
                const days = getDaysUntil(msg.unlock_date)
                return (
                  <Card key={msg.id}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{msg.title}</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-vault-500" />
                          <Badge variant="info">
                            {days > 0 ? `${days} days left` : 'Unlocks today'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Unlocks {formatDate(msg.unlock_date)}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(msg.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </Card>
                )
              })}
              {locked.length === 0 && (
                <p className="text-sm text-slate-500">All messages have been unlocked!</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 font-semibold">
              <Unlock className="h-4 w-4 text-emerald-500" /> Unlocked ({unlocked.length})
            </h2>
            <div className="space-y-3">
              {unlocked.map((msg) => (
                <Card
                  key={msg.id}
                  className="cursor-pointer border-emerald-500/20"
                  onClick={() => setSelected(msg)}
                >
                  <Badge variant="success">Unlocked</Badge>
                  <h3 className="mt-2 font-semibold">{msg.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{msg.content}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Write to your future self" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Message" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={8} placeholder="Dear future me..." />
          <Input label="Unlock date" type="date" value={form.unlock_date} onChange={(e) => setForm({ ...form, unlock_date: e.target.value })} min={new Date().toISOString().split('T')[0]} required />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Schedule message</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title || ''} size="lg">
        {selected && (
          <div>
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{selected.content}</p>
            <p className="mt-4 text-xs text-slate-400">Unlocked {formatDate(selected.unlocked_at)}</p>
          </div>
        )}
      </Modal>
    </div>
  )
}
