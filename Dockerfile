# ====== Etapa de construcción ======
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat curl
WORKDIR /app

COPY package.json package-lock.json* npm-shrinkwrap.json* ./
RUN npm ci --no-audit --no-fund

COPY . .

# ====== Etapa de runtime ======
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=development
EXPOSE 9002

COPY --from=builder /app ./

# Healthcheck ajustado al puerto 9002
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:9002/ || exit 1

CMD ["npm", "run", "dev"]
