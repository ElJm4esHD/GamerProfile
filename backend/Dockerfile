# syntax=docker/dockerfile:1

# ─── Etapa 1: build ──────────────────────────────────────────────────────────
# bookworm-slim (glibc) y no alpine (musl) a propósito: better-sqlite3 publica
# binarios precompilados para linux-x64 con glibc. Si el prebuild no coincide
# con la ABI de Node, node-gyp compila desde fuente con el toolchain de abajo.
FROM node:22-bookworm-slim AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src

# Primero solo los manifiestos: mientras no cambien, Docker reutiliza la capa
# de instalación y el rebuild es cuestión de segundos.
# Van los package.json de los tres workspaces aunque instalemos solo dos:
# npm valida el lockfile contra la definición completa del monorepo.
COPY package.json package-lock.json tsconfig.base.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/
COPY frontend/package.json frontend/

# Sin el frontend: acá no hace falta vite ni sus dependencias.
RUN npm ci --include-workspace-root --workspace @gp/backend --workspace @gp/shared

# El binding nativo de better-sqlite3 se verifica acá, no se da por hecho: si el
# prebuild no bajó o node-gyp falló, el build de la imagen se corta en este
# punto en vez de fallar al arrancar en el servidor. También deja registrado en
# el log para qué arquitectura se resolvió.
RUN node -e "const D=require('better-sqlite3'); const d=new D(':memory:'); \
    d.exec('create table t(x integer)'); d.prepare('insert into t values (1)').run(); \
    if (d.prepare('select count(*) c from t').get().c !== 1) process.exit(1); \
    console.log('better-sqlite3 OK · ' + process.arch + ' · node ' + process.version);"

COPY shared/ shared/
COPY backend/ backend/

# tsc emite backend/ y shared/ juntos bajo /src/build, conservando la
# estructura del repo (ver el rootDir de backend/tsconfig.json).
RUN npm run build --workspace @gp/backend

# Descarta las devDependencies pero conserva el binario nativo ya compilado.
RUN npm prune --omit=dev

# ─── Etapa 2: runtime ────────────────────────────────────────────────────────
# Imagen final sin toolchain de compilación, sin tsx y sin devDependencies.
FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /src/node_modules ./node_modules
COPY --from=build /src/build/ ./
COPY package.json ./
COPY backend/package.json backend/

# El package.json de `shared` en el repo apunta a src/index.ts, que es lo que
# necesitan tsx y Vite. En runtime Node no ejecuta TypeScript: lo reemplazamos
# por uno que apunte al .js ya emitido. El symlink que npm dejó en
# node_modules/@gp/shared sigue resolviendo acá.
RUN printf '%s\n' \
    '{"name":"@gp/shared","version":"0.1.0","type":"module","main":"./src/index.js","exports":{".":"./src/index.js"}}' \
    > shared/package.json

COPY backend/docker-entrypoint.sh /usr/local/bin/entrypoint.sh
# chmod explícito: el checkout en Windows no conserva el bit de ejecución.
RUN chmod +x /usr/local/bin/entrypoint.sh

# El volumen con la base se monta en /app/database. db/paths.ts lo deduce de la
# ubicación del propio archivo (/app/backend/src/db → sube tres → /app), por eso
# la imagen respeta la jerarquía del repo y no hizo falta tocar ese código.

# Usuario sin privilegios que ya trae la imagen (uid 1000, el mismo que tu
# usuario en Ubuntu si `id -u` devolvió 1000).
USER node

EXPOSE 4000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
