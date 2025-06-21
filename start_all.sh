#!/bin/bash

echo "🚀 Starting Political Candidates App - Full Stack!"
echo "=================================================="

# Kill any existing processes on both ports
echo "🔪 Cleaning up existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No process found on port 3001"
lsof -ti:8081 | xargs kill -9 2>/dev/null || echo "No process found on port 8081"

sleep 1

# Start backend
echo ""
echo "🔧 Starting Backend Server..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend  
echo ""
echo "🎨 Starting Frontend Server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

sleep 3

echo ""
echo "✅ Both servers are running!"
echo "=================================================="
echo "🔗 Frontend: http://localhost:8081"
echo "📡 Backend:  http://localhost:3001" 
echo "🎯 Open http://localhost:8081 in your browser"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=================================================="

# Wait for user to stop
wait 