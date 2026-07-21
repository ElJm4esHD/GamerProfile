#!/bin/sh
set -e

# Idempotente: drizzle registra en la propia base qué migraciones ya aplicó,
# así que reiniciar el contenedor no reaplica nada ni toca tus datos.
echo "→ Aplicando migraciones pendientes..."
node /app/backend/src/db/migrate.js

# exec para que node quede como PID 1 y reciba el SIGTERM de `docker stop`
# directo, sin un shell intermedio que se lo coma.
echo "→ Iniciando servidor..."
exec node /app/backend/src/server.js
