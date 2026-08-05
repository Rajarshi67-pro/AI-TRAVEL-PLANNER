#!/bin/bash
# Start backend
echo "Starting backend..."
cd /Users/rajarshichatterjee/Desktop/Travel/backend
npx tsx src/index.ts &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 3
echo "Checking backend health..."
curl -s http://localhost:5000/api/health

# Start frontend
echo ""
echo "Starting frontend..."
cd /Users/rajarshichatterjee/Desktop/Travel/frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "✅ Backend:  http://localhost:5000"
echo "✅ Frontend: http://localhost:3000"
echo "========================================"
echo "Press Ctrl+C to stop both servers"

# Wait for both
wait $BACKEND_PID $FRONTEND_PID
