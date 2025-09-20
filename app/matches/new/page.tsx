"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
};

type SetInput = {
  setIndex: number;
  scoreA: number | "";
  scoreB: number | "";
};

export default function NewMatchPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<User[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [createdById, setCreatedById] = useState<string>("");
  const [date, setDate] = useState<string>(""); // yyyy-mm-dd
  const [time, setTime] = useState<string>("18:00"); // hh:mm

  const [teamA1, setTeamA1] = useState<string>("");
  const [teamA2, setTeamA2] = useState<string>("");
  const [teamB1, setTeamB1] = useState<string>("");
  const [teamB2, setTeamB2] = useState<string>("");

  const [sets, setSets] = useState<SetInput[]>([
    { setIndex: 1, scoreA: 0, scoreB: 0 },
  ]);

  // fetch players once
  useEffect(() => {
    const run = async () => {
      try {
        setLoadingPlayers(true);
        const res = await fetch("/api/players", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Kunne ikke hente spillere (${res.status})`);
        }
        const data = (await res.json()) as User[];
        // kun aktive spillere
        const active = data.filter((u) => u.isActive);
        setPlayers(active);
        // for-udfyld "Oprettet af" hvis vi har Jimmy i listen – ellers første spiller
        const jimmy = active.find((u) => u.name.toLowerCase().includes("jimmy"));
        setCreatedById(jimmy?.id ?? active[0]?.id ?? "");
      } catch (e: any) {
        setError(e?.message ?? "Ukendt fejl ved hentning af spillere");
      } finally {
        setLoadingPlayers(false);
      }
    };
    run();
  }, []);

  const playerOptions = useMemo(
    () =>
      players.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} ({p.email})
        </option>
      )),
    [players]
  );

  function updateSet(idx: number, patch: Partial<SetInput>) {
    setSets((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    );
  }

  function addSet() {
    setSets((prev) => [
      ...prev,
      { setIndex: prev.length + 1, scoreA: 0, scoreB: 0 },
    ]);
  }

  function removeSet(idx: number) {
    setSets((prev) => prev.filter((_, i) => i !== idx).map((s, i) => ({ ...s, setIndex: i + 1 })));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // simple validering
    const chosen = [teamA1, teamA2, teamB1, teamB2];
    const hasDuplicate =
      new Set(chosen.filter(Boolean)).size !== chosen.filter(Boolean).length;
    if (hasDuplicate) {
      setError("Den samme spiller er valgt flere gange.");
      return;
    }
    if (!teamA1 || !teamA2 || !teamB1 || !teamB2) {
      setError("Vælg alle 4 spillere.");
      return;
    }
    if (!date) {
      setError("Vælg dato for kampen.");
      return;
    }

    // playedAt som ISO (brug dato + evt. tid)
    const playedAt = new Date(`${date}T${time || "00:00"}:00`);

    // bygg payload
    const body = {
      createdById,
      playedAt: playedAt.toISOString(),
      sets: sets.map((s) => ({
        setIndex: s.setIndex,
        teamAPlayer1Id: teamA1,
        teamAPlayer2Id: teamA2,
        teamBPlayer1Id: teamB1,
        teamBPlayer2Id: teamB2,
        scoreA: Number(s.scoreA),
        scoreB: Number(s.scoreB),
      })),
    };

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Kunne ikke oprette kamp: ${res.status} ${txt}`);
      }

      // succes – send brugeren til kamplisten
      router.push("/matches");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Kunne ikke oprette kamp.");
    }
  }

  if (loadingPlayers) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Opret kamp</h1>
        <p>Henter spillere…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 820, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 16 }}>Opret kamp</h1>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            border: "1px solid #ef4444",
            color: "#991b1b",
            padding: 12,
            borderRadius: 6,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
        {/* Oprettet af + dato/tid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 140px 100px",
            gap: 12,
            alignItems: "end",
          }}
        >
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Oprettet af
            </label>
            <select
              value={createdById}
              onChange={(e) => setCreatedById(e.target.value)}
              required
              style={{ width: "100%", padding: 8 }}
            >
              {playerOptions}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Dato
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ width: "100%", padding: 8 }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
              Tid
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />
          </div>
        </div>

        {/* Holdvalg */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <fieldset
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <legend style={{ padding: "0 6px", fontWeight: 600 }}>Team A</legend>
            <div style={{ display: "grid", gap: 8 }}>
              <select
                value={teamA1}
                onChange={(e) => setTeamA1(e.target.value)}
                required
                style={{ padding: 8 }}
              >
                <option value="">Vælg spiller 1</option>
                {playerOptions}
              </select>
              <select
                value={teamA2}
                onChange={(e) => setTeamA2(e.target.value)}
                required
                style={{ padding: 8 }}
              >
                <option value="">Vælg spiller 2</option>
                {playerOptions}
              </select>
            </div>
          </fieldset>

          <fieldset
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <legend style={{ padding: "0 6px", fontWeight: 600 }}>Team B</legend>
            <div style={{ display: "grid", gap: 8 }}>
              <select
                value={teamB1}
                onChange={(e) => setTeamB1(e.target.value)}
                required
                style={{ padding: 8 }}
              >
                <option value="">Vælg spiller 1</option>
                {playerOptions}
              </select>
              <select
                value={teamB2}
                onChange={(e) => setTeamB2(e.target.value)}
                required
                style={{ padding: 8 }}
              >
                <option value="">Vælg spiller 2</option>
                {playerOptions}
              </select>
            </div>
          </fieldset>
        </div>

        {/* Sæt-resultater */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <strong>Sæt</strong>
            <button
              type="button"
              onClick={addSet}
              style={{
                background: "#111827",
                color: "white",
                border: 0,
                borderRadius: 6,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              + Tilføj sæt
            </button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {sets.map((s, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 1fr 90px",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <span style={{ opacity: 0.8 }}>Sæt {s.setIndex}</span>
                <input
                  type="number"
                  min={0}
                  placeholder="Team A"
                  value={s.scoreA}
                  onChange={(e) =>
                    updateSet(idx, { scoreA: Number(e.target.value) })
                  }
                  style={{ padding: 8 }}
                  required
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Team B"
                  value={s.scoreB}
                  onChange={(e) =>
                    updateSet(idx, { scoreB: Number(e.target.value) })
                  }
                  style={{ padding: 8 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeSet(idx)}
                  disabled={sets.length === 1}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    border: 0,
                    borderRadius: 6,
                    padding: "6px 10px",
                    cursor: sets.length === 1 ? "not-allowed" : "pointer",
                    opacity: sets.length === 1 ? 0.6 : 1,
                  }}
                  title={sets.length === 1 ? "Mindst 1 sæt kræves" : "Fjern sæt"}
                >
                  Fjern
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => router.push("/matches")}
            style={{
              background: "white",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            Annullér
          </button>
          <button
            type="submit"
            style={{
              background: "#16a34a",
              color: "white",
              border: 0,
              borderRadius: 6,
              padding: "10px 14px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Gem kamp
          </button>
        </div>
      </form>
    </div>
  );
}
