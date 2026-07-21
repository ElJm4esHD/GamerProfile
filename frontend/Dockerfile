# syntax=docker/dockerfile:1

# ─── Etapa 1: build del bundle ───────────────────────────────────────────────
FROM node:22-bookworm-slim AS build

WORKDIR /src

COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/
COPY frontend/package.json frontend/

# Sin el backend: así este build no arrastra la compilación nativa de
# better-sqlite3, que acá no sirve para nada.
RUN npm ci --include-workspace-root --workspace @gp/frontend --workspace @gp/shared

# shared/ también: el frontend lo importa como código fuente TypeScript.
COPY shared/ shared/
COPY frontend/ frontend/

# El script corre `tsc --noEmit && vite build`: si hay un error de tipos, la
# imagen no se construye.
RUN npm run build --workspace @gp/frontend

# ─── Etapa 2: servidor estático ──────────────────────────────────────────────
FROM nginx:alpine AS runtime

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/frontend/dist /usr/share/nginx/html

EXPOSE 80
