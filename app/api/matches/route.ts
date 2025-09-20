import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** ---------- Typer for request body ---------- */
type SetInput = {
  setIndex?: number;
  teamAPlayer1Id: string;
  teamAPlayer2Id: string;
  teamBPlayer1Id: string;
  teamBPlayer2Id: string;
  scoreA: number;
  scoreB: number;
};

type CreateMatchBody = {
  createdById: string;
  playedAt?: string | Date;
  sets: SetInput[];
};

/** ---------- GET: hent kampe ---------- */
export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: {
        sets: true,
        createdBy: true,
      },
      orderBy: { playedAt: "desc" },
    });

    return NextResponse.json(matches);
  } catch (err) {
    console.error("GET /api/matches error:", err);
    return NextResponse.json(
      { error: "Kunne ikke hente kampe" },
      { status: 500 }
    );
  }
}

/** ---------- POST: opret kamp + sæt ---------- */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateMatchBody;

    // Minimal validering
    if (!body?.createdById) {
      return NextResponse.json(
        { error: "createdById er påkrævet" },
        { status: 400 }
      );
    }
    if (!Array.isArray(body.sets) || body.sets.length === 0) {
      return NextResponse.json(
        { error: "Mindst ét sæt er påkrævet" },
        { status: 400 }
      );
    }

    const playedAt =
      body.playedAt !== undefined ? new Date(body.playedAt) : new Date();

    const created = await prisma.$transaction(async (tx) => {
      // Opret kamp (NB: playedAt er påkrævet i din Prisma-type)
      const match = await tx.match.create({
        data: {
          createdById: body.createdById,
          playedAt,
          // Opret alle sæt i samme operation.
          // VIGTIGT: INGEN matchId i nested create – Prisma sætter den automatisk.
          sets: {
            createMany: {
              data: body.sets.map((s, idx) => ({
                setIndex: typeof s.setIndex === "number" ? s.setIndex : idx,
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

      return match;
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST /api/matches error:", err);
    return NextResponse.json(
      { error: "Kunne ikke oprette kamp" },
      { status: 500 }
    );
  }
}
