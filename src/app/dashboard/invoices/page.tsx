'use client'

import { useEffect, useMemo, useState } from 'react'

interface InvoiceStats {
  totalAmount: number
  totalInvoices: number
  pendingAmount: number
  pendingInvoices: number
  paidAmount: number
  paidInvoices: number
}

interface InvoiceRow {
  id: string
  invoiceNo: string
  clientName: string
  amount: number
  status: string
  issueDate: string
  dueDate: string
  createdAt: string
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US')
}

export default function InvoicesPage() {
  const [stats, setStats] = useState<InvoiceStats>({
    totalAmount: 0,
    totalInvoices: 0,
    pendingAmount: 0,
    pendingInvoices: 0,
    paidAmount: 0,
    paidInvoices: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [items, setItems] = useState<InvoiceRow[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    clientName: '',
    amount: '',
    status: 'draft',
    issueDate: '',
    dueDate: '',
  })

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/invoices/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  useEffect(() => {
    const fetchList = async () => {
      try {
        setListLoading(true)
        setListError(null)
        const response = await fetch(`/api/invoices?page=${page}&limit=${pageSize}`)
        if (!response.ok) throw new Error('Failed to fetch invoices')
        const data = await response.json()

        if (Array.isArray(data)) {
          setItems(data)
          setTotal(data.length)
        } else {
          setItems(data.items || [])
          setTotal(data.total || 0)
        }
      } catch (err) {
        setListError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setListLoading(false)
      }
    }

    fetchList()
  }, [page])

  const startEdit = (invoice: InvoiceRow) => {
    setEditingId(invoice.id)
    setEditForm({
      clientName: invoice.clientName,
      amount: invoice.amount.toString(),
      status: invoice.status,
      issueDate: invoice.issueDate.split('T')[0],
      dueDate: invoice.dueDate.split('T')[0],
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: editForm.clientName,
          amount: parseFloat(editForm.amount),
          status: editForm.status,
          issueDate: editForm.issueDate,
          dueDate: editForm.dueDate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update invoice')
      }

      setEditingId(null)
      const refreshed = await fetch(`/api/invoices?page=${page}&limit=${pageSize}`)
      const data = await refreshed.json()
      if (Array.isArray(data)) {
        setItems(data)
        setTotal(data.length)
      } else {
        setItems(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to update invoice')
    }
  }

  const deleteInvoice = async (invoiceId: string) => {
    if (!window.confirm('Delete this invoice? This cannot be undone.')) return

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete invoice')
      }

      const nextPage = items.length === 1 && page > 1 ? page - 1 : page
      setPage(nextPage)
      const refreshed = await fetch(`/api/invoices?page=${nextPage}&limit=${pageSize}`)
      const data = await refreshed.json()
      if (Array.isArray(data)) {
        setItems(data)
        setTotal(data.length)
      } else {
        setItems(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to delete invoice')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-semibold">Error loading invoice data</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your Invoice Workspace</p>
        <h1 className="text-3xl font-semibold text-slate-900">Workspace</h1>
        <p className="text-sm text-slate-600">
          Manage and track all your invoices in one place
        </p>
      </header>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-slate-600 font-medium">Total Amount</p>
              <p className="text-4xl font-bold text-slate-900">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-sm text-slate-600">Total Invoices</span>
              <span className="text-2xl font-semibold text-emerald-600">{stats.totalInvoices}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/50 bg-linear-to-br from-amber-50 to-yellow-50 p-8 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-amber-700 font-medium">Pending Amount</p>
              <p className="text-4xl font-bold text-amber-900">{formatCurrency(stats.pendingAmount)}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-amber-100">
              <span className="text-sm text-amber-700">Pending Invoices</span>
              <span className="text-2xl font-semibold text-amber-600">{stats.pendingInvoices}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200/50 bg-linear-to-br from-emerald-50 to-teal-50 p-8 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-emerald-700 font-medium">Paid Amount</p>
              <p className="text-4xl font-bold text-emerald-900">{formatCurrency(stats.paidAmount)}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-emerald-100">
              <span className="text-sm text-emerald-700">Paid Invoices</span>
              <span className="text-2xl font-semibold text-emerald-600">{stats.paidInvoices}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-md">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent Invoices</h2>
            <p className="text-sm text-slate-500">Showing the latest invoices (10 per page).</p>
          </div>
          <div className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </div>
        </div>

        {listError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {listError}
          </div>
        )}

        {listLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
          </div>
        ) : items.length === 0 ? (
          <p className="text-slate-600 text-center py-12">No invoices yet. Create your first invoice.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="pb-3 font-semibold">Invoice</th>
                  <th className="pb-3 font-semibold">Client</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Issue Date</th>
                  <th className="pb-3 font-semibold">Due Date</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((invoice) => {
                  const isEditing = editingId === invoice.id
                  return (
                    <tr key={invoice.id} className="text-slate-700">
                      <td className="py-3 font-semibold text-slate-900">{invoice.invoiceNo}</td>
                      <td className="py-3">
                        {isEditing ? (
                          <input
                            className="w-40 rounded-md border border-slate-200 px-2 py-1"
                            value={editForm.clientName}
                            onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
                          />
                        ) : (
                          invoice.clientName
                        )}
                      </td>
                      <td className="py-3">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-28 rounded-md border border-slate-200 px-2 py-1"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                          />
                        ) : (
                          formatCurrency(invoice.amount)
                        )}
                      </td>
                      <td className="py-3">
                        {isEditing ? (
                          <select
                            className="rounded-md border border-slate-200 px-2 py-1"
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          >
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                            {invoice.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {isEditing ? (
                          <input
                            type="date"
                            className="rounded-md border border-slate-200 px-2 py-1"
                            value={editForm.issueDate}
                            onChange={(e) => setEditForm({ ...editForm, issueDate: e.target.value })}
                          />
                        ) : (
                          formatDate(invoice.issueDate)
                        )}
                      </td>
                      <td className="py-3">
                        {isEditing ? (
                          <input
                            type="date"
                            className="rounded-md border border-slate-200 px-2 py-1"
                            value={editForm.dueDate}
                            onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                          />
                        ) : (
                          formatDate(invoice.dueDate)
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(invoice.id)}
                              className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(invoice)}
                              className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteInvoice(invoice.id)}
                              className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm">
          <p className="text-slate-500">Total {total} invoices</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="rounded-md border border-slate-200 px-3 py-1 text-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="rounded-md border border-slate-200 px-3 py-1 text-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
