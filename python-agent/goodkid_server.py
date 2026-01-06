"""
GoodKid Agent Server - Flask wrapper for the GoodKid AI agent
This server exposes the GoodKid agent via HTTP API for the Middlekid Next.js app
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging

# Import the GoodKid agent
from good_kid_agent import root_agent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS to allow requests from your Next.js app
# In production, replace '*' with your actual domain
CORS(app, resources={
    r"/*": {
        "origins": os.getenv("ALLOWED_ORIGINS", "*").split(","),
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'GoodKid Agent',
        'version': '1.0.0'
    })

@app.route('/chat', methods=['POST'])
def chat():
    """
    Chat endpoint that receives messages and returns agent responses
    
    Request body:
    {
        "message": "user message here",
        "conversationHistory": [
            {"role": "user", "content": "..."},
            {"role": "assistant", "content": "..."}
        ]
    }
    
    Response:
    {
        "response": "agent response here"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                'error': 'Message is required'
            }), 400
        
        user_message = data['message']
        conversation_history = data.get('conversationHistory', [])
        
        logger.info(f"Received message: {user_message[:100]}...")
        
        # Build conversation context for the agent
        # The Google ADK agent expects a string input
        # We can include history as context if needed
        if conversation_history:
            context = "Previous conversation:\n"
            for msg in conversation_history[-5:]:  # Last 5 messages for context
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                context += f"{role}: {content}\n"
            context += f"\nuser: {user_message}"
            full_message = context
        else:
            full_message = user_message
        
        # Call the agent
        # Google ADK LlmAgent uses send_message() method
        try:
            # Build the message with history context if available
            if conversation_history:
                # Include recent history for context
                context_messages = []
                for msg in conversation_history[-5:]:  # Last 5 messages
                    context_messages.append({
                        'role': msg.get('role', 'user'),
                        'content': msg.get('content', '')
                    })
                
                # Send message with context
                response = root_agent.send_message(user_message, context=context_messages)
            else:
                # Send message without context
                response = root_agent.send_message(user_message)
            
            # Extract the response text
            # The response format may vary based on Google ADK version
            if hasattr(response, 'content'):
                response_text = response.content
            elif hasattr(response, 'text'):
                response_text = response.text
            elif isinstance(response, str):
                response_text = response
            elif isinstance(response, dict):
                response_text = response.get('content') or response.get('text') or str(response)
            else:
                response_text = str(response)
            
            logger.info(f"Agent response: {response_text[:100]}...")
            
            return jsonify({
                'response': response_text
            })
            
        except Exception as agent_error:
            logger.error(f"Agent execution error: {str(agent_error)}", exc_info=True)
            return jsonify({
                'error': 'Agent execution failed',
                'details': str(agent_error)
            }), 500
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
