FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3003

# El seed está integrado en src/index.ts y se ejecuta automáticamente al arrancar
CMD sh -c "npx prisma generate && npx prisma migrate deploy && npm run dev"