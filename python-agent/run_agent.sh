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

# Export environment variables
# Set your OpenAI API key as environment variable before running:
# export OPENAI_API_KEY="your-api-key-here"
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY environment variable is not set"
    echo "Please set it first: export OPENAI_API_KEY='your-api-key'"
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
