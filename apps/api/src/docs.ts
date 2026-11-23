import { apiReference } from '@scalar/express-api-reference';
import { Router } from 'express';
import { createDocument, type ZodOpenApiPathsObject } from 'zod-openapi';
import { auth } from './lib/auth.js';
import { healthDocs } from './modules/health/health.docs.js';
import { usersDocs } from './modules/users/users.docs.js';

// The API docs: one page that lists every endpoint, at /api/docs (mounted in routes.ts).
// In dev, open http://localhost:5173/api/docs (or :8080 in Docker).
//
// The page is built from an OpenAPI document (a JSON description of every endpoint) that
// combines two sources: each module's *.docs.ts file, and Better Auth, which describes its
// own /api/auth/* endpoints.

// Every module's docs. When you add a module, add its docs here, like its router in routes.ts.
const paths: ZodOpenApiPathsObject = {
  ...healthDocs,
  ...usersDocs,
};

// The groups shown in the docs sidebar, in this order. Each endpoint picks one with "tags".
const tags = [
  { name: 'Health', description: 'Check that the API is up' },
  { name: 'Users', description: 'The signed-in user' },
  { name: 'Auth', description: 'Sign up, sign in, sign out and sessions (Better Auth)' },
];

export const docsRouter = Router();

// GET /api/docs/openapi.json: the description of every endpoint, in OpenAPI format.
// Tools like Postman or Insomnia can import it too.
docsRouter.get('/openapi.json', async (_req, res) => {
  res.json(await getOpenApiDocument());
});

// GET /api/docs: the docs page. Scalar turns openapi.json into a page where you can read
// every endpoint and try it. It runs on the same origin, so "try it" uses your session cookie.
const scalarConfig = {
  url: '/api/docs/openapi.json',
  pageTitle: 'API docs',
  // The page loads Scalar's script from a CDN. Without a version it always gets the latest one,
  // so the page could change (or break) on its own. Update this version on purpose instead.
  cdn: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.77.0',
  // Hide Scalar's own toolbar (deploy and SDK offers) and don't send usage stats to Scalar.
  showDeveloperTools: 'never' as const,
  telemetry: false,
  // Hide the "Ask AI" button, which would send your API description to Scalar's AI service.
  // (Scalar's TypeScript types don't list this option yet, which is why the settings are in a
  // variable: TypeScript only rejects unknown options written directly inside the call.)
  agent: { disabled: true },
};

docsRouter.get('/', apiReference(scalarConfig));

// The endpoints don't change while the API runs, so the document is built once and reused.
// zod-openapi and Better Auth use slightly different TypeScript types for the same OpenAPI
// format, so the combined document is typed as a plain JSON object.
let cachedDocument: object | undefined;

async function getOpenApiDocument(): Promise<object> {
  if (cachedDocument) {
    return cachedDocument;
  }

  // Turn our zod schemas into OpenAPI
  const document = createDocument({
    openapi: '3.1.0',
    info: { title: 'API', version: '1.0.0' },
    tags,
    paths,
  });

  // Add Better Auth's endpoints. Its paths start after /api/auth ("/sign-in/email"),
  // so we put the prefix back. It groups them under a tag called "Default", renamed to "Auth" here.
  // It also only gives each endpoint a description, so we use that as the title in the sidebar.
  // And it marks every endpoint as needing a bearer token or an "apiKeyCookie", but this app uses
  // neither: the browser sends the session cookie by itself. Without that, "try it" would ask
  // for a token that does nothing.
  const authDocument = await auth.api.generateOpenAPISchema();
  const authPaths: Record<string, unknown> = {};
  for (const [path, pathItem] of Object.entries(authDocument.paths)) {
    for (const operation of Object.values(pathItem)) {
      operation.tags = operation.tags?.map((tag: string) => (tag === 'Default' ? 'Auth' : tag));
      operation.summary ??= operation.description;
      delete operation.security;
    }
    authPaths[`/api/auth${path}`] = pathItem;
  }

  // Better Auth's endpoints link to its own shared schemas (User, Session...), so copy those too.
  // If one of our schemas has the same name (.meta({ id: 'User' })), one would silently replace
  // the other and the docs would show the wrong shape, so stop with a clear error instead.
  const ourSchemas = document.components?.schemas ?? {};
  const authSchemas = authDocument.components.schemas;
  for (const name of Object.keys(authSchemas)) {
    if (name in ourSchemas) {
      throw new Error(
        `API docs: the schema name "${name}" is already used by Better Auth. Use another id in .meta({ id }).`,
      );
    }
  }

  cachedDocument = {
    ...document,
    paths: { ...document.paths, ...authPaths },
    components: { ...document.components, schemas: { ...ourSchemas, ...authSchemas } },
  };
  return cachedDocument;
}
