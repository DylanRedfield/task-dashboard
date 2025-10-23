"""
Database models for task dashboard
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

Base = declarative_base()


class TaskStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    IN_REVIEW = "in_review"
    DONE = "done"
    BLOCKED = "blocked"


class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    assigned_tasks = relationship("Task", back_populates="assignee", foreign_keys="Task.assignee_id")
    created_tasks = relationship("Task", back_populates="creator", foreign_keys="Task.creator_id")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    archived = Column(Boolean, default=False)

    # Relationships
    tasks = relationship("Task", back_populates="project")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO, nullable=False)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM)

    # Foreign keys
    assignee_id = Column(Integer, ForeignKey("users.id"))
    creator_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    assignee = relationship("User", back_populates="assigned_tasks", foreign_keys=[assignee_id])
    creator = relationship("User", back_populates="created_tasks", foreign_keys=[creator_id])
    project = relationship("Project", back_populates="tasks")
    tags = relationship("TaskTag", back_populates="task", cascade="all, delete-orphan")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    color = Column(String, default="#3B82F6")  # Default blue color

    # Relationships
    task_tags = relationship("TaskTag", back_populates="tag")


class TaskTag(Base):
    __tablename__ = "task_tags"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    tag_id = Column(Integer, ForeignKey("tags.id"))

    # Relationships
    task = relationship("Task", back_populates="tags")
    tag = relationship("Tag", back_populates="task_tags")


class MeetingTranscript(Base):
    __tablename__ = "meeting_transcripts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    transcript = Column(Text, nullable=False)
    summary = Column(Text)
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

    # Relationships
    actions = relationship("TranscriptAction", back_populates="transcript", cascade="all, delete-orphan")


class TranscriptAction(Base):
    __tablename__ = "transcript_actions"

    id = Column(Integer, primary_key=True, index=True)
    transcript_id = Column(Integer, ForeignKey("meeting_transcripts.id"))
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=True)
    action_type = Column(String)  # "created", "updated", "completed"
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    transcript = relationship("MeetingTranscript", back_populates="actions")
