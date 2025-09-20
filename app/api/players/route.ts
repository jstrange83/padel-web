import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/client';

export async function GET() {
  const players = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: [{ name: 'asc' }],
    select: {
      id: true, name: true, email: true, role: true,
      eloRating: { select: { rating: true } },
    },
  });
  return NextResponse.json(players);
}
