# saas-boilerplate

A starting point for a SaaS product, organized as a pnpm + Turborepo monorepo.

## What's inside

| Folder                       | What it is                                       |
| ---------------------------- | ------------------------------------------------ |
| `apps/api`                   | Express API (TypeScript)                         |
| `apps/web`                   | The product app (React + Vite)                   |
| `apps/marketing`             | The public website (Astro)                       |
| `packages/db`                | Database tables, migrations and client (Drizzle) |
| `packages/config-eslint`     | Shared ESLint rules                              |
| `packages/config-typescript` | Shared TypeScript settings                       |

## Requirements

- Node.js 24
- pnpm 12 (`npm install -g pnpm`)
- Docker (for the database, or to run everything)

## Run everything with Docker

```sh
docker compose up --build
```

This starts the database, creates the tables (the `migrate` service), then starts the apps:

- Web app: http://localhost:8080
- Marketing site: http://localhost:8081
- API: http://localhost:3000

## Run on your machine (for development)

1. Install dependencies:

   ```sh
   pnpm install
   ```

2. Create the API's `.env` file from the example:

   ```sh
   cp apps/api/.env.example apps/api/.env
   ```

3. Start only the database in Docker:

   ```sh
   docker compose up -d db
   ```

4. Create the tables:

   ```sh
   pnpm --filter @saas/db db:migrate
   ```

5. Start all the apps (they reload when you save a file):

   ```sh
   pnpm dev
   ```

   - Web app: http://localhost:5173 (sends `/api` requests to the API)
   - Marketing site: http://localhost:4321
   - API: http://localhost:3000

## Changing the database

1. Edit the tables in `packages/db/src/schema.ts`.
2. Create a migration (an SQL file in `packages/db/migrations`; commit it):

   ```sh
   pnpm --filter @saas/db db:generate
   ```

3. Apply it to your database:

   ```sh
   pnpm --filter @saas/db db:migrate
   ```

To browse the data, run `pnpm --filter @saas/db db:studio`.

## Checks

These are the same checks CI runs on every push:

```sh
pnpm format:check # code formatting (fix with: pnpm format)
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
