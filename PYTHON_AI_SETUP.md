# Python AI Agent Setup

This project includes a Python-based AI agent using Flask and Ollama for AI-powered interactions. This document explains how to set up and run the Python AI agent.

## Prerequisites

- Python 3.8 or higher
- Ollama installed and running with the `qwen2.5:latest` model
- Node.js and npm (for the main application)

## Setting Up Python Virtual Environment

1. Navigate to the project directory:
   ```bash
   cd /Users/sk/sk/proj/hotelbooking/saloon-reservation-app
   ```

2. Activate the existing virtual environment:
   ```bash
   source venv/bin/activate  # On macOS/Linux
   # or
   venv\Scripts\activate     # On Windows
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Python AI Agent

### Option 1: Standalone
```bash
cd server
python ai_agent.py
```
The AI agent will run on `http://localhost:3001`

### Option 2: Using npm script
```bash
npm run dev:python
```

### Option 3: With the full application stack
```bash
npm run dev:all
```
This runs the frontend, the main backend server, and the Python AI agent simultaneously.

## Environment Variables

The Python AI agent uses the following environment variables:

- `OLLAMA_HOST` - The URL for the Ollama API (defaults to `http://localhost:11434`)

Create a `.env` file in the project root with:
```
OLLAMA_HOST=http://localhost:11434
```

## API Endpoints

The Python AI agent provides these endpoints:

### `/api/ai/chat` (POST)
- Handles chat requests for the AI assistant
- Expects: `{"message": "user message", "history": []}`
- Returns: AI response with capabilities information

### `/api/ai/availability` (POST)
- Checks appointment availability for services
- Expects: `{"store_id": 1, "service_id": 1, "date": "YYYY-MM-DD"}`
- Returns: Available appointment times

## Features

The Python AI agent includes:
- Natural language processing for salon/spa reservations
- Service and pricing information
- Availability checking with time slots
- Multi-turn conversation support
- Integration with mock data for stores and services

## Development

To update the virtual environment with new packages:
1. Add the package to `requirements.txt`
2. Activate the venv
3. Run `pip install -r requirements.txt`

## Troubleshooting

### Common Issues:

1. **Python module not found errors**: Make sure your virtual environment is activated
2. **Ollama connection errors**: Verify Ollama is running and the model is pulled
3. **Port conflicts**: The Python server now runs on port 5001 to avoid conflicts with the main server on port 3001
4. **"Sorry, I encountered an error. Please try again." message**: This usually means the AI agent service isn't running or can't connect to Ollama

### Verify Ollama Setup:
```bash
curl http://localhost:11434/api/tags
```

### Pull Required Model:
```bash
ollama pull qwen2.5:latest
```

### Check if Python AI Agent is Running:
```bash
# Check if the server is running on port 5001
curl -X POST http://localhost:5001/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "history": []}'
```

### To fix the "Sorry, I encountered an error" message:

1. Make sure Ollama is running: `ollama serve`
2. Start the Python AI agent:
   - Activate venv: `source venv/bin/activate`
   - Navigate to server: `cd server`
   - Run the agent: `python3 ai_agent.py`
3. Verify the service is responding as shown above