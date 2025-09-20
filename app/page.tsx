import { prisma } from "../lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Padel – Brugere</h1>
      <div className="grid gap-2">
        {users.length === 0 ? (
          <p>Ingen brugere fundet.</p>
        ) : (
          users.map((u) => (
            <div key={u.id} className="rounded border p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-sm text-gray-500">{u.email}</div>
              </div>
              <div className="text-sm">
                <span className="rounded bg-gray-100 px-2 py-1 mr-2">{u.role}</span>
                {u.isActive ? (
                  <span className="rounded bg-green-100 px-2 py-1">AKTIV</span>
                ) : (
                  <span className="rounded bg-red-100 px-2 py-1">INAKTIV</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
