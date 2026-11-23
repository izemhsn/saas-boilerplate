# saas-boilerplate

A starting point for a SaaS product, organized as a pnpm + Turborepo monorepo.

> **Source-available, not open source.** You can read the code and try it on your own computer
> for free. Building or selling a product with it needs a paid license. See [License](#license).

## What's inside

| Folder                       | What it is                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `apps/api`                   | Express API (TypeScript), with the database tables, migrations and client (Drizzle) |
| `apps/web`                   | The product app (React + Vite)                                                      |
| `apps/marketing`             | The public website (Astro)                                                          |
| `packages/config-eslint`     | Shared ESLint rules                                                                 |
| `packages/config-typescript` | Shared TypeScript settings                                                          |

## Requirements

- Node.js 24
- pnpm 12 (`npm install -g pnpm@12`)
- Docker (for the database, or to run everything)

## Run everything with Docker

```sh
cp apps/api/.env.example apps/api/.env   # first time only, then set BETTER_AUTH_SECRET in it
docker compose up --build
```

The API needs `BETTER_AUTH_SECRET` (it signs the login cookies) and won't start without it.
Docker reads it from `apps/api/.env`, the same file used for development. Generate one with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

This starts the database, creates the tables (the `migrate` service), then starts the apps:

- Web app: http://localhost:8080
- Marketing site: http://localhost:8081
- API: http://localhost:3000

The API (3000) and the database (5432) only accept connections from your own machine.
Visitors reach the API through the web app, which forwards `/api` requests to it.

**On a real server**, set a strong database password before the first start (letters and numbers
only, because it also goes inside `DATABASE_URL`), and the address people use to open the app
(sign-in is refused from any other address):

```sh
export POSTGRES_PASSWORD=ChangeMeToSomethingLong123
export BETTER_AUTH_URL=https://app.example.com
docker compose up -d --build
```

Also create `apps/api/.env` on the server with its own `BETTER_AUTH_SECRET` (never reuse the one
from your computer). Git ignores `.env`, so `git pull` keeps it. If you change the secret later,
everyone has to sign in again.

Postgres only reads `POSTGRES_PASSWORD` the first time it creates its data volume. To change the
password later, change it inside the database too, then restart with the new value:

```sh
docker compose exec db psql -U postgres -c "ALTER USER postgres PASSWORD 'NewPassword456';"
export POSTGRES_PASSWORD=NewPassword456
docker compose up -d
```

## Run on your machine (for development)

1. Install dependencies:

   ```sh
   pnpm install
   ```

2. Create the API's `.env` file from the example, then paste a secret into `BETTER_AUTH_SECRET`
   (generate it with the `node -e ...` command above):

   ```sh
   cp apps/api/.env.example apps/api/.env
   ```

3. Start only the database in Docker:

   ```sh
   docker compose up -d db
   ```

4. Create the tables:

   ```sh
   pnpm --filter @saas/api db:migrate
   ```

5. Start all the apps (they reload when you save a file):

   ```sh
   pnpm dev
   ```

   - Web app: http://localhost:5173 (sends `/api` requests to the API)
   - Marketing site: http://localhost:4321
   - API: http://localhost:3000

## How the API is organized

```
apps/api/src/
├── index.ts         starts the server
├── app.ts           builds the app: middleware, then /api routes, then the 404 and error handlers
├── env.ts           checks the environment variables at startup
├── routes.ts        mounts every feature under /api
├── modules/         one folder per feature (health, users, ...)
│   └── users/
│       ├── users.routes.ts    URLs and thin handlers: read the request, call the service, send the response
│       ├── users.service.ts   business logic and database queries (no req/res here)
│       ├── users.schemas.ts   zod schemas for the request data
│       └── users.test.ts
├── middleware/      validate (checks the request body), not-found, error-handler
└── lib/             small helpers, like HttpError
```

To add a feature, create a folder in `modules/` with the same files, then add one line to `routes.ts`.
In a service, `throw new HttpError(404, 'Not found')` to send that status to the client.
Invalid input (a zod error) becomes a 400 automatically.

## Changing the database

1. Edit the tables in `apps/api/src/db/schema.ts`.
2. Create a migration (an SQL file in `apps/api/migrations`; commit it):

   ```sh
   pnpm --filter @saas/api db:generate
   ```

3. Apply it to your database:

   ```sh
   pnpm --filter @saas/api db:migrate
   ```

To browse the data, run `pnpm --filter @saas/api db:studio`.

## Checks

These are the same checks CI runs on every push:

```sh
pnpm format:check # code formatting (fix with: pnpm format)
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## License

This is commercial software, not open source. See [LICENSE](LICENSE) for the full terms. In short:

- You may use it to build and sell as many of your own products (or your clients' products) as you like.
- You may not resell, share or publish the boilerplate itself, or use it to make another boilerplate, starter kit or template.
