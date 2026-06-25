import { useMemo, useState } from 'react'
import { FileText, Upload, Download, Trash2, Search, FolderOpen } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/useSupabase'
import { supabase, DOCUMENTS_BUCKET } from '@/lib/supabase'
import { PageHeader, LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Card, EmptyState, Badge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { formatDate, formatFileSize } from '@/lib/utils'
import type { Document, DocumentCategory } from '@/types/database'
import toast from 'react-hot-toast'

const CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'education', label: 'Education' },
  { value: 'medical', label: 'Medical' },
  { value: 'finance', label: 'Finance' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'identity', label: 'Identity' },
  { value: 'personal', label: 'Personal' },
]

export default function DocumentsPage() {
  const { user } = useAuth()
  const { data: documents, loading, refetch } = useSupabaseQuery<Document>('documents', '*', {
    column: 'created_at',
    ascending: false,
  })
  const { insert, remove } = useSupabaseMutation('documents')

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'personal' as DocumentCategory,
    file: null as File | null,
  })

  const filtered = useMemo(() => {
    return documents.filter((d) => {
      const matchSearch =
        !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.description?.toLowerCase().includes(search.toLowerCase())
      const matchCat = categoryFilter === 'all' || d.category === categoryFilter
      return matchSearch && matchCat
    })
  }, [documents, search, categoryFilter])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !form.file) return
    setUploading(true)

    const filePath = `${user.id}/${Date.now()}-${form.file.name}`
    const { error: uploadError } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(filePath, form.file)

    if (uploadError) {
      toast.error(uploadError.message)
      setUploading(false)
      return
    }

    const { error } = await insert({
      title: form.title || form.file.name,
      description: form.description || null,
      category: form.category,
      file_path: filePath,
      file_name: form.file.name,
      file_size: form.file.size,
      mime_type: form.file.type,
      tags: [],
    })

    setUploading(false)
    if (!error) {
      toast.success('Document uploaded!')
      setModalOpen(false)
      setForm({ title: '', description: '', category: 'personal', file: null })
      refetch()
    }
  }

  const handleDownload = async (doc: Document) => {
    if (!doc.file_path) return
    const { data, error } = await supabase.storage.from(DOCUMENTS_BUCKET).download(doc.file_path)
    if (error) {
      toast.error(error.message)
      return
    }
    const url = URL.createObjectURL(data)
    const a = document.createElement('a')
    a.href = url
    a.download = doc.file_name || doc.title
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDelete = async (doc: Document) => {
    if (!confirm('Delete this document?')) return
    if (doc.file_path) {
      await supabase.storage.from(DOCUMENTS_BUCKET).remove([doc.file_path])
    }
    await remove(doc.id)
    toast.success('Document deleted')
    refetch()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader
        title="Document Vault"
        subtitle="Securely store and organize your important documents"
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Upload className="h-4 w-4" /> Upload
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="glass-input pl-10"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="glass-input w-full sm:w-48"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-8 w-8" />}
          title="No documents yet"
          description="Upload your first document to start building your secure vault."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Upload className="h-4 w-4" /> Upload document
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <Card key={doc.id}>
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vault-500/10">
                  <FileText className="h-5 w-5 text-vault-600" />
                </div>
                <Badge variant="info">{doc.category}</Badge>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{doc.title}</h3>
              {doc.description && (
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{doc.description}</p>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>{formatFileSize(doc.file_size)}</span>
                <span>{formatDate(doc.created_at)}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleDownload(doc)}>
                  <Download className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(doc)}>
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Upload document">
        <form onSubmit={handleUpload} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Document title"
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as DocumentCategory })}
            options={CATEGORIES}
          />
          <Input
            label="File"
            type="file"
            onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !form.file}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
