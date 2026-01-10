"""
GoodKid Agent Server - Flask wrapper for the GoodKid AI agent
FIXED VERSION - Compatible with Google ADK latest API
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import asyncio

# Import the GoodKid agent
from good_kid_agent import root_agent

# Import Google ADK runner components
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Configure CORS
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
        'version': '1.1.0-fixed'
    })

@app.route('/chat', methods=['POST'])
def chat():
    """
    Chat endpoint - receives messages and returns agent responses
    
    FIXED: Removes dependency on google.adk.messages which doesn't exist
    Uses string message directly with runner.run_async
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message']
        logger.info(f"Received message: {user_message[:100]}...")
        
        # Execute agent using run_async method
        session_id = "demo_session"
        user_id = "demo_user"
        
        async def run_agent():
            """Run agent and collect response"""
            events = []
            try:
                # FIXED: Pass string directly instead of Message object
                # The runner should accept strings in newer versions
                async for event in runner.run_async(
                    user_id=user_id,
                    session_id=session_id,
                    new_message=user_message  # Pass string directly
                ):
                    logger.info(f"Event type: {type(event)}")
                    events.append(event)
                
                logger.info(f"Collected {len(events)} events")
                return events
            except Exception as e:
                logger.error(f"Error in run_agent: {str(e)}", exc_info=True)
                raise
        
        # Run async function
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            events = loop.run_until_complete(run_agent())
            loop.close()
        except Exception as e:
            logger.error(f"Asyncio error: {str(e)}", exc_info=True)
            return jsonify({
                'error': 'Agent execution failed',
                'details': str(e)
            }), 500
        
        # Extract response from events
        response_text = ""
        
        for event in events:
            try:
                # Try multiple ways to extract content
                if hasattr(event, 'content'):
                    response_text += str(event.content)
                elif hasattr(event, 'text'):
                    response_text += str(event.text)
                elif hasattr(event, 'message'):
                    response_text += str(event.message)
                elif isinstance(event, dict):
                    for key in ['content', 'text', 'message', 'response']:
                        if key in event:
                            response_text += str(event[key])
                            break
                elif isinstance(event, str):
                    response_text += event
            except Exception as e:
                logger.warning(f"Error processing event: {e}")
                continue
        
        # Fallback if no response extracted
        if not response_text:
            response_text = "Agent responded but content could not be extracted"
        
        logger.info(f"Returning response: {response_text[:100]}...")
        
        return jsonify({'response': response_text})
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=False)
