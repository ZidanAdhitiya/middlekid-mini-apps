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

# Import Google ADK runner components
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS to allow requests from your Next.js app
CORS(app, resources={
    r"/*": {
        "origins": os.getenv("ALLOWED_ORIGINS", "*").split(","),
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Initialize session service and runner
session_service = InMemorySessionService()
runner = Runner(
    agent=root_agent,
    session_service=session_service,
    app_name="GoodKid-MiddleKid"
)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'GoodKid Agent',
        'version': '1.0.0'
    })

@app.route('/debug', methods=['GET'])
def debug_agent():
    """Debug endpoint to discover agent methods"""
    try:
        agent_info = {
            'agent_type': str(type(root_agent)),
            'agent_class': root_agent.__class__.__name__,
            'available_methods': [m for m in dir(root_agent) if not m.startswith('_')],
            'callable': callable(root_agent),
            'has_run': hasattr(root_agent, 'run'),
            'has_send_message': hasattr(root_agent, 'send_message'),
            'has_execute': hasattr(root_agent, 'execute'),
            'has_invoke': hasattr(root_agent, 'invoke'),
        }
        
        # Try to get agent documentation
        if hasattr(root_agent, '__doc__') and root_agent.__doc__:
            agent_info['documentation'] = root_agent.__doc__
        
        return jsonify(agent_info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


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
        
        logger.info(f"Received message: {user_message[:100]}...")
        
        # Execute agent using runner
        try:
            # Use a simple user_id for demo - in production, use actual user authentication
            user_id = "demo_user"
            
            # Execute the agent with the runner
            # The runner handles session management automatically
            result = runner.run(
                user_id=user_id,
                prompt=user_message
            )
            
            # Extract the response text from the result
            # The result typically contains a 'response' or 'output' field
            if hasattr(result, 'response'):
                response_text = result.response
            elif hasattr(result, 'output'):
                response_text = result.output
            elif hasattr(result, 'content'):
                response_text = result.content
            elif isinstance(result, str):
                response_text = result
            elif isinstance(result, dict):
                response_text = result.get('response') or result.get('output') or result.get('content') or str(result)
            else:
                response_text = str(result)
            
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
