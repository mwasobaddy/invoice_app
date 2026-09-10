'use client'

import { useEffect, useMemo, useState } from 'react'

interface BudgetStats {
  totalBudget: number
  totalBudgets: number
  totalSpent: number
  totalRemaining: number
  budgetsOverspent: number
}

interface BudgetRow {
  id: string
  name: string
  limit: number
  period: string
  startDate: string
  endDate: string
  isActive: boolean
  expenses: Array<{ amount: number }>
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

export default function BudgetsPage() {
  const [stats, setStats] = useState<BudgetStats>({
    totalBudget: 0,
    totalBudgets: 0,
    totalSpent: 0,
    totalRemaining: 0,
    budgetsOverspent: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [items, setItems] = useState<BudgetRow[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    limit: '',
    period: 'monthly',
    isActive: true,
    startDate: '',
    endDate: '',
  })

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total])
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [chartData, setChartData] = useState<Array<{ month: string; amount: number }>>([])
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    items.forEach((b) => years.add(new Date(b.startDate).getFullYear()))
    years.add(new Date().getFullYear())
    return Array.from(years).sort((a, b) => b - a)
  }, [items])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/budgets/stats')
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
        const response = await fetch(`/api/budgets?page=${page}&limit=${pageSize}`)
        if (!response.ok) throw new Error('Failed to fetch budgets')
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

  useEffect(() => {
    const orgId = typeof window !== 'undefined' ? localStorage.getItem('currentOrgId') : null
    const qs = orgId ? `&orgId=${orgId}` : ''
    fetch(`/api/budgets?page=1&limit=100${qs}`)
      .then((r) => r.json())
      .then((data) => {
        const all: BudgetRow[] = Array.isArray(data) ? data : data.items || []
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        const buckets = months.map((m) => ({ month: m, amount: 0 }))
        all.forEach((b) => {
          const d = new Date(b.startDate)
          if (d.getFullYear() === selectedYear) buckets[d.getMonth()].amount += b.limit
        })
        setChartData(buckets)
      })
      .catch(() => {})
  }, [selectedYear, items.length])

  const startEdit = (budget: BudgetRow) => {
    setEditingId(budget.id)
    setEditForm({
      name: budget.name,
      limit: budget.limit.toString(),
      period: budget.period,
      isActive: budget.isActive,
      startDate: budget.startDate.split('T')[0],
      endDate: budget.endDate.split('T')[0],
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const saveEdit = async (budgetId: string) => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          limit: parseFloat(editForm.limit),
          period: editForm.period,
          isActive: editForm.isActive,
          startDate: editForm.startDate,
          endDate: editForm.endDate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update budget')
      }

      setEditingId(null)
      const refreshed = await fetch(`/api/budgets?page=${page}&limit=${pageSize}`)
      const data = await refreshed.json()
      if (Array.isArray(data)) {
        setItems(data)
        setTotal(data.length)
      } else {
        setItems(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to update budget')
    }
  }

  const deleteBudget = async (budgetId: string) => {
    if (!window.confirm('Delete this budget? This cannot be undone.')) return

    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete budget')
      }

      const nextPage = items.length === 1 && page > 1 ? page - 1 : page
      setPage(nextPage)
      const refreshed = await fetch(`/api/budgets?page=${nextPage}&limit=${pageSize}`)
      const data = await refreshed.json()
      if (Array.isArray(data)) {
        setItems(data)
        setTotal(data.length)
      } else {
        setItems(data.items || [])
        setTotal(data.total || 0)
      }
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to delete budget')
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
        <p className="font-semibold">Error loading budget data</p>
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  const spentPercentage = stats.totalBudget > 0 ? (stats.totalSpent / stats.totalBudget) * 100 : 0

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your Budget Workspace</p>
          <h1 className="text-3xl font-semibold text-slate-900">Workspace</h1>
          <p className="text-sm text-slate-600">Manage and track all your budgets in one place</p>
        </div>
        <a href="/dashboard/budgets/create" className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800">
          + Create Budget
        </a>
      </header>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-slate-600 font-medium">Total Budget</p>
              <p className="text-4xl font-bold text-slate-900">{formatCurrency(stats.totalBudget)}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-sm text-slate-600">Active Budgets</span>
              <span className="text-2xl font-semibold text-blue-600">{stats.totalBudgets}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-200/50 bg-linear-to-br from-orange-50 to-amber-50 p-8 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-orange-700 font-medium">Total Spent</p>
              <p className="text-4xl font-bold text-orange-900">{formatCurrency(stats.totalSpent)}</p>
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-orange-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-700">Usage</span>
                <span className="text-sm font-semibold text-orange-600">{spentPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-2 bg-orange-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-orange-400 to-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-green-200/50 bg-linear-to-br from-green-50 to-emerald-50 p-8 shadow-md hover:shadow-lg transition-shadow duration-200">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-green-700 font-medium">Total Remaining</p>
              <p className="text-4xl font-bold text-green-900">{formatCurrency(stats.totalRemaining)}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-green-100">
              <span className="text-sm text-green-700">Overspent Budgets</span>
              <span className="text-2xl font-semibold text-red-600">{stats.budgetsOverspent}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Monthly Budgets</h2>
            <p className="text-sm text-slate-500">Months vs budget limit for selected year</p>
          </div>
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
            {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="mt-6 h-64 flex items-end gap-2">
          {chartData.map((d) => {
            const max = Math.max(1, ...chartData.map((x) => x.amount))
            const h = (d.amount / max) * 100
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center" style={{ height: '180px' }}>
                  <div className="w-full max-w-10 rounded-t-xl bg-gradient-to-t from-emerald-700 to-emerald-500 flex items-end justify-center pb-2" style={{ height: `${h}%`, minHeight: d.amount ? '24px' : '4px' }}>
                    {d.amount > 0 && <span className="text-[10px] font-bold text-white">{formatCurrency(d.amount)}</span>}
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-500">{d.month}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-md">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent Budgets</h2>
            <p className="text-sm text-slate-500">Showing the latest budgets (10 per page).</p>
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
          <p className="text-slate-600 text-center py-12">No budgets yet. Create your first budget.</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr className="border-b border-slate-200">
                  <th className="pb-3 font-semibold">Budget</th>
                  <th className="pb-3 font-semibold">Limit</th>
                  <th className="pb-3 font-semibold">Spent</th>
                  <th className="pb-3 font-semibold">Remaining</th>
                  <th className="pb-3 font-semibold">Period</th>
                  <th className="pb-3 font-semibold">Active</th>
                  <th className="pb-3 font-semibold">Range</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((budget) => {
                  const isEditing = editingId === budget.id
                  const spent = budget.expenses.reduce((sum: number, exp) => sum + exp.amount, 0)
                  const remaining = budget.limit - spent

                  return (
                    <tr key={budget.id} className="text-slate-700">
                      <td className="py-3 font-semibold text-slate-900">
                        {isEditing ? (
                          <input
                            className="w-40 rounded-md border border-slate-200 px-2 py-1"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                        ) : (
                          budget.name
                        )}
                      </td>
                      <td className="py-3">
                        {isEditing ? (
                          <input
                            type="number"
                            className="w-28 rounded-md border border-slate-200 px-2 py-1"
                            value={editForm.limit}
                            onChange={(e) => setEditForm({ ...editForm, limit: e.target.value })}
                          />
                        ) : (
                          formatCurrency(budget.limit)
                        )}
                      </td>
                      <td className="py-3">{formatCurrency(spent)}</td>
                      <td className="py-3">
                        <span className={remaining < 0 ? 'text-red-600' : 'text-emerald-600'}>
                          {formatCurrency(Math.max(0, remaining))}
                        </span>
                      </td>
                      <td className="py-3">
                        {isEditing ? (
                          <select
                            className="rounded-md border border-slate-200 px-2 py-1"
                            value={editForm.period}
                            onChange={(e) => setEditForm({ ...editForm, period: e.target.value })}
                          >
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                            <option value="custom">Custom</option>
                          </select>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                            {budget.period}
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {isEditing ? (
                          <label className="inline-flex items-center gap-2 text-xs text-slate-600">
                            <input
                              type="checkbox"
                              checked={editForm.isActive}
                              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                            />
                            Active
                          </label>
                        ) : budget.isActive ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="date"
                              className="rounded-md border border-slate-200 px-2 py-1"
                              value={editForm.startDate}
                              onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                            />
                            <input
                              type="date"
                              className="rounded-md border border-slate-200 px-2 py-1"
                              value={editForm.endDate}
                              onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-slate-600">
                            {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(budget.id)}
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
                              onClick={() => startEdit(budget)}
                              className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteBudget(budget.id)}
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
          <p className="text-slate-500">Total {total} budgets</p>
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
