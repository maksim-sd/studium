from ninja import NinjaAPI
from user.router import router as user_router
from project_exchange.router import router as project_exchange_router 
from shop.router import router as shop_router

api = NinjaAPI()

api.add_router("/user/", user_router)
api.add_router("/project_exchange", project_exchange_router)
api.add_router("/shop/", shop_router)