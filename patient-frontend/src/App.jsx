import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import VoiceRecorder from './pages/VoiceRecorder';
import MyAppointments from './pages/MyAppointments';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/voice-recorder" element={<VoiceRecorder />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
      </Routes>
    </Router>
  );
}

export default App;
