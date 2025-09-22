"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Player = { id: string; name: string };

type SetRow = {
  setIndex: number;
  scoreA: number;
  scoreB: number;
};

export default function NewMatchForm({ players }: { players: Player[] }) {
  const router = useRouter();

  // Oprettet af
  const [createdById, setCreatedById] = useState<string>("");

  // Team A/B spillere
  const [teamA1, setTeamA1] = useState<string>("");
  const [teamA2, setTeamA2] = useState<string>("");
  const [teamB1, setTeamB1] = useState<string>("");
  const [teamB2, setTeamB2] = useState<string>("");

  // Dato + Tid
  const [date, setDate] = useState<string>(""); // yyyy-mm-dd (native date input)
  const [time, setTime] = useState<string>("18:00"); // hh:mm

  // Sæt
  const [sets, setSets] = useState<SetRow[]>([{ setIndex: 0, scoreA: 0, scoreB: 0 }]);

  // Hjælpere til dropdowns: undgå at vælge samme spiller flere gange
  const chosenIds = useMemo(
    () => new Set([createdById, teamA1, teamA2, teamB1, teamB2].filter(Boolean)),
    [createdById, teamA1, teamA2, teamB1, teamB2]
  );

  const optionsFor = (currentId: string) =>
    players
      .filter((p) => !chosenIds.has(p.id) || p.id === currentId) // tillad nuværende valgte
      .map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ));

  function addSet() {
    setSets((prev) => [
      ...prev,
      { setIndex: prev.length, scoreA: 0, scoreB: 0 },
    ]);
  }

  function removeLastSet() {
    setSets((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  function updateSet(ix: number, key: "scoreA" | "scoreB", val: number) {
    setSets((prev) =>
      prev.map((s, i) => (i === ix ? { ...s, [key]: val } : s))
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Simple validering
    if (!createdById) return alert("Vælg 'Oprettet af'.");
    if (!teamA1 || !teamA2 || !teamB1 || !teamB2)
      return alert("Vælg alle fire spillere.");
    if (!date || !time) return alert("Vælg dato og tid.");

    // Kombinér dato+tid til ISO
    const playedAt = new Date(`${date}T${time}:00`);

    // Byg payload så den matcher /api/matches (match + sets)
    const payload = {
      createdById,
      playedAt: playedAt.toISOString(),
      sets: sets.map((s) => ({
        setIndex: s.setIndex,
        teamAPlayer1Id: teamA1,
        teamAPlayer2Id: teamA2,
        teamBPlayer1Id: teamB1,
        teamBPlayer2Id: teamB2,
        scoreA: s.scoreA,
        scoreB: s.scoreB,
      })),
    };

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Kunne ikke gemme kamp.");
      }

      // Gå tilbage til oversigten (tilpas som du ønsker)
      router.push("/matches");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ukendt fejl";
      alert(message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Opret kamp</h1>

      {/* Oprettet af + Dato/Tid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm mb-1">Oprettet af</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={createdById}
            onChange={(e) => setCreatedById(e.target.value)}
          >
            <option value="">Vælg opretter</option>
            {optionsFor(createdById)}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Dato</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Tid</label>
          <input
            type="time"
            className="w-full border rounded px-3 py-2"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      {/* Teams */}
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
            {optionsFor(teamA1)}
          </select>

          <label className="block text-sm mb-1">Vælg spiller 2</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={teamA2}
            onChange={(e) => setTeamA2(e.target.value)}
          >
            <option value="">Vælg spiller 2</option>
            {optionsFor(teamA2)}
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
            {optionsFor(teamB1)}
          </select>

          <label className="block text-sm mb-1">Vælg spiller 2</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={teamB2}
            onChange={(e) => setTeamB2(e.target.value)}
          >
            <option value="">Vælg spiller 2</option>
            {optionsFor(teamB2)}
          </select>
        </div>
      </div>

      {/* Sæt */}
      <div className="rounded border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Sæt</h2>
          <div className="space-x-2">
            <button
              type="button"
              onClick={addSet}
              className="px-3 py-1 rounded bg-black text-white"
            >
              + Tilføj sæt
            </button>
            <button
              type="button"
              onClick={removeLastSet}
              className="px-3 py-1 rounded bg-rose-500 text-white"
            >
              Fjern
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-sm font-medium mb-2">
          <div className="col-span-2 md:col-span-3">Sæt</div>
          <div>Team A</div>
          <div>Team B</div>
        </div>

        {sets.map((s, i) => (
          <div
            key={i}
            className="grid grid-cols-3 md:grid-cols-5 gap-2 items-center py-1"
          >
            <div className="col-span-2 md:col-span-3">Sæt {i + 1}</div>
            <input
              type="number"
              min={0}
              value={s.scoreA}
              onChange={(e) => updateSet(i, "scoreA", Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            />
            <input
              type="number"
              min={0}
              value={s.scoreB}
              onChange={(e) => updateSet(i, "scoreB", Number(e.target.value))}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        ))}
      </div>

      {/* Knapper */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded border"
        >
          Annullér
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-green-600 text-white"
        >
          Gem kamp
        </button>
      </div>
    </form>
  );
}
