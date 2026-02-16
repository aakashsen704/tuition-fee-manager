#!/bin/bash

echo "========================================"
echo "Tuition Fee Manager Setup"
echo "========================================"
echo ""

echo "Installing backend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "Installing frontend dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi
cd ..

echo ""
echo "========================================"
echo "Setup completed successfully!"
echo "========================================"
echo ""
echo "To start the application:"
echo "1. Open TWO terminals"
echo "2. In first terminal, run: npm start"
echo "3. In second terminal, run: cd client && npm start"
echo "4. Browser will open automatically at http://localhost:3000"
echo ""
