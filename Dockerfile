FROM node:22-slim

# Instalar Ghostscript

RUN apt-get update && \
    apt-get install -y ghostscript && \
    apt-get clean

# Directorio app

WORKDIR /app

# Copiar package files

COPY package*.json ./

# Instalar dependencias

RUN npm install

# Copiar código

COPY . .

# Ejecutar build (prisma generate)

RUN npm run build

# Railway usa PORT automáticamente

EXPOSE 4000

# Start app

CMD ["npm", "start"]
