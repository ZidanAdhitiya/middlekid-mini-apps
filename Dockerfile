# Dockerfile for Cloud Run deployment
# This file builds the Python agent from the python-agent subdirectory

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy only python-agent files
COPY python-agent/requirements.txt .
COPY python-agent/good_kid_agent.py .
COPY python-agent/goodkid_server.py .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port (Cloud Run uses PORT env variable)
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# Run the application
CMD exec python goodkid_server.py
