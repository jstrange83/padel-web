// app/matches/new/ui/NewMatchForm.tsx
"use client";

import { useMemo, useState } from "react";

type Player = { id: string; name: string };
export default function NewMatchForm({ players }: { players: Player[] }) {
  // ---- Din eksisterende state og logik herunder ----
  // Eksempel på minimal state – bevar din nuværende
  const [teamA1, setTeamA1] = useState<string>("");
  const [teamA2, setTeamA2] = useState<string>("");
  const [teamB1, setTeamB1] = useState<string>("");
  const [teamB2, setTeamB2] = useState<string>("");

  // Hjælp: filtrér valgte spillere fra de andre dropdowns (valgfrit)
  const available = useMemo(() => {
    const chosen = new Set([teamA1, teamA2, teamB1, teamB2].filter(Boolean));
    return players.filter((p) => !chosen.has(p.id));
  }, [players, teamA1, teamA2, teamB1, teamB2]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Opret kamp</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team A */}
        <div className="rounded border p-4">
          <h2 className="font-medium mb-3">Team A</h2>

          <label className="block text-sm mb-1">Vælg spiller 1</label>
          <select
            className="w-full border rounded px-3 py-2 mb-3"
            value={teamA1}
            onChange={(e) => setTeamA1(e.target.value)}
          >
            <option value="">Vælg spiller 1</option>
            {available.concat(players.filter(p => p.id === teamA1)).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <label className="block text-sm mb-1">Vælg spiller 2</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={teamA2}
            onChange={(e) => setTeamA2(e.target.value)}
          >
            <option value="">Vælg spiller 2</option>
            {available.concat(players.filter(p => p.id === teamA2)).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Team B */}
        <div className="rounded border p-4">
          <h2 className="font-medium mb-3">Team B</h2>

          <label className="block text-sm mb-1">Vælg spiller 1</label>
          <select
            className="w-full border rounded px-3 py-2 mb-3"
            value={teamB1}
            onChange={(e) => setTeamB1(e.target.value)}
          >
            <option value="">Vælg spiller 1</option>
            {available.concat(players.filter(p => p.id === teamB1)).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <label className="block text-sm mb-1">Vælg spiller 2</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={teamB2}
            onChange={(e) => setTeamB2(e.target.value)}
          >
            <option value="">Vælg spiller 2</option>
            {available.concat(players.filter(p => p.id === teamB2)).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resten af din eksisterende formular: dato, tid, sæt, Gem/Annullér osv. */}
      {/* ... */}
    </div>
  );
}
