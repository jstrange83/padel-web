// app/matches/new/page.tsx
import { PrismaClient } from "@prisma/client";
import NewMatchForm from "./ui/NewMatchForm";

const prisma = new PrismaClient();

export default async function Page() {
  const players = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <NewMatchForm players={players} />;
}
