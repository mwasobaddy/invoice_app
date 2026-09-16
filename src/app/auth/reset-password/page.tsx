'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FileText, ShieldCheck, Zap } from 'lucide-react'
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
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">Reset Password</h1>
              <p className="mt-3 text-sm text-slate-500">
                {email ? (
                  <>Set a new password for <span className="font-medium text-slate-900">{email}</span>.</>
                ) : (
                  <>Set a new password for your account.</>
                )}{' '}
                <Link href="/auth/signin" className="font-semibold text-slate-900 hover:text-slate-700">
                  Back to sign in
                </Link>
              </p>
            </div>

          {!token ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/80 p-6" role="alert">
              <p className="text-sm font-medium text-red-700">
                This reset link is invalid or missing. Please request a new one.
              </p>
              <Link
                href="/auth/forgot-password"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 hover:text-slate-700"
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

              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">
                    New Password
                  </label>
                  <div className="relative mt-2">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 shadow-sm transition focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
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
                  <p className="mt-2 text-xs text-slate-500">8+ characters with uppercase and number</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                    Confirm New Password
                  </label>
                  <div className="relative mt-2">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 shadow-sm transition focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 3l18 18" />
                          <path d="M10.5 10.5a2.5 2.5 0 0 0 3.5 3.5" />
                          <path d="M7 7c-2.5 1.5-4.5 4-5 5 1.3 2.2 4.8 6 10 6 1.3 0 2.6-.3 3.8-.8" />
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
              </div>

              <Magnetic strength={5}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-400/25 transition hover:from-lime-500 hover:to-emerald-600 disabled:opacity-60"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}