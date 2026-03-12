#!/bin/bash

# AI Healthcare System - Database Setup Script
# This script helps set up database integration

set -e

echo "================================"
echo "AI Healthcare System - Database Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f "ai-service-backend/.env" ]; then
    echo "❌ .env file not found in ai-service-backend/"
    echo ""
    echo "Creating .env from .env.example..."
    cp ai-service-backend/.env.example ai-service-backend/.env
    echo "✅ .env created! Please edit it with your Supabase credentials."
    echo ""
    echo "📝 To complete setup:"
    echo "1. Go to https://supabase.com and create a new project"
    echo "2. Copy Project URL and Anon Key from Settings → API"
    echo "3. Edit ai-service-backend/.env and fill in:"
    echo "   - SUPABASE_URL=<your-url>"
    echo "   - SUPABASE_ANON_KEY=<your-key>"
    exit 1
fi

echo "✅ .env file found!"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not installed. Please install Node.js first."
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not installed. Please install npm first."
    exit 1
fi
echo "✅ npm $(npm --version)"

echo ""
echo "📦 Installing backend dependencies..."
cd ai-service-backend
npm install
cd ..
echo "✅ Backend dependencies installed"

echo ""
echo "📦 Installing frontend dependencies..."
cd doctor-frontend
npm install
cd ..
echo "✅ Frontend dependencies installed"

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Create database tables:"
echo "   - Open Supabase dashboard"
echo "   - Go to SQL Editor"
echo "   - Run the query from: shared/docs/DATABASE_SCHEMA.sql"
echo ""
echo "2. Start the servers:"
echo "   Terminal 1: cd ai-service-backend && npm start"
echo "   Terminal 2: cd doctor-frontend && npm run dev"
echo ""
echo "3. Test the setup:"
echo "   http://localhost:3000 (Frontend)"
echo "   http://localhost:5000/health (Backend)"
echo ""
echo "For detailed instructions, see: QUICKSTART_DATABASE.md"

# Add voice_summary_url column to appointments table
psql -U postgres -d healthcare_system -c "ALTER TABLE appointments ADD COLUMN voice_summary_url TEXT;"

# Confirm the column was added
echo "✅ voice_summary_url column added to appointments table!"
