# Database Integration - Quick Start

## What Has Been Done ✅

### 1. Backend Database Configuration
- ✅ Created Supabase configuration file (`config/supabase.js`)
- ✅ Created database schema with 6 tables:
  - `users` - Store all users (doctors, patients, admins)
  - `appointments` - Store appointment bookings
  - `prescriptions` - Store digital prescriptions
  - `voice_recordings` - Store voice recordings and AI analysis
  - `patient_summaries` - Store AI-generated health summaries
  - `pending_registrations` - Store pending registration approvals

### 2. Backend API Controllers (Complete CRUD)
- ✅ **User Controller** (`controllers/userController.js`)
  - Registration, Login, Approval workflow
  - User management (CRUD operations)
  - Role-based access control
  
- ✅ **Appointment Controller** (`controllers/appointmentController.js`)
  - Create, Read, Update, Delete appointments
  - Cancel, Complete appointment status changes
  - Filter by doctor, patient, status
  
- ✅ **Prescription Controller** (`controllers/prescriptionController.js`)
  - Create, Read, Update, Delete prescriptions
  - Send prescriptions via email
  - Track prescription status (created/sent)
  
- ✅ **Voice Controller** (`controllers/voiceController.js`)
  - Create, Read, Update, Delete voice recordings
  - Get latest recording for patient
  - Store structured AI analysis data

### 3. Backend API Routes
- ✅ `routes/userRoutes.js` - User management endpoints
- ✅ `routes/appointmentRoutes.js` - Appointment CRUD endpoints
- ✅ `routes/prescriptionRoutes.js` - Prescription CRUD endpoints
- ✅ `routes/voiceRoutes.js` - Voice recording CRUD endpoints
- ✅ Updated `server.js` to register all routes

### 4. Frontend API Service
- ✅ Updated `services/api.js` with comprehensive API client
  - `userAPI` - Login, register, user management
  - `appointmentAPI` - Appointment operations
  - `prescriptionAPI` - Prescription operations
  - `voiceAPI` - Voice recording operations

### 5. Documentation
- ✅ Created `DATABASE_SCHEMA.sql` - Complete SQL schema
- ✅ Created `DATABASE_INTEGRATION_GUIDE.md` - Step-by-step setup guide
- ✅ Created `.env.example` - Environment variables template

---

## Quick Setup (3 Steps)

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Create new project (free tier)
3. Copy Project URL and Anon Key

### Step 2: Create .env File
Create `AI-Healthcare-System/ai-service-backend/.env`:

```env
PORT=5000
NODE_ENV=development

# From Supabase Project Settings → API
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

OPENAI_API_KEY=sk-...
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password
ADMIN_EMAIL=admin@healthcare.com
ADMIN_PASSWORD=admin123
```

### Step 3: Create Database Tables
1. Open Supabase Project Dashboard
2. Click SQL Editor
3. Create new query
4. Copy contents from `shared/docs/DATABASE_SCHEMA.sql`
5. Run query

---

## API Endpoints Now Available

### 🔐 User Management
```
POST   /api/users/login           - User login
POST   /api/users/register        - User registration
GET    /api/users/all             - Get all users
GET    /api/users/pending         - Get pending registrations (admin)
GET    /api/users/approved        - Get approved users (admin)
PATCH  /api/users/:id/approve     - Approve user (admin)
PATCH  /api/users/:id/reject      - Reject user (admin)
```

### 📅 Appointments
```
POST   /api/appointments          - Create appointment
GET    /api/appointments          - List appointments (with filters)
GET    /api/appointments/:id      - Get appointment details
PUT    /api/appointments/:id      - Update appointment
PATCH  /api/appointments/:id/cancel   - Cancel appointment
PATCH  /api/appointments/:id/complete - Mark appointment complete
```

### 💊 Prescriptions
```
POST   /api/prescriptions         - Create prescription
GET    /api/prescriptions         - List prescriptions (with filters)
GET    /api/prescriptions/:id     - Get prescription details
PUT    /api/prescriptions/:id     - Update prescription
POST   /api/prescriptions/:id/send - Send via email
```

### 🎙️ Voice Recordings
```
POST   /api/voice                 - Save voice recording
GET    /api/voice                 - List recordings (with filters)
GET    /api/voice/:id             - Get recording details
GET    /api/voice/patient/:id/latest - Get latest recording for patient
PUT    /api/voice/:id             - Update recording
```

---

## Testing the Setup

### 1. Test Backend is Running
```bash
curl http://localhost:5000/health
```

### 2. Test User Registration
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testdoctor@hospital.com",
    "password": "doctor123",
    "name": "Dr. Test",
    "role": "doctor"
  }'
```

### 3. Test Appointment Creation (after login)
```bash
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "doctor_id": "uuid-from-login",
    "patient_id": "patient-uuid",
    "appointment_date": "2024-03-15T10:00:00"
  }'
```

---

## What Data is Now Stored in Database?

✅ **All user information** (doctors, patients, admins)
✅ **All appointments** (with dates, status, notes)
✅ **All prescriptions** (medicines, instructions)
✅ **All voice recordings** (transcripts, AI analysis)
✅ **Patient health summaries** (AI-generated)
✅ **User approval status** (for authentication)

---

## Frontend Will Automatically Use Database When:
- ✅ User logs in (validated against database)
- ✅ Appointments are created (stored in database)
- ✅ Prescriptions are created (stored in database)
- ✅ Voice recordings are saved (stored in database)
- ✅ Data is retrieved and displayed

---

## Next: Run Everything

1. **Start Backend**:
   ```bash
   cd AI-Healthcare-System/ai-service-backend
   npm start
   ```

2. **Start Frontend** (new terminal):
   ```bash
   cd AI-Healthcare-System/doctor-frontend
   npm run dev
   ```

3. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

4. **Test Login**:
   - Email: admin@healthcare.com
   - Password: admin123
   - Role: admin

---

## For Detailed Instructions
See: `shared/docs/DATABASE_INTEGRATION_GUIDE.md`

