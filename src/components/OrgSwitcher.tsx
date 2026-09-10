'use client';

import { useEffect, useState } from 'react';

export default function OrgSwitcher({ orgs: initialOrgs = [] as Array<{ id: string; name: string }> }) {
  const [orgs, setOrgs] = useState(initialOrgs);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  useEffect(() => {
    fetch("/api/orgs").then((r) => r.json()).then((data) => Array.isArray(data) && setOrgs(data)).catch(() => {});
  }, []);
  const createOrg = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/orgs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim() }) });
    if (res.ok) {
      const org = await res.json();
      setOrgs((prev) => [org, ...prev]);
      setNewName("");
    }
    setCreating(false);
  };
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="h-2 w-2 rounded-full bg-lime-300" aria-hidden />
        {orgs[0]?.name || 'Personal'}
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg" role="listbox">
          <div className="px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-400">Workspaces</div>
          {orgs.map((o) => (
            <div key={o.id} className="rounded-lg px-3 py-2 text-sm hover:bg-slate-50" role="option">
              {o.name}
            </div>
          ))}
          <div className="mt-2 border-t border-slate-200 pt-2">
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="New workspace"
                className="flex-1 rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
              <button
                onClick={createOrg}
                disabled={creating || !newName.trim()}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {creating ? "..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
