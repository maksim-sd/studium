from ninja import NinjaAPI
from .routers.profile import router as profile_router
from .routers.shop import router as profile_shop
from .routers.task import router as profile_task


api = NinjaAPI(csrf=True)

api.add_router("profile/", profile_router)
api.add_router("shop/", profile_shop)
api.add_router("task/", profile_task)

