#!/bin/bash
# Start the FastAPI AI agent server

# Activate the virtual environment
source venv/bin/activate

# Install dependencies if not already installed
pip install -r requirements.txt

# Start the server
uvicorn main:app --host 0.0.0.0 --port 5002 --reload