#!/bin/sh
set -e

mkdir -p /app/media

if [ -n "$POSTGRES_DB" ]; then
    echo "Waiting for PostgreSQL at ${POSTGRES_HOST:-db}:${POSTGRES_PORT:-5432}..."
    until python -c "
import os, sys, psycopg
try:
    psycopg.connect(
        host=os.environ.get('POSTGRES_HOST', 'db'),
        port=os.environ.get('POSTGRES_PORT', '5432'),
        dbname=os.environ['POSTGRES_DB'],
        user=os.environ.get('POSTGRES_USER', 'postgres'),
        password=os.environ.get('POSTGRES_PASSWORD', ''),
        connect_timeout=3,
    ).close()
except Exception as e:
    sys.exit(1)
" 2>/dev/null; do
        echo "  ...database not ready yet, retrying in 2s"
        sleep 2
    done
    echo "PostgreSQL is ready."
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec gunicorn main.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers "${GUNICORN_WORKERS:-3}" \
    --timeout 120
