#!/bin/bash

echo "🔄 Starting Backend Server..."

# Kill any process running on port 3001
echo "🔪 Killing any process on port 3001..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No process found on port 3001"

# Wait a moment
sleep 1

# Navigate to backend directory and start server
echo "🚀 Starting backend server on port 3001..."
cd backend
node server.js &

# Give it a moment to start
sleep 2

echo "✅ Backend server started! Running on http://localhost:3001"
echo "📡 API available at http://localhost:3001/candidates"
echo "🔌 WebSocket server ready for connections" 