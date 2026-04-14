'use client'

import { useState } from 'react'

interface SettingsFormProps {
  userEmail: string
  hasPassword: boolean
}

export default function SettingsForm({ userEmail, hasPassword }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setIsLoading(true)

    // Validation
    if (!formData.newPassword) {
      setMessage({ type: 'error', text: 'New password is required' })
      setIsLoading(false)
      return
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      setIsLoading(false)
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      setIsLoading(false)
      return
    }

    // If user already has a password, they must provide current password
    if (hasPassword && !formData.currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required' })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: formData.newPassword,
          currentPassword: formData.currentPassword || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update password' })
        return
      }

      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {message && (
        <div
          className={`rounded-2xl border p-4 ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50/80 text-emerald-800'
              : 'border-red-200 bg-red-50/80 text-red-800'
          }`}
        >
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {hasPassword && (
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700">
            Current Password
          </label>
          <div className="relative mt-2">
            <input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? 'text' : 'password'}
              required
              className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 pr-11 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={handleChange}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
              aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
            >
              {showCurrentPassword ? (
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
      )}

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
          {hasPassword ? 'New Password' : 'Set Password'}
        </label>
        <div className="relative mt-2">
          <input
            id="newPassword"
            name="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            required
            className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 pr-11 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={handleChange}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
          >
            {showNewPassword ? (
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
        <p className="mt-2 text-xs text-slate-500">At least 8 characters</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
          Confirm Password
        </label>
        <div className="relative mt-2">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            required
            className="w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 pr-11 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/25 transition hover:bg-slate-800 disabled:opacity-60"
      >
        {isLoading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  )
}
