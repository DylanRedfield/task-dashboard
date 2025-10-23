"""
OpenAI-powered meeting transcript processor
"""
import os
import json
from openai import OpenAI
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from models import MeetingTranscript, TranscriptAction, Task, TaskStatus
from schemas import TaskCreate


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def process_transcript(
    transcript_text: str,
    transcript_id: int,
    db: Session,
    available_users: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Process meeting transcript using OpenAI to extract:
    - Meeting summary
    - New tasks to create
    - Existing tasks to update/complete
    """

    # Create user context for the LLM
    user_context = "\n".join([
        f"- {user['name']} (ID: {user['id']})"
        for user in available_users
    ])

    # Get existing tasks for context
    existing_tasks = db.query(Task).filter(
        Task.status.in_([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED])
    ).all()

    tasks_context = "\n".join([
        f"- Task #{task.id}: {task.title} (Status: {task.status.value}, Assigned to: {task.assignee.name if task.assignee else 'Unassigned'})"
        for task in existing_tasks[:20]  # Limit to 20 most recent
    ])

    prompt = f"""You are an AI assistant helping to process meeting transcripts and extract actionable items.

Available Team Members:
{user_context}

Current Active Tasks:
{tasks_context if tasks_context else "No active tasks"}

Meeting Transcript:
{transcript_text}

Please analyze this transcript and provide:

1. A concise meeting summary (2-3 sentences)
2. New action items/tasks that should be created
3. Any updates or completions to existing tasks mentioned

Return your response as a JSON object with this structure:
{{
  "summary": "Brief meeting summary",
  "new_tasks": [
    {{
      "title": "Task title",
      "description": "Task description",
      "assignee_name": "Name of person assigned (or null)",
      "priority": "low|medium|high|urgent",
      "due_date": "YYYY-MM-DD or null"
    }}
  ],
  "task_updates": [
    {{
      "task_id": 123,
      "action": "completed|updated|blocked",
      "note": "Description of what changed"
    }}
  ]
}}

Be specific and extract only clearly actionable items. If someone is assigned a task, use their exact name from the team members list.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts actionable items from meeting transcripts."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )

        result = json.loads(response.choices[0].message.content)

        # Update transcript with summary
        transcript = db.query(MeetingTranscript).filter(
            MeetingTranscript.id == transcript_id
        ).first()

        if transcript:
            transcript.summary = result.get("summary", "")
            transcript.processed = True
            transcript.processed_at = datetime.utcnow()

        # Create new tasks
        created_tasks = []
        for task_data in result.get("new_tasks", []):
            # Find assignee by name
            assignee = None
            assignee_name = task_data.get("assignee_name")
            if assignee_name:
                for user in available_users:
                    if user["name"].lower() == assignee_name.lower():
                        assignee = user["id"]
                        break

            # Parse priority
            priority_map = {
                "low": "low",
                "medium": "medium",
                "high": "high",
                "urgent": "urgent"
            }
            priority = priority_map.get(task_data.get("priority", "medium").lower(), "medium")

            # Create task
            new_task = Task(
                title=task_data["title"],
                description=task_data.get("description", ""),
                priority=priority,
                assignee_id=assignee,
                creator_id=available_users[0]["id"],  # Default to first user
                status=TaskStatus.TODO
            )
            db.add(new_task)
            db.flush()  # Get the task ID

            # Log action
            action = TranscriptAction(
                transcript_id=transcript_id,
                task_id=new_task.id,
                action_type="created",
                description=f"Created task: {task_data['title']}"
            )
            db.add(action)
            created_tasks.append(new_task.id)

        # Update existing tasks
        updated_tasks = []
        for update_data in result.get("task_updates", []):
            task_id = update_data.get("task_id")
            task = db.query(Task).filter(Task.id == task_id).first()

            if task:
                action_type = update_data.get("action", "updated")

                if action_type == "completed":
                    task.status = TaskStatus.DONE
                    task.completed_at = datetime.utcnow()
                elif action_type == "blocked":
                    task.status = TaskStatus.BLOCKED

                task.updated_at = datetime.utcnow()

                # Log action
                action = TranscriptAction(
                    transcript_id=transcript_id,
                    task_id=task.id,
                    action_type=action_type,
                    description=update_data.get("note", f"Task {action_type}")
                )
                db.add(action)
                updated_tasks.append(task.id)

        db.commit()

        return {
            "success": True,
            "summary": result.get("summary", ""),
            "tasks_created": len(created_tasks),
            "tasks_updated": len(updated_tasks),
            "created_task_ids": created_tasks,
            "updated_task_ids": updated_tasks
        }

    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "error": str(e),
            "tasks_created": 0,
            "tasks_updated": 0
        }
