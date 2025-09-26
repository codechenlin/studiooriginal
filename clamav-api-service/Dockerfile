# Usar una imagen base de Node.js ligera y segura
FROM node:20-alpine

# Instalar 'curl' (necesario para el HEALTHCHECK) y las herramientas de compilación
# build-base incluye python3, make, y g++ que son necesarios para compilar
# algunas dependencias de npm.
RUN apk add --no-cache curl build-base python3

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar los archivos de definición del proyecto
COPY package*.json ./

# Instalar las dependencias de producción
# El comando --omit=dev es el equivalente moderno y recomendado a --production
RUN npm install --omit=dev

# Desinstalar las herramientas de compilación para mantener la imagen final pequeña y segura
RUN apk del build-base python3

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que se ejecuta la API
EXPOSE 3001

# --- Comprobación de estado para Coolify/Traefik ---
# Espera 15s antes de la primera comprobación, comprueba cada 30s, espera 5s por una respuesta.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Comando para iniciar la API
CMD [ "node", "index.js" ]
