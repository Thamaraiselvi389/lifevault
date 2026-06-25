import {
  FileText,
  CheckSquare,
  BookOpen,
  Target,
  Mail,
  Trophy,
  Clock,
} from 'lucide-react'
import { useTimeline } from '@/hooks/useTimeline'
import { PageHeader } from '@/components/ui/LoadingSpinner'
import { Card, EmptyState } from '@/components/ui/Card'
import { formatDate, formatRelative } from '@/lib/utils'
import type { TimelineEventType } from '@/types/database'

const EVENT_CONFIG: Record<
  TimelineEventType,
  { icon: typeof FileText; color: string; label: string }
> = {
  document: { icon: FileText, color: 'bg-blue-500', label: 'Document' },
  task: { icon: CheckSquare, color: 'bg-emerald-500', label: 'Task' },
  diary: { icon: BookOpen, color: 'bg-purple-500', label: 'Diary' },
  goal: { icon: Target, color: 'bg-vault-500', label: 'Goal' },
  message: { icon: Mail, color: 'bg-amber-500', label: 'Message' },
  achievement: { icon: Trophy, color: 'bg-yellow-500', label: 'Achievement' },
}

export default function TimelinePage() {
  const { events } = useTimeline()

  const grouped = events.reduce<Record<string, typeof events>>((acc, event) => {
    const month = formatDate(event.date).slice(0, 8)
    if (!acc[month]) acc[month] = []
    acc[month].push(event)
    return acc
  }, {})

  return (
    <div>
      <PageHeader
        title="Life Timeline"
        subtitle="Your life's important moments — documents, achievements, and memories"
      />

      {events.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-8 w-8" />}
          title="Your timeline is empty"
          description="As you use LifeVault, your important moments will appear here chronologically."
        />
      ) : (
        <div className="relative">
          <div className="absolute left-6 top-0 h-full w-0.5 bg-gradient-to-b from-vault-500/50 to-transparent md:left-1/2 md:-translate-x-px" />

          {Object.entries(grouped).map(([month, monthEvents]) => (
            <div key={month} className="mb-12">
              <div className="mb-6 flex justify-center">
                <span className="glass rounded-full px-4 py-1.5 text-sm font-semibold text-vault-700 dark:text-vault-300">
                  {month}
                </span>
              </div>

              <div className="space-y-6">
                {monthEvents.map((event, i) => {
                  const config = EVENT_CONFIG[event.type]
                  const Icon = config.icon
                  const isLeft = i % 2 === 0

                  return (
                    <div
                      key={event.id}
                      className={`relative flex items-center gap-4 md:gap-0 ${
                        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      <div className={`hidden flex-1 md:block ${isLeft ? 'md:pr-8 md:text-right' : 'md:pl-8'}`}>
                        <Card className="inline-block !p-4 text-left">
                          <div className="mb-1 flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs text-white ${config.color}`}>
                              {config.label}
                            </span>
                            <span className="text-xs text-slate-400">{formatRelative(event.date)}</span>
                          </div>
                          <h3 className="font-semibold">{event.title}</h3>
                          {event.description && (
                            <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                          )}
                          <p className="mt-1 text-xs text-slate-400">{formatDate(event.date)}</p>
                        </Card>
                      </div>

                      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-lg dark:bg-slate-800 md:absolute md:left-1/2 md:-translate-x-1/2">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${config.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>

                      <div className="flex-1 md:hidden">
                        <Card className="!p-4">
                          <div className="mb-1 flex items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-xs text-white ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                          <h3 className="font-semibold">{event.title}</h3>
                          {event.description && (
                            <p className="mt-1 text-sm text-slate-500">{event.description}</p>
                          )}
                        </Card>
                      </div>

                      <div className="hidden flex-1 md:block" />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
