export type EloResult = {
  newA1: number; newA2: number;
  newB1: number; newB2: number;
  deltaA1: number; deltaA2: number;
  deltaB1: number; deltaB2: number;
};

const K = 32;

function expectedScore(ratingA: number, ratingB: number) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * @param a1,a2,b1,b2  nuværende ratings
 * @param sets array af {scoreA, scoreB} pr. sæt
 */
export function calcElo(
  a1: number, a2: number, b1: number, b2: number,
  sets: Array<{ scoreA: number; scoreB: number }>
): EloResult {
  const teamA = (a1 + a2) / 2;
  const teamB = (b1 + b2) / 2;

  const wonA = sets.filter(s => s.scoreA > s.scoreB).length;
  const wonB = sets.filter(s => s.scoreB > s.scoreA).length;

  // Kampens “score” for A og B (best of 3 → 0, 0.5, 1 via 0/1/2 sæt)
  const Sa = wonA > wonB ? 1 : wonA === wonB ? 0.5 : 0;
  const Sb = 1 - Sa;

  const Ea = expectedScore(teamA, teamB);
  const Eb = 1 - Ea;

  const teamANew = teamA + K * (Sa - Ea);
  const teamBNew = teamB + K * (Sb - Eb);

  // fordel team-delta ligeligt mellem spillerne
  const deltaA = teamANew - teamA;
  const deltaB = teamBNew - teamB;

  const newA1 = Math.round(a1 + deltaA);
  const newA2 = Math.round(a2 + deltaA);
  const newB1 = Math.round(b1 + deltaB);
  const newB2 = Math.round(b2 + deltaB);

  return {
    newA1, newA2, newB1, newB2,
    deltaA1: Math.round(deltaA),
    deltaA2: Math.round(deltaA),
    deltaB1: Math.round(deltaB),
    deltaB2: Math.round(deltaB),
  };
}
