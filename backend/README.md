# Task Dashboard Backend

FastAPI backend for the task management dashboard with OpenAI-powered meeting transcript processing.

## Features

- Task management (CRUD operations)
- User and project management
- Tag-based task organization
- Meeting transcript upload and AI processing
- Automatic task extraction from meeting notes
- Dashboard statistics

## Setup

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create `.env` file:
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

3. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### Deploy to Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and init:
```bash
railway login
railway init
```

3. Add environment variables:
```bash
railway variables set OPENAI_API_KEY=your_key_here
```

4. Deploy:
```bash
railway up
```

## API Endpoints

### Users
- `POST /users` - Create user
- `GET /users` - Get all users
- `GET /users/{id}` - Get user by ID

### Projects
- `POST /projects` - Create project
- `GET /projects` - Get all projects
- `GET /projects/{id}` - Get project by ID
- `PATCH /projects/{id}/archive` - Archive project

### Tasks
- `POST /tasks` - Create task
- `GET /tasks` - Get all tasks (with optional filters)
- `GET /tasks/{id}` - Get task by ID
- `PATCH /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

### Tags
- `POST /tags` - Create tag
- `GET /tags` - Get all tags

### Meeting Transcripts
- `POST /transcripts` - Upload transcript
- `POST /transcripts/{id}/process` - Process with AI
- `GET /transcripts` - Get all transcripts
- `GET /transcripts/{id}` - Get transcript by ID

### Stats
- `GET /stats` - Get dashboard statistics

## Database Schema

- **Users**: Team members
- **Projects**: Task groupings
- **Tasks**: Individual work items
- **Tags**: Custom labels for tasks
- **MeetingTranscripts**: Meeting notes
- **TranscriptActions**: AI-extracted actions

## Environment Variables

- `OPENAI_API_KEY` - OpenAI API key for transcript processing
- `DATABASE_URL` - Database connection string (defaults to SQLite)
