from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain.tools import tool
from langchain.agents import AgentExecutor, create_react_agent
from langchain_core.messages import HumanMessage

app = FastAPI(title="Saloon & SPA AI Agent", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for the AI agent to reference
mock_stores = [
    {
        "id": 1,
        "name": "Glamour Spa & Salon",
        "address": "123 Main St, New York, NY",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "phone": "(212) 555-0123",
        "email": "info@glamourspa.com",
        "description": "Premium spa and salon services in the heart of Manhattan",
        "opening_hours": {
            "Monday": {"open": "09:00", "close": "20:00"},
            "Tuesday": {"open": "09:00", "close": "20:00"},
            "Wednesday": {"open": "09:00", "close": "20:00"},
            "Thursday": {"open": "09:00", "close": "21:00"},
            "Friday": {"open": "09:00", "close": "21:00"},
            "Saturday": {"open": "08:00", "close": "19:00"},
            "Sunday": {"open": "10:00", "close": "18:00"}
        }
    },
    {
        "id": 2,
        "name": "Elegant Cuts & Colors",
        "address": "456 Park Ave, New York, NY", 
        "latitude": 40.7589,
        "longitude": -73.9851,
        "phone": "(212) 555-0456",
        "email": "hello@elegantcuts.com",
        "description": "Specializing in haircuts, coloring, and styling",
        "opening_hours": {
            "Monday": {"open": "10:00", "close": "19:00"},
            "Tuesday": {"open": "10:00", "close": "19:00"},
            "Wednesday": {"open": "10:00", "close": "19:00"},
            "Thursday": {"open": "10:00", "close": "20:00"},
            "Friday": {"open": "10:00", "close": "20:00"},
            "Saturday": {"open": "08:00", "close": "18:00"},
            "Sunday": {"open": "10:00", "close": "16:00"}
        }
    },
    {
        "id": 3,
        "name": "Relaxation Station",
        "address": "789 Broadway, New York, NY",
        "latitude": 40.7282,
        "longitude": -73.9942,
        "phone": "(212) 555-0789",
        "email": "contact@relaxstation.com",
        "description": "Perfect place for massages, facials, and relaxation",
        "opening_hours": {
            "Monday": {"open": "09:00", "close": "21:00"},
            "Tuesday": {"open": "09:00", "close": "21:00"},
            "Wednesday": {"open": "09:00", "close": "21:00"},
            "Thursday": {"open": "09:00", "close": "22:00"},
            "Friday": {"open": "09:00", "close": "22:00"},
            "Saturday": {"open": "08:00", "close": "20:00"},
            "Sunday": {"open": "10:00", "close": "18:00"}
        }
    }
]

mock_services = [
    {"id": 1, "name": "Haircut", "description": "Professional haircut with styling", "duration": 30, "price": 45.00, "store_id": 1},
    {"id": 2, "name": "Hair Color", "description": "Full color service", "duration": 120, "price": 120.00, "store_id": 1},
    {"id": 3, "name": "Manicure", "description": "Classic nail care and polish", "duration": 45, "price": 30.00, "store_id": 1},
    {"id": 4, "name": "Pedicure", "description": "Luxury foot treatment", "duration": 60, "price": 45.00, "store_id": 1},
    {"id": 5, "name": "Deep Tissue Massage", "description": "Therapeutic deep tissue massage", "duration": 60, "price": 85.00, "store_id": 3},
    {"id": 6, "name": "Facial", "description": "Customized facial treatment", "duration": 60, "price": 75.00, "store_id": 3},
    {"id": 7, "name": "Cut & Style", "description": "Haircut with styling and blowout", "duration": 60, "price": 65.00, "store_id": 2},
    {"id": 8, "name": "Hair Treatment", "description": "Intensive conditioning treatment", "duration": 45, "price": 55.00, "store_id": 2}
]

# Tool to find salons based on user criteria
@tool
def find_salons(query: str = ""):
    """Find salons based on user query. Returns list of salons matching criteria."""
    if not query:
        return mock_stores
    
    query_lower = query.lower()
    results = []
    for store in mock_stores:
        if (query_lower in store["name"].lower() or 
            query_lower in store["address"].lower() or
            query_lower in store["description"].lower()):
            results.append(store)
    
    return results if results else mock_stores

@tool
def find_services_by_store(store_id: int):
    """Find services offered by a specific store."""
    services = [s for s in mock_services if s["store_id"] == store_id]
    return services

@tool
def find_services_by_name(service_name: str):
    """Find services by name across all stores."""
    service_name_lower = service_name.lower()
    services = [s for s in mock_services if service_name_lower in s["name"].lower()]
    return services

@tool
def get_store_info(store_id: int):
    """Get detailed information about a specific store."""
    store = next((s for s in mock_stores if s["id"] == store_id), None)
    return store if store else {"error": "Store not found"}

@tool
def get_store_opening_hours(store_id: int, day: str = None):
    """Get opening hours for a specific store. If day is not specified, returns all opening hours."""
    store = next((s for s in mock_stores if s["id"] == store_id), None)
    if not store:
        return {"error": "Store not found"}
    
    if day:
        return store["opening_hours"].get(day, "Day not found in schedule")
    else:
        return store["opening_hours"]

# Request model
class ChatRequest(BaseModel):
    message: str
    history: List[Dict[str, Any]] = []

# Response model
class ChatResponse(BaseModel):
    message: str
    model: str
    agent_capabilities: List[str]

# Initialize the model and agent
llm = ChatOllama(
    model="qwen2.5:latest",
    base_url=os.getenv("OLLAMA_HOST", "http://localhost:11434"),
    temperature=0.7
)

# Define the prompt for the agent for the React agent
react_agent_prompt = PromptTemplate.from_template(
    """You are an intelligent Saloon & SPA Reservation Agent. You help users find salons, check services, 
verify availability, suggest appointment times, provide pricing information, and answer questions about services.

You have access to the following tools:

{tools}

When using a tool, respond with a JSON object in the following format:
{{"action": "tool_name", "action_input": {{"arg_name": "arg_value"}}}}

Use the following format:
Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Previous conversation history:
{chat_history}

New question: {input}
{agent_scratchpad}"""
)

# Create the agent
tools = [find_salons, find_services_by_store, find_services_by_name, get_store_info, get_store_opening_hours]
agent = create_react_agent(llm, tools, react_agent_prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

@app.get("/")
def read_root():
    return {"message": "Saloon & SPA AI Agent is running!"}

@app.post("/api/ai/chat", response_model=ChatResponse)
async def ai_chat(request: ChatRequest):
    try:
        if not request.message:
            raise HTTPException(status_code=400, detail="Message is required")
        
        # Convert history to LangChain messages
        chat_history = []
        for msg in request.history:
            if msg.get('role') == "user":
                chat_history.append(HumanMessage(content=msg.get('content', '')))
        
        # Run the agent
        result = agent_executor.invoke({
            "input": request.message,
            "chat_history": chat_history
        })
        
        # Format response with additional agent capabilities information
        return ChatResponse(
            message=result['output'],
            model='qwen2.5:latest',
            agent_capabilities=[
                "Find nearby saloons",
                "Check service availability", 
                "Provide pricing information",
                "Suggest appointment times",
                "Answer service questions",
                "Provide directions",
                "Explain policies",
                "Check real-time availability",
                "Handle booking requests"
            ]
        )
    except Exception as e:
        print(f"AI Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Error processing AI request")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5002)