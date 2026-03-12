import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import UnifiedLogin from './pages/UnifiedLogin';
import Registration from './pages/Registration';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import PatientSummary from './pages/PatientSummary';
import Prescription from './pages/Prescription';
import DigitalWhiteboard from './pages/DigitalWhiteboard';
import PatientDashboard from './pages/PatientDashboard';
import BookAppointment from './pages/BookAppointment';
import VoiceRecorder from './pages/VoiceRecorder';
import MyAppointments from './pages/MyAppointments';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Persist auth state to localStorage
  useEffect(() => {
    // Initialize demo approved users on first load
    const approvedUsers = localStorage.getItem('approvedUsers');
    if (!approvedUsers) {
      const demoUsers = [
        {
          id: 1,
          name: 'Dr. Sarah Johnson',
          email: 'doctor@hospital.com',
          password: 'doctor123',
          role: 'doctor',
          type: 'doctor',
          specialization: 'Cardiology',
          license: 'MD-12345',
          phone: '+1-555-0101',
          address: 'Hospital Street, Medical City',
          status: 'approved',
          approvedAt: new Date().toLocaleDateString()
        },
        {
          id: 2,
          name: 'John Smith',
          email: 'patient@email.com',
          password: 'patient123',
          role: 'patient',
          type: 'patient',
          age: '35',
          bloodType: 'O+',
          phone: '+1-555-0102',
          address: 'Patient Street, City',
          status: 'approved',
          approvedAt: new Date().toLocaleDateString()
        }
      ];
      localStorage.setItem('approvedUsers', JSON.stringify(demoUsers));
    }

    const savedRole = localStorage.getItem('userRole');
    const savedAuth = localStorage.getItem('isAuthenticated');
    
    if (savedRole && savedAuth === 'true') {
      setUserRole(savedRole);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (role) => {
    setUserRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('userRole', role);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('isAuthenticated');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Redirect to dashboard if already logged in
  if (isAuthenticated && !window.location.pathname.includes('/doctor') && !window.location.pathname.includes('/patient')) {
    return (
      <Router>
        <Navigate to={userRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} />
      </Router>
    );
  }

  return (
    <Router>
      {isAuthenticated && <Navbar userRole={userRole} onLogout={handleLogout} />}
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to={userRole === 'doctor' ? '/doctor/dashboard' : userRole === 'patient' ? '/patient/dashboard' : '/admin/dashboard'} /> : <UnifiedLogin onLogin={handleLogin} />} 
        />
        <Route path="/register" element={<Registration />} />
        
        {/* Admin Routes - Only accessible to admins */}
        {userRole === 'admin' ? (
          <>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </>
        ) : (
          <Route path="/admin/*" element={<Navigate to="/login" />} />
        )}
        
        {/* Doctor Routes - Only accessible to doctors */}
        {userRole === 'doctor' ? (
          <>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/patient-summary/:id" element={<PatientSummary />} />
            <Route path="/doctor/prescription/:id" element={<Prescription />} />
            <Route path="/doctor/whiteboard" element={<DigitalWhiteboard />} />
          </>
        ) : (
          <Route path="/doctor/*" element={<Navigate to="/login" />} />
        )}

        {/* Patient Routes - Only accessible to patients */}
        {userRole === 'patient' ? (
          <>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/book-appointment" element={<BookAppointment />} />
            <Route path="/patient/voice-recorder" element={<VoiceRecorder />} />
            <Route path="/patient/my-appointments" element={<MyAppointments />} />
          </>
        ) : (
          <Route path="/patient/*" element={<Navigate to="/login" />} />
        )}

        {/* Default and catch-all routes */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to={userRole === 'doctor' ? '/doctor/dashboard' : userRole === 'patient' ? '/patient/dashboard' : '/admin/dashboard'} /> : <Navigate to="/login" />
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
