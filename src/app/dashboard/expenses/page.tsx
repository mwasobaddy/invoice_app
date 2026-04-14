'use client'

import { useEffect, useMemo, useState } from 'react'

interface ExpenseStats {
  totalExpenses: number
  totalAmount: number
  averageExpense: number
  activeBudgets: number
  expensesThisMonth: number
  amountThisMonth: number
}

interface ExpenseRow {
  id: string
  description: string
  amount: number
  category: string
  date: string
  budget?: { id: string; name: string } | null
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

const categoryOptions = [
  'food',
  'transportation',
  'utilities',
  'entertainment',
  'office',
  'travel',
  'healthcare',
  'other',
]

export default function ExpensesPage() {
  const [stats, setStats] = useState<ExpenseStats>({
    totalExpenses: 0,
    totalAmount: 0,
    averageExpense: 0,
    activeBudgets: 0,
    expensesThisMonth: 0,
    amountThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [items, setItems] = useState<ExpenseRow[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    description: '',
    amount: '',
    category: 'other',
    date: '',
  })

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/expenses/stats')
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
        const response = await fetch(`/api/expenses?page=${page}&limit=${pageSize}`)
        if (!response.ok) throw new Error('Failed to fetch expenses')
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

  const startEdit = (expense: ExpenseRow) => {
    setEditingId(expense.id)
    setEditForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date.split('T')[0],
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: editForm.description,
          amount: parseFloat(editForm.amount),
          category: editForm.category,
          date: editForm.date,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update expense')
      }

      setEditingId(null)
      const refreshed = await fetch(`/api/expenses?page=${page}&limit=${pageSize}`)
      const data = await refreshed.json()
      if (Array.isArray(data)) {
        setItems(data)
        setTotal(data.length)
      } else {
        setItems(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to update expense')
    }
  }

  const deleteExpense = async (expenseId: string) => {
    if (!window.confirm('Delete this expense? This cannot be undone.')) return

    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete expense')
      }

      const nextPage = items.length === 1 && page > 1 ? page - 1 : page
      setPage(nextPage)
      const refreshed = await fetch(`/api/expenses?page=${nextPage}&limit=${pageSize}`)
      const data = await refreshed.json()
      if (Array.isArray(data)) {
        setItems(data)
        setTotal(data.length)
      } else {
        setItems(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to delete expense')
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
        <p className="font-semibold">Error loading expense data</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your Expense Workspace</p>
        <h1 className="text-3xl font-semibold text-slate-900">Workspace</h1>
        <p className="text-sm text-slate-600">
          Manage and track all your expenses in one place
        </p>
      </header>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-slate-600 font-medium">Total Expenses</p>
              <p className="text-4xl font-bold text-slate-900">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-sm text-slate-600">Total Records</span>
              <span className="text-2xl font-semibold text-slate-600">{stats.totalExpenses}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-200/50 bg-linear-to-br from-purple-50 to-indigo-50 p-8 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-purple-700 font-medium">Average Expense</p>
              <p className="text-4xl font-bold text-purple-900">{formatCurrency(stats.averageExpense)}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-purple-100">
              <span className="text-sm text-purple-700">Active Budgets</span>
              <span className="text-2xl font-semibold text-purple-600">{stats.activeBudgets}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200/50 bg-linear-to-br from-rose-50 to-pink-50 p-8 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-rose-700 font-medium">This Month</p>
              <p className="text-4xl font-bold text-rose-900">{formatCurrency(stats.amountThisMonth)}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-rose-100">
              <span className="text-sm text-rose-700">Expenses</span>
              <span className="text-2xl font-semibold text-rose-600">{stats.expensesThisMonth}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-md">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent Expenses</h2>
            <p className="text-sm text-slate-500">Showing the latest expenses (10 per page).</p>
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
          <p className="text-slate-600 text-center py-12">No expenses yet. Add your first expense.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Budget</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((expense) => {
                  const isEditing = editingId === expense.id
                  return (
                    <tr key={expense.id} className="text-slate-700">
                      <td className="py-3 font-semibold text-slate-900">
                        {isEditing ? (
                          <input
                            className="w-48 rounded-md border border-slate-200 px-2 py-1"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          />
                        ) : (
                          expense.description
                        )}
                      </td>
                      <td className="py-3">
                        {isEditing ? (
                          <select
                            className="rounded-md border border-slate-200 px-2 py-1"
                            value={editForm.category}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          >
                            {categoryOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                            {expense.category}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-600">
                        {expense.budget?.name || '—'}
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
                          formatCurrency(expense.amount)
                        )}
                      </td>
                      <td className="py-3">
                        {isEditing ? (
                          <input
                            type="date"
                            className="rounded-md border border-slate-200 px-2 py-1"
                            value={editForm.date}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          />
                        ) : (
                          formatDate(expense.date)
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(expense.id)}
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
                              onClick={() => startEdit(expense)}
                              className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteExpense(expense.id)}
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
          <p className="text-slate-500">Total {total} expenses</p>
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
