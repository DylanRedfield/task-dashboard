# Quick Start Guide

Get your Task Dashboard running in 5 minutes!

## 1. Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

This will install all dependencies for both frontend and backend.

## 2. Configure OpenAI API Key

Edit `backend/.env`:
```bash
OPENAI_API_KEY=sk-your-key-here
```

## 3. Start Backend

```bash
cd backend
python main.py
```

Backend will run on `http://localhost:8000`

## 4. Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## 5. Create Team Members

### Option A: Use API Docs
1. Visit `http://localhost:8000/docs`
2. Click on `POST /users`
3. Click "Try it out"
4. Create Dylan:
   ```json
   {
     "name": "Dylan",
     "email": "dylan@example.com"
   }
   ```
5. Create Heski:
   ```json
   {
     "name": "Heski",
     "email": "heski@example.com"
   }
   ```

### Option B: Use curl
```bash
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Dylan", "email": "dylan@example.com"}'

curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Heski", "email": "heski@example.com"}'
```

## 6. Start Using!

Visit `http://localhost:3000` and:

1. **Create a task**: Click the `+` button in any column
2. **Upload a meeting transcript**: Go to Transcripts tab
3. **Watch AI process it**: Tasks will be automatically created/updated!

## Example Meeting Transcript

Try pasting this into the transcript upload:

```
Meeting Notes - Oct 21, 2024

Dylan: I'll work on the frontend dashboard redesign this week.
Should be done by Friday.

Heski: I need to integrate the payment API. That's my priority.

Dylan: The user authentication bug fix is complete, we can close
that task.

Both: Let's have another sync on Thursday to review progress.
```

The AI will:
- Create task for Dylan: "Frontend dashboard redesign"
- Create task for Heski: "Integrate payment API"
- Mark authentication bug as completed
- Generate a meeting summary

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.9+)
- Check if port 8000 is in use: `lsof -i :8000`

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Check if port 3000 is in use: `lsof -i :3000`
- Delete `node_modules` and run `npm install` again

### AI not processing transcripts
- Verify OPENAI_API_KEY in backend/.env
- Check backend logs for errors
- Ensure you have API credits in your OpenAI account

## Next Steps

- Deploy backend to Railway
- Deploy frontend to Vercel
- Add more team members
- Create custom tags and projects
- Set up recurring meeting transcript processing

Enjoy your new task dashboard! 🚀
