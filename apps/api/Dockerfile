FROM node:24-alpine
RUN npm install -g pnpm@12.14.0
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
# The "..." also builds the packages the API depends on (like @saas/db)
RUN pnpm --filter @saas/api... build

EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
