#!/bin/bash
export APP_ENV=dev
mkdir -p data/contracts/draft data/contracts/deployed data/packages data/history data/users/profile

# Start Hardhat in the background
echo "Starting Hardhat (DEV environment)..."
npx hardhat node &
HARDHAT_PID=$!

# Wait for Hardhat to be ready
sleep 5

# Start the API
echo "Starting FastAPI (DEV environment)..."
# Start the API from the project root directory, not 'cd app'
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
# OR, if you prefer the direct method without python -m:
# uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Clean up when exiting
kill $HARDHAT_PID