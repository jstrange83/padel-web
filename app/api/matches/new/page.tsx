'use client';

import { useEffect, useMemo, useState } from 'react';

type Player = { id: string; name: string; email: string; role: string; eloRating?: { rating: number } };

type SetRow = { scoreA: number; scoreB: number };

export default function NewMatchPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [createdById, setCreatedById] = useState<string>('');

  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [b1, setB1] = useState('');
  const [b2, setB2] = useState('');
  const [sets, setSets] = useState<SetRow[]>([
    { scoreA: 6, scoreB: 4 },
    { scoreA: 3, scoreB: 6 },
    { scoreA: 6, scoreB: 3 },
  ]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch('/api/players');
      const data = await res.json();
      setPlayers(data);
      // vælg første spiller som createdBy
      if (data?.length) setCreatedById(data[0].id);
      setLoading(false);
    })();
  }, []);

  const teamAValid = a1 && a2 && a1 !== a2;
  const teamBValid = b1 && b2 && b1 !== b2;
  const allDifferent = useMemo(() => {
    const ids = [a1, a2, b1, b2].filter(Boolean);
    return new Set(ids).size === 4;
  }, [a1, a2, b1, b2]);

  async function submit() {
    setMsg(null);
    if (!teamAValid || !teamBValid || !allDifferent) {
      setMsg('Vælg 4 forskellige spillere (2 pr. hold).');
      return;
    }
    setSaving(true);
    const body = {
      createdById,
      sets: sets.map(s => ({
        teamAPlayer1Id: a1, teamAPlayer2Id: a2,
        teamBPlayer1Id: b1, teamBPlayer2Id: b2,
        scoreA: Number(s.scoreA), scoreB: Number(s.scoreB),
      })),
    };
    const res = await fetch('/api/matches', { method: 'POST', body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setMsg(data?.error ?? 'Kunne ikke oprette kamp'); return; }
    setMsg('Kamp oprettet ✅');
  }

  if (loading) return <div className="p-6">Henter spillere…</div>;

  function Select({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
      <select className="border rounded px-2 py-1"
              value={value}
              onChange={e => onChange(e.target.value)}>
        <option value="">Vælg spiller…</option>
        {players.map(p => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.eloRating?.rating ?? 1000})
          </option>
        ))}
      </select>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Ny kamp</h1>

      <div className="space-y-2">
        <label className="text-sm">Oprettet af</label>
        <select className="border rounded px-2 py-1"
                value={createdById}
                onChange={e => setCreatedById(e.target.value)}>
          {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3 border rounded p-4">
          <h2 className="font-medium">Team A</h2>
          <Select value={a1} onChange={setA1}/>
          <Select value={a2} onChange={setA2}/>
        </div>
        <div className="space-y-3 border rounded p-4">
          <h2 className="font-medium">Team B</h2>
          <Select value={b1} onChange={setB1}/>
          <Select value={b2} onChange={setB2}/>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-medium">Sæt (bedst af 3)</h2>
        {sets.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-10">Sæt {i + 1}</span>
            <input type="number" min={0} max={7} className="border rounded px-2 py-1 w-20"
                   value={s.scoreA} onChange={e => {
                     const v = [...sets]; v[i] = { ...v[i], scoreA: Number(e.target.value) }; setSets(v);
                   }}/>
            <span>-</span>
            <input type="number" min={0} max={7} className="border rounded px-2 py-1 w-20"
                   value={s.scoreB} onChange={e => {
                     const v = [...sets]; v[i] = { ...v[i], scoreB: Number(e.target.value) }; setSets(v);
                   }}/>
          </div>
        ))}
      </div>

      {msg && <div className="text-sm">{msg}</div>}

      <button onClick={submit}
              disabled={saving}
              className="bg-black text-white rounded px-4 py-2">
        {saving ? 'Gemmer…' : 'Opret kamp'}
      </button>
    </div>
  );
}
