'use client';

import { useState } from 'react';

export default function OrgSwitcher({ orgs = [] as Array<{ id: string; name: string }> }) {
  const [open, setOpen] = useState(false);
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
          <div className="mt-2 border-t border-slate-200 pt-2 text-xs text-slate-500">POST /api/orgs to create</div>
        </div>
      )}
    </div>
  );
}
