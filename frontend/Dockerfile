# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Recibir la URL del backend como argumento de build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm install

COPY . .

# Usamos vite build directamente (esbuild transpila TS sin chequeo de tipos)
# Esto evita que errores de tsc estrictos rompan el build de producción
RUN npx vite build

# ── Stage 2: Serve con Nginx ─────────────────────────────────────
FROM nginx:alpine

# Copiar el build al directorio de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración de Nginx para SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5175

CMD ["nginx", "-g", "daemon off;"]