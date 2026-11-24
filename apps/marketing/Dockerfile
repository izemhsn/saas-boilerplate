# Step 1: build the site
FROM node:24-alpine AS build
RUN npm install -g pnpm@12.14.0
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @saas/marketing build

# Step 2: serve the built files with nginx
# Pinned to the 1.30 stable branch: patch updates arrive, a new version doesn't arrive by surprise
FROM nginx:1.30-alpine
COPY --from=build /app/apps/marketing/dist /usr/share/nginx/html
