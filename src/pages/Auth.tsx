import { useState } from 'react'
import type { FormEvent } from 'react'
import { Wallet, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function AuthPage() {
  const { signIn, signUp, loading } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')

    const result =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp(name, email, password)

    if (result.error) setError(result.error)
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login')
    setError('')
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-lg shadow-teal-900/20">
            <Wallet className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold">Money Copilot</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Your personal student money OS
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 sm:p-8 shadow-xl">
          <div className="mb-6 flex rounded-xl bg-[var(--color-bg)] p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError('') }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === 'login' ? 'bg-white shadow-sm text-[var(--color-ink)] dark:bg-white/10' : 'text-[var(--color-ink-muted)]'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError('') }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === 'signup' ? 'bg-white shadow-sm text-[var(--color-ink)] dark:bg-white/10' : 'text-[var(--color-ink-muted)]'}`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="mb-1.5 block text-sm font-medium">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className="w-full h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:ring-2 focus:ring-teal-600/20"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:ring-2 focus:ring-teal-600/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="w-full h-11 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 pr-11 text-sm outline-none focus:ring-2 focus:ring-teal-600/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-teal-700 text-white text-sm font-semibold transition hover:bg-teal-800 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {mode === 'login' ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-[var(--color-ink-muted)]">
            Your account and Money Copilot data stay on this browser/device.
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-[var(--color-ink-muted)]">
          Local-only mode • No email verification required
        </p>
      </div>
    </div>
  )
}
