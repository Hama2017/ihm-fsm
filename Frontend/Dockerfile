# Build stage
FROM node:18-alpine AS build-stage

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer toutes les dépendances (production + dev pour le build)
RUN npm ci

# Copier le code source
COPY . .

# Arguments de build pour les variables d'environnement
ARG VITE_API_URL=http://localhost:8000/api/v1
ARG VITE_API_KEY=pk_master_admin

# Définir les variables d'environnement
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_KEY=$VITE_API_KEY

# Build de l'application
RUN npm run build

# Production stage avec Nginx
FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copier la configuration Nginx personnalisée (optionnel)
# COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Configuration Nginx basique pour SPA
RUN echo 'server {\
    listen 80;\
    listen [::]:80;\
    server_name localhost;\
    root /usr/share/nginx/html;\
    index index.html;\
    location / {\
        try_files $uri $uri/ /index.html;\
    }\
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {\
        expires 1y;\
        add_header Cache-Control "public, immutable";\
    }\
}' > /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Commande par défaut
CMD ["nginx", "-g", "daemon off;"]