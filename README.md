# Threadbase Vote Endpoint

Express + Prisma 7.10 + PostgreSQL implementation of `POST /posts/:id/vote`.

## What it demonstrates
- `Post.score` starts at zero and is updated with Prisma's atomic `increment: 1`.
- `Vote` prevents a user from voting twice for the same post via `@@unique([userId, postId])`.
- Vote insertion and score increment share one Prisma `$transaction([...])`; either both persist or neither does.
- Error mapping: invalid ID `400`, duplicate vote `409` (`P2002`), missing post `404` (`P2025`), unexpected failures are passed to Express error middleware.

## Requirements
- Node.js 22+
- PostgreSQL

## Local setup
1. Create a PostgreSQL database named `threadbase`:
   ```sql
   CREATE DATABASE threadbase;
   ```
2. Copy `.env.example` to `.env` and set your local credentials. Never commit `.env`.
3. Install dependencies and apply the checked-in migration:
   ```bash
   npm install
   npx prisma migrate dev
   npx prisma generate
   npm run seed
   ```
4. Start the server:
   ```bash
   npx tsx src/app.ts
   ```
   It listens on port 3000 by default. Stub authentication sets `req.user = { id: 1 }` for local testing only.

## Test the endpoint
The automated HTTP integration test makes the same four requests to the Express app and asserts their status codes:
```bash
npm test
```
Expected results:

| Request | Expected status | Behavior |
| --- | ---: | --- |
| `POST /posts/1/vote` | `201` | Vote recorded; score becomes 1 |
| Repeat `POST /posts/1/vote` | `409` | Duplicate vote rejected; score stays 1 |
| `POST /posts/999999/vote` | `404` | Missing post |
| `POST /posts/abc/vote` | `400` | Invalid post ID |

For manual Thunder Client/Postman verification, run `npm run seed` first, then use `POST http://localhost:3000/posts/1/vote` with no body. The first request should be 201; repeat it for 409, then use the missing and invalid IDs for 404 and 400. If you ran `npm test` first, run the seed command again before manual requests.

## Seed data
`npm run seed` creates a test user with ID 1 and two posts with IDs 1 and 2. It resets vote/post sample data for repeatable development testing.

## Screenshot / CI verification
The PR description links the actual GitHub Actions run, which executes the HTTP integration test against PostgreSQL. The report image summarizes those real test results. This is an automated HTTP test report, not a screenshot from the Thunder Client UI; capture Thunder Client itself locally if your assessor strictly requires that specific application screenshot.

## Security note
The authentication middleware is intentionally a stub for this exercise. Do not deploy this implementation publicly as-is; replace it with real authentication and authorization before use.
