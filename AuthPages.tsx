import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) toast.error(error)
    else toast.success('Welcome back!')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-vault-400/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />
      </div>

      <div className="glass relative w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-vault-600 to-indigo-600 shadow-lg">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome to LifeVault</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to access your personal life hub</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-vault-600 hover:underline dark:text-vault-400">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-vault-600 hover:underline dark:text-vault-400">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export function SignUpPage() {
  const { signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    setLoading(false)
    if (error) toast.error(error)
    else toast.success('Account created! Check your email to verify.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass relative w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-vault-600 to-indigo-600">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Create your vault</h1>
          <p className="mt-2 text-sm text-slate-500">Start organizing your life securely</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-vault-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) toast.error(error)
    else {
      setSent(true)
      toast.success('Reset link sent!')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-3xl p-8 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Mail className="h-6 w-6 text-vault-600" />
          <h1 className="text-xl font-bold">Reset password</h1>
        </div>

        {sent ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Check your email for a password reset link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        )}

        <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm text-vault-600 hover:underline">
          <Lock className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    </div>
  )
}
