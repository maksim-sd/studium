from ninja import Schema
from datetime import datetime, date
from typing import List
from pydantic import Field


class ClassifierOut(Schema):
    id: int
    name: str


class StatusesOut(Schema):
    id: str
    name: str

class CustomUserOut(Schema):
    id: int
    last_name: str
    first_name: str


class ProjectOut(Schema):
    id: int
    project_status: str = Field(alias="get_project_status_display")
    category_project_id: int | None = None
    technologies_id: List[int] | None = None
    name: str
    description: str
    cash_reward: bool

    @staticmethod
    def resolve_technologies_id(obj):
        return [i.id for i in obj.technologies.all()]


class ProjectDetailsOut(Schema):
    id: int
    customer: CustomUserOut
    moderators: List[CustomUserOut]
    executors: List[CustomUserOut]
    project_status: str
    category_project_id: int | None
    technologies_id: List[int] 
    name: str
    description: str
    cash_reward: bool
    number_of_points: int
    due_date: date
    created_at: datetime
    completed_at: datetime | None
    files: List[str] | None


class ProjectIn(Schema):
    category_project_id: int | None = None
    technologies_id: List[int] | None = None
    name: str
    description: str
    cash_reward: bool
    number_of_points: int
    due_date: date


class ResponseIn(Schema):
    comment: str | None = None


class ResponseOut(Schema):
    id: int
    executor_id: int
    comment: str | None = None
    created_at: datetime


class ResponsesListIdIn(Schema):
    responses_id: List[int]


class ProjectPublishIn(Schema):
    new_category_project_id: int | None = None
    new_technologies_id: List[int] | None = None
    delete_technologies_id: List[int] | None = None
    new_name: str | None = None
    new_description: str | None = None
    new_cash_reward: bool | None = None
    new_number_of_points: int | None = None
    new_due_date: datetime | None = None


class FeedbackIn(Schema):
    number_stars: int
    comment: str | None = None


class FeedbackOut(Schema):
    id: int
    project_id: int
    number_stars: int
    comment: str | None = None
    created_at: datetime
    

class ChatOut(Schema):
    id: int
    project: ProjectOut


class MessageFileOut(Schema):
    id: int
    file: str


class ChatMessageOut(Schema):
    id: int
    chat_id: int
    user: CustomUserOut
    message: str | None = None
    created_at: datetime
    files: List[MessageFileOut] | None = None
    
    
class ChatMessageIn(Schema):
    message: str | None = None
