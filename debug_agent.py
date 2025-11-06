from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import tool
import os

app = Flask(__name__)
CORS(app)

# Simple mock data
mock_stores = [
    {
        "id": 1,
        "name": "Glamour Spa & Salon",
        "address": "123 Main St, New York, NY",
    }
]

# Simple tool
@tool
def find_salons(query: str = ""):
    """Find salons based on user query."""
    return mock_stores

# Create the ChatOllama model instance
llm = ChatOllama(
    model="qwen2.5:latest",
    base_url=os.getenv("OLLAMA_HOST", "http://localhost:11434"),
    temperature=0.7
)

# Create a simple prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant."),
    MessagesPlaceholder(variable_name="chat_history", optional=True),
    ("human", "{input}"),
    MessagesPlaceholder(variable_name="agent_scratchpad")
])

# Create the agent
tools = [find_salons]
try:
    agent = create_react_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
    print("Agent created successfully!")
except Exception as e:
    print(f"Error creating agent: {e}")

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        history = data.get('history', [])
        
        if not message:
            return jsonify({'error': 'Message is required'}), 400

        # Convert history to LangChain messages
        chat_history = []
        for msg in history:
            if msg.get('role') == "user":
                chat_history.append(HumanMessage(content=msg.get('content', '')))
            elif msg.get('role') == "assistant":
                chat_history.append(SystemMessage(content=msg.get('content', '')))
        
        # Run the agent
        result = agent_executor.invoke({
            "input": message,
            "chat_history": chat_history
        })
        
        return jsonify({
            'message': result['output'],
            'model': 'qwen2.5:latest',
        })
    except Exception as e:
        print(f"AI Chat error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Error processing AI request: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)  # Different port for debugging