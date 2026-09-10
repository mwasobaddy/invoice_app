'use client';

import { useEffect, useState } from 'react';

type Org = { id: string; name: string };

export default function OrgSwitcher({ orgs: initialOrgs = [] as Org[] }) {
  const [orgs, setOrgs] = useState<Org[]>(initialOrgs);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/orgs')
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setOrgs(data))
      .catch(() => {});
    const stored = typeof window !== 'undefined' ? localStorage.getItem('currentOrgId') : null;
    if (stored) setCurrentId(stored);
  }, []);

  useEffect(() => {
    if (!currentId && orgs.length > 0) setCurrentId(orgs[0].id);
  }, [orgs, currentId]);

  const current = orgs.find((o) => o.id === currentId) || orgs[0];
  const switchOrg = (id: string) => {
    setCurrentId(id);
    localStorage.setItem('currentOrgId', id);
    window.dispatchEvent(new CustomEvent('orgChange', { detail: id }));
    setOpen(false);
    // Force reload to refetch data with new orgId filter (strict)
    window.location.reload();
  };

  const createOrg = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch('/api/orgs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName.trim() }) });
    if (res.ok) {
      const org = await res.json();
      setOrgs((prev) => [org, ...prev]);
      switchOrg(org.id);
      setNewName('');
    }
    setCreating(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white" aria-hidden>
            {(current?.name || 'P').charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{current?.name || 'Personal'}</p>
            <p className="text-xs font-medium text-slate-500">{currentId ? 'Workspace' : 'Personal workspace'}</p>
          </div>
        </div>
        <span className={`h-2 w-2 rounded-full ${open ? 'bg-lime-300' : 'bg-slate-300'}`} aria-hidden />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 z-20" role="listbox">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Workspaces</p>
          <div className="space-y-1">
            {orgs.map((o) => {
              const active = o.id === currentId;
              return (
                <button
                  key={o.id}
                  onClick={() => switchOrg(o.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${active ? 'bg-slate-900 text-white shadow' : 'text-slate-700 hover:bg-slate-100'}`}
                  role="option"
                  aria-selected={active}
                >
                  <span className="flex items-center gap-2">
                    <span className={`h-6 w-6 rounded-lg flex items-center justify-center text-xs font-bold ${active ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-700'}`}>
                      {o.name.charAt(0).toUpperCase()}
                    </span>
                    <span className={`font-medium ${active ? 'text-white' : 'text-slate-900'}`}>{o.name}</span>
                  </span>
                  {active && <span className="h-2 w-2 rounded-full bg-lime-300" aria-hidden />}
                </button>
              );
            })}
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="px-2 text-xs font-semibold text-slate-500">Create workspace</p>
            <div className="mt-2 flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Malimanager"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
              <button
                onClick={createOrg}
                disabled={creating || !newName.trim()}
                className="rounded-xl bg-lime-300 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-900 shadow hover:bg-lime-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? '…' : 'Create'}
              </button>
            </div>
            <p className="mt-2 px-2 text-xs leading-4 text-slate-500">Strict filter: <span className="font-medium text-slate-700">Personal</span> shows only Personal data, <span className="font-medium text-slate-700">Malimanager</span> shows only Malimanager data.</p>
          </div>
        </div>
      )}
    </div>
  );
}
