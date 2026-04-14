'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartDataPoint {
  period: string
  invoices: number
  paidInvoices: number
  pendingInvoices: number
  expenses: number
  budget: number
}

export default function DashboardPage() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/dashboard/chart-data?period=${period}`)
        if (!response.ok) throw new Error('Failed to fetch chart data')
        const data = await response.json()
        setChartData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [period])

  const handlePeriodChange = (newPeriod: 'monthly' | 'yearly') => {
    setPeriod(newPeriod)
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Your workspace</p>
        <h1 className="text-3xl font-semibold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-600">
          Keep tabs on invoices, budgets, and spending without leaving the dashboard.
        </p>
      </header>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Link href="/dashboard/invoices" className="group">
          <div className="rounded-2xl bg-white p-6 shadow-md shadow-slate-200/60 transition-all duration-200 hover:shadow-lg group-hover:border-slate-300">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Invoices</h3>
            <p className="text-slate-600 text-sm">Manage your invoices and track payments.</p>
            <button className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              View Invoices
            </button>
          </div>
        </Link>

        <Link href="/dashboard/budgets" className="group">
          <div className="rounded-2xl bg-white p-6 shadow-md shadow-slate-200/60 transition-all duration-200 hover:shadow-lg group-hover:border-slate-300">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Budgets</h3>
            <p className="text-slate-600 text-sm">Set spending targets and keep costs aligned.</p>
            <button className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              View Budgets
            </button>
          </div>
        </Link>

        <Link href="/dashboard/expenses" className="group">
          <div className="rounded-2xl bg-white p-6 shadow-md shadow-slate-200/60 transition-all duration-200 hover:shadow-lg group-hover:border-slate-300">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Expenses</h3>
            <p className="text-slate-600 text-sm">Track and categorize cash flowing out.</p>
            <button className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              View Expenses
            </button>
          </div>
        </Link>
      </div>

      {/* Financial Overview Chart */}
      <div className="rounded-2xl bg-white p-8 shadow-md shadow-slate-200/60">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Financial Overview</h2>
            <p className="text-sm text-slate-600 mt-1">Track your income, expenses, and budgets over time</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePeriodChange('monthly')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                period === 'monthly'
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => handlePeriodChange('yearly')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                period === 'yearly'
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">Error loading chart data</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-slate-600">
            <p>No data available. Create some invoices, budgets, or expenses to see the chart.</p>
          </div>
        ) : (
          <div className="w-full h-96 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="period"
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="line"
                />

                <Line
                  type="monotone"
                  dataKey="invoices"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ fill: '#0ea5e9', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Total Invoices"
                  isAnimationActive={true}
                />

                <Line
                  type="monotone"
                  dataKey="paidInvoices"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Paid Invoices"
                  isAnimationActive={true}
                />

                <Line
                  type="monotone"
                  dataKey="pendingInvoices"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Pending Invoices"
                  isAnimationActive={true}
                />

                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Total Expenses"
                  isAnimationActive={true}
                />

                <Line
                  type="monotone"
                  dataKey="budget"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Total Budget"
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#0ea5e9' }}></div>
            <span className="text-sm text-slate-600">Total Invoices</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
            <span className="text-sm text-slate-600">Paid Invoices</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></div>
            <span className="text-sm text-slate-600">Pending Invoices</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
            <span className="text-sm text-slate-600">Total Expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#8b5cf6' }}></div>
            <span className="text-sm text-slate-600">Total Budget</span>
          </div>
        </div>
      </div>
    </section>
  )
}
