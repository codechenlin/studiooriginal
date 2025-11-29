# ====== Etapa de construcción ======
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiamos dependencias primero para aprovechar cache
COPY package.json package-lock.json* npm-shrinkwrap.json* ./
RUN npm ci --no-audit --no-fund

# Copiamos el resto del proyecto
COPY . .

# ====== Etapa de runtime ======
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=development
EXPOSE 3000

# Copiamos todo el proyecto (no usamos build en dev)
COPY --from=builder /app ./

# Healthcheck opcional
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-3000}/ || exit 1

# Arranque en modo desarrollo
CMD ["npm", "run", "dev"]
