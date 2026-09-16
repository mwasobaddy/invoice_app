'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, KeyRound, ShieldCheck, Zap } from 'lucide-react'
import { Magnetic, Reveal, Tilt } from '@/components/marketing/anim'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data.error || 'Failed to send reset link')
        return
      }

      setSent(true)
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-10 sm:px-8">
      {/* ambient brand blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-blob-slow absolute -top-24 -left-24 h-96 w-96 rounded-full bg-lime-200/50 blur-3xl" />
        <div className="animate-blob-slow-reverse absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-slate-300/40 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <Reveal y={12}>
          <Link href="/" className="inline-flex items-center gap-3 rounded-2xl px-2 py-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            Invoice Atlas
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to home
            </span>
          </Link>
        </Reveal>

        <div className="mt-6 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <Reveal>
          <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Invoice Atlas</p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">Reset your password</h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter the email associated with your account and we&apos;ll send you a reset link. Trading it in?{' '}
              <Link href="/auth/signin" className="font-semibold text-slate-900 hover:text-slate-700">
                back to sign in
              </Link>
            </p>
          </div>

          {sent ? (
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6" role="status">
              <p className="text-sm font-medium text-emerald-700">
                If an account exists for {email}, a password reset link has been sent. Check your inbox — it expires in 1 hour.
              </p>
              <Link
                href="/auth/signin"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-700"
              >
                Back to sign in
                <span aria-hidden>&rarr;</span>
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4" role="alert">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <p className="text-xs text-slate-500">
                  We&apos;ll email you a secure link to choose a new password.
                </p>
              </div>

              <Magnetic strength={5}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {isLoading ? 'Sending link...' : 'Send reset link'}
                </button>
              </Magnetic>
            </form>
          )}

          <div className="mt-6 flex items-center justify-center gap-5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-slate-400" aria-hidden /> Secure by design
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-slate-400" aria-hidden /> Free to start
            </span>
          </div>
          </div>
          </Reveal>

          <Reveal delay={0.12} y={36}>
          <Tilt className="relative hidden min-h-[520px] lg:block">
          <div className="relative min-h-[520px] overflow-hidden rounded-[32px] bg-slate-950 text-white shadow-2xl shadow-slate-900/40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#1e3a8a_0%,transparent_50%),radial-gradient(circle_at_80%_10%,#0f172a_0%,transparent_55%),radial-gradient(circle_at_70%_80%,#1f2937_0%,transparent_50%)]" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.25) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          <div className="relative flex h-full flex-col justify-between p-10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">Osmo</p>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="h-2 w-2 rounded-full bg-lime-400" />
                Account security
              </div>
            </div>

            <div className="relative mx-auto flex h-[360px] w-[300px] flex-col items-center justify-center rounded-[28px] border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800 p-6 shadow-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300/90 text-slate-900 shadow-lg">
                <KeyRound className="h-7 w-7" aria-hidden />
              </div>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Password reset</p>
              <p className="mt-2 text-center text-2xl font-semibold">Secure link sent</p>
              <div className="mt-8 w-full space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-lime-300/90 text-xs font-bold text-slate-900">1</span>
                  Check your inbox
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">2</span>
                  Choose a new password
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">3</span>
                  Sign in and get back to work
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Link validity</p>
                <p className="mt-2 text-xl font-semibold">1 hour</p>
                <p className="mt-2 text-xs text-slate-400">Single-use token</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Security</p>
                <p className="mt-2 text-xl font-semibold">Encrypted</p>
                <p className="mt-2 text-xs text-slate-400">bcrypt + pepper</p>
              </div>
            </div>
          </div>
          </div>
          </Tilt>
          </Reveal>
        </div>
      </div>
    </div>
  )
}