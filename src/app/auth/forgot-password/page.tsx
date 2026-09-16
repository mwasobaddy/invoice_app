'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, KeyRound, Send, ShieldCheck, Zap } from 'lucide-react'
import { Magnetic, Reveal } from '@/components/marketing/anim'

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-8 sm:px-6">
      {/* blurred backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-blob-slow absolute -top-24 -left-24 h-96 w-96 rounded-full bg-lime-200/60 blur-3xl" />
        <div className="animate-blob-slow-reverse absolute -right-32 -bottom-24 h-[28rem] w-[28rem] rounded-full bg-slate-300/50 blur-3xl" />
      </div>

      <Reveal className="relative w-full max-w-5xl">
        {/* single split container — brand half + form half */}
        <div className="grid overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-slate-900/20 lg:grid-cols-2">
          {/* LEFT — brand half */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 text-white lg:flex">
            <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#1e3a8a_0%,transparent_50%),radial-gradient(circle_at_80%_10%,#0f172a_0%,transparent_55%),radial-gradient(circle_at_70%_80%,#1f2937_0%,transparent_50%)]" />
            <div aria-hidden className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.25) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

            <p className="relative text-xs text-slate-400">Account security — one secure link, back in minutes.</p>

            <div className="relative mt-10">
              <h2 className="text-5xl font-semibold leading-[1.05] tracking-tight">Locked out? Let&apos;s fix that</h2>

              <div className="mx-auto mt-10 flex w-full max-w-[280px] flex-col items-center rounded-[28px] border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800 p-6 text-center shadow-2xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300/90 text-slate-900 shadow-lg">
                  <KeyRound className="h-7 w-7" aria-hidden />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Password reset</p>
                <p className="mt-2 text-2xl font-semibold">Secure link sent</p>
                <div className="mt-6 w-full space-y-3 text-left">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-300/90 text-xs font-bold text-slate-900">1</span>
                    Check your inbox
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">2</span>
                    Choose a new password
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">3</span>
                    Sign in and get back to work
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Link validity</p>
                <p className="mt-2 text-xl font-semibold">1 hour</p>
                <p className="mt-1 text-xs text-slate-400">Single-use token</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Security</p>
                <p className="mt-2 text-xl font-semibold">Encrypted</p>
                <p className="mt-1 text-xs text-slate-400">bcrypt + pepper</p>
              </div>
            </div>
          </div>

          {/* RIGHT — form half */}
          <div className="flex flex-col bg-white p-8 sm:p-12">
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <FileText className="h-4 w-4" aria-hidden />
                </span>
                Invoice Atlas
              </Link>
              <Link href="/auth/signin" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900">
                Sign In
              </Link>
            </div>

            <div className="mt-10">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">Reset password</h1>
              <p className="mt-2 text-sm text-slate-500">Enter your account email — we&apos;ll send a secure reset link.</p>
            </div>

            {sent ? (
              <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6" role="status">
                <p className="text-sm font-medium text-emerald-700">
                  If an account exists for {email}, a password reset link has been sent. Check your inbox — it expires in 1 hour.
                </p>
                <Link
                  href="/auth/signin"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition duration-200 hover:text-slate-700"
                >
                  Back to sign in
                  <span aria-hidden>&rarr;</span>
                </Link>
              </div>
            ) : (
              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4" role="alert">
                    <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full rounded-full border border-slate-200/80 bg-white px-5 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    placeholder="Email or Username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="mt-2 px-5 text-xs text-slate-500">We&apos;ll email you a secure link to choose a new password.</p>
                </div>

                <Magnetic strength={5}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition duration-200 hover:bg-slate-800 disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" aria-hidden />
                    {isLoading ? 'Sending link...' : 'Send reset link'}
                  </button>
                </Magnetic>
              </form>
            )}

            <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6 text-xs text-slate-500">
              <span className="inline-flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-slate-400" aria-hidden /> Secure by design
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-slate-400" aria-hidden /> Free to start
                </span>
              </span>
              <Link href="/" className="inline-flex items-center gap-1 font-medium transition duration-200 hover:text-slate-900">
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to home
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  )
}
