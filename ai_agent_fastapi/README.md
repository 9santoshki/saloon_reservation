# FastAPI AI Agent for Saloon & SPA Reservation

This is a FastAPI-based AI agent that provides intelligent assistance for saloon and spa reservation services.

## Features

- Natural language processing for salon and service queries
- Integration with LangChain tools for data access
- FastAPI framework for high-performance API endpoints
- CORS support for frontend integration

## Setup

1. Create a virtual environment:
```bash
python3 -m venv venv
```

2. Activate the virtual environment:
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

1. Activate the virtual environment:
```bash
source venv/bin/activate
```

2. Start the server:
```bash
uvicorn main:app --host 0.0.0.0 --port 5002
```

Or use the start script:
```bash
./start.sh
```

The server will be available at `http://localhost:5002`

## API Endpoints

- `GET /` - Health check endpoint
- `POST /api/ai/chat` - Chat endpoint for AI interactions

## Requirements

- Python 3.9+
- Ollama running with qwen2.5:latest model installed
- Access to the internet for initial dependency installation