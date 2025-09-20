/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/client';
import { calcElo } from '@/lib/elo';

type Body = {
  createdById: string;
  sets: Array<{
    teamAPlayer1Id: string;
    teamAPlayer2Id: string;
    teamBPlayer1Id: string;
    teamBPlayer2Id: string;
    scoreA: number;
    scoreB: number;
  }>;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body.sets?.length) {
      return NextResponse.json({ error: 'Ingen sæt angivet' }, { status: 400 });
    }

    // Tjek at samme fire spillere bruges i alle sæt
    const first = body.sets[0];
    const consistent = body.sets.every(s =>
      s.teamAPlayer1Id === first.teamAPlayer1Id &&
      s.teamAPlayer2Id === first.teamAPlayer2Id &&
      s.teamBPlayer1Id === first.teamBPlayer1Id &&
      s.teamBPlayer2Id === first.teamBPlayer2Id
    );
    if (!consistent) {
      return NextResponse.json({ error: 'Sæt skal have samme 4 spillere' }, { status: 400 });
    }

    // Hent current Elo for alle fire
    const [A1, A2, B1, B2] = await prisma.$transaction([
      prisma.eloRating.upsert({
        where: { userId: first.teamAPlayer1Id },
        create: { userId: first.teamAPlayer1Id, rating: 1000 },
        update: {},
      }),
      prisma.eloRating.upsert({
        where: { userId: first.teamAPlayer2Id },
        create: { userId: first.teamAPlayer2Id, rating: 1000 },
        update: {},
      }),
      prisma.eloRating.upsert({
        where: { userId: first.teamBPlayer1Id },
        create: { userId: first.teamBPlayer1Id, rating: 1000 },
        update: {},
      }),
      prisma.eloRating.upsert({
        where: { userId: first.teamBPlayer2Id },
        create: { userId: first.teamBPlayer2Id, rating: 1000 },
        update: {},
      }),
    ]);

    const result = calcElo(
      A1.rating, A2.rating, B1.rating, B2.rating,
      body.sets.map(s => ({ scoreA: s.scoreA, scoreB: s.scoreB }))
    );

    // Opret match + sets og opdater Elo i én transaktion
    const created = await prisma.$transaction(async (tx) => {
      const match = await tx.match.create({
        data: {
          createdById: body.createdById,
          sets: {
            createMany: {
              data: body.sets.map((s, idx) => ({
                matchId: undefined as any, // udfyldes automatisk
                setIndex: idx + 1,
                teamAPlayer1Id: s.teamAPlayer1Id,
                teamAPlayer2Id: s.teamAPlayer2Id,
                teamBPlayer1Id: s.teamBPlayer1Id,
                teamBPlayer2Id: s.teamBPlayer2Id,
                scoreA: s.scoreA,
                scoreB: s.scoreB,
              })),
            },
          },
        },
        include: { sets: true },
      });

      // Opdater EloRating + skriv EloHistory
      await Promise.all([
        tx.eloRating.update({
          where: { userId: first.teamAPlayer1Id },
          data: { rating: result.newA1 },
        }),
        tx.eloRating.update({
          where: { userId: first.teamAPlayer2Id },
          data: { rating: result.newA2 },
        }),
        tx.eloRating.update({
          where: { userId: first.teamBPlayer1Id },
          data: { rating: result.newB1 },
        }),
        tx.eloRating.update({
          where: { userId: first.teamBPlayer2Id },
          data: { rating: result.newB2 },
        }),
        tx.eloHistory.createMany({
          data: [
            { userId: first.teamAPlayer1Id, matchId: match.id, delta: result.deltaA1, ratingAfter: result.newA1 },
            { userId: first.teamAPlayer2Id, matchId: match.id, delta: result.deltaA2, ratingAfter: result.newA2 },
            { userId: first.teamBPlayer1Id, matchId: match.id, delta: result.deltaB1, ratingAfter: result.newB1 },
            { userId: first.teamBPlayer2Id, matchId: match.id, delta: result.deltaB2, ratingAfter: result.newB2 },
          ],
        }),
      ]);

      return match;
    });

    return NextResponse.json({ ok: true, matchId: created.id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: 'Serverfejl' }, { status: 500 });
  }
}
