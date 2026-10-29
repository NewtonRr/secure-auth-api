FROM node:22-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./

FROM base AS dev
RUN npm ci
COPY . .
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate
EXPOSE 3000
CMD ["sh", "-c", "npx prisma generate && npm run dev"]

FROM base AS build
RUN npm ci
COPY . .
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate && npm run build
# tsc skips non-TS files (e.g. .wasm) from the generated client
RUN cd src/generated && find . -type f ! -name '*.ts' | while read f; do \
      mkdir -p "../../dist/generated/$(dirname "$f")" && cp "$f" "../../dist/generated/$f"; \
    done

FROM base AS prod
ENV NODE_ENV=production
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY prisma.config.ts ./
USER node
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
