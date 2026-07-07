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

# Create virtual environment and install dependencies if needed
if [ ! -d "venv" ]; then
    echo "🔄 Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r ../requirements.txt
else
    source venv/bin/activate
fi

# Prompt for a Groq API key on first run (used for AI-enhanced insights)
if [ ! -f ".env" ]; then
    echo "🔑 TriNetra uses Groq for AI-enhanced insights. Get a free key at https://console.groq.com/keys"
    read -p "   Paste your Groq API key (or press Enter to skip / use demo mode): " GROQ_KEY
    echo "GROQ_API_KEY=${GROQ_KEY}" > .env
fi

python app.py &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID) - http://localhost:5001"

cd ..

# Start Frontend
echo "🔄 Starting frontend server..."
cd frontend

# Check if node_modules exists and install/update dependencies
if [ ! -d "node_modules" ]; then
    echo "🔄 Installing frontend dependencies..."
    npm install
else
    echo "🔄 Updating frontend dependencies..."
    npm install
fi

# Remove old PDF dependencies that cause conflicts
echo "🧹 Cleaning up conflicting dependencies..."
npm uninstall jspdf html2canvas jspdf-autotable 2>/dev/null || true

# Start frontend server
echo "🚀 Starting Vite development server..."
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID) - http://localhost:5175"

cd ..

echo ""
echo "🎉 TriNetra is now running!"
echo "=================================="
echo "🌐 Frontend: http://localhost:5175"
echo "⚙️  Backend:  http://localhost:5001"
echo "❤️  Health:   http://localhost:5001/api/health"
echo ""
echo "📱 Login Page:   http://localhost:5175/login.html"
echo "🏠 Dashboard:    http://localhost:5175/chronos.html"
echo ""
echo "⚡ Features Available:"
echo "   🕐 CHRONOS Timeline Analysis"
echo "   🐍 HYDRA AI Red-Team Battle"
echo "   📋 Auto-SAR Report Generation"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait a moment for servers to fully start
sleep 2

# Check if servers are responding
echo "🔍 Checking server health..."
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
    echo "✅ Backend server is responding"
else
    echo "⚠️  Backend server may still be starting..."
fi

if curl -s http://localhost:5175 > /dev/null 2>&1; then
    echo "✅ Frontend server is responding"
else
    echo "⚠️  Frontend server may still be starting..."
fi

echo ""

# Wait for background processes
wait $BACKEND_PID $FRONTEND_PID