FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3003

# Genera el cliente de Prisma, aplica migraciones, siembra datos y arranca el servidor
CMD sh -c "npx prisma generate && npx prisma migrate deploy && npx prisma db seed && npm run dev"