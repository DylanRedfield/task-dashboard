"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models import TaskStatus, TaskPriority, GoalStatus


# User schemas
class UserBase(BaseModel):
    name: str
    email: Optional[str] = None


class UserCreate(UserBase):
    pass


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    id: int
    created_at: datetime
    archived: bool = False

    class Config:
        from_attributes = True


# Tag schemas
class TagBase(BaseModel):
    name: str
    color: str = "#3B82F6"


class TagCreate(TagBase):
    pass


class Tag(TagBase):
    id: int

    class Config:
        from_attributes = True


# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    assignee_id: Optional[int] = None
    project_id: Optional[int] = None
    due_date: Optional[datetime] = None


class TaskCreate(TaskBase):
    creator_id: int
    tag_ids: List[int] = []


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assignee_id: Optional[int] = None
    project_id: Optional[int] = None
    due_date: Optional[datetime] = None
    tag_ids: Optional[List[int]] = None


class Task(TaskBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    assignee: Optional[User] = None
    creator: Optional[User] = None
    project: Optional[Project] = None
    tags: List[Tag] = []

    class Config:
        from_attributes = True


# Meeting transcript schemas
class TranscriptCreate(BaseModel):
    title: str
    transcript: str


class TranscriptAction(BaseModel):
    id: int
    action_type: str
    description: str
    task_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MeetingTranscript(BaseModel):
    id: int
    title: str
    transcript: str
    summary: Optional[str] = None
    processed: bool
    created_at: datetime
    processed_at: Optional[datetime] = None
    actions: List[TranscriptAction] = []

    class Config:
        from_attributes = True


# Goal schemas
class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: GoalStatus = GoalStatus.NOT_STARTED
    owner_id: Optional[int] = None
    target_date: Optional[datetime] = None


class GoalCreate(GoalBase):
    pass


class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[GoalStatus] = None
    owner_id: Optional[int] = None
    target_date: Optional[datetime] = None


class Goal(GoalBase):
    id: int
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    owner: Optional[User] = None

    class Config:
        from_attributes = True


# Dashboard stats
class DashboardStats(BaseModel):
    total_tasks: int
    todo_tasks: int
    in_progress_tasks: int
    completed_tasks: int
    blocked_tasks: int
    tasks_by_user: dict
    tasks_by_priority: dict
