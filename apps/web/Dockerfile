# Step 1: build the app
FROM node:24-alpine AS build
RUN npm install -g pnpm@12.14.0
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @saas/web build

# Step 2: serve the built files with nginx
FROM nginx:stable-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
