# Dockerfile optimizado para Railway
# Etapa de construcción
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias del frontend
COPY package.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente del frontend
COPY . .

# Argumentos de build para variables de entorno de Vite
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Construir la aplicación
RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine

# Instalar wget para healthcheck
RUN apk add --no-cache wget

# Copiar archivos construidos desde builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
