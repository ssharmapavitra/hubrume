#!/bin/bash

# Script to run both backend and frontend in development mode

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Hubrume Development Servers...${NC}\n"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${BLUE}Stopping servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${GREEN}Starting Backend (NestJS) on http://localhost:3000${NC}"
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo -e "${GREEN}Starting Frontend (Next.js) on http://localhost:3001${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "\n${GREEN}Both servers are running!${NC}"
echo -e "${BLUE}Backend: http://localhost:3000${NC}"
echo -e "${BLUE}Frontend: http://localhost:3001${NC}"
echo -e "\n${BLUE}Press Ctrl+C to stop both servers${NC}\n"

# Wait for both processes
wait

