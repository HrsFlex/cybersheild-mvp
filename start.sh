#!/bin/bash

# TriNetra - Financial Crime Detection Application
# Start script for both backend and frontend services

set -e

echo "🔹 Starting TriNetra Application..."
echo "=================================="

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🔹 Shutting down services..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    echo "✅ Services stopped"
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Navigate to TriNetra directory
if [ ! -d "TriNetra" ]; then
    echo "❌ TriNetra directory not found"
    exit 1
fi

cd TriNetra

# Check if directories exist
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found in TriNetra/"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found in TriNetra/"
    exit 1
fi

# Start Backend
echo "🔄 Starting backend server..."
cd backend

# Activate virtual environment and start backend
if [ -d "venv" ]; then
    source venv/bin/activate
    python app.py &
    BACKEND_PID=$!
    echo "✅ Backend started (PID: $BACKEND_PID) - http://localhost:5001"
else
    echo "❌ Virtual environment not found. Please run: cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

cd ..

# Start Frontend
echo "🔄 Starting frontend server..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "🔄 Installing frontend dependencies..."
    npm install
fi

# Start frontend server
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID) - http://localhost:5175"

cd ..

echo ""
echo "🎉 TriNetra is now running!"
echo "=================================="
echo "Frontend: http://localhost:5175"
echo "Backend:  http://localhost:5001"
echo "Health:   http://localhost:5001/api/health"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID