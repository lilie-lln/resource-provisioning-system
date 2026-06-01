# Frontend: build the Create React App bundle, then serve it with nginx.

# --- build stage ---
FROM node:20-alpine AS build

WORKDIR /app

# CRA inlines REACT_APP_* into the bundle at BUILD time. This URL is used by the
# BROWSER, so it must be reachable from the host (default http://localhost),
# NOT the compose service name "backend" (that only resolves inside the docker network).
ARG REACT_APP_BACKEND_HOST=http://localhost
ENV REACT_APP_BACKEND_HOST=$REACT_APP_BACKEND_HOST
# Do not treat lint warnings as build errors.
ENV CI=false

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- serve stage ---
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
