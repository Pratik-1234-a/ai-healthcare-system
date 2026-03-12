# AI Healthcare System

A comprehensive full-stack healthcare management platform that combines modern web technologies with artificial intelligence to streamline patient-doctor interactions and provide intelligent health insights.

## 🏥 Project Structure

### doctor-frontend
React/Vite application for healthcare providers
- Dashboard for appointment management
- Patient summaries with AI-generated insights
- Risk assessment tools
- Prescription management

### patient-frontend
React/Vite application for patients
- User authentication
- Doctor search and appointment booking
- Voice recording for symptom documentation
- Appointment history and tracking

### ai-service-backend
Node.js/Express backend service
- OpenAI integration for patient analysis
- Risk assessment algorithms
- Email notification system
- Voice recording processing

### shared
Database schema and documentation
- PostgreSQL database design
- System architecture documentation

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. Install dependencies for each service:
```bash
cd doctor-frontend && npm install
cd ../patient-frontend && npm install
cd ../ai-service-backend && npm install
```

2. Set up environment variables in `.env` files for each service

3. Initialize the database:
```bash
# Apply schema.sql in Supabase
```

4. Start the services:
```bash
# Terminal 1: Doctor Frontend
cd doctor-frontend && npm run dev

# Terminal 2: Patient Frontend
cd patient-frontend && npm run dev

# Terminal 3: Backend
cd ai-service-backend && npm run dev
```

## 🌐 Services

- **Doctor Frontend**: http://localhost:3000
- **Patient Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000

## 📋 Features

### For Doctors
- View scheduled appointments
- Generate AI-powered patient summaries
- Assess patient health risks
- Issue and manage prescriptions
- Track patient history

### For Patients
- Book appointments with specialists
- Record symptoms via voice
- View appointment history
- Receive notifications
- Access health recommendations

### AI Features
- Intelligent patient summarization
- Risk assessment and alerts
- Voice-to-text symptom analysis
- Prescription recommendations

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite
- React Router
- Axios
- Supabase Client

**Backend:**
- Node.js
- Express.js
- OpenAI API (GPT-3.5-turbo)
- Supabase (PostgreSQL)
- Nodemailer

## 📁 Project Layout

```
AI-Healthcare-System/
├── doctor-frontend/          # Doctor web application
├── patient-frontend/         # Patient web application
├── ai-service-backend/       # Backend API server
├── shared/                   # Shared configuration and docs
│   ├── supabase/            # Database schema
│   └── docs/                # Architecture documentation
└── README.md
```

## 🔐 Configuration

Create `.env` files in each service directory with:

### Backend (.env)
```
PORT=5000
OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_KEY=your_supabase_key
```

## 📚 API Documentation

### AI Routes
- `POST /api/ai/patient-summary` - Generate patient summary
- `POST /api/ai/risk-analysis` - Analyze health risks
- `POST /api/ai/voice-analysis` - Process voice input

### Email Routes
- `POST /api/mail/send-appointment-confirmation`
- `POST /api/mail/send-prescription`
- `POST /api/mail/send-appointment-reminder`

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit pull requests.

## 📄 License

ISC License

## 📞 Support

For support, email support@aihealthcare.com or open an issue in the repository.

---

**Built with ❤️ for better healthcare**
