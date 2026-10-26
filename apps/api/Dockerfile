FROM node:24-alpine
RUN npm install -g pnpm@12.14.0
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @saas/api build

EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
