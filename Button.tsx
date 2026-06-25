import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        variant === 'primary' && 'btn-primary',
        variant === 'secondary' && 'btn-secondary',
        variant === 'ghost' && 'btn-ghost',
        variant === 'danger' &&
          'inline-flex items-center justify-center gap-2 rounded-xl bg-red-500/90 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'lg' && 'px-6 py-3 text-base',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
