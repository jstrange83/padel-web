import { prisma } from '@/prisma/client';

export const dynamic = 'force-dynamic';

export default async function MatchesPage() {
  const matches = await prisma.match.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      sets: { orderBy: { setIndex: 'asc' } },
      createdBy: { select: { name: true } },
    },
    take: 25,
  });

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold mb-4">Kampe (seneste 25)</h1>
      {matches.map(m => {
        const s = m.sets.map(x => `${x.scoreA}-${x.scoreB}`).join(', ');
        return (
          <div key={m.id} className="border rounded p-4">
            <div className="text-sm text-gray-500">{new Date(m.createdAt).toLocaleString()} — af {m.createdBy?.name ?? 'ukendt'}</div>
            <div className="font-mono">{s}</div>
          </div>
        );
      })}
      {matches.length === 0 && <div>Ingen kampe endnu.</div>}
    </div>
  );
}
