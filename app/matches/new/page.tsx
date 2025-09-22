// app/matches/new/page.tsx
import { PrismaClient } from "@prisma/client";
import NewMatchForm from "./ui/NewMatchForm";

const prisma = new PrismaClient();

export default async function Page() {
  // Hent aktive spillere direkte fra DB på serveren
  const players = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // Giv dem til klient-komponenten som props
  return <NewMatchForm players={players} />;
}
