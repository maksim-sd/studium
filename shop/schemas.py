from datetime import datetime
from typing import List

from ninja import Schema
from pydantic import Field


class CategoryProductOut(Schema):
    id: int
    name: str
    
    
class ClassifierOut(Schema):
    id: str
    name: str


class ProductOut(Schema):
    id: int
    category_product_id: int | None = None
    name: str
    description: str | None = None
    stock: int
    price: int
    photo: str | None = None
    product_status: str = Field(alias="get_product_status_display")


class DetailProductOust(Schema):
    id: int
    name: str
    price: int
    photo: str | None = None

    
class CartOut(Schema):
    id: int
    executor_id: int


class CartProductOut(Schema):
    id: int
    cart_id: int
    product: DetailProductOust
    quantity: int
    
    
class OrderOut(Schema):
    id: int
    executor_id: int
    total_amount: int | None = None
    created_at: datetime
    order_status: str = Field(alias="get_order_status_display")
    

class OrderProductOut(Schema):
    id: int
    order_id: int
    product: DetailProductOust
    quantity: int
    price: int
    
    
class CartProductIDIn(Schema):
    cart_product_id: List[int]