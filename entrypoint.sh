#!/bin/sh
set -e

# Persistent dirs (mounted as volumes in production).
mkdir -p /app/data /app/media

# On the very first deploy, seed the volume with the database baked into the
# image so existing local data is not lost. Afterwards the volume copy wins.
if [ ! -f "${SQLITE_PATH:-/app/data/db.sqlite3}" ] && [ -f /app/db.sqlite3 ]; then
    cp /app/db.sqlite3 "${SQLITE_PATH:-/app/data/db.sqlite3}"
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec gunicorn main.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers "${GUNICORN_WORKERS:-3}" \
    --timeout 120
