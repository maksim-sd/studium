from ninja import Schema
from datetime import datetime
from typing import List
    
    
class Registration(Schema):
    username: str
    first_name: str
    last_name: str
    password: str
    password2: str
    
    
class UserOut(Schema):
    id: int
    username: str
    first_name: str
    last_name: str
    
    
class BalanceOut(Schema):
    id: int
    executor: UserOut
    number_points: int
    
    
class СlassifierOut(Schema):
    id: str
    name: str


class ProductOut(Schema):
    id: int
    category: СlassifierOut | None
    name: str
    description: str
    stock: int
    price: int
    product_status: str

    
class CartOut(Schema):
    id: int
    executor: UserOut


class CartProductOut(Schema):
    id: int
    cart: CartOut
    product: ProductOut
    quantity: int
    
    
class OrderOut(Schema):
    id: int
    executor: UserOut
    total_amount: int | None
    created_at: datetime
    order_status: str
    

class OrderProductOut(Schema):
    id: int
    order: OrderOut
    product: ProductOut
    quantity: int
    price: int
    
    
class CartProductsIDIn(Schema):
    list_id: List


class ChatOut(Schema):
    id: int
    chat_status: СlassifierOut
    created_at: datetime
    
    

