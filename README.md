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
   - API docs (every endpoint, with "try it"): http://localhost:5173/api/docs

## How the API is organized

```
apps/api/src/
├── index.ts         starts the server
├── app.ts           builds the app: middleware, then /api routes, then the 404 and error handlers
├── env.ts           checks the environment variables at startup
├── routes.ts        mounts every feature under /api
├── docs.ts          the API docs at /api/docs, built from every feature's *.docs.ts
├── db/              database tables (schema.ts) and client
├── modules/         one folder per feature
│   ├── health/
│   └── users/
│       ├── users.routes.ts   URLs and thin handlers: read the request, call the service, send the response
│       ├── users.docs.ts     how its endpoints appear in the API docs
│       └── users.test.ts
├── middleware/      requireAuth (signed-in users only), validate (checks the request body), not-found, error-handler
└── lib/             auth (Better Auth setup), HttpError, shared pieces for the API docs
```

A feature with its own logic also gets a `<feature>.service.ts` (business logic and database
queries, no `req`/`res` there) and a `<feature>.schemas.ts` (zod schemas for the request data).
`users` doesn't need them: Better Auth already loads the signed-in user.

To add a feature, create a folder in `modules/` with the files it needs, then add its router in
`routes.ts` and its docs in `docs.ts`. To remove one, delete its folder and its line in both files.
In a service, `throw new HttpError(404, 'Project not found')` to send that status to the client.
Invalid input (a zod error) becomes a 400 automatically.

### API docs

Open http://localhost:5173/api/docs while developing to see every endpoint in one place and try it
from the browser. Sign in there first (`POST /api/auth/sign-in/email`) to call endpoints that need a
signed-in user: the browser keeps the session cookie.

The docs are off in production by default, which includes `docker compose up` (it sets
`NODE_ENV=production`). The page lists every endpoint to anyone who opens it, and it loads its script
from a CDN on the same site as the session cookie. To turn them on anyway, for example on a staging
server only your team can reach, set `API_DOCS_ENABLED=true` in `apps/api/.env`.

The page is built from two sources: each module's `*.docs.ts` file, and Better Auth, which describes
its own `/api/auth/*` endpoints. The raw description is at `/api/docs/openapi.json`, which tools like
Postman or Insomnia can import. When you add or change an endpoint, update its `*.docs.ts` file too.

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
