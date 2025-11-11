# Use an official lightweight Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y libpq-dev gcc netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Copy dependency list and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Ensure python-dotenv is installed (for .env file support)
RUN pip install python-dotenv

# Copy all backend code into the container
COPY . .

# Copy .env explicitly so it’s available inside the container
COPY .env .env

# Expose FastAPI port
EXPOSE 8000

# Run FastAPI with Uvicorn (no entrypoint)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
