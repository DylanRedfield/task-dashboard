"""
FastAPI backend for Task Dashboard
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db, init_db
from models import User, Task, Project, Tag, TaskTag, MeetingTranscript, TaskStatus, Goal, GoalStatus
import schemas
from transcript_processor import process_transcript

app = FastAPI(title="Task Dashboard API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    """Initialize database on startup"""
    init_db()
    print("Database initialized")


@app.get("/")
def read_root():
    return {"message": "Task Dashboard API", "version": "1.0.0"}


# ============================================================================
# USER ENDPOINTS
# ============================================================================

@app.post("/users", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    db_user = db.query(User).filter(User.name == user.name).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(**user.dict())
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.get("/users", response_model=List[schemas.User])
def get_users(db: Session = Depends(get_db)):
    """Get all users"""
    return db.query(User).all()


@app.get("/users/{user_id}", response_model=schemas.User)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get user by ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ============================================================================
# PROJECT ENDPOINTS
# ============================================================================

@app.post("/projects", response_model=schemas.Project, status_code=status.HTTP_201_CREATED)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project"""
    new_project = Project(**project.dict())
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project


@app.get("/projects", response_model=List[schemas.Project])
def get_projects(include_archived: bool = False, db: Session = Depends(get_db)):
    """Get all projects"""
    query = db.query(Project)
    if not include_archived:
        query = query.filter(Project.archived == False)
    return query.all()


@app.get("/projects/{project_id}", response_model=schemas.Project)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get project by ID"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.patch("/projects/{project_id}/archive")
def archive_project(project_id: int, db: Session = Depends(get_db)):
    """Archive a project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.archived = True
    db.commit()
    return {"message": "Project archived"}


# ============================================================================
# TAG ENDPOINTS
# ============================================================================

@app.post("/tags", response_model=schemas.Tag, status_code=status.HTTP_201_CREATED)
def create_tag(tag: schemas.TagCreate, db: Session = Depends(get_db)):
    """Create a new tag"""
    new_tag = Tag(**tag.dict())
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    return new_tag


@app.get("/tags", response_model=List[schemas.Tag])
def get_tags(db: Session = Depends(get_db)):
    """Get all tags"""
    return db.query(Tag).all()


# ============================================================================
# TASK ENDPOINTS
# ============================================================================

@app.post("/tasks", response_model=schemas.Task, status_code=status.HTTP_201_CREATED)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    """Create a new task"""
    tag_ids = task.tag_ids
    task_data = task.dict(exclude={"tag_ids"})

    new_task = Task(**task_data)
    db.add(new_task)
    db.flush()

    # Add tags
    for tag_id in tag_ids:
        tag = db.query(Tag).filter(Tag.id == tag_id).first()
        if tag:
            task_tag = TaskTag(task_id=new_task.id, tag_id=tag_id)
            db.add(task_tag)

    db.commit()
    db.refresh(new_task)
    return new_task


@app.get("/tasks", response_model=List[schemas.Task])
def get_tasks(
    assignee_id: int = None,
    status: TaskStatus = None,
    project_id: int = None,
    db: Session = Depends(get_db)
):
    """Get all tasks with optional filters"""
    query = db.query(Task)

    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)
    if status:
        query = query.filter(Task.status == status)
    if project_id:
        query = query.filter(Task.project_id == project_id)

    return query.order_by(Task.created_at.desc()).all()


@app.get("/tasks/{task_id}", response_model=schemas.Task)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Get task by ID"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.patch("/tasks/{task_id}", response_model=schemas.Task)
def update_task(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db)):
    """Update a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_update.dict(exclude_unset=True)
    tag_ids = update_data.pop("tag_ids", None)

    for field, value in update_data.items():
        setattr(task, field, value)

    # Handle status changes
    if task_update.status == TaskStatus.DONE and task.status != TaskStatus.DONE:
        task.completed_at = datetime.utcnow()

    task.updated_at = datetime.utcnow()

    # Update tags if provided
    if tag_ids is not None:
        # Remove existing tags
        db.query(TaskTag).filter(TaskTag.task_id == task_id).delete()

        # Add new tags
        for tag_id in tag_ids:
            tag = db.query(Tag).filter(Tag.id == tag_id).first()
            if tag:
                task_tag = TaskTag(task_id=task_id, tag_id=tag_id)
                db.add(task_tag)

    db.commit()
    db.refresh(task)
    return task


@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return None


# ============================================================================
# MEETING TRANSCRIPT ENDPOINTS
# ============================================================================

@app.post("/transcripts", response_model=schemas.MeetingTranscript, status_code=status.HTTP_201_CREATED)
def create_transcript(
    transcript: schemas.TranscriptCreate,
    db: Session = Depends(get_db)
):
    """Upload a meeting transcript"""
    new_transcript = MeetingTranscript(**transcript.dict())
    db.add(new_transcript)
    db.commit()
    db.refresh(new_transcript)
    return new_transcript


@app.post("/transcripts/{transcript_id}/process")
def process_meeting_transcript(transcript_id: int, db: Session = Depends(get_db)):
    """Process a transcript with OpenAI to extract tasks"""
    transcript = db.query(MeetingTranscript).filter(
        MeetingTranscript.id == transcript_id
    ).first()

    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")

    # Get available users
    users = db.query(User).all()
    user_list = [{"id": u.id, "name": u.name} for u in users]

    # Process with OpenAI
    result = process_transcript(
        transcript_text=transcript.transcript,
        transcript_id=transcript_id,
        db=db,
        available_users=user_list
    )

    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Processing failed"))

    return result


@app.get("/transcripts", response_model=List[schemas.MeetingTranscript])
def get_transcripts(db: Session = Depends(get_db)):
    """Get all transcripts"""
    return db.query(MeetingTranscript).order_by(
        MeetingTranscript.created_at.desc()
    ).all()


@app.get("/transcripts/{transcript_id}", response_model=schemas.MeetingTranscript)
def get_transcript(transcript_id: int, db: Session = Depends(get_db)):
    """Get transcript by ID"""
    transcript = db.query(MeetingTranscript).filter(
        MeetingTranscript.id == transcript_id
    ).first()
    if not transcript:
        raise HTTPException(status_code=404, detail="Transcript not found")
    return transcript


# ============================================================================
# GOAL ENDPOINTS
# ============================================================================

@app.post("/goals", response_model=schemas.Goal, status_code=status.HTTP_201_CREATED)
def create_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    """Create a new goal"""
    new_goal = Goal(**goal.dict())
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal


@app.get("/goals", response_model=List[schemas.Goal])
def get_goals(db: Session = Depends(get_db)):
    """Get all goals"""
    return db.query(Goal).order_by(Goal.created_at.desc()).all()


@app.get("/goals/{goal_id}", response_model=schemas.Goal)
def get_goal(goal_id: int, db: Session = Depends(get_db)):
    """Get goal by ID"""
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal


@app.patch("/goals/{goal_id}", response_model=schemas.Goal)
def update_goal(goal_id: int, goal_update: schemas.GoalUpdate, db: Session = Depends(get_db)):
    """Update a goal"""
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_data = goal_update.dict(exclude_unset=True)

    # If status is being changed to achieved, set completed_at
    if "status" in update_data and update_data["status"] == GoalStatus.ACHIEVED:
        update_data["completed_at"] = datetime.utcnow()

    for key, value in update_data.items():
        setattr(goal, key, value)

    db.commit()
    db.refresh(goal)
    return goal


@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    """Delete a goal"""
    goal = db.query(Goal).filter(Goal.id == goal_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted successfully"}


# ============================================================================
# DASHBOARD / STATS ENDPOINTS
# ============================================================================

@app.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    all_tasks = db.query(Task).all()

    stats = {
        "total_tasks": len(all_tasks),
        "todo_tasks": len([t for t in all_tasks if t.status == TaskStatus.TODO]),
        "in_progress_tasks": len([t for t in all_tasks if t.status == TaskStatus.IN_PROGRESS]),
        "completed_tasks": len([t for t in all_tasks if t.status == TaskStatus.DONE]),
        "blocked_tasks": len([t for t in all_tasks if t.status == TaskStatus.BLOCKED]),
        "tasks_by_user": {},
        "tasks_by_priority": {
            "low": 0,
            "medium": 0,
            "high": 0,
            "urgent": 0
        }
    }

    # Group by user
    for task in all_tasks:
        if task.assignee:
            user_name = task.assignee.name
            if user_name not in stats["tasks_by_user"]:
                stats["tasks_by_user"][user_name] = 0
            stats["tasks_by_user"][user_name] += 1

        # Count by priority
        if task.priority and task.status != TaskStatus.DONE:
            stats["tasks_by_priority"][task.priority.value] += 1

    return stats


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
