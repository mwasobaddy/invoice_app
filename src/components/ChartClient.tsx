'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  period: string;
  invoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  expenses: number;
  budget: number;
}

export default function ChartClient({ data }: { data: ChartDataPoint[] }) {
  if (!data || data.length === 0) {
    return <div className="flex h-96 items-center justify-center text-slate-600"><p>No data available.</p></div>;
  }
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="period" stroke="#64748b" style={{ fontSize: '12px' }} />
          <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(value) => `$${Number(value).toFixed(2)}`} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="line" />
          <Line type="monotone" dataKey="invoices" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: '#0ea5e9', r: 4 }} activeDot={{ r: 6 }} name="Total Invoices" />
          <Line type="monotone" dataKey="paidInvoices" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} name="Paid Invoices" />
          <Line type="monotone" dataKey="pendingInvoices" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }} name="Pending Invoices" />
          <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} activeDot={{ r: 6 }} name="Total Expenses" />
          <Line type="monotone" dataKey="budget" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} activeDot={{ r: 6 }} name="Total Budget" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
