from datetime import datetime, date
from typing import List

from ninja import Schema


class ClassifierOut(Schema):
    id: int
    name: str


class CategoryProjectOut(Schema):
    id: int
    name: str
    icon: str | None = None


class StatusesOut(Schema):
    id: str
    name: str


class CustomUserOut(Schema):
    id: int
    last_name: str
    first_name: str


class CustomerUserOut(Schema):
    id: int
    last_name: str
    first_name: str
    organization_id: int | None = None


class ExecutorListOut(Schema):
    id: int
    last_name: str
    first_name: str
    patronymic: str | None = None
    study_group: str | None = None


class ModeratorListOut(Schema):
    id: int
    last_name: str
    first_name: str
    patronymic: str | None = None


class ProjectOut(Schema):
    id: int
    project_status: str 
    category_project_id: int | None = None
    technologies_id: List[int] = []
    name: str
    description: str
    cash_reward: bool
    number_of_points: int


class ProjectCompletedOut(Schema):
    id: int
    project_status: str 
    category_project_id: int | None = None
    technologies_id: List[int] = []
    name: str
    description: str
    cash_reward: bool
    number_of_points: int
    number_stars: int | None = None
    comment: str | None = None


class ProjectFileOut(Schema):
    id: int
    file: str


class ProjectPermissionsSchema(Schema):
    change: bool
    publish: bool
    complete: bool
    cancel: bool
    leave_respond: bool
    view_responses: bool
    view_participants: bool
    leave_feedback: bool


class ProjectDetailsOut(Schema):
    id: int
    customer: CustomerUserOut
    project_status: str
    category_project_id: int | None
    technologies_id: List[int] = [] 
    name: str
    description: str
    cash_reward: bool
    number_of_points: int
    due_date: date
    created_at: datetime
    completed_at: datetime | None
    files: List[ProjectFileOut] = []
    permission: ProjectPermissionsSchema


class ProjectIn(Schema):
    category_project_id: int | None = None
    technologies_id: List[int] = []
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


class ProjectChangeIn(Schema):
    new_category_project_id: int | None = None
    new_technologies_id: List[int] | None = None
    delete_technologies_id: List[int] | None = None
    delete_files_id: List[int] | None = None
    new_name: str | None = None
    new_description: str | None = None
    new_cash_reward: bool | None = None
    new_number_of_points: int | None = None
    new_due_date: datetime | None = None


class FeedbackIn(Schema):
    number_stars: int
    comment: str | None = None


class LastMessageOut(Schema):
    id: int
    user: CustomUserOut
    message: str | None = None
    created_at: datetime
    files_are_attached: bool


class ProjectChatOut(Schema):
    id: int
    name: str


class ChatOut(Schema):
    id: int
    project: ProjectChatOut
    unread_count: int | None = None
    last_message: LastMessageOut


class MessageFileOut(Schema):
    id: int
    file: str


class ChatMessageOut(Schema):
    id: int
    chat_id: int
    user: CustomUserOut
    message: str | None = None
    created_at: datetime
    changed: bool
    files: List[MessageFileOut] = []
    
    
class ChatMessageIn(Schema):
    message: str | None = None


class ChatMessageUpdateIn(Schema):
    new_message:str | None = None
    delete_files_id: List[int] | None = None


class ProjectParticipantsOut(Schema):
    customer: CustomerUserOut
    moderators: List[CustomUserOut] | None = []
    executors: List[CustomUserOut] | None = []