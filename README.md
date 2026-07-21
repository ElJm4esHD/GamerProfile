# GamerProfile

Ranking personal de videojuegos. Monorepo con npm workspaces: `shared` (tipos y
schemas de zod), `backend` (Fastify + Drizzle + SQLite) y `frontend` (React + Vite).

## Desarrollo local (Windows)

```bash
npm install
npm run dev          # o doble clic en "Iniciar GamerProfile.bat"
```

Frontend en `http://localhost:5173`, backend en `127.0.0.1:4000`. Vite reenvía
`/api` al backend, así que no hay URLs hardcodeadas.

La base vive en `database/app.db`. El servidor hace un backup por arranque en
`database/backups/` y conserva los últimos 20.

---

## Despliegue en el servidor Ubuntu (Docker, solo LAN)

Dos contenedores: `backend` (Node compilado a JS) y `frontend` (build estático
servido por nginx, que además hace de proxy hacia `/api`). Solo el frontend
publica un puerto; el backend queda en la red interna de compose.

### 1. Preparar las carpetas de datos

```bash
id -u; id -g          # si no devuelve 1000/1000, anotalo para el paso 3

sudo mkdir -p /srv/gamerprofile/database/backups
sudo mkdir -p /srv/gamerprofile/database/migrations
sudo mkdir -p /srv/gamerprofile/backups-daily
sudo mkdir -p /srv/gamerprofile/scripts
sudo mkdir -p /srv/gamerprofile/logs

sudo chown -R "$USER:$USER" /srv/gamerprofile
chmod -R 750 /srv/gamerprofile
```

SQLite en modo WAL necesita escribir **en el directorio**, no solo en `app.db`:
crea y borra `app.db-wal` y `app.db-shm` al lado. Por eso los permisos van sobre
las carpetas.

### 2. Traer la base desde la PC

En Windows, con la app cerrada:

```bash
npm run db:backup     # genera database/backups/app-<fecha>.db
```

Ese archivo es una base completa y consistente (`VACUUM INTO`, con el WAL ya
integrado). Se copia solo ese, sin `-wal` ni `-shm`: SQLite los recrea al
arrancar.

```bash
scp "app-<fecha>.db" usuario@servidor:/srv/gamerprofile/database/app.db
```

### 3. Configurar

```bash
git clone <repo> ~/gamerprofile && cd ~/gamerprofile

cp .env.example .env                   # GP_DATA_DIR, GP_PORT, GP_UID, GP_GID
cp backend/.env.example backend/.env   # y completá GEMINI_API_KEY
```

`backend/.env` no está en git: hay que crearlo a mano en el servidor.

### 4. Levantar

```bash
docker compose up -d --build
docker compose logs -f backend
```

Entrás desde cualquier equipo de la red en `http://<ip-del-servidor>:8080`.

El contenedor aplica las migraciones pendientes en cada arranque. Drizzle
registra en la propia base cuáles ya corrieron, así que reiniciar no reaplica
nada ni toca tus datos.

### Operaciones frecuentes

```bash
docker compose logs -f                      # ver qué pasa
docker compose restart backend              # reiniciar (genera un backup nuevo)
git pull && docker compose up -d --build    # actualizar
docker compose down                         # apagar
```

---

## Backup diario automático — pendiente de implementar

La estructura de carpetas ya queda creada en el paso 1. Falta escribir
`/srv/gamerprofile/scripts/daily-backup.sh` y su entrada de cron.

**Por qué `backups-daily/` está fuera de `database/`:** el backup de arranque de
la app (`backend/src/db/backup.ts`) borra todo `.db` de `database/backups/` que
exceda los últimos 20, sin distinguir quién lo creó. Si el cron escribiera ahí,
cada uno le borraría los backups al otro.

Diseño previsto:

- `sqlite3 app.db "VACUUM INTO '.../backups-daily/app-$(date +%F).db'"` — backup
  en caliente y consistente, sin frenar el contenedor. Requiere
  `sudo apt install sqlite3` en el host.
- Retención con `find /srv/gamerprofile/backups-daily -name '*.db' -mtime +30 -delete`.
- Cron del usuario (no root, la carpeta es tuya): `0 4 * * *`, con salida a
  `/srv/gamerprofile/logs/`.
