# Database Integration Guide

This guide explains how to integrate Supabase PostgreSQL database with the AI Healthcare System.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Testing Database Connection](#testing-database-connection)

## Prerequisites

- Supabase account (free tier available at https://supabase.com)
- Node.js and npm installed
- Backend server running on port 5000
- Frontend running on port 3000

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: AI-Healthcare-System
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free tier is fine for development

4. Wait for project initialization (5-10 minutes)

### Step 2: Get Credentials

1. Navigate to **Settings** → **API**
2. Copy the following:
   - **Project URL** (SUPABASE_URL)
   - **anon/public key** (SUPABASE_ANON_KEY)

## Environment Configuration

### Step 1: Create .env file in backend

Create a file at `AI-Healthcare-System/ai-service-backend/.env`:

```env
# Backend Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration (paste from Step 2 above)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Email Configuration
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Admin Configuration
ADMIN_EMAIL=admin@healthcare.com
ADMIN_PASSWORD=admin123
```

## Database Schema

### Step 1: Create Tables in Supabase

1. Open your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `shared/docs/DATABASE_SCHEMA.sql`
5. Click **Run**
6. Wait for tables to be created

### Tables Created:

1. **users** - All system users (doctors, patients, admins)
2. **appointments** - Doctor-patient appointments
3. **prescriptions** - Digital prescriptions
4. **voice_recordings** - Patient voice recordings with AI analysis
5. **patient_summaries** - AI-generated patient health summaries
6. **pending_registrations** - Registration approval workflow

## API Endpoints

### User Endpoints (`/api/users`)

```bash
# Register new user
POST /api/users/register
Body: { email, password, name, role, specialization?, license_number?, age?, phone_number? }

# Login user
POST /api/users/login
Body: { email, password, role }

# Get all users (with filters)
GET /api/users/all?role=doctor&status=approved

# Get user by ID
GET /api/users/:id

# Admin: Get pending users
GET /api/users/pending

# Admin: Get approved users
GET /api/users/approved

# Admin: Approve user
PATCH /api/users/:id/approve

# Admin: Reject user
PATCH /api/users/:id/reject

# Admin: Delete user
DELETE /api/users/:id
```

### Appointment Endpoints (`/api/appointments`)

```bash
# Create appointment
POST /api/appointments
Body: { doctor_id, patient_id, appointment_date, reason_for_visit, risk_level? }

# Get all appointments (with filters)
GET /api/appointments?doctor_id=xxx&patient_id=xxx&status=scheduled

# Get appointment by ID
GET /api/appointments/:id

# Update appointment
PUT /api/appointments/:id
Body: { appointment_date, reason_for_visit, notes, risk_level, status }

# Cancel appointment
PATCH /api/appointments/:id/cancel

# Complete appointment
PATCH /api/appointments/:id/complete
Body: { notes }

# Delete appointment
DELETE /api/appointments/:id
```

### Prescription Endpoints (`/api/prescriptions`)

```bash
# Create prescription
POST /api/prescriptions
Body: { appointment_id, doctor_id, patient_id, medicines, precautions, recommended_tests, follow_up_instructions, notes }

# Get all prescriptions (with filters)
GET /api/prescriptions?doctor_id=xxx&patient_id=xxx

# Get prescription by ID
GET /api/prescriptions/:id

# Update prescription
PUT /api/prescriptions/:id
Body: { medicines, precautions, notes, etc }

# Send prescription via email
POST /api/prescriptions/:id/send

# Delete prescription
DELETE /api/prescriptions/:id
```

### Voice Recording Endpoints (`/api/voice`)

```bash
# Create voice recording
POST /api/voice
Body: { patient_id, appointment_id?, transcript, symptoms, duration, severity, possible_diagnosis, risk_level, vitals }

# Get all voice recordings (with filters)
GET /api/voice?patient_id=xxx&appointment_id=xxx

# Get voice recording by ID
GET /api/voice/:id

# Get latest voice recording for patient
GET /api/voice/patient/:patient_id/latest

# Update voice recording
PUT /api/voice/:id
Body: { transcript, symptoms, risk_level, etc }

# Delete voice recording
DELETE /api/voice/:id
```

## Testing Database Connection

### Step 1: Test Backend Connection

1. Start the backend server:
```bash
cd AI-Healthcare-System/ai-service-backend
npm start
```

2. Test health endpoint:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{ "status": "OK" }
```

### Step 2: Test User Registration

```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testdoctor@hospital.com",
    "password": "doctor123",
    "name": "Dr. Test",
    "role": "doctor",
    "specialization": "Cardiology"
  }'
```

### Step 3: Test User Login

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testdoctor@hospital.com",
    "password": "doctor123",
    "role": "doctor"
  }'
```

Expected response (before approval):
```json
{
  "error": "Account not approved yet. Please wait for admin approval."
}
```

### Step 4: Admin Approval

1. Get user ID from register response
2. Approve user:

```bash
curl -X PATCH http://localhost:5000/api/users/{user_id}/approve
```

3. Try login again - should now succeed

## Frontend Integration

The frontend automatically uses the database API when available. Components like:
- `UnifiedLogin.jsx` - Uses `/api/users/login`
- `DoctorAppointments.jsx` - Uses `/api/appointments`
- `Prescription.jsx` - Uses `/api/prescriptions`
- `VoiceRecorder.jsx` - Uses `/api/voice`

### LocalStorage Fallback

If backend is unavailable, the app falls back to localStorage automatically.

## Troubleshooting

### Connection Refused
- Ensure backend is running: `npm start` in ai-service-backend
- Check SUPABASE_URL and SUPABASE_ANON_KEY in .env

### Database Error
- Verify tables were created: Open SQL Editor in Supabase dashboard
- Check Supabase project status: Go to Project Settings

### CORS Issues
- Backend already has CORS enabled
- Ensure frontend is on http://localhost:3000

### Data Not Persisting
- Check browser console for errors
- Verify Supabase connection in backend logs
- Check that .env file is in correct location

## Next Steps

After database integration:

1. **Add JWT Authentication** - Use actual JWT tokens instead of simple tokens
2. **Add Password Hashing** - Use bcrypt to hash passwords
3. **Add Validation** - Validate all input data on backend
4. **Add Testing** - Write unit tests for all endpoints
5. **Add Monitoring** - Set up error logging and monitoring
6. **Add Backups** - Configure Supabase automated backups
7. **Scale** - Migrate to production-level Supabase plan

## Support

For issues with:
- **Supabase**: [Supabase Documentation](https://supabase.com/docs)
- **Backend**: Check server.js and controller files
- **Frontend**: Check browser developer console

