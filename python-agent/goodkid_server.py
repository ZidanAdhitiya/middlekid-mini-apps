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
        
        # Execute agent using run_async method
        # run_async returns an async generator that yields events
        try:
            import asyncio
            
            # Create runner session
            session_id = "demo_session"
            user_id = "demo_user"
            
            # Collect events from the async generator
            async def run_agent():
                events = []
                # run_async yields events, so we need to iterate through them
                async for event in runner.run_async(
                    user_id=user_id,
                    session_id=session_id,
                    new_message=user_message
                ):
                    events.append(event)
                return events
            
            # Run the async function
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            try:
                events = loop.run_until_complete(run_agent())
            finally:
                loop.close()
            
            # Extract response from events
            # Events can be various types - need to handle safely
            response_text = ""
            
            try:
                for event in events:
                    # Safely extract content from event
                    try:
                        # Try different attributes
                        if hasattr(event, 'content'):
                            content = getattr(event, 'content', None)
                            if content and not isinstance(content, type(None)):
                                response_text += str(content)
                        elif hasattr(event, 'text'):
                            text = getattr(event, 'text', None)
                            if text and not isinstance(text, type(None)):
                                response_text += str(text)
                        elif hasattr(event, 'message'):
                            message = getattr(event, 'message', None)
                            if message and not isinstance(message, type(None)):
                                response_text += str(message)
                        elif hasattr(event, 'data'):
                            data = getattr(event, 'data', None)
                            if data and not isinstance(data, type(None)):
                                response_text += str(data)
                        elif isinstance(event, dict):
                            # Extract from dict
                            for key in ['content', 'text', 'message', 'data', 'response']:
                                if key in event and event[key]:
                                    response_text += str(event[key])
                                    break
                        elif isinstance(event, str):
                            response_text += event
                    except Exception as event_error:
                        # Skip problematic events
                        logger.warning(f"Error processing event: {event_error}")
                        continue
                
                # If no response collected, try to get from last event
                if not response_text and events:
                    try:
                        last_event = events[-1]
                        # Try to convert to dict or string
                        if hasattr(last_event, '__dict__'):
                            event_dict = last_event.__dict__
                            # Look for common response fields
                            for key in ['content', 'text', 'message', 'data', 'response', 'output']:
                                if key in event_dict and event_dict[key]:
                                    response_text = str(event_dict[key])
                                    break
                        if not response_text:
                            response_text = str(last_event)
                    except Exception as e:
                        logger.warning(f"Error extracting from last event: {e}")
                
                # Fallback
                if not response_text:
                    response_text = "Agent completed but no response text found"
                
            except Exception as extract_error:
                logger.error(f"Error extracting response: {extract_error}", exc_info=True)
                response_text = f"Error processing response: {str(extract_error)}"
            
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
