# Развёртывание на сервере

Установить Docker, git, python
Доставить код на сервер

# Файл `.env`

```sh
cp .env.example .env
```

Сгенерировать `SECRET_KEY`:
```sh
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

openssl rand -base64 48
```

Сгенерировать пароль для `POSTGRES_PASSWORD`:
```sh
python -c "import secrets,string; print(''.join(secrets.choice(string.ascii_letters+string.digits) for _ in range(32)))"

openssl rand -hex 24
```

---

# Собрать и запустить
```sh
docker compose up --build -d
```

# Создать суперпользователя
```sh
docker compose exec backend python manage.py createsuperuser
```

# Частые команды

```sh
docker compose ps                          # статус контейнеров
docker compose logs -f                     # логи всех сервисов
docker compose restart                     # перезапуск
docker compose down                        # остановить
```
