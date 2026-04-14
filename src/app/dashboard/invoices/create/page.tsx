'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateInvoicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invoiceNo, setInvoiceNo] = useState('')
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNo,
          clientName,
          clientEmail,
          clientPhone,
          amount: parseFloat(amount),
          description,
          issueDate: new Date(issueDate),
          dueDate: new Date(dueDate),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create invoice')
      }

      router.push('/dashboard/invoices')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-md shadow-slate-200/60 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your Invoice Workspace</p>
          <h1 className="text-3xl font-semibold text-slate-900">Create Invoice</h1>
          <p className="text-sm text-slate-600">
            Create a new invoice for your client
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Draft invoice
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-md">
          <div className="flex flex-col gap-6 border-b border-slate-200/70 pb-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Invoice</p>
              <h2 className="text-2xl font-semibold text-slate-900">Invoice Details</h2>
              <p className="text-sm text-slate-600">Share the who and when for this invoice.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Invoice No</label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  placeholder="INV-001"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-8 pt-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Bill To</p>
                <h3 className="text-xl font-semibold text-slate-900 mt-2">Client Details</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Client Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Client Email</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Client Phone</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter invoice description or notes..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-6 shadow-inner">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Summary</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">Invoice Total</h3>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000.00"
                    step="0.01"
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                  />
                </div>
                <div className="rounded-xl border border-emerald-200/60 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Total Due</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {amount ? `$${Number(amount).toFixed(2)}` : '$0.00'}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Taxes and fees are not included.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Ready to send?</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/invoices"
              className="rounded-lg border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-linear-to-r from-slate-900 to-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:from-slate-800 hover:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
