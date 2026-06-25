import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  BookOpen,
  Target,
  Mail,
  HeartPulse,
  BarChart3,
  Clock,
  Search,
  Shield,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents', icon: FileText, label: 'Document Vault' },
  { to: '/tasks', icon: CheckSquare, label: 'To-Do Manager' },
  { to: '/diary', icon: BookOpen, label: 'Personal Diary' },
  { to: '/goals', icon: Target, label: 'Goal Tracker' },
  { to: '/messages', icon: Mail, label: 'Future Messages' },
  { to: '/emergency', icon: HeartPulse, label: 'Emergency Profile' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/timeline', icon: Clock, label: 'Life Timeline' },
  { to: '/search', icon: Search, label: 'Global Search' },
]

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavContent = () => (
    <>
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-vault-600 to-indigo-600 shadow-lg shadow-vault-500/30">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">LifeVault</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Your digital life hub</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn('nav-link', isActive && 'nav-link-active')}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t border-white/20 pt-4 dark:border-white/10">
        <div className="flex items-center gap-3 rounded-xl px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-vault-500 to-indigo-500 text-xs font-bold text-white">
            {getInitials(profile?.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
              {profile?.full_name || 'User'}
            </p>
          </div>
        </div>
        <button onClick={toggleTheme} className="nav-link w-full">
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button onClick={() => signOut()} className="nav-link w-full text-red-500 hover:text-red-600">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      <button
        className="fixed left-4 top-4 z-40 rounded-xl glass p-2 lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="glass absolute left-0 top-0 flex h-full w-72 flex-col p-4">
            <button className="mb-4 self-end rounded-lg p-1" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      <aside className="glass hidden h-screen w-64 shrink-0 flex-col p-4 lg:fixed lg:flex">
        <NavContent />
      </aside>
    </>
  )
}
