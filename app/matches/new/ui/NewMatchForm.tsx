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
  const [date, setDate] = useState<string>(""); // yyyy-mm-dd
  const [time, setTime] = useState<string>("18:00"); // hh:mm

  // Sæt
  const [sets, setSets] = useState<SetRow[]>([{ setIndex: 0, scoreA: 0, scoreB: 0 }]);

  // undgå at vælge samme spiller flere gange
  const chosenIds = useMemo(
    () => new Set([createdById, teamA1, teamA2, teamB1, teamB2].filter(Boolean)),
    [createdById, teamA1, teamA2, teamB1, teamB2]
  );

  const optionsFor = (currentId: string) =>
    players
      .filter((p) => !chosenIds.has(p.id) || p.id === currentId)
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

  function setScore(ix: number, team: "A" | "B", val: number) {
    setSets((prev) =>
      prev.map((s, i) =>
        i === ix ? { ...s, [team === "A" ? "scoreA" : "scoreB"]: val } : s
      )
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!createdById) return alert("Vælg 'Oprettet af'.");
    if (!teamA1 || !teamA2 || !teamB1 || !teamB2)
      return alert("Vælg alle fire spillere.");
    if (!date || !time) return alert("Vælg dato og tid.");

    const playedAt = new Date(`${date}T${time}:00`);

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
      router.push("/matches");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ukendt fejl";
      alert(message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-semibold flex items-center gap-2">
        🔎 Indtast resultater
      </h1>

      {/* Toplinje: opretter + dato/tid */}
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

      {/* Alle sæt */}
      {sets.map((s, i) => (
        <div key={i} className="rounded-2xl border p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-semibold">Sæt #{i + 1}</div>
          </div>

          {/* Hold A */}
          <div className="rounded-xl border p-4 mb-4">
            <div className="font-medium mb-2">Hold A</div>

            <label className="block text-xs mb-1 text-gray-600">Spiller A1</label>
            <select
              className="w-full border rounded px-3 py-2 mb-3"
              value={teamA1}
              onChange={(e) => setTeamA1(e.target.value)}
            >
              <option value="">Vælg spiller…</option>
              {optionsFor(teamA1)}
            </select>

            <label className="block text-xs mb-1 text-gray-600">Spiller A2</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={teamA2}
              onChange={(e) => setTeamA2(e.target.value)}
            >
              <option value="">Vælg spiller…</option>
              {optionsFor(teamA2)}
            </select>

            {/* Scoreknapper A */}
            <div className="mt-4">
              <div className="text-xs mb-2 text-gray-600">SCORE</div>
              <ScorePills
                value={s.scoreA}
                onChange={(val) => setScore(i, "A", val)}
              />
            </div>
          </div>

          {/* Hold B */}
          <div className="rounded-xl border p-4">
            <div className="font-medium mb-2">Hold B</div>

            <label className="block text-xs mb-1 text-gray-600">Spiller B1</label>
            <select
              className="w-full border rounded px-3 py-2 mb-3"
              value={teamB1}
              onChange={(e) => setTeamB1(e.target.value)}
            >
              <option value="">Vælg spiller…</option>
              {optionsFor(teamB1)}
            </select>

            <label className="block text-xs mb-1 text-gray-600">Spiller B2</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={teamB2}
              onChange={(e) => setTeamB2(e.target.value)}
            >
              <option value="">Vælg spiller…</option>
              {optionsFor(teamB2)}
            </select>

            {/* Scoreknapper B */}
            <div className="mt-4">
              <div className="text-xs mb-2 text-gray-600">SCORE</div>
              <ScorePills
                value={s.scoreB}
                onChange={(val) => setScore(i, "B", val)}
              />
            </div>
          </div>
        </div>
      ))}

      {/* Knapper nederst */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addSet}
          className="px-4 py-2 rounded-full bg-white border shadow-sm hover:bg-gray-50"
        >
          ➕ Tilføj sæt
        </button>
        <button
          type="button"
          onClick={removeLastSet}
          className="px-4 py-2 rounded-full bg-rose-500 text-white hover:bg-rose-600"
        >
          Fjern sidste sæt
        </button>
        <div className="grow" />
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-full border bg-white hover:bg-gray-50"
        >
          Annullér
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Indsend resultater
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Tip: Tilføj flere sæt før du indsender – de samles under samme kamp-ID.
      </p>
    </form>
  );
}

/** Runde score-knapper 0..7 */
function ScorePills({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const nums = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="grid grid-cols-4 gap-2 max-w-md">
      {nums.map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={[
              "h-10 rounded-full border text-sm font-medium transition",
              active
                ? "bg-pink-600 text-white border-pink-600 shadow"
                : "bg-white hover:bg-gray-50",
            ].join(" ")}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
