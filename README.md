# Task Dashboard

A collaborative task management system with AI-powered meeting transcript processing. Built for you and Heski to track tasks, manage projects, and automatically extract action items from meeting notes.

## Features

### Task Management
- **Kanban Board**: Visual task tracking with status columns (To Do, In Progress, In Review, Done, Blocked)
- **Team Assignment**: Assign tasks to Dylan or Heski
- **Priority Levels**: Low, Medium, High, Urgent
- **Projects & Tags**: Organize tasks with projects and custom tags
- **Real-time Stats**: Dashboard with task counts and progress metrics

### AI-Powered Transcript Processing
- **Upload meeting transcripts** from your team syncs
- **Automatic task extraction** - AI identifies action items and assigns them
- **Task completion detection** - Marks tasks as done based on meeting notes
- **Task updates** - Updates existing tasks mentioned in meetings
- **Meeting summaries** - Generates concise summaries of each meeting

## Tech Stack

### Frontend (Vercel)
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Axios for API calls

### Backend (Railway)
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite database
- OpenAI API for transcript processing

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- OpenAI API key

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Run the server
python main.py
```

Backend runs on `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
cp .env.local.example .env.local

# Run development server
npm run dev
```

Frontend runs on `http://localhost:3000`

### 3. Initialize Team Members

Visit the API docs at `http://localhost:8000/docs` and create users:

```json
POST /users
{
  "name": "Dylan",
  "email": "dylan@example.com"
}

POST /users
{
  "name": "Heski",
  "email": "heski@example.com"
}
```

## Deployment

### Backend to Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
cd backend
railway login
railway init
railway up
```

3. Add environment variable in Railway dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key

4. Note your Railway app URL (e.g., `https://your-app.railway.app`)

### Frontend to Vercel

1. Push code to GitHub

2. Import in Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Set root directory to `frontend`
   - Add environment variable:
     - `NEXT_PUBLIC_API_URL`: Your Railway backend URL

3. Deploy!

## Usage

### Managing Tasks

1. **Create Task**: Click the `+` button in any column
2. **View Task**: Click on a task card to see details
3. **Update Task**: Change status, priority, assignee
4. **Delete Task**: Click the trash icon

### Processing Meeting Transcripts

1. Navigate to **Transcripts** section
2. Enter meeting title and paste transcript
3. Click **Upload & Process with AI**
4. AI will:
   - Extract new action items
   - Detect task completions
   - Update existing tasks
   - Generate a meeting summary

Example transcript:
```
Dylan: We need to finish the dashboard UI by Friday.
Heski: I'll work on the API integration this week.
Dylan: The database migration is complete, we can mark that as done.
```

AI will create tasks for Dylan and Heski and mark the database migration as complete.

## API Endpoints

### Tasks
- `GET /tasks` - List all tasks
- `POST /tasks` - Create task
- `PATCH /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

### Users
- `GET /users` - List users
- `POST /users` - Create user

### Projects
- `GET /projects` - List projects
- `POST /projects` - Create project

### Transcripts
- `GET /transcripts` - List transcripts
- `POST /transcripts` - Upload transcript
- `POST /transcripts/{id}/process` - Process with AI

### Stats
- `GET /stats` - Get dashboard statistics

Full API documentation available at `/docs` endpoint.

## Database Schema

- **Users**: Team members (Dylan, Heski)
- **Projects**: Task groupings
- **Tasks**: Work items with status, priority, assignments
- **Tags**: Custom labels
- **MeetingTranscripts**: Meeting notes
- **TranscriptActions**: AI-extracted actions from meetings

## License

MIT

## Support

For issues or questions, contact the development team.
