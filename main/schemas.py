from ninja import Schema, UploadedFile
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
    
    
class ClassifierOut(Schema):
    id: str
    name: str


class ProductOut(Schema):
    id: int
    category: ClassifierOut | None
    name: str
    description: str | None
    stock: int
    price: int
    photo: str | None
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
    chat_status: ClassifierOut
    created_at: datetime


class MessageFileOut(Schema):
    id: int
    file: str


class ChatMessageOut(Schema):
    id: int
    chat: ChatOut
    user: UserOut
    message: str | None
    created_at: datetime
    files: List[MessageFileOut] | None
    
    
class ChatMessageIn(Schema):
    message: str | None
    files: List[UploadedFile] | None
    
    
class TaskOut(Schema):
    customer: UserOut
    moderator: UserOut | None
    executor: UserOut | None
    task_status: str
    name: str
    description: str
    type_reward: str
    amount_reward: int | None
    deadlines: int | None
    created_at: datetime
    completed_at: datetime | None
    chat: ChatOut | None
    

class TaskIn(Schema):
    name: str
    description: str
    type_reward: str
    amount_reward: int | None
    deadlines: int | None


class ResponseIn(Schema):
    comment: str
    

class ResponseOut(Schema):
    task: TaskOut
    executor: UserOut
    comment: str
    created_at: datetime
    
    
class FeedbackIn(Schema):
    number_stars: float
    comment: str
    
    
class FeedbackOut(Schema):
    task: TaskOut
    number_stars: float
    comment: str
    created_at: datetime