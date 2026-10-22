import assert from "node:assert/strict";
import request from "supertest";
import app from "./app";
import { prisma } from "./lib/prisma";

async function main(): Promise<void> {
  // Reset only the development sample data so all four requests are deterministic.
  await prisma.vote.deleteMany();
  await prisma.post.deleteMany();

  await prisma.user.upsert({
    where: { id: 1 },
    update: { name: "Threadbase Test User" },
    create: { id: 1, name: "Threadbase Test User" },
  });

  await prisma.post.createMany({
    data: [
      { id: 1, title: "Vote endpoint test", body: "First sample", score: 0 },
      { id: 2, title: "Second post", body: "Second sample", score: 0 },
    ],
  });

  try {
    const first = await request(app).post("/posts/1/vote");
    assert.equal(first.status, 201, JSON.stringify(first.body));
    assert.equal(first.body.score, 1);
    console.log("PASS 201 — first vote succeeds; score is 1");

    const duplicate = await request(app).post("/posts/1/vote");
    assert.equal(duplicate.status, 409, JSON.stringify(duplicate.body));
    const afterDuplicate = await prisma.post.findUnique({ where: { id: 1 } });
    assert.equal(afterDuplicate?.score, 1, "duplicate vote must not change score");
    console.log("PASS 409 — duplicate vote rejected; score remains 1");

    const missing = await request(app).post("/posts/999999/vote");
    assert.equal(missing.status, 404, JSON.stringify(missing.body));
    console.log("PASS 404 — non-existent post rejected");

    const invalid = await request(app).post("/posts/abc/vote");
    assert.equal(invalid.status, 400, JSON.stringify(invalid.body));
    console.log("PASS 400 — invalid post id rejected");

    console.log("\nAll four HTTP status checks passed.");
  } finally {
    await prisma.vote.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany({ where: { id: 1, name: "Threadbase Test User" } });
    await prisma.$disconnect();
  }
}

main().catch(async (error: unknown) => {
  console.error("Endpoint integration test failed:", error);
  await prisma.$disconnect();
  process.exitCode = 1;
});
