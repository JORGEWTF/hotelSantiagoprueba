FROM node:18-alpine

# Crear el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de dependencias primero para aprovechar el caché de Docker
COPY package*.json ./

# Instalamos las dependencias (esto ejecuta todos los 'npm install' que hiciste)
RUN npm install

# Copiamos el resto del código del backend
COPY . .

# Exponemos el puerto
EXPOSE 3000

# Comando para iniciar la aplicación (ajusta según tu script en package.json)
CMD ["npm", "run", "dev"]