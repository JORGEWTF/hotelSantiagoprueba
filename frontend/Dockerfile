FROM node:20-alpine

WORKDIR /app

# Copiamos los archivos de configuración
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código del front
COPY . .

# Exponemos el puerto de Vite (5173 es el estándar)
EXPOSE 5173

# Comando para arrancar en modo desarrollo
CMD ["npm", "run", "dev", "--", "--host"]