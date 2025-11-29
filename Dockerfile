# ====== Etapa de construcción ======
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiamos dependencias primero para aprovechar cache
COPY package.json package-lock.json* npm-shrinkwrap.json* ./
RUN npm ci --no-audit --no-fund

# Copiamos el resto del proyecto
COPY . .

# Build de producción (ignora TS/ESLint gracias a next.config.ts)
RUN npm run build

# ====== Etapa de runtime ======
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
EXPOSE 3000

# Copiamos salida standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Healthcheck opcional
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3000}/ || exit 1

# Arranque recomendado con server.js de standalone
CMD ["node", ".next/standalone/server.js"]
