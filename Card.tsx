import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover = true, onClick }: CardProps) {
  return (
    <div className={cn('glass-card', !hover && 'hover:shadow-xl', className)} onClick={onClick}>
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  className,
}: {
  label: string
  value: string | number
  icon: ReactNode
  trend?: string
  className?: string
}) {
  return (
    <Card className={cn('flex items-start gap-4', className)}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-vault-500/20 to-indigo-500/20 text-vault-600 dark:text-vault-400">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        {trend && <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">{trend}</p>}
      </div>
    </Card>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-vault-500/10 text-vault-500">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/80', className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-vault-500 to-indigo-500 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function Badge({
  children,
  variant = 'default',
  className,
}: {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
}) {
  return (
    <span
      className={cn(
        'badge',
        variant === 'default' && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        variant === 'success' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        variant === 'warning' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
        variant === 'danger' && 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
        variant === 'info' && 'bg-vault-100 text-vault-700 dark:bg-vault-900/40 dark:text-vault-300',
        className,
      )}
    >
      {children}
    </span>
  )
}
