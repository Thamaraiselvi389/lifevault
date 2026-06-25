import { useState } from 'react'
import { Search, FileText, CheckSquare, Target, BookOpen, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGlobalSearch } from '@/hooks/useTimeline'
import { PageHeader } from '@/components/ui/LoadingSpinner'
import { Card, EmptyState } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'

const TYPE_CONFIG = {
  document: { icon: FileText, color: 'text-blue-500', label: 'Document' },
  task: { icon: CheckSquare, color: 'text-emerald-500', label: 'Task' },
  goal: { icon: Target, color: 'text-vault-500', label: 'Goal' },
  diary: { icon: BookOpen, color: 'text-purple-500', label: 'Diary' },
  message: { icon: Mail, color: 'text-amber-500', label: 'Message' },
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const results = useGlobalSearch(query)

  return (
    <div>
      <PageHeader
        title="Global Search"
        subtitle="Search across documents, tasks, goals, diary entries, and messages"
      />

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          className="glass-input py-4 pl-12 text-base"
          placeholder="Search your entire vault..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {!query.trim() ? (
        <Card className="text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p className="text-slate-500">Start typing to search across all your LifeVault data</p>
        </Card>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<Search className="h-8 w-8" />}
          title="No results found"
          description={`Nothing matched "${query}". Try different keywords.`}
        />
      ) : (
        <div className="space-y-2">
          <p className="mb-4 text-sm text-slate-500">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          {results.map((result) => {
            const config = TYPE_CONFIG[result.type]
            const Icon = config.icon
            return (
              <Link key={`${result.type}-${result.id}`} to={result.href}>
                <Card className="flex items-center gap-4 !p-4 transition hover:scale-[1.01]">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-medium">{result.title}</h3>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{result.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{formatDate(result.date)}</span>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
