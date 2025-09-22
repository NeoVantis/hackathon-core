#!/bin/bash

# Hackathon Core Application Test Script
# This script helps test the application and its dependencies

echo "🧪 Hackathon Core Application Test Script"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your actual configuration."
    echo ""
fi

# Function to check if a service is running
check_service() {
    local url=$1
    local service_name=$2
    
    echo "🔍 Checking $service_name at $url..."
    
    if curl -s --max-time 5 "$url/health" > /dev/null; then
        echo "✅ $service_name: Available"
        return 0
    else
        echo "❌ $service_name: Not available"
        return 1
    fi
}

# Function to check if port is in use
check_port() {
    local port=$1
    local service_name=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t > /dev/null; then
        echo "✅ Port $port: In use ($service_name is likely running)"
        return 0
    else
        echo "❌ Port $port: Available (no service running)"
        return 1
    fi
}

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

echo ""
echo "🔧 Environment Configuration:"
echo "=============================="
echo "Database: ${DB_HOST:-localhost}:${DB_PORT:-5432}/${DB_DATABASE:-hackathon_db}"
echo "Auth Service: ${AUTH_SERVICE_URL:-http://localhost:3000/api/v1}"
echo "Notification Service: ${NOTIFICATION_SERVICE_URL:-http://localhost:4321/api/v1}"
echo "Port: ${PORT:-3002}"
echo ""

echo "🏥 Service Health Checks:"
echo "========================="

# Check individual service ports
auth_available=false
notification_available=false

if check_port 3000 "Auth Service"; then
    auth_available=true
fi

if check_port 4321 "Notification Service"; then
    notification_available=true
fi

echo ""

# Check service health endpoints
if [ "$auth_available" = true ]; then
    check_service "${AUTH_SERVICE_URL:-http://localhost:3000/api/v1}" "Auth Service"
fi

if [ "$notification_available" = true ]; then
    check_service "${NOTIFICATION_SERVICE_URL:-http://localhost:4321/api/v1}" "Notification Service"
fi

echo ""

# Check if hackathon core is running
echo "🚀 Hackathon Core Service:"
echo "=========================="
if check_port ${PORT:-3002} "Hackathon Core"; then
    check_service "http://localhost:${PORT:-3002}/api/v1" "Hackathon Core"
fi

echo ""

# Database check
echo "🗄️  Database Check:"
echo "=================="
if command -v psql > /dev/null; then
    echo "🔍 Checking PostgreSQL connection..."
    if PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USERNAME}" -d "${DB_DATABASE}" -c "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ Database: Connected successfully"
    else
        echo "❌ Database: Connection failed"
        echo "   Make sure PostgreSQL is running and credentials are correct"
    fi
else
    echo "⚠️  psql not found. Cannot test database connection."
fi

echo ""

# Recommendations
echo "📋 Recommendations:"
echo "=================="

if [ "$auth_available" = false ]; then
    echo "❗ Start the Auth Service on port 3000"
fi

if [ "$notification_available" = false ]; then
    echo "❗ Start the Notification Service on port 4321"
fi

if ! check_port ${PORT:-3002} "Hackathon Core" > /dev/null; then
    echo "❗ Start the Hackathon Core service with: npm run start:dev"
fi

echo ""
echo "🧪 Test API Endpoints:"
echo "====================="
echo "Health Check: curl http://localhost:${PORT:-3002}/api/v1/health"
echo "Hackathons:   curl http://localhost:${PORT:-3002}/api/v1/hackathons"
echo "Teams:        curl http://localhost:${PORT:-3002}/api/v1/teams"
echo ""

echo "✨ Test script completed!"