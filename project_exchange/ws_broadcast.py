import json

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def _participant_ids(chat):
    project = chat.project
    ids = set()
    if project.customer_id:
        ids.add(project.customer_id)
    ids.update(project.moderators.values_list('id', flat=True))
    ids.update(project.executors.values_list('id', flat=True))
    return ids


def broadcast_chat_message(chat, action, msg=None, message_id=None):
    layer = get_channel_layer()
    if layer is None:
        return
    if action == 'delete':
        data = {'action': 'delete', 'chat_id': chat.id, 'message_id': message_id}
    else:
        from .schemas import ChatMessageOut, MessageFileOut
        out = ChatMessageOut(
            id=msg.id,
            chat_id=msg.chat_id,
            user=msg.user,
            message=msg.message,
            created_at=msg.created_at,
            changed=msg.changed,
            files=[MessageFileOut(id=f.id, file=f.file.url) for f in msg.files.all()],
        )
        data = {'action': action, 'message': json.loads(out.model_dump_json())}

    async_to_sync(layer.group_send)(
        f'chat_{chat.id}',
        {'type': 'message_event', 'data': data},
    )
    for uid in _participant_ids(chat):
        async_to_sync(layer.group_send)(
            f'chatlist_{uid}',
            {'type': 'chatlist_update', 'data': {'action': 'refresh'}},
        )
