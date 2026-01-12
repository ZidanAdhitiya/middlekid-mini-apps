#!/bin/bash
# Quick setup script for OpenAI Agent

set -e

echo "🚀 Setting up GoodKid AI Agent with OpenAI..."

# Check if pip is available
if ! python3 -m pip --version &> /dev/null; then
    echo "📦 Installing pip..."
    sudo apt-get update -qq
    sudo apt-get install -y python3-pip python3-venv
fi

# Create virtual environment
cd "$(dirname "$0")"
echo "🔨 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📚 Installing Python packages..."
pip install -q flask==3.0.0 flask-cors==4.0.0 openai

# Load environment variables from .env file if it exists
ENV_FILE="../.env"
if [ -f "$ENV_FILE" ]; then
    echo "📄 Loading environment from .env file..."
    export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY environment variable is not set"
    echo "Please either:"
    echo "  1. Create a .env file in the project root with: OPENAI_API_KEY=your-key"
    echo "  2. Or run: export OPENAI_API_KEY='your-api-key'"
    exit 1
fi
export PORT=8080
export ALLOWED_ORIGINS="http://localhost:3000"

echo "✅ Setup complete!"
echo ""
echo "🤖 Starting GoodKid AI Agent on http://localhost:8080"
echo "Press Ctrl+C to stop"
echo ""

# Run the agent
python3 openai_agent.py
