# Setting up a monorepo like this one

Every step and command to build this project's monorepo from an empty folder.
Short config files are shown in full; longer code files link to their copy in this repo.

Commands use Git Bash syntax.

## 0. Install the tools

```sh
node -v                       # needs v24
npm install -g pnpm@12.14.0   # the package manager
docker -v                     # for the database and running everything
```

## 1. Create the root

```sh
mkdir saas-boilerplate && cd saas-boilerplate
git init
mkdir -p apps packages
```

**`package.json`**: the root only runs tasks and has no app code.

```json
{
  "name": "saas-boilerplate",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@12.14.0",
  "engines": { "node": "24.x" },
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

**`pnpm-workspace.yaml`**: tells pnpm where the packages are. The catalog keeps shared tools on one version across all packages.

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
allowBuilds:
  esbuild: true

catalog:
  typescript: 6.0.3
  eslint: ^10.13.0
  vitest: ^5.0.5
```

**`.gitattributes`**: keeps LF line endings on Windows too.

```
* text=auto eol=lf
```

**`.gitignore`**: at minimum:

```
node_modules/
dist/
.turbo/
.astro/
*.tsbuildinfo
.env
.env.*
!.env.example
```

Install the root tools. `-w` installs them at the workspace root:

```sh
pnpm add -Dw turbo prettier typescript@catalog:
```

## 2. Turborepo and Prettier

**`turbo.json`**: `^build` means "build the packages I depend on first".

```json
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".astro/**"] },
    "dev": {
      "dependsOn": ["^build"],
      "cache": false,
      "persistent": true,
      "passThroughEnv": ["PORT"]
    },
    "lint": {},
    "typecheck": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"] }
  }
}
```

**`.prettierrc.json`**

```json
{ "singleQuote": true, "semi": true, "printWidth": 100 }
```

**`.prettierignore`**

```
pnpm-lock.yaml
packages/db/migrations
```

## 3. Shared TypeScript config: `packages/config-typescript`

```sh
mkdir -p packages/config-typescript
```

- **`package.json`**: just `{ "name": "@saas/config-typescript", "version": "0.0.0", "private": true }`
- **[base.json](../packages/config-typescript/base.json)**: settings for every package (strict mode, unused-variable checks).
- **[node.json](../packages/config-typescript/node.json)**: for the API and db, which are compiled with `tsc`.
- **[react.json](../packages/config-typescript/react.json)**: for the web app, where Vite builds and `tsc` only checks types.

## 4. Shared ESLint config: `packages/config-eslint`

```sh
mkdir -p packages/config-eslint
```

**`package.json`**

```json
{
  "name": "@saas/config-eslint",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": { "./astro": "./astro.js", "./node": "./node.js", "./react": "./react.js" }
}
```

```sh
pnpm --filter @saas/config-eslint add @eslint/js eslint@catalog: typescript@catalog: typescript-eslint globals eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-plugin-astro
```

Then create the four rule files:

- **[base.js](../packages/config-eslint/base.js)**: rules for all packages.
- **[node.js](../packages/config-eslint/node.js)**: for the API and db.
- **[react.js](../packages/config-eslint/react.js)**: for the web app.
- **[astro.js](../packages/config-eslint/astro.js)**: for the marketing site.

## 5. Database package: `packages/db`

```sh
mkdir -p packages/db/src
pnpm --filter @saas/db init   # or write package.json by hand
```

Use [packages/db/package.json](../packages/db/package.json) as the reference. The important part is `exports`, which points at `dist/` so apps import the built code.

```sh
pnpm --filter @saas/db add drizzle-orm pg
pnpm --filter @saas/db add -D drizzle-kit @types/pg @types/node typescript@catalog: eslint@catalog: "@saas/config-eslint@workspace:*" "@saas/config-typescript@workspace:*"
```

Files:

- **[tsconfig.json](../packages/db/tsconfig.json)**: extends `@saas/config-typescript/node.json` and sets `declaration: true` so apps get the types.
- **[eslint.config.js](../packages/db/eslint.config.js)**: a one-liner that re-exports `@saas/config-eslint/node`.
- **[drizzle.config.ts](../packages/db/drizzle.config.ts)**: settings for the `drizzle-kit` commands.
- **[src/schema.ts](../packages/db/src/schema.ts)**: the tables.
- **[src/index.ts](../packages/db/src/index.ts)**: the connection pool (with an `error` listener, so a dropped connection doesn't crash the API), plus re-exports of the tables and of drizzle's query helpers (`eq`, `and`...), so apps don't need their own `drizzle-orm`.

## 6. API: `apps/api`

```sh
mkdir -p apps/api/src
```

Use [apps/api/package.json](../apps/api/package.json) as the reference (scripts: `dev`, `build`, `start`, `typecheck`, `lint`, `test`).

```sh
pnpm --filter @saas/api add express zod "@saas/db@workspace:*"
pnpm --filter @saas/api add -D tsx supertest @types/express @types/node @types/supertest typescript@catalog: vitest@catalog: eslint@catalog: "@saas/config-eslint@workspace:*" "@saas/config-typescript@workspace:*"
```

Files:

- **[tsconfig.json](../apps/api/tsconfig.json)** and **[tsconfig.build.json](../apps/api/tsconfig.build.json)**: the build config leaves test files out of `dist`.
- **[eslint.config.js](../apps/api/eslint.config.js)**
- **[.env.example](../apps/api/.env.example)**: copy it to `.env`.
- **[src/env.ts](../apps/api/src/env.ts)**: checks the environment variables at startup.
- **[src/app.ts](../apps/api/src/app.ts)**: builds the app: `trust proxy`, JSON parsing, the `/api` router, then the 404 handler and the error handler.
- **[src/index.ts](../apps/api/src/index.ts)**: starts the server.
- **[src/routes.ts](../apps/api/src/routes.ts)**: mounts every feature's router under `/api`.
- **[src/modules/](../apps/api/src/modules/)**: one folder per feature. Each has `*.routes.ts` (thin handlers: read `req`, call the service, send `res`), `*.service.ts` (business logic and database queries, no `req`/`res`), `*.schemas.ts` (zod input schemas) and `*.test.ts`.
- **[src/middleware/](../apps/api/src/middleware/)**: shared middleware: `validate` (checks `req.body` with zod), `not-found` and `error-handler` (turns zod errors into 400 and `HttpError` into its status).
- **[src/lib/http-error.ts](../apps/api/src/lib/http-error.ts)**: `throw new HttpError(404, 'User not found')` from a service.
- **[src/app.test.ts](../apps/api/src/app.test.ts)**: app-wide tests (unknown routes). Feature tests sit next to their module.

## 7. Web app: `apps/web`

```sh
pnpm create vite apps/web --template react-ts
```

Then adapt the generated app:

1. In `apps/web/package.json`:
   - Rename the package to `"@saas/web"`.
   - Add the scripts `"lint": "eslint ."`, `"typecheck": "tsc -b"` and `"test": "vitest run"`.
   - Remove the template's ESLint packages, which the shared config replaces.
2. Install the shared configs and test tools:
   ```sh
   pnpm --filter @saas/web add -D "@saas/config-eslint@workspace:*" "@saas/config-typescript@workspace:*" eslint@catalog: typescript@catalog: vitest@catalog: jsdom @testing-library/react @testing-library/dom
   ```
3. Replace these files with the repo's versions:
   - **[eslint.config.js](../apps/web/eslint.config.js)**: a one-liner.
   - **[tsconfig.app.json](../apps/web/tsconfig.app.json)**: extends `react.json`.
   - **[tsconfig.node.json](../apps/web/tsconfig.node.json)**: extends `node.json`, only type-checks `vite.config.ts`.
   - **[vite.config.ts](../apps/web/vite.config.ts)**: adds the `/api` proxy to `localhost:3000` and the test settings.
   - **[src/test-setup.ts](../apps/web/src/test-setup.ts)**
   - **[src/App.test.tsx](../apps/web/src/App.test.tsx)**

## 8. Marketing site: `apps/marketing`

```sh
pnpm create astro@latest apps/marketing --template minimal --no-install --no-git
```

Then adapt the generated site:

1. In `apps/marketing/package.json`, rename the package to `"@saas/marketing"`, add `"private": true`, and add the scripts `"lint": "eslint ."` and `"typecheck": "astro check"`.
2. Install the shared ESLint config and the type-check tool:
   ```sh
   pnpm --filter @saas/marketing add -D @astrojs/check "@saas/config-eslint@workspace:*" eslint@catalog: typescript@catalog:
   ```
3. Add **[eslint.config.js](../apps/marketing/eslint.config.js)** and exclude it in **[tsconfig.json](../apps/marketing/tsconfig.json)**.

## 9. Check the workspace, then create the database

```sh
pnpm install
pnpm format && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

All five should pass before you continue.

```sh
cp apps/api/.env.example apps/api/.env
docker compose up -d db                      # needs step 10's compose.yaml, or run any Postgres 18
pnpm --filter @saas/db db:generate           # writes the first migration SQL file
pnpm --filter @saas/db db:migrate            # creates the tables
pnpm dev                                     # web :5173, marketing :4321, api :3000
```

## 10. Docker

These files are self-contained, so copy them from the repo:

- **[.dockerignore](../.dockerignore)**
- **[apps/api/Dockerfile](../apps/api/Dockerfile)**: runs the API as the `node` user, not root.
- **[apps/web/Dockerfile](../apps/web/Dockerfile)** and **[apps/web/nginx.conf](../apps/web/nginx.conf)**: nginx serves the React files and forwards `/api` to the API, with the `X-Forwarded-*` headers.
- **[apps/marketing/Dockerfile](../apps/marketing/Dockerfile)**
- **[compose.yaml](../compose.yaml)**: runs `db`, then `migrate`, then `api`, plus `web` and `marketing`. Long-running services restart if they crash. The API and Postgres ports are published on `127.0.0.1` only, and the database password comes from `POSTGRES_PASSWORD` (default `postgres`).

Every Dockerfile uses the repo root as its build context (`context: .`), because each app needs the shared `packages/`.

```sh
docker compose up --build    # web :8080, marketing :8081, api :3000
```

## 11. CI

Create **[.github/workflows/ci-cd.yaml](../.github/workflows/ci-cd.yaml)**. It has two jobs that run at the same time:

- **`ci`**: installs dependencies with `--frozen-lockfile` (cached between runs), fails if `db:generate` would create a new migration (someone changed `schema.ts` without generating one), then runs format check, lint, typecheck, test and build.
- **`docker`**: runs `docker compose build`, so a broken Dockerfile is caught before deploy.

## 12. First commit

```sh
git add .
git commit -m "chore: set up monorepo"
```

## Rules that keep the monorepo working

- **Use `pnpm --filter <name> add`** to install packages into one package, and `-w` only for root tools.
- **Use `workspace:*`** for your own packages and `catalog:` for tools every package shares.
- **Packages other apps import** (like `@saas/db`) need a `build` script and `exports` pointing at `dist/`.
- **Every package defines the same script names** (`dev`, `build`, `lint`, `typecheck`, `test`), so Turborepo can run them all from the root.
