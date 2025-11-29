# ====== Etapa de construcción ======
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiamos dependencias primero para aprovechar cache
COPY package.json package-lock.json* npm-shrinkwrap.json* ./
RUN npm ci --no-audit --no-fund

# Copiamos el resto del proyecto
COPY . .

# Copiamos también el archivo de variables de entorno
COPY .env .env

# ====== Etapa de runtime ======
FROM node:20-alpine AS runner
WORKDIR /app

# Instalar curl para el healthcheck
RUN apk add --no-cache curl

ENV NODE_ENV=development
EXPOSE 9002

# Copiamos todo el proyecto desde la etapa builder
COPY --from=builder /app ./

# Healthcheck ajustado al puerto 9002
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:9002/ || exit 1

# Arranque en modo desarrollo
CMD ["npm", "run", "dev"]
