'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, KeyRound, ShieldCheck, Zap } from 'lucide-react'
import { Magnetic, Reveal } from '@/components/marketing/anim'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Invalid or missing reset link. Please request a new one.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must be 8+ chars with uppercase and number')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        const message = data.error || 'Failed to reset password'
        setError(message === 'Invalid or expired reset link' ? 'This reset link is invalid or has expired. Please request a new one.' : message)
        return
      }

      router.push('/auth/signin?success=Password reset successfully. Sign in with your new password.')
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

            <p className="relative text-xs text-slate-400">Account security — one strong password, fully encrypted.</p>

            <div className="relative mt-10">
              <h2 className="text-5xl font-semibold leading-[1.05] tracking-tight">Almost back in</h2>

              <div className="mx-auto mt-10 flex w-full max-w-[280px] flex-col items-center rounded-[28px] border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800 p-6 text-center shadow-2xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/90 text-slate-900 shadow-lg">
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Done</p>
                <p className="mt-2 text-2xl font-semibold">Password saved</p>
                <p className="mt-3 text-sm text-slate-400">Sign in with your new password and get back to your invoices.</p>
              </div>
            </div>

            <div className="relative mt-10 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Security</p>
                <p className="mt-2 text-xl font-semibold">Encrypted</p>
                <p className="mt-1 text-xs text-slate-400">bcrypt + pepper hashing</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">One-time</p>
                <p className="mt-2 text-xl font-semibold">Single use</p>
                <p className="mt-1 text-xs text-slate-400">Token invalidated on reset</p>
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
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900">New password</h1>
              <p className="mt-2 text-sm text-slate-500">
                {email ? (
                  <>Set a new password for <span className="font-medium text-slate-900">{email}</span>.</>
                ) : (
                  <>Set a new password for your account.</>
                )}
              </p>
            </div>

            {!token ? (
              <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/80 p-6" role="alert">
                <p className="text-sm font-medium text-red-700">
                  This reset link is invalid or missing. Please request a new one.
                </p>
                <Link
                  href="/auth/forgot-password"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition duration-200 hover:text-slate-700"
                >
                  Request a new reset link
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
                  <label htmlFor="password" className="sr-only">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      className="w-full rounded-full border border-slate-200/80 bg-white px-5 py-3 pr-12 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      placeholder="New Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition duration-200 hover:text-slate-900"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 3l18 18" />
                          <path d="M10.5 10.5a2.5 2.5 0 0 0 3.5 3.5" />
                          <path d="M7 7c-2.5 1.5-4.5 4-5 5 1.3 2.2 4.8 6 10 6 1.3 0 2.6-.3 3.8-.8" />
                          <path d="M12 6c4.7 0 8.4 3 10 6-.6 1.1-1.7 2.8-3.2 4.2" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="mt-2 px-5 text-xs text-slate-500">8+ characters with uppercase and number</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="sr-only">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      className="w-full rounded-full border border-slate-200/80 bg-white px-5 py-3 pr-12 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition duration-200 hover:text-slate-900"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 3l18 18" />
                          <path d="M10.5 10.5a2.5 2.5 0 0 0 3.5 3.5" />
                          <path d="M7 7c-2.5 1.5-4.5 4-5 5 1.3 2.2 4.8 6 10 6 1.3 0 2.6-.3 3.8-.8" />
                          <path d="M12 6c4.7 0 8.4 3 10 6-.6 1.1-1.7 2.8-3.2 4.2" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <Magnetic strength={5}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition duration-200 hover:bg-slate-800 disabled:opacity-60"
                  >
                    <KeyRound className="h-4 w-4" aria-hidden />
                    {isLoading ? 'Resetting...' : 'Reset password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
