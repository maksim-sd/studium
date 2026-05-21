from datetime import datetime
from typing import List

from pydantic import Field
from ninja import Schema
    

class GroupOut(Schema):
    id: int
    name: str


class OrganizationOut(Schema):
    id: int
    full_name: str
    abbreviated_name: str


class UserOut(Schema):
    id: int
    organization_id: int | None = None
    last_name: str
    first_name: str
    patronymic: str | None = None
    photo: str | None = None
    groups_id: List[int] = []
    faculty: str | None = None
    specialty: str | None = None
    study_group: str | None = None
    average_rating: float | None = None
    last_login: datetime | None = None

    
class BalanceOut(Schema):
    id: int
    executor_id: int
    number_of_points: int


class RequestOut(Schema):
    id: int
    message: str 
    request_status: str = Field(alias="get_request_status_display")
    answer: str | None = None
    created_at: datetime


class RequestIn(Schema):
    message: str 