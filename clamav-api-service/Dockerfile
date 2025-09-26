# Usa una imagen base de Node.js
FROM node:18-slim

# Instala clamav y curl (para el healthcheck)
RUN apt-get update && apt-get install -y clamav-daemon curl

# Crea el directorio de la aplicación
WORKDIR /usr/src/app

# Copia los archivos de definición del proyecto y el lockfile
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto en el que correrá la aplicación
EXPOSE 3001

# Configura la comprobación de estado para Coolify/Traefik
# Espera 15 segundos para que todo inicie, luego comprueba cada 30s.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Comando para iniciar el demonio de ClamAV en segundo plano y luego la API
CMD ["/bin/sh", "-c", "freshclam -d && clamd & npm start"]
