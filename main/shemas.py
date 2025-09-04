from ninja import Schema
from datetime import datetime, date
from typing import Annotated


class Auth(Schema):
    username: str
    password: str
    
    
class Registration(Schema):
    username: str
    password: str
    password2: str
    
    
class UserOut(Schema):
    id: int
    first_name: str
    last_name: str
    
    
class BalenceOut(Schema):
    id: int
    student: UserOut
    number_points: int
    
    
class СlassifierOut(Schema):
    id: int
    name: str


class ProductOut(Schema):
    id: int
    category: СlassifierOut
    name: str
    description: str
    price: int
    product_status: СlassifierOut

    
class PurchaseOut(Schema):
    id: int
    student: UserOut
    product: ProductOut
    price: int
    purchase_status: СlassifierOut
    

class ChatOut(Schema):
    id: int
    chat_status: СlassifierOut
    datetime_creation: datetime
    
    
# class ChatMessagesOut(Schema):
#     id: int
#     chat: ChatOut
#     user: UserOut
#     message: str
#     file: Annotated[File, "Файл"]
