'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, ShieldCheck, Zap } from 'lucide-react'
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
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-10 sm:px-8">
      {/* ambient brand blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-blob-slow absolute -top-24 -left-24 h-96 w-96 rounded-full bg-lime-200/50 blur-3xl" />
        <div className="animate-blob-slow-reverse absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-slate-300/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <Reveal>
          <div className="w-full max-w-lg rounded-3xl border border-slate-200/70 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-2.5 text-sm font-semibold text-slate-700 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                Invoice Atlas
              </Link>
              <Link href="/auth/signin" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
                Sign In
              </Link>
            </div>

            <div className="mt-10">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">Forgot Password</h1>
              <p className="mt-3 text-sm text-slate-500">
                Enter your email and we&apos;ll send you a reset link.{' '}
                <Link href="/auth/signin" className="font-semibold text-slate-900 hover:text-slate-700">
                  Back to sign in
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
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4" role="alert">
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
                    placeholder="you@example.com"
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
                  className="w-full rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-400/25 transition hover:from-lime-500 hover:to-emerald-600 disabled:opacity-60"
                >
                  {isLoading ? 'Sending link...' : 'Send Reset Link'}
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
      </div>
    </div>
  )
}