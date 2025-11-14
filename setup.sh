#!/bin/bash

# Racelith Penalty Tracking System - Initial Setup Script
# This script prepares the project for first-time use

set -e

echo "🔧 Racelith Penalty Tracking System - Initial Setup"
echo "===================================================="

# Make all scripts executable
echo "📝 Making scripts executable..."
chmod +x start.sh deploy.sh backup.sh 2>/dev/null || true
chmod +x backend/wait-for-db.sh 2>/dev/null || true

echo "✅ Scripts are now executable"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/session_exports
mkdir -p backups
touch backend/session_exports/.gitkeep 2>/dev/null || true

echo "✅ Directories created"

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "⚠️  No .env file found."
    echo "   Creating from template..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "✅ Created backend/.env from template"
        echo "⚠️  IMPORTANT: Edit backend/.env and change the default passwords!"
    else
        echo "❌ backend/.env.example not found. Please create backend/.env manually."
    fi
else
    echo "✅ backend/.env already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit backend/.env and configure your settings"
echo "   2. Run: ./start.sh (for development)"
echo "   3. Or run: ./deploy.sh (for production)"
echo ""

