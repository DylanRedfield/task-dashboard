#!/bin/bash

echo "=========================================="
echo "Task Dashboard Setup"
echo "=========================================="
echo ""

# Backend setup
echo "Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
    echo "⚠️  Please add your OPENAI_API_KEY to backend/.env"
fi

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "Backend setup complete!"
echo "Run: cd backend && python main.py"
echo ""

# Frontend setup
cd ../frontend
echo "Setting up frontend..."

if [ ! -f ".env.local" ]; then
    echo "Creating frontend .env.local file..."
    cp .env.local.example .env.local
fi

echo "Installing Node dependencies..."
npm install

echo ""
echo "Frontend setup complete!"
echo "Run: cd frontend && npm run dev"
echo ""

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Add OPENAI_API_KEY to backend/.env"
echo "2. Start backend: cd backend && python main.py"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Visit http://localhost:3000"
echo ""
