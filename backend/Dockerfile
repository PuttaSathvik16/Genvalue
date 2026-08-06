# GenValue Academy API — production image for Render
FROM oven/bun:1.2-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN bun install --frozen-lockfile

FROM oven/bun:1.2-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
COPY scripts ./scripts

RUN bunx prisma generate

# Render injects PORT; default matches common local override
ENV PORT=10000
EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||10000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "src/server.js"]
