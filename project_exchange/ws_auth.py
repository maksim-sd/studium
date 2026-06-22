import base64
from urllib.parse import parse_qs

from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth import authenticate
from django.contrib.auth.models import AnonymousUser


@database_sync_to_async
def get_user_from_token(token):
    try:
        decoded = base64.b64decode(token).decode('utf-8')
        email, password = decoded.split(':', 1)
    except Exception:
        return AnonymousUser()
    user = authenticate(email=email, password=password)
    return user or AnonymousUser()


class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query = parse_qs(scope.get('query_string', b'').decode())
        token = query.get('token', [None])[0]
        scope['user'] = await get_user_from_token(token) if token else AnonymousUser()
        return await super().__call__(scope, receive, send)
