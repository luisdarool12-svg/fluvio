FROM node:20-alpine
WORKDIR /app

# Baileys necesita estas libs para compilar dependencias nativas
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Directorio persistente: sesión de WhatsApp (montar como volumen en EasyPanel)
# /app/auth_info → credenciales/sesión de Baileys (NO se debe perder ni commitear)
RUN mkdir -p /app/auth_info
VOLUME ["/app/auth_info"]

ENV NODE_ENV=production

# El bridge no escucha puertos: se conecta a WhatsApp y llama al bot vía BOT_API_URL.
CMD ["node", "index.js"]
