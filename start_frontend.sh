#!/bin/bash

echo "🔄 Starting Frontend Server..."

# Kill any process running on port 8081
echo "🔪 Killing any process on port 8081..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || echo "No process found on port 8081"

# Wait a moment
sleep 1

# Navigate to frontend directory and start server
echo "🚀 Starting frontend server on port 8081..."
cd frontend
npm start &

# Give it a moment to start
sleep 3

echo "✅ Frontend server started! Open http://localhost:8081 in your browser"
echo "🎯 Political Candidates App is ready!"
echo "🔗 Make sure backend is running on port 3001 for full functionality" 