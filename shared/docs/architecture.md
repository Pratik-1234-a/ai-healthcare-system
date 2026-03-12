# AI Healthcare System Architecture

## Overview
The AI Healthcare System is a full-stack web application designed to streamline healthcare operations by connecting doctors and patients through an intelligent platform powered by AI.

## System Components

### 1. Doctor Frontend (React/Vite)
- Dashboard for managing appointments
- Patient summary views with AI-generated insights
- Prescription management
- Risk assessment badges
- Real-time appointment notifications

### 2. Patient Frontend (React/Vite)
- User authentication
- Appointment booking with doctor search
- Voice recording for symptom documentation
- Appointment history and management
- Health summaries

### 3. AI Service Backend (Node.js/Express)
- Patient data analysis using OpenAI GPT
- Risk analysis algorithms
- Voice recording processing
- Email notifications
- RESTful API endpoints

### 4. Database (Supabase/PostgreSQL)
- User management (doctors and patients)
- Appointment scheduling
- Medical records storage
- Prescription management
- Voice recording metadata

## Technology Stack

### Frontend
- React 18
- Vite (build tool)
- React Router (routing)
- Axios (HTTP client)
- Supabase JS client

### Backend
- Node.js
- Express.js
- OpenAI API
- Nodemailer
- Multer (file handling)

### Database
- PostgreSQL (via Supabase)

## API Endpoints

### AI Routes (`/api/ai`)
- `POST /patient-summary` - Generate AI patient summary
- `POST /risk-analysis` - Analyze patient health risk
- `POST /voice-analysis` - Process voice recordings

### Mail Routes (`/api/mail`)
- `POST /send-appointment-confirmation` - Send appointment confirmation
- `POST /send-prescription` - Send prescription details
- `POST /send-appointment-reminder` - Send appointment reminder

## Data Flow

1. **Patient books appointment** → Submit to backend → Store in database
2. **Doctor views patient** → Backend fetches data → AI generates summary
3. **Voice recording captured** → Sent to backend → Analyzed → Results stored
4. **Appointment confirmed** → Backend sends email notification
5. **Risk assessment** → AI analyzes data → Alert doctor if needed

## Security Considerations
- Environment variables for sensitive data
- Supabase authentication
- CORS configuration
- Input validation
- Secure password hashing

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Supabase account
- OpenAI API key
- Gmail account (for email service)

### Setup Steps

1. Clone the repository
2. Install dependencies for each module:
   ```bash
   cd doctor-frontend && npm install
   cd ../patient-frontend && npm install
   cd ../ai-service-backend && npm install
   ```
3. Configure environment variables (.env files)
4. Set up Supabase database using schema.sql
5. Start the services

## Future Enhancements
- Mobile app development
- Video consultation feature
- Advanced analytics dashboard
- ML-based diagnosis suggestions
- Blockchain for medical records
- Integration with hospitals' EHR systems
