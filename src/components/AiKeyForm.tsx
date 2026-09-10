'use client';

import { useEffect, useState } from 'react';

const providers = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'nvidia', label: 'NVIDIA' },
  { id: 'claude', label: 'Claude (Anthropic)' },
  { id: 'gemini', label: 'Gemini (Google)' },
] as const;

export default function AiKeyForm() {
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [masked, setMasked] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch('/api/settings/ai-key').then((r) => r.json()).then((d) => {
      if (d.provider) setProvider(d.provider);
      if (d.masked) setMasked(d.masked);
    }).catch(() => {});
  }, []);

  const save = async () => {
    setStatus(null);
    const res = await fetch('/api/settings/ai-key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, apiKey }) });
    if (res.ok) {
      setStatus('Saved — key encrypted with BCRYPT_PEPPER');
      setApiKey('');
      const d = await (await fetch('/api/settings/ai-key')).json();
      if (d.masked) setMasked(d.masked);
    } else setStatus('Failed to save');
  };

  const test = async () => {
    setTesting(true);
    setStatus(null);
    const res = await fetch('/api/settings/ai-key', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl: 'https://example.com/receipt.jpg', provider, apiKey: apiKey || undefined }) });
    const data = await res.json();
    setStatus(res.ok ? `Test OK via ${data.provider || provider}: ${data.description} $${data.amount}` : `Test failed: ${data.error}`);
    setTesting(false);
  };

  const clear = async () => {
    await fetch('/api/settings/ai-key', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiKey: '' }) });
    setMasked(null);
    setStatus('Cleared — will use server OPENAI_API_KEY or mock 42.5');
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">AI Provider (BYOK)</h3>
      <p className="mt-1 text-sm text-slate-600">Per-user encrypted key (`User.aiKeyEncrypted @db.Text` + `BCRYPT_PEPPER` AES-GCM). Stored encrypted, never returned. `src/app/api/ai/parse-receipt` uses <code>userKey ?? server OPENAI_API_KEY</code> else mock 42.5.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Provider</label>
          <select value={provider} onChange={(e) => setProvider(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm">
            {providers.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <p className="mt-1 text-xs text-slate-500">Nvidia uses OpenAI-compatible baseURL, Claude via @ai-sdk/anthropic, Gemini via @ai-sdk/google — all routed through `ai` SDK `generateText`.</p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">API Key {masked && <span className="text-xs text-emerald-600">({masked})</span>}</label>
          <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={masked ? "•••• Enter new to replace" : "sk-..."} type="password" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <p className="mt-1 text-xs text-slate-500">Encrypted with `BCRYPT_PEPPER` AES-GCM (`src/lib/crypto.ts:14`). Never logged.</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={save} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Save</button>
        <button onClick={test} disabled={testing} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{testing ? "Testing…" : "Test"}</button>
        <button onClick={clear} className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50">Clear (use server/mocks)</button>
      </div>
      {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
      <p className="mt-3 text-xs text-slate-400">Providers: <b>nvidia</b> (nvidia NIM), <b>openai</b> (gpt-4o-mini), <b>claude</b> (claude-3), <b>gemini</b> (gemini-1.5). `src/app/api/ai/parse-receipt/route.ts:14` picks `userKey ?? server` and routes by `aiProvider`.</p>
    </div>
  );
}
