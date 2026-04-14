'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useMemo, useState } from 'react'

const navItems = [
  { label: 'Overview', href: '/dashboard' },
  {
    label: 'Invoices',
    href: '/dashboard/invoices',
    submenu: [
      { label: 'Overview', href: '/dashboard/invoices' },
      { label: 'Create Invoice', href: '/dashboard/invoices/create' },
    ],
  },
  {
    label: 'Budgets',
    href: '/dashboard/budgets',
    submenu: [
      { label: 'Overview', href: '/dashboard/budgets' },
      { label: 'Create Budget', href: '/dashboard/budgets/create' },
    ],
  },
  {
    label: 'Expenses',
    href: '/dashboard/expenses',
    submenu: [
      { label: 'Overview', href: '/dashboard/expenses' },
      { label: 'Create Expense', href: '/dashboard/expenses/create' },
    ],
  },
  { label: 'Settings', href: '/dashboard/settings' },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const userLabel = useMemo(() => {
    return session?.user?.name || session?.user?.email || 'Signed in'
  }, [session])

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_15%_-20%,#dbeafe_0%,transparent_55%),radial-gradient(900px_circle_at_90%_0%,#fde68a_0%,transparent_55%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
      <div className="flex h-screen overflow-y-hidden">
        <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200/60 bg-white/70 backdrop-blur h-screen overflow-y-auto">
          <div className="px-6 pt-8 pb-6">
            <div className="text-sm uppercase tracking-[0.3em] text-slate-500">Workspace</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">Invoice Atlas</div>
          </div>

          <nav className="flex-1 px-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const hasSubmenu = 'submenu' in item && item.submenu
                const isDropdownOpen = openDropdown === item.label
                const isSubmenuActive = hasSubmenu && item.submenu.some((sub) => pathname === sub.href)

                return (
                  <div key={item.label}>
                    {hasSubmenu ? (
                      <button
                        onClick={() => setOpenDropdown(isDropdownOpen ? null : item.label)}
                        className={`w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                          isDropdownOpen || isSubmenuActive
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span
                          className={`h-2 w-2 rounded-full transition-transform duration-200 ${
                            isDropdownOpen || isSubmenuActive ? 'bg-amber-300' : 'bg-slate-300'
                          } ${isDropdownOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{item.label}</span>
                        <span className={`h-2 w-2 rounded-full ${isActive ? 'bg-amber-300' : 'bg-slate-300'}`} />
                      </Link>
                    )}

                    {hasSubmenu && (isDropdownOpen || isSubmenuActive) && (
                      <div className="mt-1 space-y-1 pl-2">
                        {item.submenu.map((subitem) => {
                          const isSubActive = pathname === subitem.href
                          return (
                            <Link
                              key={subitem.href}
                              href={subitem.href}
                              className={`flex items-center rounded-lg px-4 py-2 text-sm transition-all duration-200 ${
                                isSubActive
                                  ? 'bg-slate-800 text-white font-semibold'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              <span className="text-xl">›</span>
                              <span className="ml-2">{subitem.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </nav>

          <div className="px-6 pb-8">
            <div className="rounded-2xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 p-4 text-white shadow-lg">
              <p className="text-xs uppercase tracking-widest text-slate-300">Signed in</p>
              <p className="mt-2 text-sm font-medium text-white/90">{userLabel}</p>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: '/auth/signin' })}
                className="mt-4 w-full rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/90 transition hover:bg-white/10"
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col h-full overflow-y-auto">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-5 py-4 backdrop-blur lg:hidden">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Invoice Atlas</p>
              <p className="text-lg font-semibold text-slate-900">Dashboard</p>
            </div>
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow-lg shadow-slate-900/30"
              aria-expanded={mobileOpen}
            >
              Menu
            </button>
          </header>

          <main className="animate-fade-up px-5 pb-10 pt-6 lg:px-10 lg:py-10">
            {children}
          </main>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white px-6 pb-10 pt-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Quick Navigation</p>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-2xl border border-slate-200/80 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm"
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-slate-500">Go</span>
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-900 px-4 py-4 text-white">
              <p className="text-xs uppercase tracking-widest text-slate-300">Signed in</p>
              <p className="mt-2 text-sm font-medium text-white/90">{userLabel}</p>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: '/auth/signin' })}
                className="mt-4 w-full rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/90"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
