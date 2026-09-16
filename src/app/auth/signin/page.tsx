'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FileText, ShieldCheck, Zap } from 'lucide-react'
import { Magnetic, Reveal, Tilt } from '@/components/marketing/anim'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          const url = result.url ? new URL(result.url, window.location.origin) : null
          const code = url?.searchParams.get('code')

          if (code === 'oauth_no_password') {
            setError('This account was created with Google. Sign in with Google, then set a password in Settings if you want email login.')
          } else {
            setError('Invalid email or password')
          }
        } else if (result.error === 'Configuration') {
          setError('Authentication is not configured correctly. Please try again or sign in with Google.')
        } else {
          setError(result.error)
        }
      } else if (result?.ok) {
        router.push('/dashboard')
      }
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
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <Reveal>
          <div className="rounded-3xl border border-slate-200/70 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex items-center gap-2.5 text-sm font-semibold text-slate-700 transition hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <FileText className="h-5 w-5" aria-hidden />
              </span>
              Invoice Atlas
            </Link>
            <Link href="/auth/signup" className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
              Sign Up
            </Link>
          </div>

          <div className="mt-10">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Sign In</h1>
            <p className="mt-3 text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-semibold text-slate-900 hover:text-slate-700">
                Create one
              </Link>
            </p>
          </div>

          <button
            type="button"
            onClick={() => signIn('google', { redirect: true, callbackUrl: '/dashboard' })}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            Continue with Google
          </button>

          <div className="relative mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.3em] text-slate-400">
              <span className="bg-white px-3">Or sign in with email</span>
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4" role="status">
                <p className="text-sm font-medium text-emerald-700">{success}</p>
              </div>
            )}
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
              <div>
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-900 shadow-sm transition focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-500/20"
                    placeholder="Enter your password"
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
                <div className="mt-2 flex justify-end">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-lime-600 transition hover:text-lime-700"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            </div>

            <Magnetic strength={5}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-lime-400 to-emerald-500 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-lime-400/25 transition hover:from-lime-500 hover:to-emerald-600 disabled:opacity-60"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </Magnetic>
          </form>

          <div className="mt-6 flex items-center justify-center gap-5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-slate-400" aria-hidden /> Secure by design
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-slate-400" aria-hidden /> SSO with Google
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
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Live metrics
              </div>
            </div>

            <div className="relative mx-auto flex h-[360px] w-[260px] flex-col items-center justify-between rounded-[28px] border border-slate-700/60 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800 p-6 shadow-2xl">
              <div className="flex w-full items-center justify-between text-xs text-slate-300">
                <span>Dashboard</span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px] uppercase tracking-widest">Osmo</span>
              </div>
              <div className="mt-6 w-full rounded-2xl bg-lime-300/90 p-4 text-slate-900 shadow-lg">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-700">Revenue</p>
                <p className="mt-2 text-2xl font-semibold">$62,746</p>
                <p className="mt-2 text-xs text-slate-700">+12% vs last month</p>
              </div>
              <div className="mt-6 grid w-full grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-3">
                  <p className="text-xs text-slate-400">Invoices</p>
                  <p className="mt-2 text-lg font-semibold">120</p>
                </div>
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-3">
                  <p className="text-xs text-slate-400">Paid</p>
                  <p className="mt-2 text-lg font-semibold">86%</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Sales</p>
                <p className="mt-2 text-xl font-semibold">$35,647</p>
                <p className="mt-2 text-xs text-slate-400">+4% this week</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Total Income</p>
                <p className="mt-2 text-xl font-semibold">$12,924</p>
                <p className="mt-2 text-xs text-slate-400">USD</p>
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

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  )
}
