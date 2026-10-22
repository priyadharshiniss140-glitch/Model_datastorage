import "dotenv/config";
import { prisma } from "./lib/prisma";

async function main(): Promise<void> {
  // This is a deterministic development seed. It clears only sample votes/posts.
  await prisma.vote.deleteMany();
  await prisma.post.deleteMany();

  await prisma.user.upsert({
    where: { id: 1 },
    update: { name: "Threadbase Test User" },
    create: { id: 1, name: "Threadbase Test User" },
  });

  await prisma.post.createMany({
    data: [
      { id: 1, title: "Welcome to Threadbase", body: "First sample post", score: 0 },
      { id: 2, title: "Prisma transactions", body: "Second sample post", score: 0 },
    ],
  });

  // Keep serial sequences positioned after explicit sample IDs.
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"User"', 'id'), (SELECT MAX(id) FROM "User"))`;
  await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"Post"', 'id'), (SELECT MAX(id) FROM "Post"))`;

  console.log("Seed complete: user id 1 and posts id 1 and 2 are ready.");
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
