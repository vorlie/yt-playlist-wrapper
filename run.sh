#!/bin/bash

# Check if Python is installed
if ! command -v python3 &> /dev/null
then
    echo "Python is not installed. Please install Python and try again."
    exit 1
fi

# Create a virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

# Activate the virtual environment
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "Failed to install requirements. Please check the error messages above."
    exit 1
fi

# Run the app
# To use a specific port, add the --port option to the uvicorn command below, e.g., uvicorn main_web:app --reload --port 8080
uvicorn main_web:app --reload
if [ $? -ne 0 ]; then
    echo "Failed to start the application. Please check the error messages above."
    exit 1
fi

# Open the URL in the default web browser (optional)
if command -v xdg-open &> /dev/null; then
    xdg-open http://127.0.0.1:8000 &
else
    echo "xdg-open is not available. Please open http://127.0.0.1:8000 manually."
fi